import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { vaultApi, Product } from "../api/vault";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { Spinner } from "../components/Spinner";
import { COLLECTIONS, COLLECTION_ORDER } from "../theme/collections";
import { AI_SHELVES, AI_SHELF_ORDER, AI_SHELF_FALLBACK_LABEL } from "../theme/aiShelves";

// Public storefront - the Vault is browsable without an account (product
// data is already a public endpoint). Only "already owned" state and
// checkout need a logged-in user.
export function ShopPage() {
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([vaultApi.listProducts(), user ? vaultApi.getLibrary() : Promise.resolve([])])
      .then(([allProducts, library]) => {
        setProducts(allProducts);
        setOwnedIds(new Set(library.map((item) => item.product.id)));
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleProductClick(product: Product) {
    // Owned products still open the download instantly; anything she doesn't
    // own yet goes to the preview page first, not straight into checkout.
    if (ownedIds.has(product.id)) {
      if (!user) {
        navigate("/register", { state: { from: "/shop" } });
        return;
      }
      setError(null);
      setBusyId(product.id);
      try {
        const { download_url } = await vaultApi.getDownloadUrl(product.id);
        window.open(download_url, "_blank", "noopener,noreferrer");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Try again in a moment.");
      } finally {
        setBusyId(null);
      }
      return;
    }
    navigate(`/shop/${product.slug}`);
  }

  function handleAddToCart(product: Product) {
    cart.addItem({ type: "product", id: product.id, title: product.title, price: product.price, thumbnailUrl: product.thumbnail_url });
  }

  if (loading) return <Spinner />;

  const heroProducts = products.filter((p) => p.is_hero);
  const byCollection = COLLECTION_ORDER.filter((key) => key !== "ai").map((key) => ({
    key,
    meta: COLLECTIONS[key],
    products: products.filter((p) => p.collection === key),
  })).filter((group) => group.products.length > 0);

  // AI Collection is presented as named sub-brand shelves rather than one
  // flat list - see theme/aiShelves.ts.
  const aiProducts = products.filter((p) => p.collection === "ai");
  const namedAiShelves = AI_SHELF_ORDER.map((key) => {
    const def = AI_SHELVES[key];
    return {
      key,
      meta: def.meta,
      products: aiProducts.filter((p) => def.slugs.includes(p.slug)),
    };
  }).filter((shelf) => shelf.products.length > 0);
  const shelvedSlugs = new Set(AI_SHELF_ORDER.flatMap((key) => AI_SHELVES[key].slugs));
  const unmappedAiProducts = aiProducts.filter((p) => !shelvedSlugs.has(p.slug));

  return (
    <div className="container page stack gap-lg">
      <div className="stack gap-sm">
        <h1>The Shop</h1>
        <p className="muted">One boutique, six collections. Everything she needs, a la carte or bundled.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      {heroProducts.length > 0 && (
        <section className="stack gap-md">
          <h2>Hero Products</h2>
          <div className="grid grid-products">
            {heroProducts.map((product) => {
              const meta = COLLECTIONS[product.collection];
              const owned = ownedIds.has(product.id);
              return (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  subtitle={product.subtitle}
                  type={product.type}
                  price={product.price}
                  thumbnailUrl={product.thumbnail_url}
                  owned={owned}
                  busy={busyId === product.id}
                  collectionMeta={meta}
                  creditLine={product.credit_line}
                  onClick={() => handleProductClick(product)}
                  onAddToCart={() => handleAddToCart(product)}
                  inCart={cart.has(product.id)}
                />
              );
            })}
          </div>
        </section>
      )}

      {byCollection.map(({ key, meta, products: collectionProducts }) => (
        <section key={key} className="stack gap-md">
          <h2>
            {meta.emoji} {meta.label}
          </h2>
          <div className="grid grid-products">
            {collectionProducts.map((product) => {
              const owned = ownedIds.has(product.id);
              return (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  subtitle={product.subtitle}
                  type={product.type}
                  price={product.price}
                  thumbnailUrl={product.thumbnail_url}
                  owned={owned}
                  busy={busyId === product.id}
                  collectionMeta={meta}
                  creditLine={product.credit_line}
                  onClick={() => handleProductClick(product)}
                  onAddToCart={() => handleAddToCart(product)}
                  inCart={cart.has(product.id)}
                />
              );
            })}
          </div>
        </section>
      ))}

      {namedAiShelves.length > 0 && (
        <section className="stack gap-lg">
          <div className="stack gap-sm">
            <h2>🤖 AI Collection</h2>
            <p className="muted">Prompt packs for every side of her life.</p>
          </div>
          {namedAiShelves.map(({ key, meta, products: shelfProducts }) => (
            <div key={key} className="stack gap-md">
              <h3 style={{ color: meta.accentColor }}>{meta.label}</h3>
              <div className="grid grid-products">
                {shelfProducts.map((product) => {
                  const owned = ownedIds.has(product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      title={product.title}
                      subtitle={product.subtitle}
                      type={product.type}
                      price={product.price}
                      thumbnailUrl={product.thumbnail_url}
                      owned={owned}
                      busy={busyId === product.id}
                      collectionMeta={meta}
                      creditLine={product.credit_line}
                      onClick={() => handleProductClick(product)}
                      onAddToCart={() => handleAddToCart(product)}
                      inCart={cart.has(product.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {unmappedAiProducts.length > 0 && (
            <div className="stack gap-md">
              <h3>{AI_SHELF_FALLBACK_LABEL}</h3>
              <div className="grid grid-products">
                {unmappedAiProducts.map((product) => {
                  const owned = ownedIds.has(product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      title={product.title}
                      subtitle={product.subtitle}
                      type={product.type}
                      price={product.price}
                      thumbnailUrl={product.thumbnail_url}
                      owned={owned}
                      busy={busyId === product.id}
                      collectionMeta={COLLECTIONS.ai}
                      creditLine={product.credit_line}
                      onClick={() => handleProductClick(product)}
                      onAddToCart={() => handleAddToCart(product)}
                      inCart={cart.has(product.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
