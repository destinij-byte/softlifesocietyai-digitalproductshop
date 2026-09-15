import { useEffect, useState } from "react";

import { adminApi, AdminUser, AdminOrder, AdminBoxSubscriber } from "../api/admin";
import { Spinner } from "../components/Spinner";

type Tab = "users" | "orders" | "boxes";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [boxSubscribers, setBoxSubscribers] = useState<AdminBoxSubscriber[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (tab === "users" && users === null) {
      adminApi.listUsers().then(setUsers).catch(() => setError("Couldn't load users."));
    } else if (tab === "orders" && orders === null) {
      adminApi.listOrders().then(setOrders).catch(() => setError("Couldn't load orders."));
    } else if (tab === "boxes" && boxSubscribers === null) {
      adminApi.listBoxSubscribers().then(setBoxSubscribers).catch(() => setError("Couldn't load Box subscribers."));
    }
  }, [tab, users, orders, boxSubscribers]);

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
    </div>
  );
}
