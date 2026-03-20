import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  MapPin,
  MessageSquare,
  DollarSign,
  Truck,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";
import { CURRENT_DRIVER } from "../../data/mock";
import Logo from "../../assets/logo_2.png";

/* ─── Sidebar Context ─── */
interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

export const SidebarContext = createContext<SidebarState>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
  open: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((p) => !p), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);
  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

/* ─── Navigation ─── */
const MAIN_NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/deliveries", label: "Deliveries", icon: Package },
  { to: "/tracking", label: "Tracking", icon: MapPin },
  { to: "/messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { to: "/earnings", label: "Earnings", icon: DollarSign },
  { to: "/fleet", label: "Fleet", icon: Truck },
];

const BOTTOM_NAV = [{ label: "Log Out", icon: LogOut }];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ─── Component ─── */
export default function Sidebar() {
  const { isOpen, close } = useSidebar();

  const sidebarContent = (
    <div
      style={{
        width: "var(--sidebar-w)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #0f172a 0%, #080e1a 100%)",
        borderRight: "1px solid var(--border-soft)",
        overflowY: "auto",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-5"
        style={{ height: 72, flexShrink: 0 }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,

            boxShadow:
              "0 4px 20px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 16,
            color: "#fff",
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          <img src={Logo} alt="" />
        </div>
        <div className="flex flex-col" style={{ minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Driver Platform
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-tertiary)",
              lineHeight: 1.3,
              fontWeight: 500,
            }}
          >
            Digital Delivery
          </span>
        </div>
        <button
          onClick={close}
          className="lg:hidden"
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 150ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Separator ── */}
      <div
        className="mx-4"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--border-medium), transparent)",
        }}
      />

      {/* ── Section label ── */}
      <div className="px-5 pt-5 pb-2">
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-tertiary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Main Menu
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-1 px-3 flex-1 p-6">
        {MAIN_NAV.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={close}
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 px-3 py-2.5"
                style={{
                  borderRadius: 12,
                  position: "relative",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(139,92,246,0.08) 100%)"
                    : "transparent",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: isActive
                    ? "0 2px 12px rgba(59,130,246,0.12)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 20,
                      borderRadius: "0 4px 4px 0",
                      background: "linear-gradient(180deg, #3b82f6, #8b5cf6)",
                      boxShadow: "0 0 8px rgba(59,130,246,0.5)",
                    }}
                  />
                )}

                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive
                      ? "rgba(59,130,246,0.15)"
                      : "rgba(255,255,255,0.03)",
                    transition: "all 200ms",
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    style={{
                      color: isActive ? "#3b82f6" : "var(--text-tertiary)",
                      transition: "color 200ms",
                    }}
                  />
                </div>

                <span className="flex-1">{label}</span>

                {badge && badge > 0 && (
                  <span
                    style={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                      boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                    }}
                  >
                    {badge}
                  </span>
                )}

                {isActive && !badge && (
                  <ChevronRight
                    size={16}
                    style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}
                  />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Separator ── */}
      <div
        className="mx-4"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--border-medium), transparent)",
        }}
      />

      {/* ── Bottom actions ── */}
      <div className="flex flex-col gap-0.5 px-3 py-3">
        {BOTTOM_NAV.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex items-center gap-3 px-3 py-2"
            style={{
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color:
                label === "Log Out"
                  ? "var(--accent-red)"
                  : "var(--text-tertiary)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 150ms",
              width: "100%",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                label === "Log Out"
                  ? "rgba(239,68,68,0.08)"
                  : "rgba(255,255,255,0.04)";
              if (label !== "Log Out")
                e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              if (label !== "Log Out")
                e.currentTarget.style.color = "var(--text-tertiary)";
            }}
          >
            <Icon size={18} strokeWidth={1.7} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Separator ── */}
      <div
        className="mx-4"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--border-medium), transparent)",
        }}
      />

      {/* ── Driver profile ── */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ cursor: "pointer", transition: "background 150ms" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              boxShadow:
                "0 4px 16px rgba(59,130,246,0.25), 0 0 0 2px rgba(59,130,246,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            {getInitials(CURRENT_DRIVER.name)}
          </div>
          {/* Online dot */}
          <span
            style={{
              position: "absolute",
              bottom: -1,
              right: -1,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2.5px solid #0f172a",
              boxShadow: "0 0 8px rgba(34,197,94,0.6)",
            }}
          >
            <span
              className="animate-pulse-dot"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
          </span>
        </div>

        <div className="flex flex-col" style={{ minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {CURRENT_DRIVER.name}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--text-tertiary)",
              fontWeight: 500,
            }}
          >
            {CURRENT_DRIVER.vehicleType} &middot; {CURRENT_DRIVER.rating}{" "}
            &#9733;
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden lg:block"
        style={{ position: "fixed", top: 0, left: 0, zIndex: 40 }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden"
          style={{ position: "fixed", inset: 0, zIndex: 50 }}
        >
          <div
            onClick={close}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              animation: "slide-in-left 0.25s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <style>{`@keyframes slide-in-left { from { transform: translateX(-100%); opacity: 0.5; } to { transform: translateX(0); opacity: 1; } }`}</style>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
