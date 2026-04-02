import { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, Package, MessageSquare, DollarSign, Settings, Check } from "lucide-react";
import { useSidebar } from "./Sidebar";
import { useNotifications } from "../../contexts/NotificationContext";

interface TopBarProps {
  title?: string;
}

function getRelativeTime(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  delivery: <Package size={14} />,
  message: <MessageSquare size={14} />,
  earnings: <DollarSign size={14} />,
  system: <Settings size={14} />,
};

const NOTIF_RGB: Record<string, string> = {
  delivery: "59,130,246",
  message: "168,85,247",
  earnings: "34,197,94",
  system: "245,158,11",
};

export default function TopBar({ title }: TopBarProps) {
  const { open } = useSidebar();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOnline, setIsOnline] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Close panel on click outside
  useEffect(() => {
    if (!showPanel) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setShowPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPanel]);

  return (
    <header
      className="flex items-center gap-3 px-4 lg:px-6"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: "var(--topbar-h)",
        background: "rgba(11,17,32,0.85)",
        backdropFilter: "blur(12px) saturate(150%)",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      {/* Hamburger – mobile */}
      <button
        onClick={open}
        className="flex md:hidden"
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-soft)",
          background: "rgba(255,255,255,0.04)",
          color: "var(--text-secondary)",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all var(--duration-normal) var(--ease-out)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.04)";
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--text-secondary)";
        }}
      >
        <Menu size={22} />
      </button>

      {/* Page title – desktop */}
      {title && (
        <h1
          className="hidden lg:block"
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search – desktop */}
      <div
        className="hidden lg:flex items-center gap-2 px-3"
        style={{
          height: 40,
          borderRadius: "var(--radius-sm)",
          background: "var(--bg-input)",
          border: searchFocused
            ? "1px solid var(--accent-blue)"
            : "1px solid var(--border-soft)",
          boxShadow: searchFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
          transition: "all var(--duration-normal) var(--ease-out)",
          width: 240,
        }}
      >
        <Search
          size={16}
          style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
        />
        <input
          type="text"
          placeholder="Search..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text-primary)",
            fontSize: 14,
            width: "100%",
          }}
        />
      </div>

      {/* Online toggle */}
      <div className="flex items-center gap-2">
        <span
          className="hidden sm:inline"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isOnline ? "var(--accent-green)" : "var(--text-tertiary)",
            transition: "color var(--duration-normal) var(--ease-out)",
          }}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
        <button
          onClick={() => setIsOnline((p) => !p)}
          role="switch"
          aria-checked={isOnline}
          style={{
            position: "relative",
            width: 44,
            height: 24,
            borderRadius: "var(--radius-full)",
            border: "none",
            cursor: "pointer",
            background: isOnline
              ? "var(--accent-green)"
              : "rgba(255,255,255,0.12)",
            boxShadow: isOnline ? "0 0 12px rgba(34,197,94,0.35)" : "none",
            transition: "all var(--duration-normal) var(--ease-out)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: isOnline ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: "var(--radius-full)",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              transition: "left var(--duration-normal) var(--ease-out)",
            }}
          />
        </button>
      </div>

      {/* Notification bell */}
      <div style={{ position: "relative" }}>
        <button
          ref={bellRef}
          onClick={() => setShowPanel((p) => !p)}
          style={{
            position: "relative",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-sm)",
            border: showPanel ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--border-soft)",
            background: showPanel ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.04)",
            color: showPanel ? "#3b82f6" : "var(--text-secondary)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all var(--duration-normal) var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            if (!showPanel) {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (!showPanel) {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-secondary)";
            }
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                minWidth: 18,
                height: 18,
                borderRadius: "var(--radius-full)",
                background: "var(--accent-red)",
                boxShadow: "0 0 10px rgba(239,68,68,0.5)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                lineHeight: 1,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {showPanel && (
          <div
            ref={panelRef}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 340,
              maxHeight: 440,
              borderRadius: 16,
              background: "linear-gradient(145deg, #1a2332, #141c2c)",
              border: "1px solid var(--border-soft)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
              overflow: "hidden",
              zIndex: 50,
              animation: "fade-in 150ms ease-out",
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--border-soft)" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: "#3b82f6",
                    background: "rgba(59,130,246,0.1)", padding: "2px 7px", borderRadius: 8,
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#3b82f6", fontSize: 11, fontWeight: 600,
                  }}
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div style={{ maxHeight: 380, overflowY: "auto", scrollbarWidth: "thin" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <Bell size={28} style={{ color: "var(--text-tertiary)", margin: "0 auto 8px", opacity: 0.3 }} />
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>
                    No notifications yet
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
                    You'll be notified about deliveries, messages, and updates
                  </p>
                </div>
              ) : (
                notifications.map((notif, idx) => {
                  const rgb = NOTIF_RGB[notif.type] || "100,116,139";
                  return (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3"
                      onClick={() => markRead(notif.id)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: idx < notifications.length - 1 ? "1px solid var(--border-soft)" : "none",
                        cursor: "pointer",
                        transition: "background 150ms",
                        position: "relative",
                        background: !notif.read ? `rgba(${rgb},0.03)` : "transparent",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = !notif.read ? `rgba(${rgb},0.03)` : "transparent"; }}
                    >
                      {!notif.read && (
                        <div style={{
                          position: "absolute", top: 16, left: 5,
                          width: 5, height: 5, borderRadius: "50%",
                          background: `rgb(${rgb})`,
                          boxShadow: `0 0 6px rgba(${rgb},0.5)`,
                        }} />
                      )}
                      <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: `rgba(${rgb},0.1)`,
                        color: `rgb(${rgb})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {NOTIF_ICONS[notif.type]}
                      </div>
                      <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p style={{
                            fontSize: 12,
                            fontWeight: notif.read ? 500 : 650,
                            color: "#fff",
                          }}>
                            {notif.title}
                          </p>
                          <span style={{ fontSize: 10, color: "var(--text-tertiary)", flexShrink: 0 }}>
                            {getRelativeTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className="truncate" style={{
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          lineHeight: 1.4,
                        }}>
                          {notif.body}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
