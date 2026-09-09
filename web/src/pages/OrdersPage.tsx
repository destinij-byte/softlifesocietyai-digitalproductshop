import { useEffect, useState } from "react";

import { vaultApi, Order } from "../api/vault";
import { Spinner } from "../components/Spinner";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vaultApi
      .getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="container page stack gap-lg">
      <h1>My Purchases</h1>

      {orders.length === 0 ? (
        <p className="muted">Nothing here yet — but she's about to have options.</p>
      ) : (
        <div className="stack gap-md">
          {orders.map((order) => (
            <div key={order.id} className="card stack gap-sm">
              <div className="row-between">
                <span className="muted">{formatDate(order.created_at)}</span>
                <strong style={{ color: "var(--gold)" }}>${order.amount.toFixed(2)}</strong>
              </div>
              {order.items.map((line, idx) => (
                <p key={idx}>{line.title}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
