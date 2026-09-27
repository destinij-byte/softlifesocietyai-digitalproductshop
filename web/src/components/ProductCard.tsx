import { useState } from "react";
import type { CollectionMeta } from "../theme/collections";

interface ProductCardProps {
  title: string;
  subtitle?: string;
  type: string;
  price: number;
  thumbnailUrl?: string;
  /** "She walks away with" line - shown in place of the subtitle when present. */
  outcome?: string;
  /** "What's inside" bullets - the first few are previewed on the card. */
  whatsInside?: string[];
  owned?: boolean;
  locked?: boolean;
  busy?: boolean;
  collectionMeta?: CollectionMeta;
  creditLine?: string;
  onClick?: () => void;
  onAddToCart?: () => void;
  inCart?: boolean;
}

export function ProductCard({
  title,
  subtitle,
  type,
  price,
  thumbnailUrl,
  outcome,
  whatsInside,
  owned,
  locked,
  busy,
  collectionMeta,
  creditLine,
  onClick,
  onAddToCart,
  inCart,
}: ProductCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const preview = (whatsInside ?? []).slice(0, 3);
  const muted = collectionMeta?.mutedColor ?? "var(--espresso)";
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={busy ? undefined : onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className="card card-hover stack gap-sm"
      style={{
        textAlign: "left",
        border: "none",
        cursor: onClick && !busy ? "pointer" : "default",
        opacity: locked ? 0.6 : busy ? 0.7 : 1,
        background: collectionMeta?.cardBg,
        color: collectionMeta?.textColor,
      }}
    >
      {thumbnailUrl && !coverFailed ? (
        <img
          className="thumb thumb-cover"
          src={thumbnailUrl}
          alt={`${title} cover`}
          loading="lazy"
          onError={() => setCoverFailed(true)}
        />
      ) : (
        <div className="thumb" style={collectionMeta ? { background: collectionMeta.accentColor } : undefined}>
          {locked ? "🔒" : collectionMeta?.emoji ?? "🎀"}
        </div>
      )}
      <span
        className={collectionMeta ? "pill" : "pill pill-cream"}
        style={
          collectionMeta
            ? { alignSelf: "flex-start", background: collectionMeta.accentColor, color: "var(--ink)" }
            : { alignSelf: "flex-start" }
        }
      >
        {type}
      </span>
      <h3 style={{ fontSize: 18, color: collectionMeta?.textColor }}>{title}</h3>
      {(outcome || subtitle) && (
        <span style={{ fontSize: 13.5, lineHeight: 1.5, color: muted, opacity: 0.9 }}>
          {outcome || subtitle}
        </span>
      )}
      {preview.length > 0 && (
        <div className="card-inside">
          <span className="card-inside-label" style={{ color: muted }}>Inside</span>
          <ul>
            {preview.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {owned ? (
        <span style={{ fontSize: 14, color: collectionMeta?.mutedColor ?? "var(--espresso)" }}>✨ In your Vault</span>
      ) : locked ? (
        <span style={{ fontSize: 14, color: collectionMeta?.mutedColor ?? "var(--espresso)" }}>
          Vault members only
        </span>
      ) : (
        <strong style={{ color: collectionMeta?.mutedColor ?? "var(--espresso)", fontSize: 18 }}>
          ${price.toFixed(0)}
        </strong>
      )}
      {creditLine && (
        <span style={{ fontSize: 11, letterSpacing: "0.03em", color: collectionMeta?.mutedColor ?? "var(--espresso)", opacity: 0.7 }}>
          {creditLine}
        </span>
      )}
      {onAddToCart && !owned && !locked && (
        <button
          className="btn btn-sm btn-outline-gold"
          disabled={inCart}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
          style={{ marginTop: 4 }}
        >
          {inCart ? "In your cart" : "Add to Cart"}
        </button>
      )}
    </div>
  );
}
