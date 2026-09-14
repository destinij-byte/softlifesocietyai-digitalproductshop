import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { vaultApi, Product } from "../api/vault";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Spinner } from "../components/Spinner";
import { COLLECTIONS } from "../theme/collections";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const cart = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [owned, setOwned] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    Promise.all([vaultApi.getProduct(slug), user ? vaultApi.getLibrary() : Promise.resolve([])])
      .then(([p, library]) => {
        setProduct(p);
        setOwned(library.some((item) => item.product.id === p.id));
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError("Couldn't load this product. Try again in a moment.");
      })
      .finally(() => setLoading(false));
  }, [slug, user]);

  async function handleBuyNow() {
    if (!product) return;
    if (!user) {
      navigate("/register", { state: { from: `/shop/${product.slug}` } });
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (owned) {
        const { download_url } = await vaultApi.getDownloadUrl(product.id);
        window.open(download_url, "_blank", "noopener,noreferrer");
      } else {
        const { checkout_url } = await vaultApi.checkout({ product_id: product.id });
        window.location.href = checkout_url;
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    cart.addItem({ type: "product", id: product.id, title: product.title, price: product.price, thumbnailUrl: product.thumbnail_url });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  if (loading) return <Spinner />;

  if (notFound) {
    return (
      <div className="container page stack gap-md">
        <h1>We couldn&apos;t find that product.</h1>
        <Link to="/shop" className="btn btn-outline-gold">
          Back to the Shop
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container page stack gap-md">
        <h1>Something went wrong.</h1>
        <p className="muted">{error ?? "Couldn't load this product. Try again in a moment."}</p>
        <Link to="/shop" className="btn btn-outline-gold">
          Back to the Shop
        </Link>
      </div>
    );
  }

  const meta = COLLECTIONS[product.collection];
  const inCart = cart.has(product.id);

  return (
    <div className="container page stack gap-lg" style={{ maxWidth: 900 }}>
      <Link to="/shop" className="muted" style={{ fontSize: 14 }}>
        ← Back to the Shop
      </Link>

      {error && <div className="form-error">{error}</div>}

      <div className="grid" style={{ gridTemplateColumns: "minmax(240px, 360px) 1fr", gap: 32, alignItems: "start" }}>
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt=""
            style={{ width: "100%", borderRadius: "var(--radius-lg)", border: "1px solid var(--blush)" }}
          />
        ) : (
          <div
            className="thumb"
            style={{ width: "100%", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: meta.accentColor, fontSize: 48 }}
          >
            {meta.emoji}
          </div>
        )}

        <div className="stack gap-md">
          <div className="stack gap-sm">
            <span className="pill" style={{ alignSelf: "flex-start", background: meta.accentColor, color: "var(--ink)" }}>
              {product.type}
            </span>
            <h1 style={{ fontSize: 34 }}>{product.title}</h1>
            {product.subtitle && <p className="muted" style={{ fontSize: 16 }}>{product.subtitle}</p>}
          </div>

          <p style={{ fontSize: 15.5, lineHeight: 1.7 }}>{product.description}</p>

          {product.credit_line && (
            <p className="muted" style={{ fontSize: 12, letterSpacing: "0.03em" }}>
              {product.credit_line}
            </p>
          )}

          <div className="row-between" style={{ alignItems: "center", marginTop: 8 }}>
            <strong style={{ fontSize: 28 }}>{owned ? "In your Vault" : `$${product.price.toFixed(0)}`}</strong>
          </div>

          <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
            <button className="btn btn-gold" disabled={busy} onClick={handleBuyNow}>
              {owned ? "Download" : busy ? "Redirecting…" : "Buy Now"}
            </button>
            {!owned && (
              <button className="btn btn-outline-gold" disabled={inCart} onClick={handleAddToCart}>
                {inCart ? "In your cart" : justAdded ? "Added ✓" : "Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
