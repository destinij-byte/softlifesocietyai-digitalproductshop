import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { vaultApi } from "../api/vault";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cart = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!user) {
      navigate("/register", { state: { from: "/cart" } });
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const items = cart.items.map((i) => (i.type === "product" ? { product_id: i.id } : { bundle_id: i.id }));
      const { checkout_url } = await vaultApi.checkoutCart(items);
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start checkout. Try again in a moment.");
      setBusy(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="container page stack gap-md" style={{ maxWidth: 560, textAlign: "center" }}>
        <h1>Your cart is empty.</h1>
        <p className="muted">Browse the Vault and add a few things you love.</p>
        <Link to="/shop" className="btn btn-gold" style={{ alignSelf: "center" }}>
          Explore the Vault
        </Link>
      </div>
    );
  }

  return (
    <div className="container page stack gap-lg" style={{ maxWidth: 640 }}>
      <h1>Your Cart</h1>

      {error && <div className="form-error">{error}</div>}

      <div className="stack gap-sm">
        {cart.items.map((item) => (
          <div key={item.id} className="card row-between" style={{ alignItems: "center" }}>
            <div className="row gap-sm" style={{ alignItems: "center" }}>
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt="" style={{ width: 52, height: 52, borderRadius: "var(--radius-sm)", objectFit: "cover" }} />
              ) : (
                <div className="thumb" style={{ width: 52, height: 52 }} />
              )}
              <div className="stack" style={{ gap: 2 }}>
                <strong style={{ fontSize: 15 }}>{item.title}</strong>
                <span className="muted" style={{ fontSize: 13 }}>${item.price.toFixed(0)}</span>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-gold" onClick={() => cart.removeItem(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card stack gap-md">
        <div className="row-between">
          <span style={{ fontSize: 16 }}>Subtotal</span>
          <strong style={{ fontSize: 22 }}>${cart.subtotal.toFixed(0)}</strong>
        </div>
        <button className="btn btn-gold btn-block" disabled={busy} onClick={handleCheckout}>
          {busy ? "Redirecting…" : "Secure Checkout"}
        </button>
      </div>
    </div>
  );
}
