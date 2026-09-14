import { Link } from "react-router-dom";

import logo from "../assets/logo.png";

// Social links ship empty until real, active handles exist - see
// Footer's own guidance: never link an account that doesn't exist.
const SOCIAL_LINKS: { label: string; href: string }[] = [];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="row gap-sm" style={{ alignItems: "center", marginBottom: 10 }}>
              <img src={logo} alt="" style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--gold)" }} />
              <strong style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>Soft Life Society AI</strong>
            </div>
            <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 220 }}>Plan your life. Glow daily. Become her.</p>
            {SOCIAL_LINKS.length > 0 && (
              <div className="row gap-md" style={{ marginTop: 16 }}>
                {SOCIAL_LINKS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{ display: "inline", padding: 0 }}>
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="footer-col">
            <h4>Navigate</h4>
            <Link to="/">Home</Link>
            <Link to="/#society">The Society</Link>
            <Link to="/shop">The Vault</Link>
            <Link to="/drops">Monthly Drops</Link>
            <Link to="/upgrade">Upgrade</Link>
            <Link to="/#faq">FAQ</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/#society">About</Link>
            <a href="mailto:hello@softlifesocietyai.com">Contact</a>
            <a href="mailto:support@softlifesocietyai.com">Support</a>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/refund-policy">Refund Policy</Link>
            <Link to="/cookie-policy">Cookie Policy</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Soft Life Society AI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
