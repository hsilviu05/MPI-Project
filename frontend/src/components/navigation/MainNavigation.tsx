import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAccessToken, getAccessToken } from "../../lib/authToken";

const navItems = [
  { to: "/", label: "Overview", end: true },
  { to: "/portfolios", label: "Portfolios" },
  { to: "/assets", label: "Assets" },
  { to: "/settings", label: "Settings" },
];

export function MainNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasToken, setHasToken] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
  }, [location.pathname]);

  function onLogout() {
    clearAccessToken();
    setHasToken(false);
    navigate("/login");
  }

  return (
    <nav aria-label="Main navigation">
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
        {hasToken ? (
          <li className="nav-list-auth">
            <button type="button" className="nav-link nav-button" onClick={onLogout}>
              Logout
            </button>
          </li>
        ) : (
          <li className="nav-list-auth">
            <NavLink to="/login" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Login
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
