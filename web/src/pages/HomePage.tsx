import { Link } from "react-router-dom";

import { FadeInSection } from "../components/FadeInSection";
import { FaqAccordion, FaqItem } from "../components/FaqAccordion";
import { LIFE_AREAS, LIFE_AREA_ORDER } from "../theme/lifeAreas";

const WHAT_IS_CARDS = [
  { title: "Plan Your Life", body: "Organize the goals, routines, and plans that move you forward." },
  { title: "Glow Daily", body: "Build habits, confidence, wellness, and rituals that make you feel like yourself again." },
  { title: "Become Her", body: "Turn the woman you envision into the woman you consistently choose to be." },
];

const STEPS = [
  { number: "01", title: "Join", body: "Create your account and enter your Soft Life Society." },
  { number: "02", title: "Choose Your Era", body: "Explore the tools, resources, challenges, and digital library designed around the life you're building." },
  { number: "03", title: "Become Her", body: "Use the Society consistently and turn intention into action." },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is Soft Life Society AI?",
    answer:
      "A members-only digital lifestyle brand — a curated Vault of digital products, monthly drops, and an AI-powered companion app, built around one intentional system for your goals, routines, money, business, and mindset.",
  },
  {
    question: "Is Soft Life Society AI an app?",
    answer:
      "This website is your storefront and membership home — browse the Vault, manage your purchases, and join The Box. The personalized AI tools, goal tracking, routines, and challenges live inside the Soft Life Society AI app, which you can open anytime from your dashboard.",
  },
  {
    question: "What's included in the Vault?",
    answer:
      "The Vault is our full digital library — workbooks, planners, guides, and AI prompt packs organized by collection, from Soft Life essentials to Money, CEO, and AI-powered resources.",
  },
  {
    question: "What's included in the digital library?",
    answer:
      "Every workbook, planner, checklist, guide, and prompt pack you've unlocked — individually, through a bundle, or as a Founding Member — lives in My Library, ready whenever you are.",
  },
  {
    question: "How does the AI work?",
    answer:
      "Inside the app, Luna Reyes — your AI coach — helps you plan your day, your goals, and your routines across four modes: Life, Money, Wellness, and Goals.",
  },
  {
    question: "How do I access my purchases?",
    answer: "Every product you unlock lives in My Library, available anytime you're logged in — no re-downloading or re-purchasing.",
  },
  {
    question: "Are the products digital?",
    answer:
      "Yes — every product in the Vault is a digital download, unlocked instantly after purchase. Nothing physical ships, unless you're subscribed to The Box, which is a physical, hand-packed monthly box.",
  },
  {
    question: "How does Monthly Drops work?",
    answer:
      "The Box is our monthly subscription — Skincare or Lifestyle, in three sizes, hand-packed and shipped every month. Subscribe by the monthly cutoff to get that month's box.",
  },
  {
    question: "Can I cancel my membership?",
    answer: "Yes, anytime, from your account. Cancelling stops future billing; any current period stays active through its end.",
  },
  {
    question: "What happens after I purchase?",
    answer: "Individual products and bundles unlock instantly in My Library. The Box ships according to that month's schedule.",
  },
  {
    question: "How do I contact support?",
    answer: "Email support@softlifesocietyai.com and we'll get back to you.",
  },
];

const ORBIT_RADIUS = 150;

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow">Soft Life Society AI</span>
          <h1>Become the woman you&apos;ve been working toward.</h1>
          <p className="hero-sub">
            Soft Life Society AI brings your goals, routines, mindset, money, wellness, and
            personal growth into one intentional space.
          </p>
          <div className="hero-ctas">
            <Link to="/register" className="btn btn-gold">
              ENTER THE SOCIETY
            </Link>
            <Link to="/shop" className="btn btn-outline-gold">
              EXPLORE THE VAULT
            </Link>
          </div>
          <p className="hero-trust">AI-powered. Goal-driven. Designed for your next era.</p>

          <div className="hero-orbit" aria-hidden="true">
            <div className="hero-orbit-ring" />
            <div className="hero-orbit-center">
              <span style={{ fontSize: 26 }}>✨</span>
            </div>
            {LIFE_AREA_ORDER.map((key, i) => {
              const angle = (i * (360 / LIFE_AREA_ORDER.length) - 90) * (Math.PI / 180);
              const x = Math.round(Math.cos(angle) * ORBIT_RADIUS);
              const y = Math.round(Math.sin(angle) * ORBIT_RADIUS);
              return (
                <div
                  key={key}
                  className="hero-orbit-node"
                  style={{ left: "50%", top: "50%", transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
                >
                  {LIFE_AREAS[key].emoji}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What is Soft Life Society */}
      <FadeInSection>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>Your life deserves a system.</h2>
              <p className="muted" style={{ marginTop: 14, fontSize: 15.5, lineHeight: 1.6 }}>
                Soft Life Society AI was created for the woman who wants more — more intention,
                more confidence, more organization, more financial freedom, more wellness, and
                more time to actually enjoy the life she&apos;s building.
              </p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {WHAT_IS_CARDS.map((card) => (
                <div className="card card-hover" key={card.title}>
                  <h3>{card.title}</h3>
                  <p className="muted" style={{ marginTop: 10 }}>
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Society Ecosystem */}
      <FadeInSection>
        <section className="section" id="society" style={{ background: "var(--soft-pink)" }}>
          <div className="container">
            <div className="section-head">
              <h2>The Society Ecosystem</h2>
              <p className="muted" style={{ marginTop: 14 }}>Seven pillars. One intentional system.</p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {LIFE_AREA_ORDER.map((key) => (
                <Link to="/register" className="card card-hover pillar-card" key={key}>
                  <span className="medallion">{LIFE_AREAS[key].emoji}</span>
                  <h3 style={{ fontSize: 19 }}>{LIFE_AREAS[key].label}</h3>
                  <p className="muted" style={{ fontSize: 13.5 }}>{LIFE_AREAS[key].description}</p>
                  <span className="pillar-card-link">Inside the Society →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* How It Works */}
      <FadeInSection>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>How it works</h2>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {STEPS.map((step) => (
                <div className="step-card" key={step.number}>
                  <span className="step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p className="muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Why Soft Life Society AI */}
      <FadeInSection>
        <section className="section" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
          <div className="container" style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
            <p style={{ fontSize: 20, fontFamily: "var(--font-display)", color: "var(--champagne)", lineHeight: 1.5 }}>
              Not another planner. Not another productivity app. Not another generic AI chatbot.
            </p>
            <p style={{ marginTop: 18, fontSize: 16, opacity: 0.85, lineHeight: 1.6 }}>
              One intentional ecosystem for the woman building a life she actually wants to live.
            </p>
          </div>
        </section>
      </FadeInSection>

      {/* FAQ */}
      <FadeInSection>
        <section className="section" id="faq">
          <div className="container" style={{ maxWidth: 720 }}>
            <div className="section-head">
              <h2>Questions, answered.</h2>
            </div>
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </section>
      </FadeInSection>

      {/* Email capture */}
      <FadeInSection>
        <section className="section" style={{ background: "var(--soft-pink)" }}>
          <div className="container" style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
            <h2>Your next era starts here.</h2>
            <p className="muted" style={{ marginTop: 12 }}>
              Join the Society list for first access to new drops, exclusive resources, launch
              offers, and updates.
            </p>
            <form
              className="row gap-sm"
              style={{ marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                aria-label="Email address"
                style={{
                  border: "1.5px solid var(--blush)",
                  background: "#fff",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                  fontSize: 15,
                  minWidth: 240,
                }}
              />
              <button className="btn btn-gold" type="submit">
                JOIN THE LIST
              </button>
            </form>
          </div>
        </section>
      </FadeInSection>
    </div>
  );
}
