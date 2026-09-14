import { LegalPage } from "../../components/LegalPage";

export function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" updated="September 2026">
      <p>
        Because Vault products are instantly downloadable digital files, all sales are final and
        non-refundable once a product has been unlocked or downloaded, except where required by
        law.
      </p>
      <h3>Something went wrong with a purchase</h3>
      <p>
        If you were charged in error, charged twice, or a product genuinely failed to unlock,
        contact <a href="mailto:support@softlifesocietyai.com">support@softlifesocietyai.com</a>{" "}
        within 7 days of purchase and we'll make it right.
      </p>
      <h3>Subscriptions (The Box)</h3>
      <p>
        Cancelling a subscription stops future charges but does not refund the current billing
        period.
      </p>
    </LegalPage>
  );
}
