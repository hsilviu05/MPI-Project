import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Overview", end: true },
  { to: "/portfolios", label: "Portfolios" },
  { to: "/assets", label: "Assets" },
  { to: "/settings", label: "Settings" },
];

export function MainNavigation() {
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
      </ul>
    </nav>
  );
}
