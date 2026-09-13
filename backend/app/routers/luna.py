"""Goals, Routines, and Challenges (non-AI parts of the Soft Life Society AI
build brief). The Luna Reyes chat and Nourish AI photo/meal-builder logic
need an AI provider decision first - see app/models/chat.py - so only plain
manual food logging is wired up here."""

import secrets
from datetime import date, datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database import get_database
from app.deps import get_current_user
from app.models.challenge import POINTS_PER_LOG
from app.models.routine import DEFAULT_STEPS
from app.models.user import UserInDB
from app.schemas.luna import (
    ChallengeJoinRequest,
    ChallengeParticipantOut,
    ChallengeTemplateOut,
    FoodLogCreate,
    FoodLogOut,
    GoalCreate,
    GoalOut,
    GoalUpdate,
    InviteOut,
    LeaderboardEntryOut,
    RedeemInviteRequest,
    RoutineOut,
    RoutineStepCreate,
    RoutineToggleRequest,
)

router = APIRouter(prefix="/luna", tags=["luna"])

INVITE_BASE_URL = "https://softlifesocietyai.com/app/invite"


def _oid(id_str: str, field_name: str = "id") -> ObjectId:
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid {field_name}")
    return ObjectId(id_str)


def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _yesterday() -> str:
    return (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()


# --- Goals ------------------------------------------------------------


@router.post("/goals", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
async def create_goal(payload: GoalCreate, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["user_id"] = user.id
    doc["progress"] = 0
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.goals.insert_one(doc)
    doc["_id"] = result.inserted_id
    return GoalOut(id=doc["_id"], **{k: doc[k] for k in ("category", "title", "target", "deadline", "progress", "milestones")})


@router.get("/goals", response_model=list[GoalOut])
async def list_goals(category: str | None = Query(default=None), user: UserInDB = Depends(get_current_user)):
    db = get_database()
    query: dict = {"user_id": user.id}
    if category:
        query["category"] = category
    docs = await db.goals.find(query).sort("created_at", -1).to_list(length=None)
    return [
        GoalOut(id=doc["_id"], **{k: doc[k] for k in ("category", "title", "target", "deadline", "progress", "milestones")})
        for doc in docs
    ]


@router.patch("/goals/{goal_id}", response_model=GoalOut)
async def update_goal(goal_id: str, payload: GoalUpdate, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc)

    result = await db.goals.find_one_and_update(
        {"_id": _oid(goal_id, "goal_id"), "user_id": user.id}, {"$set": update}, return_document=True
    )
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return GoalOut(id=result["_id"], **{k: result[k] for k in ("category", "title", "target", "deadline", "progress", "milestones")})


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(goal_id: str, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    result = await db.goals.delete_one({"_id": _oid(goal_id, "goal_id"), "user_id": user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")


# --- Routines -----------------------------------------------------------


async def _get_or_create_template(db, user_id: ObjectId, routine_type: str) -> dict:
    template = await db.routine_templates.find_one({"user_id": user_id, "type": routine_type})
    if template is not None:
        return template

    steps = [{"id": str(ObjectId()), "label": label, "order": i} for i, label in enumerate(DEFAULT_STEPS[routine_type])]
    now = datetime.now(timezone.utc)
    doc = {"user_id": user_id, "type": routine_type, "steps": steps, "created_at": now, "updated_at": now}
    result = await db.routine_templates.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


@router.get("/routines/{routine_type}", response_model=RoutineOut)
async def get_routine(routine_type: str, user: UserInDB = Depends(get_current_user)):
    if routine_type not in ("morning", "night"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="type must be morning or night")

    db = get_database()
    template = await _get_or_create_template(db, user.id, routine_type)
    completion = await db.routine_completions.find_one({"user_id": user.id, "type": routine_type, "date": _today()})

    return RoutineOut(
        type=routine_type,
        steps=[{"id": s["id"], "label": s["label"], "order": s["order"]} for s in template["steps"]],
        completed_step_ids=completion["completed_step_ids"] if completion else [],
    )


@router.post("/routines/{routine_type}/steps", response_model=RoutineOut)
async def add_routine_step(routine_type: str, payload: RoutineStepCreate, user: UserInDB = Depends(get_current_user)):
    if routine_type not in ("morning", "night"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="type must be morning or night")

    db = get_database()
    template = await _get_or_create_template(db, user.id, routine_type)
    new_step = {"id": str(ObjectId()), "label": payload.label, "order": len(template["steps"])}
    await db.routine_templates.update_one(
        {"_id": template["_id"]},
        {"$push": {"steps": new_step}, "$set": {"updated_at": datetime.now(timezone.utc)}},
    )
    return await get_routine(routine_type, user)


@router.post("/routines/{routine_type}/toggle", response_model=RoutineOut)
async def toggle_routine_step(routine_type: str, payload: RoutineToggleRequest, user: UserInDB = Depends(get_current_user)):
    if routine_type not in ("morning", "night"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="type must be morning or night")

    db = get_database()
    op = "$addToSet" if payload.done else "$pull"
    await db.routine_completions.update_one(
        {"user_id": user.id, "type": routine_type, "date": _today()},
        {op: {"completed_step_ids": payload.step_id}},
        upsert=True,
    )
    return await get_routine(routine_type, user)


# --- Challenges -----------------------------------------------------------


def _template_out(doc: dict) -> ChallengeTemplateOut:
    return ChallengeTemplateOut(
        id=doc["_id"], slug=doc["slug"], name=doc["name"], duration_days=doc["duration_days"],
        requires_intensity=doc["requires_intensity"], emoji=doc.get("emoji", "🔥"),
    )


@router.get("/challenges/templates", response_model=list[ChallengeTemplateOut])
async def list_challenge_templates():
    db = get_database()
    docs = await db.challenge_templates.find({"is_active": True}).to_list(length=None)
    return [_template_out(doc) for doc in docs]


async def _participant_out(db, participant: dict, template: dict) -> ChallengeParticipantOut:
    days_completed = await db.challenge_logs.count_documents({"participant_id": participant["_id"]})
    return ChallengeParticipantOut(
        id=participant["_id"],
        template=_template_out(template),
        intensity=participant.get("intensity"),
        joined_at=participant["joined_at"],
        current_streak=participant["current_streak"],
        longest_streak=participant["longest_streak"],
        points=participant["points"],
        days_completed=days_completed,
        logged_today=participant.get("last_logged_date") == _today(),
    )


@router.post("/challenges/join", response_model=ChallengeParticipantOut, status_code=status.HTTP_201_CREATED)
async def join_challenge(payload: ChallengeJoinRequest, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    template = await db.challenge_templates.find_one({"_id": _oid(payload.template_id, "template_id"), "is_active": True})
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    if template["requires_intensity"] and payload.intensity not in ("hard", "medium", "easy"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This challenge requires an intensity")

    existing = await db.challenge_participants.find_one({"user_id": user.id, "template_id": template["_id"]})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already joined this challenge")

    doc = {
        "user_id": user.id,
        "template_id": template["_id"],
        "intensity": payload.intensity,
        "joined_at": datetime.now(timezone.utc),
        "current_streak": 0,
        "longest_streak": 0,
        "points": 0,
        "last_logged_date": None,
    }
    result = await db.challenge_participants.insert_one(doc)
    doc["_id"] = result.inserted_id
    return await _participant_out(db, doc, template)


@router.get("/challenges/mine", response_model=list[ChallengeParticipantOut])
async def list_my_challenges(user: UserInDB = Depends(get_current_user)):
    db = get_database()
    participants = await db.challenge_participants.find({"user_id": user.id}).to_list(length=None)
    template_ids = {p["template_id"] for p in participants}
    templates = await db.challenge_templates.find({"_id": {"$in": list(template_ids)}}).to_list(length=None)
    templates_by_id = {t["_id"]: t for t in templates}
    return [await _participant_out(db, p, templates_by_id[p["template_id"]]) for p in participants if p["template_id"] in templates_by_id]


@router.post("/challenges/{participant_id}/log", response_model=ChallengeParticipantOut)
async def log_challenge_day(participant_id: str, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    participant = await db.challenge_participants.find_one({"_id": _oid(participant_id, "participant_id"), "user_id": user.id})
    if participant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not enrolled in this challenge")

    today = _today()
    if participant.get("last_logged_date") == today:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already logged today")

    new_streak = participant["current_streak"] + 1 if participant.get("last_logged_date") == _yesterday() else 1
    longest_streak = max(participant["longest_streak"], new_streak)
    points = participant["points"] + POINTS_PER_LOG

    await db.challenge_logs.insert_one({"participant_id": participant["_id"], "user_id": user.id, "date": today, "logged_at": datetime.now(timezone.utc)})
    await db.challenge_participants.update_one(
        {"_id": participant["_id"]},
        {"$set": {"current_streak": new_streak, "longest_streak": longest_streak, "points": points, "last_logged_date": today}},
    )

    template = await db.challenge_templates.find_one({"_id": participant["template_id"]})
    participant.update({"current_streak": new_streak, "longest_streak": longest_streak, "points": points, "last_logged_date": today})
    return await _participant_out(db, participant, template)


@router.get("/challenges/{participant_id}/leaderboard", response_model=list[LeaderboardEntryOut])
async def get_leaderboard(participant_id: str, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    participant = await db.challenge_participants.find_one({"_id": _oid(participant_id, "participant_id"), "user_id": user.id})
    if participant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not enrolled in this challenge")

    friendships = await db.friendships.find({"user_id": user.id}).to_list(length=None)
    friend_ids = [f["friend_id"] for f in friendships]
    peer_ids = friend_ids + [user.id]

    peers = await db.challenge_participants.find({"template_id": participant["template_id"], "user_id": {"$in": peer_ids}}).to_list(length=None)
    users = await db.users.find({"_id": {"$in": [p["user_id"] for p in peers]}}).to_list(length=None)
    users_by_id = {u["_id"]: u for u in users}

    entries = [
        LeaderboardEntryOut(
            user_id=str(p["user_id"]),
            full_name=users_by_id[p["user_id"]].get("full_name") or "Vault member",
            is_self=p["user_id"] == user.id,
            points=p["points"],
            current_streak=p["current_streak"],
        )
        for p in peers
        if p["user_id"] in users_by_id
    ]
    entries.sort(key=lambda e: (-e.points, -e.current_streak))
    return entries


# --- Friends ----------------------------------------------------------


@router.post("/friends/invite", response_model=InviteOut, status_code=status.HTTP_201_CREATED)
async def create_invite(user: UserInDB = Depends(get_current_user)):
    db = get_database()
    code = secrets.token_urlsafe(6)
    await db.friend_invites.insert_one({"code": code, "inviter_id": user.id, "created_at": datetime.now(timezone.utc)})
    return InviteOut(code=code, invite_url=f"{INVITE_BASE_URL}/{code}")


@router.post("/friends/redeem", status_code=status.HTTP_204_NO_CONTENT)
async def redeem_invite(payload: RedeemInviteRequest, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    invite = await db.friend_invites.find_one({"code": payload.code})
    if invite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    if invite["inviter_id"] == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can't redeem your own invite")

    now = datetime.now(timezone.utc)
    await db.friendships.update_one(
        {"user_id": invite["inviter_id"], "friend_id": user.id},
        {"$setOnInsert": {"user_id": invite["inviter_id"], "friend_id": user.id, "created_at": now}},
        upsert=True,
    )
    await db.friendships.update_one(
        {"user_id": user.id, "friend_id": invite["inviter_id"]},
        {"$setOnInsert": {"user_id": user.id, "friend_id": invite["inviter_id"], "created_at": now}},
        upsert=True,
    )


# --- Nourish AI (manual food logging - photo/AI meal builder pending) -----


@router.post("/nourish/logs", response_model=FoodLogOut, status_code=status.HTTP_201_CREATED)
async def create_food_log(payload: FoodLogCreate, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    doc = payload.model_dump()
    doc["date"] = doc["date"].isoformat()
    doc["user_id"] = user.id
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.food_logs.insert_one(doc)
    doc["_id"] = result.inserted_id
    return FoodLogOut(id=doc["_id"], **{k: doc[k] for k in ("date", "meal_type", "name", "calories", "protein_g", "carbs_g", "fat_g", "source")})


@router.get("/nourish/logs", response_model=list[FoodLogOut])
async def list_food_logs(for_date: date = Query(alias="date"), user: UserInDB = Depends(get_current_user)):
    db = get_database()
    docs = await db.food_logs.find({"user_id": user.id, "date": for_date.isoformat()}).sort("created_at", 1).to_list(length=None)
    return [
        FoodLogOut(id=doc["_id"], **{k: doc[k] for k in ("date", "meal_type", "name", "calories", "protein_g", "carbs_g", "fat_g", "source")})
        for doc in docs
    ]
