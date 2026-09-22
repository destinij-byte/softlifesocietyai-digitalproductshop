import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { vaultApi, Box, BoxTierKey } from "../api/vault";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { VaultLoadingGrid, VaultErrorState } from "../components/VaultStatus";
import logo from "../assets/logo.png";

// Public storefront - box/tier/pricing data is already a public endpoint.
// Only the actual subscribe checkout needs a logged-in user.
export function MonthlyDropsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: boxes, loading, error, retry } = useAsyncData(() => vaultApi.getBoxes(), {
    cacheKey: "sls_cache_boxes",
  });
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleSubscribe(boxType: Box["box_type"], tier: BoxTierKey) {
    if (!user) {
      navigate("/register", { state: { from: "/drops" } });
      return;
    }
    setActionError(null);
    const key = `${boxType}-${tier}`;
    setBusyKey(key);
    try {
      const { checkout_url } = await vaultApi.checkoutBox({ box_type: boxType, tier });
      window.location.href = checkout_url;
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Something went wrong. Try again in a moment.");
      setBusyKey(null);
    }
  }

  if (loading) return <VaultLoadingGrid title="The Box" gridClassName="grid-bundles" count={2} />;
  if (error) return <VaultErrorState title="The Box" message={error} onRetry={retry} />;

  return (
    <div className="container page stack gap-lg">
      <div className="stack gap-sm">
        <h1>The Box</h1>
        <p className="muted">
          A little something in the mail every month — hand-packed by Dess. Subscribe by the monthly cutoff to
          make that month's box; contents rotate, so it's always a bit of a surprise.
        </p>
      </div>

      {actionError && <div className="form-error">{actionError}</div>}

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {(boxes ?? []).map((box) => (
          <div key={box.box_type} className="box-card">
            <img src={logo} alt="" className="brand-logo" />
            <span className="box-card-question">?</span>
            <h2>{box.label}</h2>
            <p className="box-card-teaser">{box.teaser}</p>

            <div className="box-tiers">
              {box.tiers.map((tier) => {
                const subscribed = box.subscribed_tier === tier.tier;
                const key = `${box.box_type}-${tier.tier}`;
                return (
                  <div key={tier.tier} className="box-tier-row">
                    <span style={{ fontWeight: 600 }}>{tier.label}</span>
                    <span className="row gap-sm">
                      <span className="box-tier-price">${tier.price}/mo</span>
                      <button
                        className={`btn btn-sm ${subscribed ? "btn-outline-gold" : "btn-gold"}`}
                        disabled={subscribed || busyKey === key}
                        onClick={() => handleSubscribe(box.box_type, tier.tier)}
                      >
                        {subscribed ? "Subscribed" : busyKey === key ? "…" : "Subscribe"}
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
