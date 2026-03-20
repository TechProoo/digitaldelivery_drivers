import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  MapPin,
  MessageSquare,
  DollarSign,
} from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/deliveries", label: "Deliveries", icon: Package },
  { to: "/tracking", label: "Tracking", icon: MapPin },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/earnings", label: "Earnings", icon: DollarSign },
];

export default function BottomNav() {
  return (
    <nav
      className="hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        height: "var(--bottom-nav-h)",
        background: "rgba(11,17,32,0.88)",
        backdropFilter: "blur(16px) saturate(180%)",
        borderTop: "1px solid var(--border-soft)",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          style={{ textDecoration: "none", flex: 1 }}
        >
          {({ isActive }) => (
            <div
              className="flex flex-col items-center justify-center gap-1"
              style={{
                position: "relative",
                paddingTop: 8,
                paddingBottom: 4,
                cursor: "pointer",
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    width: 24,
                    height: 3,
                    borderRadius: "var(--radius-full)",
                    background: "var(--accent-blue)",
                    boxShadow: "0 0 8px rgba(59,130,246,0.4)",
                  }}
                />
              )}

              <Icon
                size={22}
                style={{
                  color: isActive
                    ? "var(--accent-blue)"
                    : "var(--text-tertiary)",
                  transition: "color var(--duration-normal) var(--ease-out)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? "var(--accent-blue)"
                    : "var(--text-tertiary)",
                  lineHeight: 1,
                  transition: "color var(--duration-normal) var(--ease-out)",
                }}
              >
                {label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
