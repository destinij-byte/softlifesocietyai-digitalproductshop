"""The Box - Skincare and Lifestyle monthly subscription boxes.

Draft pricing per the brand redesign spec's price ranges (Mini $19-24,
Classic $34-39, Deluxe $54-64) - picked the middle of each range as a
placeholder. Contents genuinely rotate month to month (hand-packed, not
fulfilled by a 3PL yet), so there's no per-box product row - just a price
per tier, billed via a Stripe subscription using inline price_data rather
than pre-created Stripe Price objects, so this file is the source of truth
for pricing until real cost-of-goods is known. Update PRICE_CENTS here (and
nowhere else) once that's finalized.
"""

import stripe

from app.config import settings
from app.models.user import UserInDB

stripe.api_key = settings.stripe_secret_key

BOX_TYPES: dict[str, dict] = {
    "skincare": {
        "label": "Skincare Box",
        "teaser": "Could include Korean skincare minis, a Summer Fridays treat, or an Eadem lip kit — every box is a little different.",
    },
    "lifestyle": {
        "label": "Lifestyle Box",
        "teaser": "Could include a candle, tea, affirmation cards, an eye mask, or a room spray — every box is a little different.",
    },
}

BOX_TIERS: dict[str, dict] = {
    "mini": {"label": "Mini", "price_low": 19, "price_high": 24, "price_cents": 2200},
    "classic": {"label": "Classic", "price_low": 34, "price_high": 39, "price_cents": 3700},
    "deluxe": {"label": "Deluxe", "price_low": 54, "price_high": 64, "price_cents": 5900},
}

TIER_ORDER = ["mini", "classic", "deluxe"]


def create_box_checkout_session(box_type: str, tier: str, user: UserInDB) -> stripe.checkout.Session:
    box = BOX_TYPES[box_type]
    tier_info = BOX_TIERS[tier]
    return stripe.checkout.Session.create(
        mode="subscription",
        payment_method_types=["card"],
        customer_email=user.email,
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": tier_info["price_cents"],
                    "recurring": {"interval": "month"},
                    "product_data": {
                        "name": f"{box['label']} — {tier_info['label']}",
                        "description": box["teaser"][:500],
                    },
                },
                "quantity": 1,
            }
        ],
        metadata={
            "kind": "box_subscription",
            "box_type": box_type,
            "tier": tier,
            "user_id": str(user.id),
        },
        subscription_data={"metadata": {"box_type": box_type, "tier": tier, "user_id": str(user.id)}},
        success_url=f"{settings.vault_stripe_success_url}?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=settings.vault_stripe_cancel_url,
    )
