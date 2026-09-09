import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

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
        <NavLink to="/" className="wordmark">
          The Soft Life Vault
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
              <NavLink to="/ai-resources">AI Resources</NavLink>
              <NavLink to="/upgrade">Upgrade</NavLink>
              <NavLink to="/purchases">My Purchases</NavLink>
            </div>
            <a className="btn btn-sm btn-ink" href={APP_LINK} target="_blank" rel="noreferrer">
              OPEN THE APP
            </a>
            <button className="btn btn-sm btn-outline" onClick={handleLogout}>
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
