import { LegalPage } from "../../components/LegalPage";

export function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 2026">
      <p>
        By creating an account or purchasing from Soft Life Society AI, you agree to these
        terms.
      </p>
      <h3>Your account</h3>
      <p>
        You're responsible for keeping your login credentials secure and for activity that
        happens under your account.
      </p>
      <h3>Digital products</h3>
      <p>
        Products in the Vault are for your personal use only. Reselling, redistributing, or
        publicly sharing purchased files is not permitted.
      </p>
      <h3>Memberships and subscriptions</h3>
      <p>
        Recurring memberships (including The Box) renew automatically until cancelled. You can
        cancel at any time from your account; cancellation stops future billing but does not
        retroactively refund past charges.
      </p>
      <h3>Changes to the service</h3>
      <p>
        We may update, add to, or remove features, products, or pricing over time. We'll do our
        best to communicate meaningful changes.
      </p>
      <h3>Contact</h3>
      <p>Questions about these terms: <a href="mailto:hello@softlifesocietyai.com">hello@softlifesocietyai.com</a>.</p>
    </LegalPage>
  );
}
