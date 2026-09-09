import type { CollectionMeta } from "../theme/collections";

interface ProductCardProps {
  title: string;
  subtitle?: string;
  type: string;
  price: number;
  thumbnailUrl?: string;
  owned?: boolean;
  locked?: boolean;
  busy?: boolean;
  collectionMeta?: CollectionMeta;
  creditLine?: string;
  onClick?: () => void;
}

export function ProductCard({
  title,
  subtitle,
  type,
  price,
  thumbnailUrl,
  owned,
  locked,
  busy,
  collectionMeta,
  creditLine,
  onClick,
}: ProductCardProps) {
  return (
    <button
      className="card card-hover stack gap-sm"
      onClick={onClick}
      disabled={busy}
      style={{
        textAlign: "left",
        border: "none",
        cursor: onClick && !busy ? "pointer" : "default",
        opacity: locked ? 0.6 : busy ? 0.7 : 1,
        background: collectionMeta?.cardBg,
        color: collectionMeta?.textColor,
      }}
    >
      {thumbnailUrl ? (
        <img className="thumb" src={thumbnailUrl} alt="" />
      ) : (
        <div className="thumb" style={collectionMeta ? { background: collectionMeta.accentColor } : undefined}>
          {locked ? "🔒" : "🎀"}
        </div>
      )}
      <span
        className={collectionMeta ? "pill" : "pill pill-cream"}
        style={
          collectionMeta
            ? { alignSelf: "flex-start", background: collectionMeta.accentColor, color: collectionMeta.cardBg }
            : { alignSelf: "flex-start" }
        }
      >
        {type}
      </span>
      <h3 style={{ fontSize: 18, color: collectionMeta?.textColor }}>{title}</h3>
      {subtitle && (
        <span style={{ fontSize: 13, color: collectionMeta?.mutedColor ?? "var(--espresso)", opacity: 0.9 }}>
          {subtitle}
        </span>
      )}
      {owned ? (
        <span style={{ fontSize: 14, color: collectionMeta?.mutedColor ?? "var(--espresso)" }}>✨ In your Vault</span>
      ) : locked ? (
        <span style={{ fontSize: 14, color: collectionMeta?.mutedColor ?? "var(--espresso)" }}>
          Vault members only
        </span>
      ) : (
        <strong style={{ color: collectionMeta?.accentColor ?? "var(--gold)", fontSize: 18 }}>
          ${price.toFixed(0)}
        </strong>
      )}
      {creditLine && (
        <span style={{ fontSize: 11, letterSpacing: "0.03em", color: collectionMeta?.mutedColor ?? "var(--espresso)", opacity: 0.7 }}>
          {creditLine}
        </span>
      )}
    </button>
  );
}
