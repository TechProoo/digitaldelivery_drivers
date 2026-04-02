import { useState, useRef, useEffect, useCallback } from "react";
import {
  Shield,
  Send,
  CheckCheck,
  Check,
  AlertCircle,
  MapPin,
  Clock,
  Info,
  ChevronDown,
  Headphones,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { getMessages, sendMessage as apiSendMessage, markMessagesRead } from "../services/api";
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
  return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
}

function getMessageMeta(content: string) {
  const lower = content.toLowerCase();
  if (lower.includes("traffic") || lower.includes("construction") || lower.includes("congestion"))
    return { icon: AlertCircle, rgb: "245,158,11", label: "Alert" };
  if (lower.includes("route") || lower.includes("pickup") || lower.includes("delivery") || lower.includes("confirmed"))
    return { icon: MapPin, rgb: "59,130,246", label: "Delivery" };
  if (lower.includes("reminder") || lower.includes("confirm") || lower.includes("eta"))
    return { icon: Clock, rgb: "239,68,68", label: "Urgent" };
  return { icon: Info, rgb: "100,116,139", label: "" };
}

/** Map backend DriverMessage to frontend Message type */
function mapBackendMessage(m: any): Message {
  return {
    id: m.id,
    senderId: m.sender === "driver" ? m.driverId : "admin-001",
    senderName: m.sender === "driver" ? "You" : "Admin",
    content: m.text,
    timestamp: m.createdAt,
    isDriver: m.sender === "driver",
    read: m.read,
  };
}

const QUICK_REPLIES = [
  "On my way",
  "Arrived at pickup",
  "Package picked up",
  "Delivered successfully",
  "Stuck in traffic",
  "Need assistance",
];

export default function Messages() {
  const { driver } = useAuth();
  const { socket } = useSocket();
  const driverId = driver?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const unreadCount = messages.filter((m) => !m.read && !m.isDriver).length;

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages from API
  useEffect(() => {
    if (!driverId) return;
    setLoading(true);
    getMessages(driverId)
      .then((data: any[]) => {
        // API returns newest first, reverse for chronological order
        const mapped = data.map(mapBackendMessage).reverse();
        setMessages(mapped);
      })
      .catch((err) => console.error("Failed to fetch messages:", err))
      .finally(() => setLoading(false));
  }, [driverId]);

  // Listen for real-time messages via socket
  useEffect(() => {
    if (!socket || !driverId) return;

    const onNewMessage = (msg: any) => {
      if (msg.driverId !== driverId && msg.driverId !== undefined) return;
      const mapped = mapBackendMessage(msg);
      setMessages((prev) => {
        // Dedupe by id
        if (prev.some((m) => m.id === mapped.id)) return prev;
        return [...prev, mapped];
      });
    };

    const onMessagesRead = (data: { driverId: string; readBy: string }) => {
      if (data.driverId !== driverId) return;
      if (data.readBy === "admin") {
        // Our (driver) messages were read by admin
        setMessages((prev) => prev.map((m) => (m.isDriver ? { ...m, read: true } : m)));
      }
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:read", onMessagesRead);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:read", onMessagesRead);
    };
  }, [socket, driverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Track scroll position for "scroll to bottom" button
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(gap > 120);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Mark messages read when scrolled to bottom
  useEffect(() => {
    if (!showScrollBtn && unreadCount > 0 && driverId) {
      setMessages((prev) => prev.map((m) => (!m.isDriver && !m.read ? { ...m, read: true } : m)));
      // Tell backend
      markMessagesRead(driverId, "driver").catch(() => {});
      socket?.emit("message:read", { driverId, readBy: "driver" });
    }
  }, [showScrollBtn, unreadCount, driverId, socket]);

  function handleSend(text?: string) {
    const content = (text || input).trim();
    if (!content || !driverId) return;

    // Optimistic local message
    const tempId = `msg-drv-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      senderId: driverId,
      senderName: driver?.driverName || "You",
      content,
      timestamp: new Date().toISOString(),
      isDriver: true,
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setShowQuickReplies(false);
    inputRef.current?.focus();

    // Send via API
    apiSendMessage(driverId, "driver", content).catch((err) =>
      console.error("Failed to send message:", err),
    );
    // Also emit via socket for real-time
    socket?.emit("message:send", { driverId, sender: "driver", text: content });
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
    <div className="flex flex-col" style={{ height: "calc(100vh - var(--topbar-h, 64px) - 32px)", maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 sm:px-5 py-3"
        style={{
          background: "linear-gradient(145deg, #1a2332, #141c2c)",
          borderRadius: "16px 16px 0 0",
          border: "1px solid var(--border-soft)",
          borderBottom: "none",
          flexShrink: 0,
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #1E40AF, #3b82f6)",
            boxShadow: "0 4px 14px rgba(59,130,246,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Shield size={20} style={{ color: "#fff" }} />
          </div>
          <span style={{
            position: "absolute", bottom: -1, right: -1, width: 12, height: 12,
            borderRadius: "50%", background: "#22c55e", border: "2.5px solid #1a2332",
            boxShadow: "0 0 6px rgba(34,197,94,0.5)",
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2">
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Admin Operations</h2>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0, marginTop: 1 }}>
            Digital Delivery HQ &middot; <span style={{ color: "#22c55e" }}>Online</span>
          </p>
        </div>

        {unreadCount > 0 && (
          <span style={{
            minWidth: 22, height: 22, borderRadius: 11,
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#fff", fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 6px", boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
          }}>
            {unreadCount}
          </span>
        )}

        <button style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.04)", color: "var(--text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 150ms" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
          title="Support"
        >
          <Headphones size={16} />
        </button>
      </div>

      {/* Message Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4"
        style={{
          background: "linear-gradient(180deg, #0d1320 0%, #0b1018 100%)",
          borderLeft: "1px solid var(--border-soft)",
          borderRight: "1px solid var(--border-soft)",
          display: "flex", flexDirection: "column", gap: 4,
          position: "relative",
        }}
      >
        {/* Welcome message */}
        <div style={{ textAlign: "center", padding: "8px 20px 16px", marginBottom: 4 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", border: "1px solid rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
            <Shield size={24} style={{ color: "#3b82f6" }} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Admin Operations</p>
          <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2, lineHeight: 1.5 }}>
            Messages from Digital Delivery admin team.<br />
            Delivery updates, alerts, and instructions appear here.
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date} className="flex flex-col" style={{ gap: 3 }}>
              {/* Date divider */}
              <div className="flex items-center justify-center py-3">
                <span style={{
                  fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)",
                  letterSpacing: "0.04em", padding: "3px 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                }}>
                  {formatDateHeader(group.msgs[0].timestamp)}
                </span>
              </div>

              {group.msgs.map((msg, idx) => {
                const prevMsg = idx > 0 ? group.msgs[idx - 1] : null;
                const isConsecutive = prevMsg && prevMsg.isDriver === msg.isDriver &&
                  new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 300000;

                if (msg.isDriver) {
                  return (
                    <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", marginTop: isConsecutive ? 1 : 8 }}>
                      <div style={{
                        maxWidth: "80%", padding: "9px 13px",
                        borderRadius: isConsecutive ? "14px 4px 4px 14px" : "14px 14px 4px 14px",
                        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                        boxShadow: "0 1px 4px rgba(59,130,246,0.15)",
                      }}>
                        <p style={{ fontSize: 13, lineHeight: 1.55, color: "#fff", margin: 0, wordBreak: "break-word" }}>
                          {msg.content}
                        </p>
                        <div className="flex items-center justify-end gap-1" style={{ marginTop: 3 }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{formatTime(msg.timestamp)}</span>
                          {msg.read
                            ? <CheckCheck size={12} style={{ color: "rgba(255,255,255,0.65)" }} />
                            : <Check size={12} style={{ color: "rgba(255,255,255,0.35)" }} />
                          }
                        </div>
                      </div>
                    </div>
                  );
                }

                // Admin message
                const meta = getMessageMeta(msg.content);
                const Icon = meta.icon;
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: "flex-start", gap: 6, marginTop: isConsecutive ? 1 : 8 }}>
                    {!isConsecutive ? (
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: `rgba(${meta.rgb},0.1)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: 2,
                      }}>
                        <Icon size={14} style={{ color: `rgb(${meta.rgb})` }} />
                      </div>
                    ) : (
                      <div style={{ width: 28, flexShrink: 0 }} />
                    )}

                    <div style={{
                      maxWidth: "80%", padding: "9px 13px",
                      borderRadius: isConsecutive ? "4px 14px 14px 14px" : "4px 14px 14px 14px",
                      background: !msg.read
                        ? `linear-gradient(145deg, rgba(${meta.rgb},0.06), rgba(${meta.rgb},0.015))`
                        : "#1a2536",
                      border: !msg.read
                        ? `1px solid rgba(${meta.rgb},0.12)`
                        : "1px solid rgba(255,255,255,0.04)",
                      position: "relative",
                    }}>
                      {!msg.read && (
                        <div style={{
                          position: "absolute", top: 5, right: 5,
                          width: 5, height: 5, borderRadius: "50%",
                          background: `rgb(${meta.rgb})`,
                          boxShadow: `0 0 4px rgba(${meta.rgb},0.5)`,
                        }} />
                      )}

                      {!isConsecutive && meta.label && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: `rgb(${meta.rgb})`, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 3 }}>
                          {meta.label}
                        </span>
                      )}

                      <p style={{ fontSize: 13, lineHeight: 1.55, color: "#fff", fontWeight: msg.read ? 400 : 450, margin: 0, wordBreak: "break-word" }}>
                        {msg.content}
                      </p>
                      <div className="flex items-center gap-1" style={{ marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={endRef} />

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            style={{
              position: "sticky", bottom: 8, alignSelf: "center",
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(30,41,59,0.9)", border: "1px solid var(--border-soft)",
              backdropFilter: "blur(8px)", color: "var(--text-secondary)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)", transition: "all 150ms", zIndex: 5,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.15)"; e.currentTarget.style.color = "#3b82f6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(30,41,59,0.9)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <ChevronDown size={18} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Quick Replies */}
      {showQuickReplies && (
        <div className="flex gap-1.5 px-3 sm:px-5 py-2 overflow-x-auto" style={{
          background: "#141c2c", borderLeft: "1px solid var(--border-soft)", borderRight: "1px solid var(--border-soft)",
          scrollbarWidth: "none",
        }}>
          {QUICK_REPLIES.map((reply) => (
            <button key={reply} onClick={() => handleSend(reply)}
              style={{
                padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(59,130,246,0.15)",
                background: "rgba(59,130,246,0.06)", color: "#3b82f6",
                fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.06)"; }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div
        className="flex items-center gap-2 px-3 sm:px-4 py-3"
        style={{
          background: "linear-gradient(145deg, #1a2332, #141c2c)",
          borderRadius: "0 0 16px 16px",
          border: "1px solid var(--border-soft)",
          borderTop: showQuickReplies ? "none" : "1px solid var(--border-soft)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setShowQuickReplies((p) => !p)}
          style={{
            width: 36, height: 36, borderRadius: 10, border: "none",
            background: showQuickReplies ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
            color: showQuickReplies ? "#3b82f6" : "var(--text-tertiary)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 150ms", flexShrink: 0, fontSize: 16,
          }}
          title="Quick replies"
        >
          ⚡
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder="Reply to admin..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            flex: 1, height: 40, padding: "0 14px",
            borderRadius: 12,
            border: inputFocused ? "1px solid rgba(59,130,246,0.35)" : "1px solid var(--border-soft)",
            background: inputFocused ? "rgba(59,130,246,0.04)" : "rgba(255,255,255,0.03)",
            color: "#fff", fontSize: 13, outline: "none",
            boxShadow: inputFocused ? "0 0 0 3px rgba(59,130,246,0.08)" : "none",
            transition: "all 200ms",
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          style={{
            width: 40, height: 40, borderRadius: 12, border: "none",
            background: input.trim() ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(255,255,255,0.04)",
            color: input.trim() ? "#fff" : "var(--text-tertiary)",
            cursor: input.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 200ms", flexShrink: 0,
            boxShadow: input.trim() ? "0 3px 10px rgba(59,130,246,0.25)" : "none",
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
