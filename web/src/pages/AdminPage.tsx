import { useEffect, useState } from "react";

import { adminApi, AdminUser, AdminOrder, AdminBoxSubscriber, AdminReview } from "../api/admin";
import { Spinner } from "../components/Spinner";
import { StarRating } from "../components/StarRating";

type Tab = "users" | "orders" | "boxes" | "reviews";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [boxSubscribers, setBoxSubscribers] = useState<AdminBoxSubscriber[] | null>(null);
  const [reviews, setReviews] = useState<AdminReview[] | null>(null);
  const [reviewBusyId, setReviewBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (tab === "users" && users === null) {
      adminApi.listUsers().then(setUsers).catch(() => setError("Couldn't load users."));
    } else if (tab === "orders" && orders === null) {
      adminApi.listOrders().then(setOrders).catch(() => setError("Couldn't load orders."));
    } else if (tab === "boxes" && boxSubscribers === null) {
      adminApi.listBoxSubscribers().then(setBoxSubscribers).catch(() => setError("Couldn't load Box subscribers."));
    } else if (tab === "reviews" && reviews === null) {
      adminApi.listReviews().then(setReviews).catch(() => setError("Couldn't load reviews."));
    }
  }, [tab, users, orders, boxSubscribers, reviews]);

  async function handleReviewStatus(reviewId: string, status: "approved" | "rejected") {
    setReviewBusyId(reviewId);
    try {
      await adminApi.updateReviewStatus(reviewId, status);
      setReviews((prev) => prev?.map((r) => (r.id === reviewId ? { ...r, status } : r)) ?? null);
    } catch {
      setError("Couldn't update that review. Try again in a moment.");
    } finally {
      setReviewBusyId(null);
    }
  }

  const totalRevenue = orders?.reduce((sum, o) => sum + o.amount, 0) ?? null;

  return (
    <div className="container page stack gap-lg">
      <div className="stack gap-sm">
        <h1>Admin</h1>
        <p className="muted">Accounts, purchases, and Box subscribers — business data only.</p>
      </div>

      <div className="row gap-sm">
        <button className={`btn btn-sm ${tab === "users" ? "btn-gold" : "btn-outline-gold"}`} onClick={() => setTab("users")}>
          Users {users ? `(${users.length})` : ""}
        </button>
        <button className={`btn btn-sm ${tab === "orders" ? "btn-gold" : "btn-outline-gold"}`} onClick={() => setTab("orders")}>
          Orders {orders ? `(${orders.length})` : ""}
        </button>
        <button className={`btn btn-sm ${tab === "boxes" ? "btn-gold" : "btn-outline-gold"}`} onClick={() => setTab("boxes")}>
          Box Subscribers {boxSubscribers ? `(${boxSubscribers.length})` : ""}
        </button>
        <button className={`btn btn-sm ${tab === "reviews" ? "btn-gold" : "btn-outline-gold"}`} onClick={() => setTab("reviews")}>
          Reviews {reviews ? `(${reviews.filter((r) => r.status === "pending").length} pending)` : ""}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {tab === "users" && (
        users === null ? (
          <Spinner />
        ) : users.length === 0 ? (
          <p className="muted">No users yet.</p>
        ) : (
          <div className="stack gap-sm">
            {users.map((u) => (
              <div key={u.id} className="card row-between" style={{ alignItems: "center" }}>
                <div className="stack" style={{ gap: 2 }}>
                  <strong>{u.full_name || u.email}</strong>
                  <span className="muted" style={{ fontSize: 13 }}>{u.email}</span>
                </div>
                <div className="row gap-sm" style={{ alignItems: "center" }}>
                  {u.is_admin && <span className="pill" style={{ background: "var(--gold)", color: "var(--ink)" }}>Admin</span>}
                  <span className="pill pill-cream">{u.membership_tier.replace("_", " ")}</span>
                  <span className="muted" style={{ fontSize: 12.5 }}>Joined {formatDate(u.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "orders" && (
        orders === null ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <p className="muted">No orders yet.</p>
        ) : (
          <div className="stack gap-md">
            {totalRevenue !== null && (
              <div className="card row-between">
                <span>Total revenue ({orders.length} orders)</span>
                <strong style={{ fontSize: 20 }}>${totalRevenue.toFixed(2)}</strong>
              </div>
            )}
            <div className="stack gap-sm">
              {orders.map((o) => (
                <div key={o.id} className="card stack gap-sm">
                  <div className="row-between">
                    <div className="stack" style={{ gap: 2 }}>
                      <strong>{o.user_full_name || o.user_email}</strong>
                      <span className="muted" style={{ fontSize: 13 }}>{o.user_email}</span>
                    </div>
                    <div className="stack" style={{ gap: 2, alignItems: "flex-end" }}>
                      <strong>${o.amount.toFixed(2)}</strong>
                      <span className="muted" style={{ fontSize: 12.5 }}>{formatDate(o.created_at)}</span>
                    </div>
                  </div>
                  {o.items.map((item, idx) => (
                    <p key={idx} className="muted" style={{ fontSize: 13.5 }}>
                      {item.title}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {tab === "boxes" && (
        boxSubscribers === null ? (
          <Spinner />
        ) : boxSubscribers.length === 0 ? (
          <p className="muted">No active Box subscribers yet.</p>
        ) : (
          <div className="stack gap-sm">
            {boxSubscribers.map((s) => (
              <div key={`${s.user_id}-${s.box_type}`} className="card row-between" style={{ alignItems: "center" }}>
                <div className="stack" style={{ gap: 2 }}>
                  <strong>{s.full_name || s.email}</strong>
                  <span className="muted" style={{ fontSize: 13 }}>{s.email}</span>
                </div>
                <div className="row gap-sm" style={{ alignItems: "center" }}>
                  <span className="pill pill-cream" style={{ textTransform: "capitalize" }}>{s.box_type}</span>
                  <span className="pill" style={{ background: "var(--champagne)", color: "var(--ink)", textTransform: "capitalize" }}>{s.tier}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "reviews" && (
        reviews === null ? (
          <Spinner />
        ) : reviews.length === 0 ? (
          <p className="muted">No reviews yet.</p>
        ) : (
          <div className="stack gap-sm">
            {reviews.map((r) => (
              <div key={r.id} className="card stack gap-sm">
                <div className="row-between" style={{ alignItems: "flex-start" }}>
                  <div className="stack" style={{ gap: 2 }}>
                    <strong>{r.product_title}</strong>
                    <span className="muted" style={{ fontSize: 13 }}>{r.user_email}</span>
                  </div>
                  <div className="stack" style={{ gap: 4, alignItems: "flex-end" }}>
                    <StarRating rating={r.rating} />
                    <span className="muted" style={{ fontSize: 12 }}>{formatDate(r.created_at)}</span>
                  </div>
                </div>
                {r.title && <strong style={{ fontSize: 14.5 }}>{r.title}</strong>}
                {r.body && <p style={{ fontSize: 14, lineHeight: 1.6 }}>{r.body}</p>}
                <div className="row gap-sm" style={{ flexWrap: "wrap", alignItems: "center" }}>
                  <span className="muted" style={{ fontSize: 12.5 }}>— {r.display_name || "A member"}</span>
                  {r.verified_purchase && <span className="pill pill-cream" style={{ fontSize: 11 }}>Verified purchase</span>}
                  {r.incentivized && <span className="pill pill-cream" style={{ fontSize: 11 }}>Incentivized</span>}
                  <span
                    className="pill"
                    style={{
                      fontSize: 11,
                      textTransform: "capitalize",
                      background: r.status === "approved" ? "var(--champagne)" : r.status === "rejected" ? "var(--blush)" : "var(--cream)",
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                {r.status === "pending" && (
                  <div className="row gap-sm">
                    <button
                      className="btn btn-sm btn-gold"
                      disabled={reviewBusyId === r.id}
                      onClick={() => handleReviewStatus(r.id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-outline-gold"
                      disabled={reviewBusyId === r.id}
                      onClick={() => handleReviewStatus(r.id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
