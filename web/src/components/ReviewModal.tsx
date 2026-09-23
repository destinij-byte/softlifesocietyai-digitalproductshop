import { useState } from "react";

import { vaultApi } from "../api/vault";
import { ApiError } from "../api/client";

interface ReviewModalProps {
  productId: string;
  productTitle: string;
  onClose: () => void;
}

export function ReviewModal({ productId, productTitle, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Pick a star rating first.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await vaultApi.submitReview(productId, { rating, title, body, display_name: displayName });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your review. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26, 26, 26, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card stack gap-md"
        style={{ maxWidth: 440, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="stack gap-sm" style={{ textAlign: "center" }}>
            <h3>Thank you!</h3>
            <p className="muted">
              Your review is saved and will show once approved. It means a lot that you took the time.
            </p>
            <button className="btn btn-gold" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className="stack gap-md" onSubmit={handleSubmit}>
            <div className="stack" style={{ gap: 2 }}>
              <h3>Leave a review</h3>
              <p className="muted" style={{ fontSize: 13.5 }}>{productTitle}</p>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="stack" style={{ gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Rating</label>
              <div style={{ fontSize: 26, cursor: "pointer" }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ color: n <= (hoverRating || rating) ? "var(--gold)" : "var(--blush)" }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="review-title">Title (optional)</label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Sum it up in a few words"
              />
            </div>

            <div className="field">
              <label htmlFor="review-body">Your review (optional)</label>
              <textarea
                id="review-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="What was going on before you got this? What changed?"
              />
            </div>

            <div className="field">
              <label htmlFor="review-name">Display name (optional)</label>
              <input
                id="review-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                placeholder="How should we credit you? (defaults to your first name)"
              />
            </div>

            <div className="row gap-sm" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-sm btn-outline-gold" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-gold" disabled={busy}>
                {busy ? "Submitting…" : "Submit review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
