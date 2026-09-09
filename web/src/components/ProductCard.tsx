
interface ProductCardProps {
  title: string;
  type: string;
  price: number;
  thumbnailUrl?: string;
  owned?: boolean;
  locked?: boolean;
  busy?: boolean;
  onClick?: () => void;
}

export function ProductCard({ title, type, price, thumbnailUrl, owned, locked, busy, onClick }: ProductCardProps) {
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
      }}
    >
      {thumbnailUrl ? (
        <img className="thumb" src={thumbnailUrl} alt="" />
      ) : (
        <div className="thumb">{locked ? "🔒" : "🎀"}</div>
      )}
      <span className="pill pill-cream" style={{ alignSelf: "flex-start" }}>
        {type}
      </span>
      <h3 style={{ fontSize: 18 }}>{title}</h3>
      {owned ? (
        <span className="muted" style={{ fontSize: 14 }}>
          ✨ In your Vault
        </span>
      ) : locked ? (
        <span className="muted" style={{ fontSize: 14 }}>
          Vault members only
        </span>
      ) : (
        <strong style={{ color: "var(--gold)", fontSize: 18 }}>${price.toFixed(0)}</strong>
      )}
    </button>
  );
}
