import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { vaultApi, LibraryItem } from "../api/vault";
import { ProductCard } from "../components/ProductCard";
import { Spinner } from "../components/Spinner";

export function AiResourcesPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vaultApi
      .getAiResources()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function handleOpen(item: LibraryItem) {
    const { download_url } = await vaultApi.getDownloadUrl(item.product.id);
    window.open(download_url, "_blank", "noopener,noreferrer");
  }

  if (loading) return <Spinner />;

  return (
    <div className="container page stack gap-lg">
      <div className="stack gap-sm">
        <h1>🤖 AI Resources</h1>
        <p className="muted">Your Soft Life AI prompt packs, all in one place.</p>
      </div>

      {items.length === 0 ? (
        <div className="stack gap-md" style={{ alignItems: "flex-start" }}>
          <p className="muted">This one's for Vault members only. Ready to upgrade?</p>
          <Link to="/upgrade" className="btn btn-gold">
            See Bundles
          </Link>
        </div>
      ) : (
        <div className="grid grid-products">
          {items.map((item) => (
            <ProductCard
              key={item.product.id}
              title={item.product.title}
              type={item.product.type}
              price={item.product.price}
              thumbnailUrl={item.product.thumbnail_url}
              owned
              onClick={() => handleOpen(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
