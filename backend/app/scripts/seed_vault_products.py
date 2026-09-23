"""Seed The Soft Life Vault's 18 individual products, 4 AI Collection monthly
drops, and 4 bundles (Starter / Reset / Full Library / Founding Member
Lifetime), per the Production Bible pricing table and phased launch plan in
the project brief.

    python -m app.scripts.seed_vault_products

Idempotent - upserts by slug, safe to re-run. Content/business fields
(description, best_for, outcome, thumbnail_url, is_active) are only
applied here if explicitly set below - otherwise a live value set later
via PATCH /vault/admin/products/{id} or the copy-import script survives
future boots instead of being reset to whatever this file said originally.

Phase 1 was the original 18-product launch; all 10 originally-held-back
"Phase 2" products have since been published (real files attached,
descriptions imported) and are is_active=True below like everything else.
"""

import asyncio
from datetime import datetime, timezone
from pathlib import Path

from app.database import get_database

# Real product files live here, named "{slug}.pdf" - only products with a
# file actually present get a working file_url; everything else stays empty
# ("not available yet") rather than pointing at a fake/dead placeholder URL.
STATIC_VAULT_DIR = Path(__file__).resolve().parent.parent / "static" / "vault"

PRODUCTS = [
    # 🌸 Soft Life Collection (#1-10) - blush + cream + champagne
    {"slug": "soft-life-blueprint", "title": "The Soft Life Blueprint", "subtitle": "Your roadmap to the life you're building.", "type": "Workbook", "collection": "soft_life", "life_area": "soft_life", "price": 17, "is_hero": True, "description": 'Figuring out what "soft life" actually means for her and mapping out the life she wants to build.', "best_for": "A woman who knows she wants more peace and ease but doesn't have a clear picture or plan yet.", "outcome": 'A personal roadmap covering her vision, values, priorities, and the first steps to get there.'},
    {"slug": "soft-life-reset", "title": "The Soft Life Reset", "subtitle": "A clean slate, whenever she needs one.", "type": "Workbook", "collection": "soft_life", "life_area": "soft_life", "price": 19, "is_hero": True, "description": 'Starting over when life feels cluttered, overwhelming, or off track, whether in her routines, her mindset, or her space.', "best_for": 'Anyone who feels burnt out or stuck and needs a fresh start. She can use it again any time she needs one.', "outcome": 'A clean slate and a simple plan for what to let go of and what to rebuild.'},
    {"slug": "that-girl-daily-planner", "title": "That Girl Daily Planner", "subtitle": "Plan her day like the main character.", "type": "Planner", "collection": "soft_life", "life_area": "soft_life", "price": 12, "description": 'Planning each day around her priorities, routines, and self-care so she feels in control from morning to night.', "best_for": 'A woman who wants structure every day without a complicated system.', "outcome": 'Days that feel intentional, with her top priorities, routines, and self-care all on one page.', "is_active": True},
    {"slug": "30-day-soft-life-challenge", "title": "30-Day Soft Life Challenge", "subtitle": "30 days to a softer, more intentional life.", "type": "Challenge Workbook", "collection": "soft_life", "life_area": "challenges", "price": 22, "is_hero": True, "description": 'Turning soft-life ideas into daily practice through one small, intentional action each day.', "best_for": 'A woman who does well with structure and accountability.', "outcome": 'Thirty days of new habits that make her everyday life feel softer and more intentional.'},
    {"slug": "soft-life-morning-routine-guide", "title": "Soft Life Morning Routine Guide", "subtitle": "Start her day like she means it.", "type": "Guide", "collection": "soft_life", "life_area": "soft_life", "price": 9, "description": 'Building a calm, realistic morning routine that sets the tone for her whole day.', "best_for": 'A woman whose mornings feel rushed, reactive, or glued to her phone.', "outcome": 'A morning routine she actually enjoys and can keep, even on busy days.', "is_active": True},
    {"slug": "soft-life-night-routine-guide", "title": "Soft Life Night Routine Guide", "subtitle": "Wind down like the boss she is.", "type": "Guide", "collection": "soft_life", "life_area": "soft_life", "price": 9, "description": 'Winding down each evening so she sleeps better and wakes up ready.', "best_for": 'A woman who stays up scrolling, goes to bed stressed, or wakes up tired.', "outcome": 'A soothing night routine that helps her rest and prepare for tomorrow.', "is_active": True},
    {"slug": "weekly-reset-checklist", "title": "The Weekly Reset Checklist", "subtitle": "Sunday reset, simplified.", "type": "Checklist", "collection": "soft_life", "life_area": "soft_life", "price": 7, "description": 'Resetting her space, schedule, money, and mind every week in under an hour.', "best_for": 'A woman who wants a simple Sunday ritual to start each week fresh.', "outcome": 'A repeatable weekly reset that keeps life from piling up.', "is_active": True},
    {"slug": "monthly-soft-life-reset", "title": "The Monthly Soft Life Reset", "subtitle": "A monthly check-in with herself.", "type": "Planner", "collection": "soft_life", "life_area": "soft_life", "price": 12, "description": 'Checking in with herself once a month on her goals, habits, money, and wellbeing.', "best_for": 'A woman who wants a regular ritual to reflect and adjust before things drift.', "outcome": 'A monthly check-in habit that keeps her life aligned with what matters.', "is_active": True},
    {"slug": "soft-life-goal-setting-workbook", "title": "Soft Life Goal-Setting Workbook", "subtitle": "Turn her vision into a plan.", "type": "Workbook", "collection": "soft_life", "life_area": "goals", "price": 15, "description": 'Deciding what she really wants and setting goals that fit her soft life.', "best_for": 'A woman who wants goals that feel meaningful, not stressful.', "outcome": 'Clear, aligned goals and the first steps to reach them.', "is_active": True},
    {"slug": "dream-life-vision-planner", "title": "The Dream Life Vision Planner", "subtitle": "Design the life she's dreaming of.", "type": "Planner", "collection": "soft_life", "life_area": "goals", "price": 17, "description": "Getting clear on the life she's dreaming of across every area, from home to career to love.", "best_for": 'A woman who wants to picture her dream life in detail before planning it.', "outcome": 'A vivid, written vision of her dream life she can come back to all year.', "is_active": True},
    # 💰 Wealth Collection (#11-12) - espresso + cream + champagne
    {"slug": "soft-life-money-makeover", "title": "Soft Life Money Makeover", "subtitle": "A softer way to get her money right.", "type": "Workbook", "collection": "wealth", "life_area": "money", "price": 22, "is_hero": True, "description": 'Getting her finances in order without shame or harsh budgeting, so money feels calmer.', "best_for": 'A woman who avoids looking at her money or feels stressed about it.', "outcome": 'A clear view of where her money goes and a gentle plan to improve it.'},
    {"slug": "soft-life-budget-planner", "title": "The Soft Life Budget Planner", "subtitle": "Budgeting, but make it luxe.", "type": "Planner", "collection": "wealth", "life_area": "money", "price": 12, "description": 'Setting up a simple, pretty budget that makes money feel calm instead of stressful.', "best_for": 'A woman who is new to budgeting and wants an easy place to start.', "outcome": 'A basic monthly budget she can keep up without overwhelm.', "is_active": True},
    # 👑 CEO Collection (#13) - black + cream + gold
    {"slug": "soft-life-ceo-starter-kit", "title": "Soft Life CEO Starter Kit", "subtitle": "Everything she needs to run her empire.", "type": "Toolkit", "collection": "ceo", "life_area": "ceo_life", "price": 27, "is_hero": True, "description": 'Running her business or side hustle with the right tools, systems, and mindset from day one.', "best_for": 'New and aspiring women entrepreneurs.', "outcome": 'A starter set of business tools to organize, plan, and grow her work.'},
    # 🤖 AI Collection (#14-15) - black + ivory + champagne
    {"slug": "100-soft-life-ai-prompts", "title": "100 Soft Life AI Prompts", "subtitle": "100 prompts to think, plan, and create faster.", "type": "Prompt Pack", "collection": "ai", "life_area": "ai", "price": 15, "is_ai_resource": True, "is_hero": True, "description": 'Using AI tools such as ChatGPT or Claude to think, plan, write, and create faster across every area of life.', "best_for": "A woman who is new to AI and doesn't know what to ask it.", "outcome": '100 copy-and-paste prompts she can use right away.'},
    {"slug": "content-creator-ai-prompt-pack", "title": "Content Creator AI Prompt Pack", "subtitle": "AI prompts for the girl building her brand.", "type": "Prompt Pack", "collection": "ai", "life_area": "ai", "price": 19, "is_ai_resource": True, "is_hero": True, "description": 'Using AI to brainstorm content, write captions and scripts, and plan her brand.', "best_for": 'A creator who wants AI to help her come up with ideas, captions, and scripts faster.', "outcome": 'Faster content creation and fewer blank-page moments.'},
    # 💕 Inner Life Collection (#16-17) - blush + ivory
    {"slug": "soft-life-journal", "title": "The Soft Life Journal", "subtitle": "A private space for her thoughts.", "type": "Digital Journal", "collection": "inner_life", "life_area": "inner_life", "price": 12, "description": 'Giving her a private space to process her thoughts, feelings, and growth.', "best_for": "A woman who wants to journal but doesn't know what to write.", "outcome": 'A regular journaling habit and more clarity about herself.', "is_active": True},
    {"slug": "affirmations-for-her", "title": "Affirmations for Her", "subtitle": "Words to remind her who she is.", "type": "Affirmation Pack", "collection": "inner_life", "life_area": "inner_life", "price": 7, "description": "Reminding her who she is and who she's becoming through daily affirmations.", "best_for": 'A woman working on her confidence, self-talk, and mindset.', "outcome": 'Words she can read, repeat, and save to her phone to start each day grounded.', "is_active": True},
    # 👑 Signature Collection (#18) - black + champagne + ivory - the flagship
    {"slug": "ultimate-soft-life-planner", "title": "The Ultimate Soft Life Planner", "subtitle": "Every tool she needs, in one luxe planner.", "type": "All-in-One", "collection": "signature", "life_area": "goals", "price": 37, "is_hero": True, "description": 'Keeping her whole life organized in one place, including goals, routines, money, wellness, and business.', "best_for": 'A woman who wants a single luxe planner instead of juggling a lot of separate tools.', "outcome": 'One complete planning system for her whole life. This is the flagship product.'},
]

# 🤖 AI Collection sub-brand lineups - each shelf on the Shop's AI Collection
# (see web/src/theme/aiShelves.ts) previously mapped to a single prompt pack.
# These are the full product lines for those named shelves, seeded here so
# the shelves show a real catalog instead of one item each. All live in the
# "ai" collection / "ai" life area, matching the existing drops above.
AI_BRAND_PRODUCTS = [
    # 💗 Her New Era AI shelf (alongside existing "dating-relationships-ai-prompt-pack")
    {"slug": "her-new-era-30-day-life-reset", "title": "The 30-Day Life Reset System", "subtitle": "A full month to reset your habits, mindset, and momentum.", "type": "Workbook", "price": 19, "is_hero": True, "description": 'A full month of resetting her habits, her mindset, and her momentum.', "best_for": 'A woman who feels stuck in old patterns and wants a structured month to start fresh.', "outcome": 'New routines and a fresh mental start after 30 days.'},
    {"slug": "her-new-era-identity-reset", "title": "The Identity & Self-Concept Reset", "subtitle": "A 14-day plan to rebuild how you see yourself.", "type": "Workbook", "price": 17, "description": 'Changing how she sees herself through a 14-day plan of self-image work, reflection, and journaling.', "best_for": "A woman who is ready to stop seeing herself as her old self and step into who she's becoming.", "outcome": 'A stronger self-concept and a clear sense of the woman she is becoming.'},
    {"slug": "her-new-era-habit-builder", "title": "The Habit & Routine Builder", "subtitle": "Build routines that actually stick.", "type": "Workbook", "price": 17, "description": 'Building morning, evening, and daily routines she will actually keep.', "best_for": "A woman who has tried routines before but couldn't make them stick.", "outcome": 'Realistic routines made for her real life, with a way to track them.'},
    {"slug": "her-new-era-confidence-rebuild", "title": "The Confidence Rebuild System", "subtitle": "A 21-day challenge to rebuild real confidence.", "type": "Challenge Workbook", "price": 19, "description": 'Rebuilding real confidence through a 21-day challenge, especially after a setback, breakup, or hard season.', "best_for": 'A woman coming out of a setback, breakup, or hard season who wants to trust herself again.', "outcome": 'Daily proof of her own capability and a steadier sense of self- worth.'},
    {"slug": "her-new-era-goal-to-action-planner", "title": "The Goal-to-Action Life Planner", "subtitle": "Turn her goals into an actual plan.", "type": "Planner", "price": 17, "description": 'Turning big goals into specific monthly, weekly, and daily actions.', "best_for": "A woman with big goals who isn't sure what to do each week to reach them.", "outcome": 'A real plan instead of a wish list.'},
    {"slug": "her-new-era-future-self-ai-kit", "title": "The Future Self AI Planning Kit", "subtitle": "AI prompts to plan the next version of her life.", "type": "Prompt Pack", "price": 15, "is_ai_resource": True, "description": 'Using AI to picture and plan the next version of her life, including her goals, identity, and next steps.', "best_for": 'A woman who wants AI to help her get clear on her next chapter.', "outcome": 'A clear, AI-assisted plan for her future self.'},
    # 👑 CEO Girl AI shelf (alongside existing "ceo-ai-prompt-pack")
    {"slug": "ceo-girl-idea-finder", "title": "Business Idea Finder + AI Validation Kit", "subtitle": "Find and validate a real business idea with AI.", "type": "Workbook", "price": 19, "description": 'Finding a business idea that fits her skills and then using AI to check whether people will pay for it.', "best_for": "A woman who wants to start a business but hasn't picked an idea yet.", "outcome": 'A tested business idea she can feel confident pursuing.'},
    {"slug": "ceo-girl-offer-builder", "title": "The Offer Builder System", "subtitle": "Build an offer people actually want to buy.", "type": "Workbook", "price": 19, "description": 'Creating a product, service, or package that people actually want to buy.', "best_for": "A new business owner who isn't sure what to sell or how to package it.", "outcome": 'A clearly defined offer with its value, price, and positioning.'},
    {"slug": "ceo-girl-ideal-customer-profile", "title": "The Ideal Customer AI Profile Kit", "subtitle": "Know exactly who she's building for.", "type": "Workbook", "price": 15, "description": 'Using AI to define exactly who her customer is, including their problems, wants, and where to find them.', "best_for": "A business owner whose marketing feels like it's speaking to everyone and no one.", "outcome": 'A detailed customer profile that guides her marketing and her offers.'},
    {"slug": "ceo-girl-pricing-calculator", "title": "Digital Product Pricing Calculator + Guide", "subtitle": "Price her digital products with confidence.", "type": "Guide", "price": 15, "description": 'Pricing digital products like e-books, templates, and courses with confidence.', "best_for": "A creator selling e-books, templates, or courses who worries she's undercharging.", "outcome": 'Prices that make sense for her, and she stops undercharging.'},
    {"slug": "ceo-girl-30-day-launch-system", "title": "The 30-Day Business Launch System", "subtitle": "A day-by-day plan to launch in 30 days.", "type": "Workbook", "price": 22, "is_hero": True, "description": 'A day-by-day plan for launching her business in 30 days.', "best_for": 'A woman ready to launch who needs a day-by-day plan to keep her moving.', "outcome": 'A launched business and a clear view of what to do each day.'},
    {"slug": "ceo-girl-content-marketing-kit", "title": "Small Business Content & Marketing Kit", "subtitle": "Market her small business without the overwhelm.", "type": "Toolkit", "price": 19, "description": 'Marketing her small business without the overwhelm, using content ideas, templates, and a simple strategy.', "best_for": 'A small business owner who knows she should market but feels overwhelmed.', "outcome": 'A realistic marketing plan she can keep up.'},
    # 💸 Money Muse AI shelf (alongside existing "money-ai-prompt-pack")
    {"slug": "money-muse-money-reset-workbook", "title": "The Money Reset Workbook", "subtitle": "A full reset on her relationship with money.", "type": "Workbook", "price": 17, "is_hero": True, "description": 'Resetting her relationship with money, including her money mindset, old habits, and emotional spending.', "best_for": 'A woman who knows her money habits are tied to her emotions and wants to change that.', "outcome": 'A healthier, more confident relationship with her finances.'},
    {"slug": "money-muse-ultimate-budget-planner", "title": "The Ultimate Budget Planner", "subtitle": "Budgeting that actually fits her life.", "type": "Planner", "price": 17, "description": 'Building a budget that fits how she actually lives and spends.', "best_for": "A woman who has quit budgets before because they didn't fit her real life.", "outcome": 'A working monthly budget and a simple way to keep it up.'},
    {"slug": "money-muse-debt-freedom-tracker", "title": "The Debt Freedom Tracker", "subtitle": "Track her path to being debt-free.", "type": "Workbook", "price": 17, "description": 'Listing her debts, choosing a payoff strategy, and tracking progress until she is debt-free.', "best_for": 'A woman carrying debt who wants a clear payoff plan and motivation to stick with it.', "outcome": 'A visible, motivating payoff plan.'},
    {"slug": "money-muse-savings-goal-planner", "title": "The Savings Goal Planner", "subtitle": "Plan and track every savings goal.", "type": "Planner", "price": 12, "description": 'Planning and tracking savings goals such as an emergency fund, a trip, a move, or a big purchase.', "best_for": 'A woman saving for something specific, such as an emergency fund, a trip, or a move.', "outcome": 'Clear targets, timelines, and progress trackers for each goal.'},
    {"slug": "money-muse-ai-prompt-pack", "title": "The Money Muse AI Prompt Pack", "subtitle": 'AI prompts for building long-term wealth.', "type": "Prompt Pack", "price": 15, "is_ai_resource": True, "description": "Using AI to build long-term wealth: setting income goals, learning investing basics, and shifting her money mindset. (Recommended new focus, so it's different from the Money AI Prompt Pack, which covers everyday budgets and decisions.)", "best_for": 'A woman who wants AI to help her build long-term wealth and a healthier money mindset.', "outcome": 'Prompts that help her plan long-term wealth, investing basics, income goals, and a calmer money mindset.'},
    # 🎬 Creator Muse AI shelf (alongside existing "content-creator-ai-prompt-pack")
    {"slug": "creator-muse-30-day-content-calendar", "title": "The 30-Day Content Calendar", "subtitle": "A full month of content, planned out.", "type": "Workbook", "price": 17, "is_hero": True, "description": 'Planning a full month of content ahead of time.', "best_for": 'A creator who posts inconsistently and wants a month planned in advance.', "outcome": "A month of posts mapped out, so she isn't posting at random."},
    {"slug": "creator-muse-hooks-templates", "title": "500+ Hooks & Hook Templates", "subtitle": "Never stare at a blank caption box again.", "type": "Guide", "price": 15, "description": 'Writing scroll-stopping first lines for Reels, TikToks, and captions.', "best_for": "A creator whose videos and posts aren't getting people to stop scrolling.", "outcome": 'More than 500 hooks she can adapt, so she never starts from nothing.'},
    {"slug": "creator-muse-caption-vault", "title": "The Caption Vault", "subtitle": "Captions ready to copy, paste, and post.", "type": "Guide", "price": 12, "description": 'Ready-to-use captions she can copy, paste, and post.', "best_for": 'A busy creator or business owner who wants to post consistently without writing from scratch.', "outcome": 'Time saved and posts that stay consistent.'},
    {"slug": "creator-muse-reels-tiktok-script-pack", "title": "Reels & TikTok Script Pack", "subtitle": "Full hook-body-CTA scripts, ready to film.", "type": "Workbook", "price": 19, "description": 'Complete short-form video scripts written in a hook, body, and call-to- action format.', "best_for": 'A creator who wants to post more short-form video but freezes on what to say.', "outcome": 'Scripts that are ready to film.'},
    {"slug": "creator-muse-ai-prompt-pack", "title": "The Creator Muse AI Prompt Pack", "subtitle": 'AI prompts for turning her content into a brand.', "type": "Prompt Pack", "price": 15, "is_ai_resource": True, "description": "Using AI to turn her content into a brand: bios, brand story, pitches to brands, a media kit, and ways to make money. (Recommended new focus, so it's different from the Content Creator AI Prompt Pack, which covers ideas, captions, and scripts.)", "best_for": 'A creator ready to turn her content into a brand, such as bios, brand pitches, and a media kit.', "outcome": 'Prompts for her bio, brand story, brand-deal pitches, media kit, and monetization plan.'},
    # 🏡 Home Reset AI shelf (alongside existing "home-lifestyle-ai-prompt-pack")
    {"slug": "home-reset-whole-home-reset", "title": "The Whole Home Reset", "subtitle": "A room-by-room method for resetting her whole home.", "type": "Workbook", "price": 19, "is_hero": True, "description": 'Resetting her entire home one room at a time.', "best_for": 'A woman whose home feels chaotic and who wants a fresh start room by room.', "outcome": 'A fully reset home and a method she can repeat.'},
    {"slug": "home-reset-declutter-challenge", "title": "The Declutter Challenge", "subtitle": "A 14-day zone-by-zone declutter challenge.", "type": "Challenge Workbook", "price": 15, "description": 'Decluttering her home zone by zone over 14 days.', "best_for": 'A woman who feels overwhelmed by stuff and wants a short, doable challenge.', "outcome": 'Less stuff, more space, and a lighter-feeling home.'},
    {"slug": "home-reset-cleaning-system", "title": "The Cleaning System", "subtitle": "A daily, weekly, and monthly cleaning rotation.", "type": "Guide", "price": 15, "description": 'A daily, weekly, and monthly cleaning rotation, so cleaning is never overwhelming.', "best_for": 'A woman who cleans in big stressful bursts and wants a steady routine instead.', "outcome": 'A home that stays clean with small, steady effort.'},
    {"slug": "home-reset-room-organization-planner", "title": "The Room Organization Planner", "subtitle": "A reusable method for organizing any room.", "type": "Planner", "price": 15, "description": "A method she can reuse to organize any room, whether it's a closet, kitchen, or office.", "best_for": 'A woman who wants organized spaces that stay organized.', "outcome": 'Organized spaces and systems that last.'},
    {"slug": "home-reset-moving-planner", "title": "The Moving Planner", "subtitle": "From 8 weeks out to move-in day, fully mapped.", "type": "Planner", "price": 17, "description": 'Planning a move from eight weeks out to move-in day.', "best_for": 'Anyone with a move coming up in the next two months.', "outcome": 'A stress-free move with nothing forgotten.'},
    # 🎓 Study Muse AI shelf - new shelf, no existing product yet
    {"slug": "study-muse-ai-schedule-builder", "title": "The AI Study Schedule Builder", "subtitle": "Turn your exam date and subjects into a real schedule with AI.", "type": "Planner", "price": 15, "is_ai_resource": True, "is_hero": True, "description": 'Using AI to turn her exam dates and subjects into a realistic study schedule.', "best_for": "A student with exams coming up who doesn't know where to start.", "outcome": 'A custom study plan she can actually follow.'},
    {"slug": "study-muse-exam-prep-system", "title": "The Exam Prep System", "subtitle": "A complete method for walking into any exam prepared.", "type": "Workbook", "price": 17, "description": 'A complete method for preparing for any exam.', "best_for": 'A student who wants one reliable method she can use for every exam.', "outcome": 'Confidence walking into the test room.'},
    {"slug": "study-muse-30-day-exam-countdown", "title": "The 30-Day Exam Countdown", "subtitle": "A day-by-day structure for the month before your exam.", "type": "Planner", "price": 15, "description": 'A day-by-day structure for the month before a big exam.', "best_for": 'A student with a big exam about a month away.', "outcome": 'Steady preparation instead of last-minute cramming.'},
    {"slug": "study-muse-active-recall-study-kit", "title": "The Active Recall & Study Method Kit", "subtitle": "The research-backed techniques that actually build memory.", "type": "Guide", "price": 15, "description": 'Learning research-backed study techniques, such as active recall and spaced repetition, that actually build memory.', "best_for": 'A student who studies for hours but forgets what she learned.', "outcome": 'Better retention in less study time.'},
    {"slug": "study-muse-finals-week-survival-system", "title": "The Finals Week Survival System", "subtitle": "A triage system for the week everything is due at once.", "type": "Guide", "price": 12, "description": 'Prioritizing when everything is due at once.', "best_for": 'A student facing finals with too much due at once.', "outcome": 'A clear plan to get through finals week without falling apart.'},
    {"slug": "study-muse-ai-prompt-kit", "title": "The Study AI Prompt Kit", "subtitle": "Prompts that turn AI into a study partner.", "type": "Prompt Pack", "price": 12, "is_ai_resource": True, "description": 'Turning AI into a study partner that can quiz her, explain concepts, summarize notes, and make flashcards.', "best_for": 'A student who wants AI to quiz her, explain topics, and make flashcards.', "outcome": 'A personal tutor she can use any time.'},
    # 🌴 Florida Property AI shelf - new shelf, vacation-rental hosting angle.
    # General frameworks/systems only, same as every other shelf - no
    # specific tax/legal/licensing claims stated as fact anywhere here.
    # is_active=False on all 6: the lineup (titles/prices) is approved, but
    # unlike the other 33, none of these have actual workbook content or a
    # PDF written yet - flip to True per-product via PATCH /vault/admin/
    # products/{id} once each one is real.
    {"slug": "florida-property-short-term-rental-launch-kit", "title": "The Short-Term Rental Launch Kit", "subtitle": "Everything to set up her first vacation rental the right way.", "type": "Workbook", "price": 19, "is_hero": True, "is_active": False},
    {"slug": "florida-property-host-pricing-revenue-planner", "title": "The Host Pricing & Revenue Planner", "subtitle": "Price her nights with a system, not a guess.", "type": "Planner", "price": 17, "is_active": False},
    {"slug": "florida-property-5-star-guest-experience-playbook", "title": "The 5-Star Guest Experience Playbook", "subtitle": "Turn one-time guests into repeat bookings and reviews.", "type": "Guide", "price": 15, "is_active": False},
    {"slug": "florida-property-systems-turnover-checklist", "title": "The Property Systems & Turnover Checklist", "subtitle": "A repeatable system for every guest turnover.", "type": "Workbook", "price": 17, "is_active": False},
    {"slug": "florida-property-rental-investment-tracker", "title": "The Rental Property Investment Tracker", "subtitle": "Track income, expenses, and ROI on every property.", "type": "Planner", "price": 15, "is_active": False},
    {"slug": "florida-property-ai-prompt-pack", "title": "The Florida Property AI Prompt Pack", "subtitle": "AI prompts for listings, guest messages, and pricing strategy.", "type": "Prompt Pack", "price": 15, "is_ai_resource": True, "is_active": False},
]

# Future AI Collection additions, seeded as the Vault's Monthly Drops so
# "New This Month" / "Monthly Drops" has real data to show.
AI_COLLECTION_DROPS = [
    {"slug": "ceo-ai-prompt-pack", "title": "CEO AI Prompt Pack", "subtitle": "Prompts for the boss building her empire.", "life_area": "ai", "drop_month": "2026-09", "description": 'Using AI for business tasks like planning, marketing, emails, strategy, and decisions.', "best_for": 'A business owner who wants to hand everyday business tasks to AI.', "outcome": 'Prompts that work like an assistant for her business.'},
    {"slug": "money-ai-prompt-pack", "title": "Money AI Prompt Pack", "subtitle": "Prompts for getting her money right.", "life_area": "ai", "drop_month": "2026-08", "description": 'Using AI to make budgets, plan savings, understand money topics, and make financial decisions.', "best_for": 'A woman who wants quick, practical help with everyday money tasks.', "outcome": 'Ready-made prompts that make AI her personal money assistant.'},
    {"slug": "dating-relationships-ai-prompt-pack", "title": "Dating & Relationships AI Prompt Pack", "subtitle": "Prompts for her heart and her boundaries.", "life_area": "ai", "drop_month": "2026-07", "description": 'Using AI to think through dating, understand her patterns, set boundaries, and plan hard conversations.', "best_for": 'A woman who is dating, healing from a breakup, or wants healthier relationship patterns.', "outcome": 'More clarity about what she wants in love and the confidence to protect her peace.'},
    {"slug": "home-lifestyle-ai-prompt-pack", "title": "Home & Lifestyle AI Prompt Pack", "subtitle": "Prompts for the life she's building at home.", "life_area": "ai", "drop_month": "2026-06", "description": 'Using AI for meal plans, cleaning schedules, organizing, home projects, and household routines.', "best_for": 'A busy woman who wants AI to help run her household.', "outcome": 'An AI assistant for running her home.'},
]

STARTER_BUNDLE_SLUGS = [
    "soft-life-blueprint",
    "soft-life-reset",
    "that-girl-daily-planner",
    "soft-life-morning-routine-guide",
    "weekly-reset-checklist",
]

RESET_BUNDLE_SLUGS = [
    "soft-life-reset",
    "soft-life-morning-routine-guide",
    "soft-life-night-routine-guide",
    "weekly-reset-checklist",
    "monthly-soft-life-reset",
    "soft-life-goal-setting-workbook",
]

BUNDLES = [
    {
        "slug": "starter-bundle",
        "name": "Starter Bundle",
        "description": "Five essentials to start her soft life era. A $54 value.",
        "price": 27,
        "product_slugs": STARTER_BUNDLE_SLUGS,
    },
    {
        "slug": "reset-bundle",
        "name": "Reset Bundle",
        "description": "Six resources for whenever she needs to hit reset. A $94 value.",
        "price": 47,
        "product_slugs": RESET_BUNDLE_SLUGS,
    },
    {
        # Launch price - brief calls for $79-$97 at launch, raised to $127
        # later. Adjust here (and in Stripe) when that changes.
        "slug": "full-library",
        "name": "Full Digital Library",
        "description": "All 18 products. Every tool, unlocked. A $270+ value - launch pricing, going up to $127 later.",
        "price": 79,
        "product_slugs": [p["slug"] for p in PRODUCTS],
    },
    {
        # Positioned in marketing copy as a founding membership, but still
        # implemented as the existing one-time purchase + lifetime
        # entitlement - no recurring billing is wired up yet. Revisit once
        # an actual annual price/renewal structure is decided.
        "slug": "founding-member-lifetime",
        "name": "Founding Member",
        "description": "Full Library + app access + AI + Vault + founding-only bonuses, forever. She was here first.",
        "price": 147,
        "product_slugs": [p["slug"] for p in PRODUCTS],
        "includes_app_access": True,
        "is_founding_member": True,
    },
]


async def _upsert_product(db, data: dict) -> None:
    now = datetime.now(timezone.utc)
    file_url = data.get("file_url") or (f"local:vault/{data['slug']}.pdf" if (STATIC_VAULT_DIR / f"{data['slug']}.pdf").is_file() else "")
    # Structural/catalog fields this seed owns outright and keeps in sync
    # with this file on every boot.
    doc = {
        "title": data["title"],
        "subtitle": data.get("subtitle", ""),
        "type": data["type"],
        "collection": data.get("collection", "ai"),
        "life_area": data.get("life_area", "ai"),
        "credit_line": data.get("credit_line", "D. Jones / Soft Life Society"),
        "price": data["price"],
        "file_url": file_url,
        "is_ai_resource": data.get("is_ai_resource", False),
        "is_monthly_drop": data.get("is_monthly_drop", False),
        "is_hero": data.get("is_hero", False),
        "drop_month": data.get("drop_month"),
        "updated_at": now,
    }
    existing = await db.products.find_one({"slug": data["slug"]})
    if existing:
        # description/best_for/outcome/thumbnail_url/is_active are content
        # and business fields owned by the copy-import script and the admin
        # panel - a boot must not silently stomp them back to whatever this
        # file happened to say (that's the bug that made "flip is_active via
        # PATCH" in the docstring above not actually stick). Only touch one
        # here if this file explicitly sets it.
        for key in ("description", "best_for", "outcome", "thumbnail_url", "is_active"):
            if key in data:
                doc[key] = data[key]
        await db.products.update_one({"_id": existing["_id"]}, {"$set": doc})
    else:
        doc["slug"] = data["slug"]
        doc["bundle_ids"] = []
        doc["description"] = data.get("description", "")
        doc["best_for"] = data.get("best_for", "")
        doc["outcome"] = data.get("outcome", "")
        doc["whats_inside"] = data.get("whats_inside", [])
        doc["thumbnail_url"] = data.get("thumbnail_url", "")
        doc["is_active"] = data.get("is_active", True)
        doc["created_at"] = now
        await db.products.insert_one(doc)


async def _upsert_bundle(db, data: dict) -> None:
    now = datetime.now(timezone.utc)
    product_docs = await db.products.find({"slug": {"$in": data["product_slugs"]}}).to_list(length=None)
    product_ids = [doc["_id"] for doc in product_docs]

    doc = {
        "name": data["name"],
        "description": data.get("description", ""),
        "price": data["price"],
        "product_ids": product_ids,
        "includes_app_access": data.get("includes_app_access", False),
        "is_founding_member": data.get("is_founding_member", False),
        "is_active": True,
        "updated_at": now,
    }
    existing = await db.bundles.find_one({"slug": data["slug"]})
    if existing:
        bundle_id = existing["_id"]
        await db.bundles.update_one({"_id": bundle_id}, {"$set": doc})
    else:
        doc["slug"] = data["slug"]
        doc["created_at"] = now
        result = await db.bundles.insert_one(doc)
        bundle_id = result.inserted_id

    await db.products.update_many({"_id": {"$in": product_ids}}, {"$addToSet": {"bundle_ids": bundle_id}})


async def run() -> None:
    db = get_database()

    for product in PRODUCTS:
        await _upsert_product(db, product)
    for drop in AI_COLLECTION_DROPS:
        await _upsert_product(
            db,
            {**drop, "type": "Prompt Pack", "price": 12, "is_ai_resource": True, "is_monthly_drop": True},
        )
    for product in AI_BRAND_PRODUCTS:
        await _upsert_product(db, {**product, "collection": "ai", "life_area": "ai"})

    for bundle in BUNDLES:
        await _upsert_bundle(db, bundle)

    print(
        f"Seeded {len(PRODUCTS)} products, {len(AI_COLLECTION_DROPS)} monthly drops, "
        f"{len(AI_BRAND_PRODUCTS)} AI brand shelf products, {len(BUNDLES)} bundles."
    )


if __name__ == "__main__":
    asyncio.run(run())
