import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { vaultApi, Drop } from "../api/vault";
import { ProductCard } from "../components/ProductCard";
import { Spinner } from "../components/Spinner";

function formatMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function MonthlyDropsPage() {
  const navigate = useNavigate();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vaultApi
      .getDrops()
      .then(setDrops)
      .finally(() => setLoading(false));
  }, []);

  async function handleClick(productId: string, unlocked: boolean) {
    if (!unlocked) {
      navigate("/upgrade");
      return;
    }
    const { download_url } = await vaultApi.getDownloadUrl(productId);
    window.open(download_url, "_blank", "noopener,noreferrer");
  }

  if (loading) return <Spinner />;

  return (
    <div className="container page stack gap-lg">
      <h1>Monthly Drops</h1>

      {drops.length === 0 ? (
        <p className="muted">Nothing here yet — but she's about to have options.</p>
      ) : (
        drops.map((drop) => (
          <section key={drop.month} className="stack gap-md">
            <div className="row gap-md">
              <h2>{formatMonth(drop.month)}</h2>
              {!drop.unlocked && <span className="pill pill-cream">Vault members only</span>}
            </div>
            <div className="grid grid-products">
              {drop.products.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  type={product.type}
                  price={product.price}
                  thumbnailUrl={product.thumbnail_url}
                  locked={!drop.unlocked}
                  owned={drop.unlocked}
                  onClick={() => handleClick(product.id, drop.unlocked)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
