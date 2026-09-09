import { Link } from "react-router-dom";

export function CheckoutCancelledPage() {
  return (
    <div className="center-page">
      <div className="card stack gap-md" style={{ maxWidth: 440, textAlign: "center", alignItems: "center" }}>
        <span style={{ fontSize: 40 }}>🎀</span>
        <h1 style={{ fontSize: 30 }}>No worries, babe.</h1>
        <p className="muted">Your checkout was cancelled — nothing was charged. It'll be here when you're ready.</p>
        <Link to="/upgrade" className="btn btn-gold">
          Back to Bundles
        </Link>
      </div>
    </div>
  );
}
