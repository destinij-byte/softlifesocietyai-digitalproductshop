import { useEffect, useMemo, useState } from "react";

import { vaultApi, LibraryItem } from "../api/vault";
import { ProductCard } from "../components/ProductCard";
import { Spinner } from "../components/Spinner";

export function MyLibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string | undefined>(undefined);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    vaultApi
      .getLibrary()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => Array.from(new Set(items.map((item) => item.product.type))), [items]);
  const filtered = activeType ? items.filter((item) => item.product.type === activeType) : items;

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

      {types.length > 1 && (
        <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
          <button
            className={`pill ${activeType === undefined ? "pill-gold" : "pill-cream"}`}
            style={{ border: "none", cursor: "pointer" }}
            onClick={() => setActiveType(undefined)}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t}
              className={`pill ${activeType === t ? "pill-gold" : "pill-cream"}`}
              style={{ border: "none", cursor: "pointer" }}
              onClick={() => setActiveType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

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
