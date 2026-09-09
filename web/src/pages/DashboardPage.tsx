import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { vaultApi, Dashboard } from "../api/vault";
import { MembershipBadge } from "../components/MembershipBadge";
import { VaultTile } from "../components/VaultTile";
import { ProductCard } from "../components/ProductCard";
import { Spinner } from "../components/Spinner";

export function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vaultApi
      .getDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !dashboard) return <Spinner />;

  return (
    <div className="container page stack gap-lg">
      <div className="stack gap-sm">
        {dashboard.membership_badge && (
          <MembershipBadge badge={dashboard.membership_badge} founding={dashboard.membership_tier === "founding_member"} />
        )}
        <h1>{dashboard.welcome_message}</h1>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        <VaultTile emoji="📚" label="My Library" to="/library" />
        <VaultTile emoji="🎀" label="My Purchases" to="/purchases" />
        <VaultTile emoji="🗂️" label="Downloads" to="/library" />
        <VaultTile emoji="✨" label="Monthly Drops" to="/drops" />
        <VaultTile emoji="🤖" label="AI Resources" to="/ai-resources" />
        <VaultTile emoji="🎁" label="Member Bonuses" to="/upgrade" />
      </div>

      {dashboard.new_this_month.length > 0 && (
        <section className="stack gap-md">
          <h2>New This Month</h2>
          <div className="grid grid-products">
            {dashboard.new_this_month.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                type={product.type}
                price={product.price}
                subtitle={product.subtitle}
                thumbnailUrl={product.thumbnail_url}
                locked
                onClick={() => navigate("/drops")}
              />
            ))}
          </div>
        </section>
      )}

      <section className="stack gap-md">
        <h2>Continue Your Journey</h2>
        {dashboard.continue_your_journey.length === 0 ? (
          <p className="muted">Nothing here yet — but she's about to have options.</p>
        ) : (
          <div className="grid grid-products">
            {dashboard.continue_your_journey.map((item) => (
              <ProductCard
                key={item.product.id}
                title={item.product.title}
                type={item.product.type}
                price={item.product.price}
                subtitle={item.product.subtitle}
                thumbnailUrl={item.product.thumbnail_url}
                owned
                onClick={() => navigate("/library")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
