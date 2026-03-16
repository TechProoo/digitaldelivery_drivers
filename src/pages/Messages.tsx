import { useState, useRef, useEffect } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  Phone,
  Video,
  Check,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import { CONVERSATIONS, MESSAGES } from "../data/mock";
import { type Message } from "../types";

const cssVars = {
  "--bg-primary": "#0a0a0f",
  "--bg-secondary": "#12121a",
  "--bg-card": "#1a1a2e",
  "--bg-card-hover": "#22223a",
  "--border-soft": "rgba(255,255,255,0.06)",
  "--border-medium": "rgba(255,255,255,0.12)",
  "--text-primary": "#f0f0f5",
  "--text-secondary": "#a0a0b8",
  "--text-tertiary": "#6b6b80",
  "--accent-blue": "#3b82f6",
  "--accent-green": "#22c55e",
  "--accent-purple": "#a855f7",
  "--radius-lg": "16px",
  "--radius-full": "9999px",
} as React.CSSProperties;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Messages() {
  const [activeConversation, setActiveConversation] = useState<string | null>(
    CONVERSATIONS[0]?.id ?? null
  );
  const [messageInput, setMessageInput] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>(
    () => JSON.parse(JSON.stringify(MESSAGES))
  );
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConvo = CONVERSATIONS.find((c) => c.id === activeConversation);
  const currentMessages = activeConversation
    ? localMessages[activeConversation] ?? []
    : [];

  const filteredConversations = CONVERSATIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length, activeConversation]);

  function handleSend() {
    if (!messageInput.trim() || !activeConversation) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "drv-001",
      senderName: "Chidi Okonkwo",
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
      isDriver: true,
      read: false,
    };
    setLocalMessages((prev) => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] ?? []), newMsg],
    }));
    setMessageInput("");
  }

  return (
    <div
      className="flex h-full w-full overflow-hidden"
      style={{ ...cssVars, background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Left Panel — Conversation List */}
      <div
        className={`flex flex-col border-r ${
          activeConversation ? "hidden md:flex" : "flex"
        }`}
        style={{
          width: "100%",
          maxWidth: "400px",
          minWidth: "280px",
          borderColor: "var(--border-soft)",
          background: "var(--bg-secondary)",
        }}
      >
        {/* Search */}
        <div className="p-4">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-soft)",
            }}
          >
            <Search size={16} style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConversation;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: isActive ? "var(--bg-card)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--accent-blue)" : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="flex items-center justify-center text-sm font-semibold"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-full)",
                      background: "linear-gradient(135deg, #3b82f6, #a855f7)",
                      boxShadow: "0 0 12px rgba(59,130,246,0.3)",
                      color: "#fff",
                    }}
                  >
                    {getInitials(conv.name)}
                  </div>
                  {conv.online && (
                    <span
                      className="absolute bottom-0 right-0 block"
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "var(--radius-full)",
                        background: "var(--accent-green)",
                        border: "2px solid var(--bg-secondary)",
                      }}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {conv.name}
                    </span>
                    <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: "var(--text-tertiary)" }}>
                      {formatTime(conv.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {conv.role}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span
                      className="text-xs truncate"
                      style={{ color: "var(--text-secondary)", maxWidth: "200px" }}
                    >
                      {conv.lastMessage}
                    </span>
                    {conv.unread > 0 && (
                      <span
                        className="flex-shrink-0 ml-2 flex items-center justify-center text-[10px] font-bold"
                        style={{
                          minWidth: 20,
                          height: 20,
                          borderRadius: "var(--radius-full)",
                          background: "var(--accent-blue)",
                          color: "#fff",
                          padding: "0 6px",
                        }}
                      >
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel — Chat View */}
      {activeConversation && activeConvo ? (
        <div
          className={`flex-1 flex flex-col ${
            activeConversation ? "flex" : "hidden md:flex"
          }`}
          style={{ background: "var(--bg-primary)" }}
        >
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b"
            style={{
              borderColor: "var(--border-soft)",
              background: "var(--bg-secondary)",
            }}
          >
            <button
              className="md:hidden p-1 rounded-lg"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setActiveConversation(null)}
            >
              <ArrowLeft size={20} />
            </button>
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="flex items-center justify-center text-xs font-semibold"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-full)",
                  background: "linear-gradient(135deg, #3b82f6, #a855f7)",
                  boxShadow: "0 0 10px rgba(59,130,246,0.25)",
                  color: "#fff",
                }}
              >
                {getInitials(activeConvo.name)}
              </div>
              {activeConvo.online && (
                <span
                  className="absolute bottom-0 right-0 block"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "var(--radius-full)",
                    background: "var(--accent-green)",
                    border: "2px solid var(--bg-secondary)",
                  }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {activeConvo.name}
              </div>
              <div className="text-xs" style={{ color: activeConvo.online ? "var(--accent-green)" : "var(--text-tertiary)" }}>
                {activeConvo.online ? "Online" : "Offline"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
                <Phone size={18} />
              </button>
              <button className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
                <Video size={18} />
              </button>
              <button className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentMessages.map((msg) => {
              const isDriver = msg.isDriver;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isDriver ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[75%] px-4 py-2.5"
                    style={{
                      background: isDriver
                        ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                        : "var(--bg-card)",
                      color: isDriver ? "#fff" : "var(--text-primary)",
                      borderRadius: isDriver
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    }}
                  >
                    {!isDriver && (
                      <div
                        className="text-xs font-medium mb-1"
                        style={{ color: "var(--accent-blue)" }}
                      >
                        {msg.senderName}
                      </div>
                    )}
                    <div className="text-sm leading-relaxed">{msg.content}</div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span
                        className="text-[10px]"
                        style={{
                          color: isDriver ? "rgba(255,255,255,0.6)" : "var(--text-tertiary)",
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                      {isDriver &&
                        (msg.read ? (
                          <CheckCheck
                            size={12}
                            style={{ color: "rgba(255,255,255,0.7)" }}
                          />
                        ) : (
                          <Check
                            size={12}
                            style={{ color: "rgba(255,255,255,0.5)" }}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-t"
            style={{
              borderColor: "var(--border-soft)",
              background: "var(--bg-secondary)",
            }}
          >
            <button
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 px-4 py-2 rounded-xl text-sm outline-none transition-shadow"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-soft)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                (e.target as HTMLElement).style.boxShadow = "0 0 0 2px var(--accent-blue)";
              }}
              onBlur={(e) => {
                (e.target as HTMLElement).style.boxShadow = "none";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!messageInput.trim()}
              className="p-2.5 rounded-full transition-opacity"
              style={{
                background: "var(--accent-blue)",
                color: "#fff",
                opacity: messageInput.trim() ? 1 : 0.4,
                cursor: messageInput.trim() ? "pointer" : "default",
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* Empty state — desktop only */
        <div
          className="hidden md:flex flex-1 flex-col items-center justify-center gap-4"
          style={{ background: "var(--bg-primary)" }}
        >
          <div
            className="p-4 rounded-2xl"
            style={{ background: "var(--bg-card)" }}
          >
            <MessageSquare size={40} style={{ color: "var(--text-tertiary)" }} />
          </div>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Select a conversation
          </span>
        </div>
      )}
    </div>
  );
}
