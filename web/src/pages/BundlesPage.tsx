import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { vaultApi, Bundle } from "../api/vault";
import { useAuth } from "../context/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { BundleCard } from "../components/BundleCard";
import { VaultLoadingGrid, VaultErrorState } from "../components/VaultStatus";
import { ApiError } from "../api/client";

// Public storefront - bundle data is already a public endpoint. Only
// checkout needs a logged-in user.
export function BundlesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: bundles, loading, error, retry } = useAsyncData(() => vaultApi.listBundles(), {
    cacheKey: "sls_cache_bundles",
  });
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleBuy(bundle: Bundle) {
    if (!user) {
      navigate("/register", { state: { from: "/upgrade" } });
      return;
    }
    setActionError(null);
    setCheckingOutId(bundle.id);
    try {
      const { checkout_url } = await vaultApi.checkout({ bundle_id: bundle.id });
      window.location.href = checkout_url;
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't start checkout. Try again in a moment.");
      setCheckingOutId(null);
    }
  }

  if (loading) return <VaultLoadingGrid title="Upgrade Your Vault" gridClassName="grid-bundles" count={9} />;
  if (error) return <VaultErrorState title="Upgrade Your Vault" message={error} onRetry={retry} />;

  return (
    <div className="container page stack gap-lg">
      <div className="stack gap-sm">
        <h1>Upgrade Your Vault</h1>
        <p className="muted">The more you bundle, the more she saves.</p>
      </div>

      {actionError && <div className="form-error">{actionError}</div>}

      <div className="grid grid-bundles">
        {(bundles ?? []).map((bundle) => (
          <BundleCard
            key={bundle.id}
            name={bundle.name}
            description={bundle.description}
            price={bundle.price}
            individualTotal={bundle.individual_total}
            savings={bundle.savings}
            productCount={bundle.products.length}
            isFoundingMember={bundle.is_founding_member}
            isBestValue={bundle.slug === "full-library"}
            loading={checkingOutId === bundle.id}
            onBuy={() => handleBuy(bundle)}
          />
        ))}
      </div>
    </div>
  );
}
