import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  DollarSign,
  MapPin,
  Clock,
  TrendingUp,
  Navigation,
  Zap,
  ChevronRight,
  Phone,
  ExternalLink,
  Star,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import { STATUS_CONFIG } from "../types";
import { useDeliveries } from "../contexts/DeliveryContext";
import { useAuth } from "../contexts/AuthContext";

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
  const d = new Date(dateStr),
    n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* ── Completion ring SVG ── */
function CompletionRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.16,1,0.3,1)" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{Math.round(pct)}%</span>
        <span style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 600 }}>done</span>
      </div>
    </div>
  );
}

/* ── Mini sparkline ── */
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke="url(#sparkGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      {/* Last dot */}
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length - 1] - min) / range) * h} r="3" fill="#22c55e" />
    </svg>
  );
}

export default function Dashboard() {
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const { deliveries, activeDeliveryId, pickUpDelivery, startDelivery, completeDelivery } = useDeliveries();
  const { driver } = useAuth();
  const firstName = (driver?.driverName || "Driver").split(" ")[0];

  const todayDeliveries = deliveries.filter((d) => isToday(d.scheduledAt));
  const completedDeliveries = todayDeliveries.filter((d) => d.status === "delivered");
  const activeDeliveries = todayDeliveries.filter((d) => d.status !== "delivered" && d.status !== "failed");
  const distanceCovered = completedDeliveries.reduce((sum, d) => sum + d.distance, 0);

  // Compute earnings from real delivery data
  const todayEarnings = completedDeliveries.reduce((sum, d) => sum + d.earnings, 0);
  const allCompleted = deliveries.filter((d) => d.status === "delivered");
  const weekEarnings = allCompleted.reduce((sum, d) => sum + d.earnings, 0);
  const pendingEarnings = deliveries
    .filter((d) => d.status !== "delivered" && d.status !== "failed")
    .reduce((sum, d) => sum + d.earnings, 0);

  // Build sparkline from the last 7 days of completed deliveries
  const sparkData = (() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toDateString();
      return allCompleted
        .filter((del) => new Date(del.scheduledAt).toDateString() === dayStr)
        .reduce((sum, del) => sum + del.earnings, 0);
    });
  })();

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* ═══════════════════════════════════════
          HERO — Greeting + Progress + Earnings
          ═══════════════════════════════════════ */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.06) 40%, rgba(6,182,212,0.04) 100%)",
          border: "1px solid rgba(59,130,246,0.12)",
          borderRadius: 20,
          padding: "24px 24px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)", pointerEvents: "none" }} />

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5" style={{ position: "relative" }}>
          {/* Left — greeting */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
                {getGreeting()}, {firstName}
              </h1>
              <span className="flex items-center gap-1.5" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid rgba(34,197,94,0.2)" }}>
                <Zap size={11} /> On Duty
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{formattedDate}</p>

            {/* Quick stats row */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Star size={13} style={{ color: "#f59e0b" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{driver?.rating ?? "—"}</span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>rating</span>
              </div>
              <div style={{ width: 1, height: 16, background: "var(--border-soft)" }} />
              <div className="flex items-center gap-1.5">
                <Flame size={13} style={{ color: "#ef4444" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{allCompleted.length}</span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>total deliveries</span>
              </div>
              <div style={{ width: 1, height: 16, background: "var(--border-soft)" }} />
              <div className="flex items-center gap-1.5">
                <MapPin size={13} style={{ color: "#06b6d4" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{distanceCovered.toFixed(1)} km</span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>today</span>
              </div>
            </div>
          </div>

          {/* Center — completion ring */}
          <CompletionRing completed={completedDeliveries.length} total={todayDeliveries.length} />

          {/* Right — earnings mini card */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "14px 18px", border: "1px solid var(--border-soft)", minWidth: 180 }}>
            <div className="flex items-center justify-between mb-2">
              <p style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Today's Earnings</p>
              <ArrowUpRight size={12} style={{ color: "#22c55e" }} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 8 }}>
              {formatNaira(todayEarnings)}
            </p>
            <Sparkline data={sparkData} />
            <p style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 6 }}>
              This week: <span style={{ color: "#22c55e", fontWeight: 700 }}>{formatNaira(weekEarnings)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          STAT CARDS
          ═══════════════════════════════════════ */}
      <div className="stagger grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Today's Deliveries", value: todayDeliveries.length, icon: <Package size={20} />, rgb: "59,130,246", accent: "#3b82f6" },
          { label: "Completed", value: completedDeliveries.length, icon: <CheckCircle2 size={20} />, rgb: "34,197,94", accent: "#22c55e" },
          { label: "Active", value: activeDeliveries.length, icon: <Navigation size={20} />, rgb: "168,85,247", accent: "#a855f7" },
          { label: "Pending Payout", value: formatNaira(pendingEarnings), icon: <DollarSign size={20} />, rgb: "245,158,11", accent: "#f59e0b" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: `linear-gradient(145deg, rgba(${card.rgb},0.1) 0%, rgba(${card.rgb},0.02) 100%)`,
              border: `1px solid rgba(${card.rgb},0.12)`,
              borderRadius: 14,
              padding: "16px 14px",
              cursor: "default",
              transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 24px rgba(${card.rgb},0.12)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", color: card.accent }}>
                {card.icon}
              </div>
              <TrendingUp size={12} style={{ color: card.accent, opacity: 0.4 }} />
            </div>
            <p className="text-xl md:text-2xl font-extrabold" style={{ color: "#fff", letterSpacing: "-0.02em", marginBottom: 1 }}>
              {typeof card.value === "number" ? card.value : card.value}
            </p>
            <p style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 500 }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          ACTIVE DELIVERIES
          ═══════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold" style={{ color: "#fff" }}>Active Deliveries</h2>
            {activeDeliveries.length > 0 && (
              <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{activeDeliveries.length}</span>
            )}
          </div>
          <Link to="/deliveries" style={{ textDecoration: "none", color: "var(--accent-blue)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
            View all <ChevronRight size={13} />
          </Link>
        </div>

        {activeDeliveries.length === 0 ? (
          <div style={{ background: "linear-gradient(145deg, #1a2332, #141c2c)", borderRadius: 16, border: "1px solid var(--border-soft)", padding: "40px 20px", textAlign: "center" }}>
            <Package size={40} strokeWidth={1.2} style={{ color: "var(--text-tertiary)", margin: "0 auto 10px", opacity: 0.5 }} />
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>No active deliveries right now</p>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>New assignments will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeDeliveries.map((delivery) => {
              const sc = STATUS_CONFIG[delivery.status];
              const eta = delivery.estimatedArrival ? new Date(delivery.estimatedArrival).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : "TBD";
              const isExpanded = expandedDelivery === delivery.id;
              const isTracking = activeDeliveryId === delivery.id && delivery.status === "in_transit";

              // Google Maps navigation links
              const pickupMapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.pickupAddress)}`;
              const dropoffMapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.dropoffAddress)}`;

              return (
                <div
                  key={delivery.id}
                  style={{
                    background: isTracking
                      ? "linear-gradient(145deg, rgba(34,197,94,0.04), #1a2332 30%, #141c2c 100%)"
                      : "linear-gradient(145deg, #1a2332 0%, #141c2c 100%)",
                    borderRadius: 16,
                    border: isTracking ? "1.5px solid rgba(34,197,94,0.3)" : isExpanded ? "1px solid var(--border-medium)" : "1px solid var(--border-soft)",
                    overflow: "hidden",
                    transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: isTracking ? "0 0 24px rgba(34,197,94,0.08)" : isExpanded ? "0 4px 16px rgba(0,0,0,0.25)" : "none",
                  }}
                >
                  {/* Live tracking banner */}
                  {isTracking && (
                    <div className="flex items-center gap-2 px-4 py-1.5" style={{ background: "rgba(34,197,94,0.06)", borderBottom: "1px solid rgba(34,197,94,0.08)" }}>
                      <span className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "0.06em" }}>LIVE TRACKING</span>
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>— Broadcasting to admin</span>
                    </div>
                  )}

                  {/* Main row */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => setExpandedDelivery(isExpanded ? null : delivery.id)}
                    style={{ transition: "background 150ms" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                      <Package size={18} style={{ color: sc.color }} />
                      <span className="animate-pulse-dot" style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: sc.color, border: "2px solid #1a2332" }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{delivery.customerName}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: sc.color, background: sc.bg, padding: "1px 7px", borderRadius: 5 }}>{sc.label}</span>
                      </div>
                      <p className="truncate" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {delivery.pickupAddress} → {delivery.dropoffAddress}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="hidden sm:flex flex-col items-end">
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{eta}</span>
                        <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{delivery.distance} km</span>
                      </div>
                      <ChevronRight size={14} style={{ color: "var(--text-tertiary)", transform: isExpanded ? "rotate(90deg)" : "rotate(0)", transition: "transform 200ms" }} />
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--border-soft)", padding: "14px 18px" }}>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Route visualization */}
                        <div className="flex gap-3 flex-1">
                          <div className="flex flex-col items-center gap-0.5 pt-1">
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }} />
                            <div style={{ width: 2, flex: 1, background: "linear-gradient(to bottom, #22c55e, #ef4444)", borderRadius: 1, minHeight: 28 }} />
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.4)" }} />
                          </div>
                          <div className="flex flex-col gap-3 flex-1">
                            <div>
                              <div className="flex items-center justify-between">
                                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Pickup</p>
                                <a href={pickupMapUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 10, color: "#3b82f6", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                                  Navigate <ExternalLink size={9} />
                                </a>
                              </div>
                              <p style={{ fontSize: 13, color: "#fff", marginTop: 2 }}>{delivery.pickupAddress}</p>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Dropoff</p>
                                <a href={dropoffMapUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 10, color: "#ef4444", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                                  Navigate <ExternalLink size={9} />
                                </a>
                              </div>
                              <p style={{ fontSize: 13, color: "#fff", marginTop: 2 }}>{delivery.dropoffAddress}</p>
                            </div>
                          </div>
                        </div>

                        {/* Meta + Actions */}
                        <div className="flex flex-col gap-3 sm:items-end">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1"><Clock size={12} style={{ color: "var(--accent-amber)" }} /><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>ETA {eta}</span></div>
                            <div className="flex items-center gap-1"><Navigation size={12} style={{ color: "var(--accent-cyan)" }} /><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{delivery.distance} km</span></div>
                          </div>
                          <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-tertiary)", background: "rgba(255,255,255,0.03)", padding: "3px 7px", borderRadius: 5 }}>{delivery.trackingNumber}</span>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <a href={`tel:${delivery.customerPhone}`} onClick={(e) => e.stopPropagation()} style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(34,197,94,0.1)", border: "none", color: "#22c55e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }} title="Call customer">
                              <Phone size={15} />
                            </a>

                            {delivery.status === "assigned" && (
                              <button onClick={(e) => { e.stopPropagation(); pickUpDelivery(delivery.id); }} style={{ background: "linear-gradient(135deg, #a855f7, #9333ea)", color: "#fff", border: "none", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 3px 10px rgba(168,85,247,0.25)" }}>
                                <Package size={13} /> Pick Up
                              </button>
                            )}

                            {delivery.status === "picked_up" && (
                              <button onClick={(e) => { e.stopPropagation(); startDelivery(delivery.id); }} style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", border: "none", borderRadius: 9, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 3px 10px rgba(59,130,246,0.3)" }}>
                                <Navigation size={13} /> Start Delivery
                              </button>
                            )}

                            {delivery.status === "in_transit" && (
                              <>
                                {activeDeliveryId === delivery.id && (
                                  <span className="flex items-center gap-1" style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.08)", padding: "3px 8px", borderRadius: 6 }}>
                                    <span className="animate-pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                                    LIVE
                                  </span>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); completeDelivery(delivery.id); }} style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#fff", border: "none", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 3px 10px rgba(6,182,212,0.25)" }}>
                                  <CheckCircle2 size={13} /> Mark Delivered
                                </button>
                              </>
                            )}

                            {delivery.status === "pending" && (
                              <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontStyle: "italic" }}>Awaiting confirmation...</span>
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

      {/* ═══════════════════════════════════════
          RECENT COMPLETED
          ═══════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold" style={{ color: "#fff" }}>Recent Completed</h2>
            {allCompleted.length > 0 && (
              <span style={{ minWidth: 18, height: 18, borderRadius: 6, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#22c55e" }}>{allCompleted.length}</span>
              </span>
            )}
          </div>
          <CheckCircle2 size={14} style={{ color: "var(--text-tertiary)" }} />
        </div>

        <div style={{ background: "linear-gradient(145deg, #1a2332, #141c2c)", borderRadius: 14, border: "1px solid var(--border-soft)", overflow: "hidden" }}>
          {allCompleted.length === 0 ? (
            <div style={{ padding: "30px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No completed deliveries yet</p>
            </div>
          ) : (
            allCompleted.slice(0, 4).map((delivery, idx) => (
              <div
                key={delivery.id}
                className="flex items-start gap-3"
                style={{
                  padding: "12px 16px",
                  borderBottom: idx < Math.min(allCompleted.length, 4) - 1 ? "1px solid var(--border-soft)" : "none",
                  transition: "background 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(34,197,94,0.1)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Package size={16} />
                </div>
                <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{delivery.customerName}</p>
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)", flexShrink: 0 }}>{getRelativeTime(delivery.scheduledAt)}</span>
                  </div>
                  <p className="truncate" style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {delivery.trackingNumber} — {formatNaira(delivery.earnings)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
