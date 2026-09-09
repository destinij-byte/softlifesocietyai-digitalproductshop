import { useEffect, useState } from "react";

import { vaultApi, Bundle } from "../api/vault";
import { BundleCard } from "../components/BundleCard";
import { Spinner } from "../components/Spinner";
import { ApiError } from "../api/client";

export function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vaultApi
      .listBundles()
      .then(setBundles)
      .finally(() => setLoading(false));
  }, []);

  async function handleBuy(bundle: Bundle) {
    setError(null);
    setCheckingOutId(bundle.id);
    try {
      const { checkout_url } = await vaultApi.checkout({ bundle_id: bundle.id });
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start checkout. Try again in a moment.");
      setCheckingOutId(null);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="container page stack gap-lg">
      <div className="stack gap-sm">
        <h1>Upgrade Your Vault</h1>
        <p className="muted">The more you bundle, the more she saves.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="grid grid-bundles">
        {bundles.map((bundle) => (
          <BundleCard
            key={bundle.id}
            name={bundle.name}
            description={bundle.description}
            price={bundle.price}
            individualTotal={bundle.individual_total}
            savings={bundle.savings}
            productCount={bundle.products.length}
            isFoundingMember={bundle.is_founding_member}
            loading={checkingOutId === bundle.id}
            onBuy={() => handleBuy(bundle)}
          />
        ))}
      </div>
    </div>
  );
}
