import { useState } from "react";
import {
  Package,
  CheckCircle2,
  DollarSign,
  MapPin,
  Clock,
  MessageSquare,
  Settings,
  Bell,
  TrendingUp,
  Navigation,
  Zap,
  ChevronRight,
  Phone,
} from "lucide-react";
import { EARNINGS_SUMMARY, CURRENT_DRIVER, NOTIFICATIONS } from "../data/mock";
import { STATUS_CONFIG } from "../types";
import { useDeliveries } from "../contexts/DeliveryContext";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("NGN", "\u20A6");
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

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  delivery: <Package size={18} />,
  message: <MessageSquare size={18} />,
  earnings: <DollarSign size={18} />,
  system: <Settings size={18} />,
};

const NOTIF_RGB: Record<string, string> = {
  delivery: "59,130,246",
  message: "168,85,247",
  earnings: "34,197,94",
  system: "245,158,11",
};

export default function Dashboard() {
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const { deliveries, activeDeliveryId, pickUpDelivery, startDelivery, completeDelivery } = useDeliveries();
  const firstName = CURRENT_DRIVER.name.split(" ")[0];
  const todayDeliveries = deliveries.filter((d) => isToday(d.scheduledAt));
  const completedDeliveries = todayDeliveries.filter((d) => d.status === "delivered");
  const activeDeliveries = todayDeliveries.filter((d) => d.status !== "delivered" && d.status !== "failed");
  const distanceCovered = completedDeliveries.reduce((sum, d) => sum + d.distance, 0);

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const statCards = [
    { label: "Today's Deliveries", value: todayDeliveries.length.toString(), icon: <Package size={22} />, rgb: "59,130,246", accent: "#3b82f6" },
    { label: "Completed", value: completedDeliveries.length.toString(), icon: <CheckCircle2 size={22} />, rgb: "34,197,94", accent: "#22c55e" },
    { label: "Today's Earnings", value: formatNaira(EARNINGS_SUMMARY.today), icon: <DollarSign size={22} />, rgb: "245,158,11", accent: "#f59e0b" },
    { label: "Distance Covered", value: `${distanceCovered.toFixed(1)} km`, icon: <MapPin size={22} />, rgb: "6,182,212", accent: "#06b6d4" },
  ];

  const recentNotifs = NOTIFICATIONS.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      {/* ═══════════════════════════════════════════
          GREETING HERO
          ═══════════════════════════════════════════ */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.05) 50%, rgba(6,182,212,0.04) 100%)",
          border: "1px solid rgba(59,130,246,0.1)",
          borderRadius: 20,
          padding: "28px 28px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)", pointerEvents: "none" }} />

        <div className="flex items-start justify-between flex-wrap gap-4" style={{ position: "relative" }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
                {getGreeting()}, {firstName}
              </h1>
              <span className="flex items-center gap-1.5" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(34,197,94,0.2)" }}>
                <Zap size={12} /> On Duty
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{formattedDate}</p>
          </div>

          {/* Quick earnings summary */}
          <div className="flex items-center gap-3" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "12px 18px", border: "1px solid var(--border-soft)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={20} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Today's Earnings</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{formatNaira(EARNINGS_SUMMARY.today)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          STAT CARDS
          ═══════════════════════════════════════════ */}
      <div className="stagger grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: `linear-gradient(145deg, rgba(${card.rgb},0.12) 0%, rgba(${card.rgb},0.03) 100%)`,
              border: `1px solid rgba(${card.rgb},0.15)`,
              borderRadius: 16,
              padding: "18px 16px",
              cursor: "default",
              transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px rgba(${card.rgb},0.15)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div className="flex items-center justify-between mb-3">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${card.accent}25, ${card.accent}0a)`, display: "flex", alignItems: "center", justifyContent: "center", color: card.accent }}>
                {card.icon}
              </div>
              <TrendingUp size={14} style={{ color: card.accent, opacity: 0.5 }} />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold" style={{ color: "#fff", letterSpacing: "-0.02em", marginBottom: 2 }}>{card.value}</p>
            <p style={{ color: "var(--text-tertiary)", fontSize: 12, fontWeight: 500 }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          ACTIVE DELIVERIES
          ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold" style={{ color: "#fff" }}>Active Deliveries</h2>
            <span style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{activeDeliveries.length} active</span>
          </div>
          <button style={{ background: "none", border: "none", color: "var(--accent-blue)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            View all <ChevronRight size={14} />
          </button>
        </div>

        {activeDeliveries.length === 0 ? (
          <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-soft)", padding: "48px 24px", textAlign: "center" }}>
            <Package size={48} strokeWidth={1.2} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>No active deliveries right now</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeDeliveries.map((delivery) => {
              const sc = STATUS_CONFIG[delivery.status];
              const eta = delivery.estimatedArrival ? new Date(delivery.estimatedArrival).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : "TBD";
              const isExpanded = expandedDelivery === delivery.id;

              const isTracking = activeDeliveryId === delivery.id && delivery.status === "in_transit";

              return (
                <div
                  key={delivery.id}
                  style={{
                    background: isTracking
                      ? "linear-gradient(145deg, rgba(34,197,94,0.04), #1a2332 30%, #141c2c 100%)"
                      : "linear-gradient(145deg, #1a2332 0%, #141c2c 100%)",
                    borderRadius: 16,
                    border: isTracking
                      ? "1.5px solid rgba(34,197,94,0.3)"
                      : isExpanded ? "1px solid var(--border-medium)" : "1px solid var(--border-soft)",
                    overflow: "hidden",
                    transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: isTracking
                      ? "0 0 24px rgba(34,197,94,0.1)"
                      : isExpanded ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
                  }}
                >
                  {/* Live tracking banner */}
                  {isTracking && (
                    <div className="flex items-center gap-2 px-4 py-2" style={{ background: "rgba(34,197,94,0.08)", borderBottom: "1px solid rgba(34,197,94,0.1)" }}>
                      <span className="animate-pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.05em" }}>LIVE TRACKING</span>
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>&mdash; Location broadcasting to admin</span>
                    </div>
                  )}
                  {/* Main row — always visible */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpandedDelivery(isExpanded ? null : delivery.id)}
                    style={{ transition: "background 150ms" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* Status indicator */}
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                      <Package size={20} style={{ color: sc.color }} />
                      <span className="animate-pulse-dot" style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: sc.color, border: "2px solid #1a2332" }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{delivery.customerName}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg, padding: "2px 8px", borderRadius: 6 }}>{sc.label}</span>
                      </div>
                      <p className="truncate" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {delivery.pickupAddress} → {delivery.dropoffAddress}
                      </p>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="hidden sm:flex flex-col items-end">
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{eta}</span>
                        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{delivery.distance} km</span>
                      </div>
                      <ChevronRight size={16} style={{ color: "var(--text-tertiary)", transform: isExpanded ? "rotate(90deg)" : "rotate(0)", transition: "transform 200ms" }} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="animate-slide-down" style={{ borderTop: "1px solid var(--border-soft)", padding: "16px 20px" }}>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Route */}
                        <div className="flex gap-3 flex-1">
                          <div className="flex flex-col items-center gap-0.5 pt-1">
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }} />
                            <div style={{ width: 2, flex: 1, background: "linear-gradient(to bottom, #22c55e, #ef4444)", borderRadius: 1, minHeight: 32 }} />
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.4)" }} />
                          </div>
                          <div className="flex flex-col gap-4 flex-1">
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>Pickup</p>
                              <p style={{ fontSize: 13, color: "#fff" }}>{delivery.pickupAddress}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>Dropoff</p>
                              <p style={{ fontSize: 13, color: "#fff" }}>{delivery.dropoffAddress}</p>
                            </div>
                          </div>
                        </div>

                        {/* Meta + Actions */}
                        <div className="flex flex-col gap-3 sm:items-end">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5"><Clock size={13} style={{ color: "var(--accent-amber)" }} /><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>ETA {eta}</span></div>
                            <div className="flex items-center gap-1.5"><Navigation size={13} style={{ color: "var(--accent-cyan)" }} /><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{delivery.distance} km</span></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-tertiary)", background: "rgba(255,255,255,0.04)", padding: "4px 8px", borderRadius: 6 }}>{delivery.trackingNumber}</span>
                          </div>
                          {/* Workflow Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <button style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.12)", border: "none", color: "#22c55e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Call customer">
                              <Phone size={16} />
                            </button>

                            {delivery.status === "assigned" && (
                              <button
                                onClick={() => pickUpDelivery(delivery.id)}
                                style={{ background: "linear-gradient(135deg, #a855f7, #9333ea)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(168,85,247,0.25)" }}
                              >
                                <Package size={14} /> Pick Up
                              </button>
                            )}

                            {delivery.status === "picked_up" && (
                              <button
                                onClick={() => startDelivery(delivery.id)}
                                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}
                              >
                                <Navigation size={14} /> Start Delivery
                              </button>
                            )}

                            {delivery.status === "in_transit" && (
                              <>
                                {activeDeliveryId === delivery.id && (
                                  <span className="flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "4px 10px", borderRadius: 8 }}>
                                    <span className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                                    LIVE
                                  </span>
                                )}
                                <button
                                  onClick={() => completeDelivery(delivery.id)}
                                  style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(6,182,212,0.25)" }}
                                >
                                  <CheckCircle2 size={14} /> Mark Delivered
                                </button>
                              </>
                            )}

                            {delivery.status === "pending" && (
                              <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>Awaiting confirmation...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          RECENT ACTIVITY
          ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold" style={{ color: "#fff" }}>Recent Activity</h2>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#ef4444" }}>{NOTIFICATIONS.filter((n) => !n.read).length}</span>
            </div>
          </div>
          <Bell size={16} style={{ color: "var(--text-tertiary)" }} />
        </div>

        <div style={{ background: "linear-gradient(145deg, #1a2332, #141c2c)", borderRadius: 16, border: "1px solid var(--border-soft)", overflow: "hidden" }}>
          {recentNotifs.map((notif, idx) => {
            const rgb = NOTIF_RGB[notif.type] || "100,116,139";
            return (
              <div
                key={notif.id}
                className="flex items-start gap-3"
                style={{
                  padding: "14px 18px",
                  borderBottom: idx < recentNotifs.length - 1 ? "1px solid var(--border-soft)" : "none",
                  cursor: "pointer",
                  transition: "background 150ms",
                  position: "relative",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {!notif.read && (
                  <div style={{ position: "absolute", top: 18, left: 6, width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px rgba(59,130,246,0.5)" }} />
                )}

                <div style={{ width: 38, height: 38, borderRadius: 10, background: `rgba(${rgb},0.12)`, color: `rgb(${rgb})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {NOTIF_ICONS[notif.type]}
                </div>

                <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p style={{ fontSize: 13, fontWeight: notif.read ? 500 : 650, color: "#fff" }}>{notif.title}</p>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)", flexShrink: 0 }}>{getRelativeTime(notif.timestamp)}</span>
                  </div>
                  <p className="truncate" style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>{notif.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
