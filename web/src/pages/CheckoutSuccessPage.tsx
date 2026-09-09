import { Link } from "react-router-dom";

export function CheckoutSuccessPage() {
  return (
    <div className="center-page">
      <div className="card stack gap-md" style={{ maxWidth: 440, textAlign: "center", alignItems: "center" }}>
        <span style={{ fontSize: 40 }}>💗</span>
        <h1 style={{ fontSize: 30 }}>It's yours, babe. Unlocked and ready.</h1>
        <p className="muted">Your Vault has been updated — head to My Library to open it.</p>
        <Link to="/library" className="btn btn-gold">
          Go to My Library
        </Link>
      </div>
    </div>
  );
}
