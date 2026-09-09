import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { vaultApi, LibraryItem, LifeArea } from "../api/vault";
import { ProductCard } from "../components/ProductCard";
import { Spinner } from "../components/Spinner";
import { LIFE_AREAS, LIFE_AREA_ORDER } from "../theme/lifeAreas";

export function MyLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeArea = (searchParams.get("area") as LifeArea | null) ?? undefined;

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    vaultApi
      .getLibrary()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeArea ? items.filter((item) => item.product.life_area === activeArea) : items;

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

  if (loading) return <Spinner />;

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
            <ProductCard
              key={item.product.id}
              title={item.product.title}
              type={item.product.type}
              price={item.product.price}
              subtitle={item.product.subtitle}
              thumbnailUrl={item.product.thumbnail_url}
              owned
              busy={openingId === item.product.id}
              onClick={() => handleOpen(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
