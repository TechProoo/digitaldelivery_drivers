import { useState, useRef, useEffect } from "react";
import {
  Shield,
  Send,
  Paperclip,
  CheckCheck,
  Check,
  AlertCircle,
  MapPin,
  Clock,
  Info,
  Smile,
} from "lucide-react";
import { ADMIN_MESSAGES, CURRENT_DRIVER } from "../data/mock";
import type { Message } from "../types";

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateHeader(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
}

function getMessageMeta(content: string) {
  const lower = content.toLowerCase();
  if (lower.includes("traffic") || lower.includes("construction") || lower.includes("congestion"))
    return { icon: AlertCircle, rgb: "245,158,11" };
  if (lower.includes("route") || lower.includes("pickup") || lower.includes("delivery"))
    return { icon: MapPin, rgb: "59,130,246" };
  if (lower.includes("reminder") || lower.includes("confirm"))
    return { icon: Clock, rgb: "239,68,68" };
  return { icon: Info, rgb: "100,116,139" };
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>(() =>
    JSON.parse(JSON.stringify(ADMIN_MESSAGES)),
  );
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const unreadCount = messages.filter((m) => !m.read && !m.isDriver).length;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = {
      id: `msg-drv-${Date.now()}`,
      senderId: CURRENT_DRIVER.id,
      senderName: CURRENT_DRIVER.name,
      content: text,
      timestamp: new Date().toISOString(),
      isDriver: true,
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    inputRef.current?.focus();
  }

  // Group by date
  const grouped: { date: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const key = new Date(msg.timestamp).toDateString();
    const last = grouped[grouped.length - 1];
    if (last && last.date === key) last.msgs.push(msg);
    else grouped.push({ date: key, msgs: [msg] });
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - var(--topbar-h, 64px) - 32px)" }}>
      {/* ═══ Chat Header ═══ */}
      <div
        className="flex items-center gap-4 px-5 py-4"
        style={{
          background: "linear-gradient(145deg, #1a2332, #141c2c)",
          borderRadius: "16px 16px 0 0",
          border: "1px solid var(--border-soft)",
          borderBottom: "none",
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Shield size={22} style={{ color: "#fff" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2">
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Admin</h2>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
              boxShadow: "0 0 6px rgba(34,197,94,0.5)", display: "inline-block",
            }} />
            <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>Online</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0, marginTop: 1 }}>
            Digital Delivery Operations
          </p>
        </div>
        {unreadCount > 0 && (
          <span style={{
            minWidth: 24, height: 24, borderRadius: 12,
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#fff", fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 7px", boxShadow: "0 2px 8px rgba(239,68,68,0.35)",
          }}>
            {unreadCount}
          </span>
        )}
      </div>

      {/* ═══ Message Feed ═══ */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5"
        style={{
          background: "linear-gradient(180deg, #0d1320, #0b1018)",
          borderLeft: "1px solid var(--border-soft)",
          borderRight: "1px solid var(--border-soft)",
          display: "flex", flexDirection: "column", gap: 16,
        }}
      >
        {grouped.map((group) => (
          <div key={group.date} className="flex flex-col" style={{ gap: 10 }}>
            {/* Date divider */}
            <div className="flex items-center gap-3 py-2">
              <div style={{ flex: 1, height: 1, background: "var(--border-soft)" }} />
              <span style={{
                fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)",
                letterSpacing: "0.05em", textTransform: "uppercase",
                padding: "4px 12px", borderRadius: 20,
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-soft)",
              }}>
                {formatDateHeader(group.msgs[0].timestamp)}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border-soft)" }} />
            </div>

            {/* Messages */}
            {group.msgs.map((msg) => {
              if (msg.isDriver) {
                // Driver (right-aligned) bubble
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{
                      maxWidth: "75%",
                      padding: "10px 14px",
                      borderRadius: "14px 14px 4px 14px",
                      background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                      boxShadow: "0 2px 8px rgba(59,130,246,0.2)",
                    }}>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: "#fff", margin: 0 }}>
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-1.5" style={{ marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.read
                          ? <CheckCheck size={13} style={{ color: "rgba(255,255,255,0.7)" }} />
                          : <Check size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
                        }
                      </div>
                    </div>
                  </div>
                );
              }

              // Admin (left-aligned) bubble with category icon
              const meta = getMessageMeta(msg.content);
              const Icon = meta.icon;
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}>
                  {/* Category icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: `rgba(${meta.rgb},0.1)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: 4,
                  }}>
                    <Icon size={16} style={{ color: `rgb(${meta.rgb})` }} />
                  </div>

                  <div style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: "4px 14px 14px 14px",
                    background: !msg.read
                      ? `linear-gradient(145deg, rgba(${meta.rgb},0.06), rgba(${meta.rgb},0.02))`
                      : "linear-gradient(145deg, #1e293b, #1a2332)",
                    border: !msg.read
                      ? `1px solid rgba(${meta.rgb},0.15)`
                      : "1px solid var(--border-soft)",
                    position: "relative",
                  }}>
                    {!msg.read && (
                      <div style={{
                        position: "absolute", top: 6, right: 6,
                        width: 6, height: 6, borderRadius: "50%",
                        background: `rgb(${meta.rgb})`,
                        boxShadow: `0 0 6px rgba(${meta.rgb},0.5)`,
                      }} />
                    )}
                    <p style={{
                      fontSize: 13, lineHeight: 1.6, color: "#fff",
                      fontWeight: msg.read ? 400 : 500, margin: 0,
                    }}>
                      {msg.content}
                    </p>
                    <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* ═══ Message Input ═══ */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: "linear-gradient(145deg, #1a2332, #141c2c)",
          borderRadius: "0 0 16px 16px",
          border: "1px solid var(--border-soft)",
          borderTop: "none",
          flexShrink: 0,
        }}
      >
        {/* Attach */}
        <button
          style={{
            width: 38, height: 38, borderRadius: 10, border: "none",
            background: "rgba(255,255,255,0.04)", color: "var(--text-tertiary)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 150ms", flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          <Paperclip size={18} />
        </button>

        {/* Emoji */}
        <button
          style={{
            width: 38, height: 38, borderRadius: 10, border: "none",
            background: "rgba(255,255,255,0.04)", color: "var(--text-tertiary)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 150ms", flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          <Smile size={18} />
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            flex: 1, height: 42, padding: "0 16px",
            borderRadius: 12, border: "1px solid var(--border-soft)",
            background: "rgba(255,255,255,0.04)", color: "#fff",
            fontSize: 13, outline: "none",
            transition: "all 200ms",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
            e.currentTarget.style.background = "rgba(59,130,246,0.04)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-soft)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            width: 42, height: 42, borderRadius: 12, border: "none",
            background: input.trim()
              ? "linear-gradient(135deg, #3b82f6, #2563eb)"
              : "rgba(255,255,255,0.06)",
            color: input.trim() ? "#fff" : "var(--text-tertiary)",
            cursor: input.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 200ms", flexShrink: 0,
            boxShadow: input.trim() ? "0 4px 12px rgba(59,130,246,0.3)" : "none",
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
