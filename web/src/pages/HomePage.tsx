import { SVGProps } from "react";
import { Link, useNavigate } from "react-router-dom";

import { vaultApi, Product } from "../api/vault";
import { useAsyncData } from "../hooks/useAsyncData";
import { useCart } from "../context/CartContext";
import { FadeInSection } from "../components/FadeInSection";
import { FaqAccordion, FaqItem } from "../components/FaqAccordion";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { ProductCard } from "../components/ProductCard";
import { BundleCard } from "../components/BundleCard";
import { COLLECTIONS } from "../theme/collections";
import {
  IconAscend,
  IconBloom,
  IconCompass,
  IconCoin,
  IconCrown,
  IconFlame,
  IconHeart,
  IconKey,
  IconSpark,
  IconSun,
  IconTarget,
} from "../components/icons/LineIcons";
import { LIFE_AREAS, LIFE_AREA_ORDER } from "../theme/lifeAreas";
import type { LifeArea } from "../api/vault";
import catalogFallback from "../data/catalogFallback.json";

const LIFE_AREA_ICONS: Record<LifeArea, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  soft_life: IconBloom,
  goals: IconTarget,
  money: IconCoin,
  ceo_life: IconCrown,
  ai: IconSpark,
  inner_life: IconHeart,
  challenges: IconFlame,
};

const WHAT_IS_CARDS = [
  { title: "Plan Your Life", body: "Organize the goals, routines, and plans that move you forward.", Icon: IconCompass },
  { title: "Glow Daily", body: "Build habits, confidence, wellness, and rituals that make you feel like yourself again.", Icon: IconSun },
  { title: "Become Her", body: "Turn the woman you envision into the woman you consistently choose to be.", Icon: IconAscend },
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

const ORBIT_RADIUS = 160;

export function HomePage() {
  const navigate = useNavigate();
  const cart = useCart();
  const { data: products } = useAsyncData(() => vaultApi.listProducts(), {
    cacheKey: "sls_cache_products",
    fallback: catalogFallback as Product[],
  });
  const { data: bundles } = useAsyncData(() => vaultApi.listBundles(), {
    cacheKey: "sls_cache_bundles",
  });
  const heroProducts = (products ?? []).filter((p) => p.is_hero).slice(0, 4);
  const featuredBundle = (bundles ?? []).find((b) => b.slug === "full-library");

  function handleAddToCart(product: Product) {
    cart.addItem({ type: "product", id: product.id, title: product.title, price: product.price, thumbnailUrl: product.thumbnail_url });
  }

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
          <p className="hero-trust">AI-POWERED &nbsp;·&nbsp; GOAL-DRIVEN &nbsp;·&nbsp; DESIGNED FOR YOUR NEXT ERA</p>

          <div className="hero-orbit" aria-hidden="true">
            <div className="hero-orbit-ring" />
            <div className="hero-orbit-center">
              <IconKey style={{ width: 30, height: 30 }} />
            </div>
            {LIFE_AREA_ORDER.map((key, i) => {
              const angle = (i * (360 / LIFE_AREA_ORDER.length) - 90) * (Math.PI / 180);
              const x = Math.round(Math.cos(angle) * ORBIT_RADIUS);
              const y = Math.round(Math.sin(angle) * ORBIT_RADIUS);
              const Icon = LIFE_AREA_ICONS[key];
              return (
                <div
                  key={key}
                  className="hero-orbit-node"
                  style={{ left: "50%", top: "50%", transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
                >
                  <Icon style={{ width: 20, height: 20 }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products - a taste of the Vault before she has to join */}
      {(heroProducts.length > 0 || featuredBundle) && (
        <FadeInSection>
          <section className="section">
            <div className="container">
              <div className="section-head">
                <h2>From the Vault</h2>
                <p className="muted" style={{ marginTop: 14, fontSize: 15.5 }}>
                  A few favorites — browse the full Shop for everything.
                </p>
              </div>
              <div className="grid grid-products">
                {heroProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    title={product.title}
                    subtitle={product.subtitle}
                    type={product.type}
                    price={product.price}
                    thumbnailUrl={product.thumbnail_url}
                    collectionMeta={COLLECTIONS[product.collection]}
                    creditLine={product.credit_line}
                    onClick={() => navigate(`/shop/${product.slug}`)}
                    onAddToCart={() => handleAddToCart(product)}
                    inCart={cart.has(product.id)}
                  />
                ))}
              </div>
              {featuredBundle && (
                <div style={{ maxWidth: 360, margin: "32px auto 0" }}>
                  <BundleCard
                    name={featuredBundle.name}
                    description={featuredBundle.description}
                    price={featuredBundle.price}
                    individualTotal={featuredBundle.individual_total}
                    savings={featuredBundle.savings}
                    productCount={featuredBundle.products.length}
                    onBuy={() => navigate("/register", { state: { from: "/upgrade" } })}
                  />
                </div>
              )}
              <div className="row" style={{ justifyContent: "center", marginTop: 28 }}>
                <Link to="/shop" className="btn btn-outline-gold">
                  BROWSE THE FULL SHOP
                </Link>
              </div>
            </div>
          </section>
        </FadeInSection>
      )}

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
              {WHAT_IS_CARDS.map(({ title, body, Icon }) => (
                <div className="card card-hover" key={title}>
                  <span className="icon-badge">
                    <Icon style={{ width: 22, height: 22 }} />
                  </span>
                  <h3 style={{ marginTop: 16 }}>{title}</h3>
                  <p className="muted" style={{ marginTop: 10 }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Society Ecosystem - deliberately dark: the one section that should
          feel like a private members' club, not a soft pastel page. */}
      <FadeInSection>
        <section className="section" id="society" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
          <div className="container">
            <div className="section-head">
              <span className="hero-eyebrow" style={{ color: "var(--champagne)" }}>
                The Ecosystem
              </span>
              <h2 style={{ color: "var(--champagne)", marginTop: 10 }}>Seven pillars. One society.</h2>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {LIFE_AREA_ORDER.map((key) => {
                const Icon = LIFE_AREA_ICONS[key];
                return (
                  <Link to={`/shop?area=${key}`} className="pillar-card-dark" key={key}>
                    <span className="icon-badge icon-badge-dark">
                      <Icon style={{ width: 22, height: 22 }} />
                    </span>
                    <h3 style={{ fontSize: 18, color: "var(--ivory)", marginTop: 14 }}>{LIFE_AREAS[key].label}</h3>
                    <p style={{ fontSize: 13.5, color: "var(--ivory)", opacity: 0.65, marginTop: 6 }}>
                      {LIFE_AREAS[key].description}
                    </p>
                    <span className="pillar-card-link" style={{ color: "var(--champagne)" }}>
                      Shop this pillar →
                    </span>
                  </Link>
                );
              })}
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
            <p style={{ fontSize: 22, fontFamily: "var(--font-display)", color: "var(--champagne)", lineHeight: 1.5 }}>
              Not another planner. Not another productivity app. Not another generic AI chatbot.
            </p>
            <p style={{ marginTop: 18, fontSize: 16, opacity: 0.85, lineHeight: 1.6 }}>
              One intentional ecosystem for the woman building a life she actually wants to live.
            </p>
          </div>
        </section>
      </FadeInSection>

      {/* Testimonials - sample/placeholder copy for launch; see
          data/testimonials.ts to swap in real customer testimonials later. */}
      <FadeInSection>
        <TestimonialsSection />
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
        <section className="section">
          <div className="container">
            <div className="email-capture-card">
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
          </div>
        </section>
      </FadeInSection>
    </div>
  );
}
