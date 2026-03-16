import { useState } from "react";
import { Menu, Search, Bell } from "lucide-react";
import { useSidebar } from "./Sidebar";
import { NOTIFICATIONS } from "../../data/mock";

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { open } = useSidebar();
  const [isOnline, setIsOnline] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

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
        className="lg:hidden"
        style={{
          width: 40,
          height: 40,
          display: "flex",
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
      <button
        style={{
          position: "relative",
          width: 40,
          height: 40,
          display: "flex",
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
            {unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}
