import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { IconBag } from "./icons/LineIcons";
import logo from "../assets/logo.png";

const APP_LINK = import.meta.env.VITE_APP_LINK ?? "https://softlifesocietyai.com/app";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

// Same-page hash anchors (e.g. "/#faq") always resolve to pathname "/" for
// NavLink's active-matching, which falsely marks them (and sometimes Home)
// active regardless of scroll position - render those as plain anchors.
function NavItemLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  if (item.to.includes("#")) {
    return (
      <a href={item.to.replace(/^\//, "")} onClick={onClick}>
        {item.label}
      </a>
    );
  }
  return (
    <NavLink to={item.to} end={item.end} onClick={onClick}>
      {item.label}
    </NavLink>
  );
}

export function NavBar() {
  const { user, logout } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login");
  }

  const memberItems: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", end: true },
    { to: "/shop", label: "The Vault" },
    { to: "/library", label: "My Library" },
    { to: "/drops", label: "Monthly Drops" },
    { to: "/upgrade", label: "Upgrade" },
    { to: "/purchases", label: "My Purchases" },
  ];

  const guestItems: NavItem[] = [
    { to: "/", label: "Home", end: true },
    { to: "/#society", label: "The Society" },
    { to: "/shop", label: "The Vault" },
    { to: "/upgrade", label: "Upgrade" },
    { to: "/#faq", label: "FAQ" },
  ];

  const items = user ? memberItems : guestItems;

  return (
    <header className="navbar">
      <div className="container">
        <NavLink to="/" className="brand-lockup" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="" className="brand-logo" />
          <span className="wordmark">
            Soft Life Society AI
            <span className="wordmark-tagline">Plan your life · Glow daily · Become her</span>
          </span>
        </NavLink>

        <nav className="row gap-md">
          <div className="nav-desktop-extra row gap-md">
            <div className="nav-links">
              {items.map((item) => (
                <NavItemLink key={item.label} item={item} />
              ))}
            </div>

            {user ? (
              <button className="btn btn-sm btn-outline-gold" onClick={handleLogout}>
                Log out
              </button>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-sm btn-outline-gold">
                  Log in
                </NavLink>
                <NavLink to="/register" className="btn btn-sm btn-gold">
                  Join the Society
                </NavLink>
              </>
            )}
          </div>

          {user && (
            <a className="btn btn-sm btn-gold nav-app-btn" href={APP_LINK} target="_blank" rel="noreferrer">
              OPEN THE APP
            </a>
          )}

          <NavLink to="/cart" className="nav-cart-link" aria-label="Cart" onClick={() => setMenuOpen(false)}>
            <IconBag style={{ width: 22, height: 22 }} />
            {cart.count > 0 && <span className="nav-cart-badge">{cart.count}</span>}
          </NavLink>

          <button
            className="nav-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </nav>
      </div>

      {menuOpen && (
        <div className="mobile-menu-panel">
          <div className="row-between">
            <NavLink to="/" className="brand-lockup" onClick={() => setMenuOpen(false)}>
              <img src={logo} alt="" className="brand-logo" />
              <span className="wordmark">Soft Life Society AI</span>
            </NavLink>
            <button className="nav-burger" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="nav-links">
            {items.map((item) => (
              <NavItemLink key={item.label} item={item} onClick={() => setMenuOpen(false)} />
            ))}
            {user && (
              <a href="#faq" onClick={() => setMenuOpen(false)}>
                FAQ
              </a>
            )}
            <a href="mailto:hello@softlifesocietyai.com" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
            {user ? (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Log out
              </a>
            ) : (
              <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                Log in
              </NavLink>
            )}
          </div>

          {user ? (
            <a
              className="btn btn-gold btn-block"
              style={{ marginTop: "auto" }}
              href={APP_LINK}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              OPEN THE APP
            </a>
          ) : (
            <NavLink to="/register" className="btn btn-gold btn-block" style={{ marginTop: "auto" }} onClick={() => setMenuOpen(false)}>
              JOIN THE SOCIETY
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
