import { LegalPage } from "../../components/LegalPage";

export function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <p>
        Soft Life Society AI ("we," "us") respects your privacy. This policy describes what
        information we collect when you use softlifesocietyai.com and our related app, and how we
        use it.
      </p>
      <h3>Information we collect</h3>
      <p>
        Account information you provide (name, email, password), purchase and order history,
        and product usage data (such as which items you've opened or downloaded) needed to run
        your membership and library.
      </p>
      <h3>How we use it</h3>
      <p>
        To create and maintain your account, fulfill purchases, provide access to products
        you've unlocked, and communicate with you about your account or orders. We do not sell
        your personal information.
      </p>
      <h3>Payment information</h3>
      <p>
        Payments are processed by Stripe. We do not store your full card details on our servers.
      </p>
      <h3>Your choices</h3>
      <p>
        You can request a copy of your data or ask us to delete your account by contacting{" "}
        <a href="mailto:support@softlifesocietyai.com">support@softlifesocietyai.com</a>.
      </p>
      <h3>Contact</h3>
      <p>Questions about this policy: <a href="mailto:hello@softlifesocietyai.com">hello@softlifesocietyai.com</a>.</p>
    </LegalPage>
  );
}
