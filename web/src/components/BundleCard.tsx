
interface BundleCardProps {
  name: string;
  description: string;
  price: number;
  individualTotal: number;
  savings: number;
  productCount: number;
  isFoundingMember?: boolean;
  isBestValue?: boolean;
  loading?: boolean;
  onBuy: () => void;
}

export function BundleCard({
  name,
  description,
  price,
  individualTotal,
  savings,
  productCount,
  isFoundingMember,
  isBestValue,
  loading,
  onBuy,
}: BundleCardProps) {
  return (
    <div
      className={`card stack gap-sm ${isFoundingMember ? "card-ink" : ""}`}
      style={
        isBestValue
          ? { border: "2px solid var(--gold)", boxShadow: "var(--shadow-hover)", transform: "scale(1.03)" }
          : undefined
      }
    >
      {isBestValue && (
        <span className="pill pill-gold badge-founding" style={{ alignSelf: "flex-start" }}>
          Best Value
        </span>
      )}
      {isFoundingMember && <span style={{ fontSize: 22 }}>👑</span>}
      <h2>{name}</h2>
      <p className="muted">{description}</p>
      <p className="muted" style={{ fontSize: 14 }}>
        {productCount} products{isBestValue ? " — every tool unlocked" : ""}
      </p>
      <div className="row gap-md" style={{ alignItems: "baseline", marginTop: 4 }}>
        <span className="display" style={{ fontSize: 32, color: isFoundingMember ? "var(--champagne)" : "var(--espresso)" }}>
          ${price.toFixed(0)}
        </span>
        <span className="muted" style={{ textDecoration: "line-through" }}>
          ${individualTotal.toFixed(0)}
        </span>
      </div>
      <span className="pill pill-blush" style={{ alignSelf: "flex-start" }}>
        Save ${savings.toFixed(0)}
      </span>
      <button
        className={`btn ${isFoundingMember ? "btn-gold" : isBestValue ? "btn-gold" : "btn-ink"} btn-block`}
        onClick={onBuy}
        disabled={loading}
        style={{ marginTop: 8 }}
      >
        {loading ? "Starting checkout…" : isBestValue ? "Unlock the Full Library" : "Unlock this bundle"}
      </button>
      {isBestValue && (
        <p className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 2 }}>
          Launch pricing available for a limited time.
        </p>
      )}
    </div>
  );
}
