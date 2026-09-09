
interface BundleCardProps {
  name: string;
  description: string;
  price: number;
  individualTotal: number;
  savings: number;
  productCount: number;
  isFoundingMember?: boolean;
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
  loading,
  onBuy,
}: BundleCardProps) {
  return (
    <div className={`card stack gap-sm ${isFoundingMember ? "card-ink" : ""}`}>
      {isFoundingMember && <span style={{ fontSize: 22 }}>👑</span>}
      <h2>{name}</h2>
      <p className="muted">{description}</p>
      <p className="muted" style={{ fontSize: 14 }}>
        {productCount} products
      </p>
      <div className="row gap-md" style={{ alignItems: "baseline", marginTop: 4 }}>
        <span className="display" style={{ fontSize: 32, color: "var(--gold)" }}>
          ${price.toFixed(0)}
        </span>
        <span className="muted" style={{ textDecoration: "line-through" }}>
          ${individualTotal.toFixed(0)}
        </span>
      </div>
      <span className="pill pill-rose" style={{ alignSelf: "flex-start" }}>
        Save ${savings.toFixed(0)}
      </span>
      <button className={`btn ${isFoundingMember ? "btn-gold" : "btn-ink"} btn-block`} onClick={onBuy} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? "Starting checkout…" : "Unlock this bundle"}
      </button>
    </div>
  );
}
