import { LegalPage } from "../../components/LegalPage";

export function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" updated="September 2026">
      <p>
        Soft Life Society AI uses a small amount of browser storage to keep the site working -
        we don't use tracking or advertising cookies today.
      </p>
      <h3>What we store</h3>
      <p>
        A login token, stored in your browser, so you stay signed in between visits. This is
        essential to the site working and isn't used for tracking or advertising.
      </p>
      <h3>Future updates</h3>
      <p>
        If we add analytics or marketing tools later, we'll update this policy and provide a way
        to opt out where required.
      </p>
    </LegalPage>
  );
}
