import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { vaultApi, LibraryItem, LifeArea } from "../api/vault";
import { useAuth } from "../context/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { ProductCard } from "../components/ProductCard";
import { ReviewModal } from "../components/ReviewModal";
import { VaultLoadingGrid, VaultErrorState } from "../components/VaultStatus";
import { LIFE_AREAS, LIFE_AREA_ORDER } from "../theme/lifeAreas";

export function MyLibraryPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeArea = (searchParams.get("area") as LifeArea | null) ?? undefined;

  // Cache key is scoped per-user so a shared device never flashes one
  // account's library while a different account's fresh copy loads.
  const { data: items, loading, error, retry } = useAsyncData(() => vaultApi.getLibrary(), {
    cacheKey: user ? `sls_cache_library_${user.id}` : undefined,
  });
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [reviewingItem, setReviewingItem] = useState<LibraryItem | null>(null);

  const filtered = activeArea ? (items ?? []).filter((item) => item.product.life_area === activeArea) : items ?? [];

  function setArea(area: LifeArea | undefined) {
    setSearchParams(area ? { area } : {});
  }

  async function handleOpen(item: LibraryItem) {
    setOpeningId(item.product.id);
    try {
      const { download_url } = await vaultApi.getDownloadUrl(item.product.id);
      window.open(download_url, "_blank", "noopener,noreferrer");
    } finally {
      setOpeningId(null);
    }
  }

  if (loading) return <VaultLoadingGrid title="My Library" />;
  if (error) return <VaultErrorState title="My Library" message={error} onRetry={retry} />;

  return (
    <div className="container page stack gap-lg">
      <h1>My Library</h1>

      <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
        <button
          className={`pill ${activeArea === undefined ? "pill-gold" : "pill-cream"}`}
          style={{ border: "none", cursor: "pointer" }}
          onClick={() => setArea(undefined)}
        >
          All
        </button>
        {LIFE_AREA_ORDER.map((key) => (
          <button
            key={key}
            className={`pill ${activeArea === key ? "pill-gold" : "pill-cream"}`}
            style={{ border: "none", cursor: "pointer" }}
            onClick={() => setArea(key)}
          >
            {LIFE_AREAS[key].emoji} {LIFE_AREAS[key].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="muted">Nothing here yet — but she's about to have options.</p>
      ) : (
        <div className="grid grid-products">
          {filtered.map((item) => (
            <div key={item.product.id} className="stack" style={{ gap: 6 }}>
              <ProductCard
                title={item.product.title}
                type={item.product.type}
                price={item.product.price}
                subtitle={item.product.subtitle}
                thumbnailUrl={item.product.thumbnail_url}
                owned
                busy={openingId === item.product.id}
                onClick={() => handleOpen(item)}
              />
              <button className="btn btn-sm btn-outline-gold" onClick={() => setReviewingItem(item)}>
                Leave a review
              </button>
            </div>
          ))}
        </div>
      )}

      {reviewingItem && (
        <ReviewModal
          productId={reviewingItem.product.id}
          productTitle={reviewingItem.product.title}
          onClose={() => setReviewingItem(null)}
        />
      )}
    </div>
  );
}
