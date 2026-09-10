import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const APP_LINK = import.meta.env.VITE_APP_LINK ?? "https://softlifesocietyai.com/app";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="container">
        <NavLink to="/" className="brand-lockup">
          <img src={logo} alt="" className="brand-logo" />
          <span className="wordmark">
            Soft Life Society AI
            <span className="wordmark-tagline">Plan your life · Glow daily · Become her</span>
          </span>
        </NavLink>

        {user ? (
          <nav className="row gap-md">
            <div className="nav-links">
              <NavLink to="/" end>
                Dashboard
              </NavLink>
              <NavLink to="/shop">Shop</NavLink>
              <NavLink to="/library">My Library</NavLink>
              <NavLink to="/drops">Monthly Drops</NavLink>
              <NavLink to="/upgrade">Upgrade</NavLink>
              <NavLink to="/purchases">My Purchases</NavLink>
            </div>
            <a className="btn btn-sm btn-gold" href={APP_LINK} target="_blank" rel="noreferrer">
              OPEN THE APP
            </a>
            <button className="btn btn-sm btn-outline-gold" onClick={handleLogout}>
              Log out
            </button>
          </nav>
        ) : (
          <div className="nav-links">
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register" className="btn btn-gold">
              Join the Vault
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
