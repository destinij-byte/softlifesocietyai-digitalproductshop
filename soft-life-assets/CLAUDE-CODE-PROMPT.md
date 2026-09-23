# Claude Code Prompt: Soft Life Society AI (Final, All-in-One)

**This prompt replaces Part 2, so you only need this one.**

**Before you paste it:** unzip `soft-life-assets.zip` and put the `soft-life-assets` folder in the root of your project, next to your frontend and backend folders. Then copy everything below the line into Claude Code.

---

You're continuing work on my site **Soft Life Society AI** (https://softlifesocietyai.com). The frontend is React + Vite, and the backend is FastAPI on Render at `https://api.softlifesocietyai.com` (it looks like MongoDB). Phase 1 is already live: the backend wake-up, retries, loading states, and the public Upgrade and Box pages all work.

Everything you need is in the `soft-life-assets/` folder in the project root:

| File | What it is |
|---|---|
| `data/product-copy.json` | Copy for all 55 products: the 45 in the shop plus 10 that are currently bundle-only. It has `description` (Helps with), `best_for`, and `outcome` (She walks away with). `drafted_fields` shows which fields my assistant wrote, and `currently_hidden_from_shop` marks the 10 bundle-only items. |
| `data/bundle-plan.json` | My decisions on bundles, new collection bundles, products to publish, and promo codes |
| `covers/product/{slug}.png` | Finished cover images (1200×1500) for all 55 products |
| `covers/og/{slug}.png` | Social share images (1200×630) for all 55 products |
| `og-image.png` | Site-wide share image (1200×630) |
| `freebies/soft-life-reset-checklist.pdf` | Free lead-magnet PDF for the email signup |
| `products/the-soft-life-blueprint-v2.pdf` | The upgraded version of The Soft Life Blueprint, which replaces the current download file |
| `content/about.md` | About page copy, with placeholders I'll fill in |

Work in the order below and commit after each section. **For every database write, Stripe change, or file replacement: do a dry run, show me the summary, and wait for my "OK" before running it for real.**

## 1. Publish the 10 hidden products

- These slugs are in bundles but don't appear in `GET /vault/products`, and `GET /vault/products/{slug}` returns "Product not found": `that-girl-daily-planner`, `soft-life-morning-routine-guide`, `soft-life-night-routine-guide`, `weekly-reset-checklist`, `monthly-soft-life-reset`, `soft-life-goal-setting-workbook`, `dream-life-vision-planner`, `soft-life-budget-planner`, `soft-life-journal`, `affirmations-for-her`.
- Find the reason (an inactive/unpublished flag or a query filter) and publish them so they appear in the shop and on their own product pages. Keep their current prices ($7–$17).
- Confirm that each one has a real downloadable file attached. List any that don't, and don't publish those until I upload a file.

## 2. Fix and expand bundles (follow `data/bundle-plan.json`)

- Remove hard-coded dollar values from bundle descriptions. Always show value and savings using `individual_total` and `savings` from the API.
- Apply the `fix_existing` changes:
  - New descriptions for all four current bundles
  - Rename "Full Digital Library" to "The Soft Life Library"
  - The Founding Member bundle includes **all active products** (55) instead of 18
- Create the `new_bundles`: "The Everything Vault" ($127, all active products) and the six collection bundles (Her New Era $47, Money Muse $37, CEO Girl $47, Creator Muse $39, Home Reset $37, Study Muse $37), using the `product_slugs` listed.
  - Bundles that include "all active products" should be computed dynamically, so new products get added automatically.
- Create the matching Stripe prices or products for any new bundles, in the same way the existing bundles are set up.
- On every bundle card, add a "See what's inside" expand that lists the products.
- Upgrade page order: collection bundles → Starter and Reset → The Soft Life Library → The Everything Vault → Founding Member, with Founding Member highlighted as the best deal.

## 3. Load product copy and covers

- Add the optional fields `best_for`, `outcome`, and `whats_inside` (a list, which I'll fill in later) to the product model, the API responses, and the admin create/edit form. `description` and `thumbnail_url` already exist but are empty.
- Write `scripts/import_product_copy` to update `description`, `best_for`, and `outcome` by `slug` from `data/product-copy.json`. Don't change titles, prices, or slugs, except for the two subtitle updates below.
- Update the subtitles of these two products:
  - `money-muse-ai-prompt-pack`: "AI prompts for building long-term wealth."
  - `creator-muse-ai-prompt-pack`: "AI prompts for turning her content into a brand."
- Copy `covers/product/*` to `public/covers/` and `covers/og/*` to `public/covers/og/`. Set each product's `thumbnail_url` to `/covers/{slug}.png`, or upload the images to wherever the site stores product images if that's the existing pattern.
- In `/admin`, add thumbnail upload so I can replace covers later.
- Show a fallback `ProductCover` component (title on an ivory background with a gold border) for any product without an image.

## 4. Replace The Soft Life Blueprint file

- Replace the downloadable file for `soft-life-blueprint` with `products/the-soft-life-blueprint-v2.pdf`, using the existing file system (`/vault/files` or the admin upload). Keep the old file as a backup.
- Anyone who already bought it should get the new version in My Library automatically.
- The new PDF mentions the promo code **BLUEPRINT15** (15% off). Create it in Stripe (or the site's discount system) and make sure the cart and checkout accept promo codes. **Show me first.**

## 5. Product detail pages

- Add a `/shop/:slug` route that uses `GET /vault/products/{id_or_slug}`. Clicking a card or title opens it, and "Add to Cart" still adds to the cart.
- Page layout:
  - Large cover image
  - Type label, title, subtitle, and price
  - **Helps with**, **Best for**, and **She walks away with**
  - A "What's inside" list, shown only if it has items
  - Add to Cart and Buy Now buttons
  - A "Save with a bundle" box listing bundles that include this product, with savings
  - Four related products from the same collection
- Add a 404 state for unknown slugs.

## 6. Email signup and freebie

- Change the "Join the list" block to: **"Get the free Soft Life Reset Checklist"**.
- Add `POST /subscribers` (email, source, created_at) with duplicate protection and basic rate limiting, or connect it to my email platform if one already exists in the code.
- After signup, show a success message with a download link to `/freebies/soft-life-reset-checklist.pdf` (copy it into `public/freebies/`).
- Add a simple admin view or CSV export of subscribers.

## 7. Layout fixes (tested at 1024px wide)

- The header wraps ("Log in" breaks into two lines). Switch to the hamburger menu below about 1200px, and add `white-space: nowrap` on the nav links and buttons.
- The Shop, Upgrade, and Box pages have no side padding. Add a shared container: `max-width: 1200px; margin: 0 auto; padding: 0 24px` (16px on mobile).
- The Upgrade page scrolls sideways at 1024px. Fix the overflowing element.
- Product grid: 4 columns at 1200px and up, 3 at 900px, 2 at 600px, and 1–2 on phones. Cards should have equal heights, with the buttons aligned at the bottom.
- The Box cards show a large "?". Replace it with a gift or box icon and the label "Surprise inside".
- Scroll-reveal animations: content must be visible by default. Respect `prefers-reduced-motion`, and add a 1-second reveal fallback.
- Darken the gold for small text if it fails WCAG AA contrast on cream.

## 8. Homepage and About

- Link the pillar cards to the filtered Shop (for example `/shop?collection=money-muse`), not `/register`. Add filter chips on the Shop page, and support `?collection=` and `?area=` in the URL.
- Add a **Shop by collection** row: Soft Life, Her New Era, Money Muse, CEO Girl, Creator Muse, Home Reset, Study Muse, and AI, each with its product count, a cover thumbnail, and a link to its collection bundle.
- Add a pricing summary: single products from $7, collection bundles from $37, The Everything Vault $127, and Founding Member $147. Pull the prices from the API.
- Build `/about` from `content/about.md`. Keep my `[PLACEHOLDER]` text visible so I can find it and replace it. Point the footer "About" link to `/about`.
- Add a testimonials section driven by `src/data/testimonials.json`. Keep it hidden while the file is empty, and never invent reviews.

## 9. SEO and sharing

- Use `react-helmet-async` for a unique title and meta description on every route. Examples: "The Vault | Soft Life Society AI", and on product pages "{title} | Soft Life Society AI" with the subtitle as the description.
- Add Open Graph and Twitter tags. Use `og-image.png` for the site (copy it to `public/`), and `/covers/og/{slug}.png` on each product page.
- `robots.txt` and `sitemap.xml` currently return the homepage HTML. Create a real `public/robots.txt` and a build-time `sitemap.xml` covering all public routes and every `/shop/{slug}`.
- Add JSON-LD: `Organization` on the homepage, and `Product` + `Offer` (USD, InStock) on product pages.
- Prerender the public routes at build time.

## Rules

- Don't break checkout, the Stripe webhooks (`/vault/webhook/stripe`, `/academy/webhook/stripe`), login, My Library, or downloads.
- After each section, test the full flow in Stripe test mode: add to cart → checkout → success → item appears in My Library → download works.
- Show me first before any database write, Stripe change, price change, or file replacement.
- Keep the brand: ivory/cream, gold, Cormorant Garamond headings, DM Sans body, and the warm "she/her era" voice.
- At the end, give me:
  1. a checklist of everything you changed,
  2. anything that still needs my input (photo, story, testimonials, missing files),
  3. exact deploy steps for the frontend and backend.
