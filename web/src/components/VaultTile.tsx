import { Link } from "react-router-dom";

interface VaultTileProps {
  emoji: string;
  label: string;
  to: string;
}

export function VaultTile({ emoji, label, to }: VaultTileProps) {
  return (
    <Link to={to} className="card card-hover stack gap-sm" style={{ alignItems: "center", padding: "24px 16px" }}>
      <span className="medallion">{emoji}</span>
      <span className="medallion-label">{label}</span>
    </Link>
  );
}
