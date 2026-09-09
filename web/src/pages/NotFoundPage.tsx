import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="center-page">
      <div className="stack gap-md" style={{ textAlign: "center", alignItems: "center" }}>
        <h1>Nothing here yet — but she's about to have options.</h1>
        <Link to="/" className="btn btn-gold">
          Back to the Vault
        </Link>
      </div>
    </div>
  );
}
