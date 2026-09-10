import { useEffect, useState } from "react";

import { vaultApi, Product } from "../api/vault";
import { ApiError } from "../api/client";
import { ProductCard } from "../components/ProductCard";
import { Spinner } from "../components/Spinner";
import { COLLECTIONS, COLLECTION_ORDER } from "../theme/collections";
import { AI_SHELVES, AI_SHELF_ORDER, AI_SHELF_FALLBACK_LABEL } from "../theme/aiShelves";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([vaultApi.listProducts(), vaultApi.getLibrary()])
      .then(([allProducts, library]) => {
        setProducts(allProducts);
        setOwnedIds(new Set(library.map((item) => item.product.id)));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleProductClick(product: Product) {
    setError(null);
    setBusyId(product.id);
    try {
      if (ownedIds.has(product.id)) {
        const { download_url } = await vaultApi.getDownloadUrl(product.id);
        window.open(download_url, "_blank", "noopener,noreferrer");
      } else {
        const { checkout_url } = await vaultApi.checkout({ product_id: product.id });
        window.location.href = checkout_url;
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again in a moment.");
    } finally {
      setBusyId(null);
    }
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
  const namedAiShelves = AI_SHELF_ORDER.map((slug) => ({
    slug,
    meta: AI_SHELVES[slug],
    products: aiProducts.filter((p) => p.slug === slug),
  })).filter((shelf) => shelf.products.length > 0);
  const unmappedAiProducts = aiProducts.filter((p) => !AI_SHELVES[p.slug]);

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
          {namedAiShelves.map(({ slug, meta, products: shelfProducts }) => (
            <div key={slug} className="stack gap-md">
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
