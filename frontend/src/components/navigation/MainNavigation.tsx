import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Briefcase, BarChart2, Settings, LogOut, LogIn } from "lucide-react";
import { clearAccessToken, getAccessToken } from "../../lib/authToken";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/portfolios", label: "Portfolios", icon: Briefcase },
  { to: "/assets", label: "Assets", icon: BarChart2 },
  { to: "/settings", label: "Settings", icon: Settings },
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
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <Icon size={18} aria-hidden />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
        <li className="nav-list-auth">
          {hasToken ? (
            <button type="button" className="nav-link nav-button" onClick={onLogout}>
              <LogOut size={18} aria-hidden />
              <span>Logout</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <LogIn size={18} aria-hidden />
              <span>Login</span>
            </NavLink>
          )}
        </li>
      </ul>
    </nav>
  );
}
