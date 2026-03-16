import { useState } from "react";
import {
  MapPin,
  Navigation,
  Truck,
  Package,
  Clock,
  ArrowRight,
  Locate,
  ZoomIn,
  ZoomOut,
  Layers,
  Phone,
  Radio,
  Wifi,
  WifiOff,
  Play,
  Square,
} from "lucide-react";
import { DELIVERIES, CURRENT_DRIVER } from "../data/mock";
import { STATUS_CONFIG } from "../types";
import { useLocationTracking } from "../hooks/useLocationTracking";
import { useSocket } from "../contexts/SocketContext";

const animationStyles = `
@keyframes radar-ping {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes pin-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes route-dash {
  to { stroke-dashoffset: -20; }
}
`;

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

interface MapPin_ {
  id: string;
  x: number;
  y: number;
  type: "pickup" | "dropoff" | "current";
  label: string;
}

const MAP_PINS: MapPin_[] = [
  { id: "current", x: 42, y: 45, type: "current", label: "You" },
  { id: "pickup-1", x: 22, y: 28, type: "pickup", label: "Marina St" },
  { id: "dropoff-1", x: 68, y: 32, type: "dropoff", label: "Awolowo Rd" },
  { id: "pickup-2", x: 75, y: 65, type: "pickup", label: "Adeola Odeku" },
  { id: "dropoff-2", x: 30, y: 72, type: "dropoff", label: "Opebi Rd" },
];

const PIN_COLORS: Record<string, string> = {
  pickup: "var(--accent-green)",
  dropoff: "var(--accent-red)",
  current: "var(--accent-blue)",
};

export default function Tracking() {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const { connected } = useSocket();

  const activeDeliveries = DELIVERIES.filter(
    (d) => isToday(d.scheduledAt) && d.status !== "delivered" && d.status !== "failed",
  );

  // Find the in-transit delivery to auto-track
  const inTransitDelivery = activeDeliveries.find((d) => d.status === "in_transit");
  const [manualTrackingId, setManualTrackingId] = useState<string | null>(null);
  const trackingDeliveryId = manualTrackingId || inTransitDelivery?.id || null;

  const { position, tracking, error, startTracking, stopTracking } = useLocationTracking({
    driverId: CURRENT_DRIVER.id,
    activeDeliveryId: trackingDeliveryId,
    interval: 5000,
  });

  const handleStartTracking = (deliveryId: string) => {
    setManualTrackingId(deliveryId);
    if (!tracking) startTracking();
  };

  const handleStopTracking = () => {
    setManualTrackingId(null);
    stopTracking();
  };

  return (
    <>
      <style>{animationStyles}</style>

      <div className="flex flex-col w-full h-full" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        {/* ═══════════════════════════════════════════════════════ */}
        {/*  MOCK MAP AREA                                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div
          className="relative w-full shrink-0 overflow-hidden select-none"
          style={{ height: "60%", minHeight: 320, background: "linear-gradient(180deg, #0c1a2e 0%, #162236 50%, #0f1923 100%)" }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Roads */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line x1="0%" y1="45%" x2="100%" y2="45%" stroke="rgba(255,255,255,0.04)" strokeWidth="18" />
            <line x1="42%" y1="0%" x2="42%" y2="100%" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
            <line x1="10%" y1="80%" x2="90%" y2="20%" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
            <polyline points="42%,45% 22%,28% 68%,32%" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="8 6" style={{ animation: "route-dash 1s linear infinite" } as React.CSSProperties} opacity={0.5} />
            <polyline points="42%,45% 75%,65% 30%,72%" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeDasharray="8 6" style={{ animation: "route-dash 1.2s linear infinite" } as React.CSSProperties} opacity={0.35} />
          </svg>

          {/* Location pins */}
          {MAP_PINS.map((pin) => {
            const color = PIN_COLORS[pin.type];
            const isCurrent = pin.type === "current";
            return (
              <div key={pin.id} className="absolute flex flex-col items-center" style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)", zIndex: isCurrent ? 20 : 10 }}>
                <div className="absolute rounded-full" style={{ width: isCurrent ? 48 : 32, height: isCurrent ? 48 : 32, background: color, opacity: 0.15, animation: "radar-ping 2s ease-out infinite" }} />
                {isCurrent ? (
                  <>
                    <div className="absolute rounded-full" style={{ width: 64, height: 64, border: `2px solid ${color}`, opacity: 0.25, animation: "radar-ping 2.5s ease-out infinite" }} />
                    <div className="relative flex items-center justify-center rounded-full shadow-lg" style={{ width: 40, height: 40, background: color, boxShadow: `0 0 20px ${color}55` }}>
                      <Truck size={20} color="#fff" />
                    </div>
                  </>
                ) : (
                  <div style={{ animation: "pin-bounce 2.5s ease-in-out infinite" }}>
                    <MapPin size={28} color={color} fill={color} fillOpacity={0.25} />
                  </div>
                )}
                <span className="mt-1 text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.55)", color, fontSize: 10, backdropFilter: "blur(4px)" }}>
                  {pin.label}
                </span>
              </div>
            );
          })}

          {/* ── Live Tracking Status Badge (top left) ── */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid var(--border-soft)" }}>
              {tracking ? (
                <Radio size={14} style={{ color: "var(--accent-green)" }} />
              ) : (
                <Radio size={14} style={{ color: "var(--text-tertiary)" }} />
              )}
              <div className="flex flex-col">
                <span className="text-xs font-bold" style={{ color: tracking ? "var(--accent-green)" : "var(--text-tertiary)" }}>
                  {tracking ? "Broadcasting Live" : "Tracking Paused"}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                  {tracking && position
                    ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
                    : error || "Tap a delivery to start"}
                </span>
              </div>
              {tracking && (
                <span className="block rounded-full" style={{ width: 8, height: 8, background: "var(--accent-green)", animation: "pulse-dot 1.5s ease-in-out infinite", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
              )}
            </div>

            {/* Connection status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid var(--border-soft)" }}>
              {connected ? <Wifi size={12} style={{ color: "var(--accent-green)" }} /> : <WifiOff size={12} style={{ color: "var(--accent-red)" }} />}
              <span style={{ fontSize: 10, fontWeight: 600, color: connected ? "var(--accent-green)" : "var(--accent-red)" }}>
                {connected ? "Server Connected" : "Disconnected"}
              </span>
            </div>

            {/* Speed + accuracy */}
            {tracking && position && (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid var(--border-soft)" }}>
                <div className="flex flex-col">
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Speed</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-cyan)" }}>
                    {position.speed !== null ? `${(position.speed * 3.6).toFixed(0)} km/h` : "—"}
                  </span>
                </div>
                <div style={{ width: 1, height: 20, background: "var(--border-soft)" }} />
                <div className="flex flex-col">
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Accuracy</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-amber)" }}>
                    {position.accuracy < 10 ? "High" : position.accuracy < 30 ? "Medium" : "Low"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Driver info chip — top center */}
          <div className="absolute top-4 left-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ transform: "translateX(-50%)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid var(--border-soft)" }}>
            <Truck size={14} style={{ color: "var(--accent-blue)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{CURRENT_DRIVER.name}</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--text-tertiary)", fontSize: 10 }}>{CURRENT_DRIVER.vehiclePlate}</span>
          </div>

          {/* Map controls — top right */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5">
            {[
              { icon: <ZoomIn size={16} />, label: "Zoom in" },
              { icon: <ZoomOut size={16} />, label: "Zoom out" },
              { icon: <Layers size={16} />, label: "Layers" },
              { icon: <Locate size={16} />, label: "My location" },
            ].map((ctrl) => (
              <button key={ctrl.label} title={ctrl.label} className="flex items-center justify-center transition-colors" style={{ width: 36, height: 36, borderRadius: "var(--radius-lg)", background: "var(--bg-card)", border: "1px solid var(--border-soft)", color: "var(--text-secondary)", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >{ctrl.icon}</button>
            ))}
          </div>

          {/* Stats bar — bottom of map */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-6 py-3" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.6))", backdropFilter: "blur(4px)" }}>
            {[
              { icon: <Package size={14} style={{ color: "var(--accent-blue)" }} />, value: activeDeliveries.length, label: "Active" },
              { icon: <Navigation size={14} style={{ color: "var(--accent-cyan)" }} />, value: `${activeDeliveries.reduce((s, d) => s + d.distance, 0).toFixed(1)} km`, label: "Total Distance" },
              { icon: <Clock size={14} style={{ color: "var(--accent-amber)" }} />, value: activeDeliveries.filter((d) => d.status === "in_transit").length, label: "In Transit" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                {stat.icon}
                <div className="flex flex-col">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</span>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)", fontSize: 10 }}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  ACTIVE DELIVERY CARDS                                */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="flex flex-col flex-1 min-h-0" style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--border-soft)" }}>
          <div className="flex items-center justify-between px-5 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Active Routes</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.12)", color: "var(--accent-blue)", minWidth: 22, textAlign: "center" }}>{activeDeliveries.length}</span>
            </div>
            {tracking && (
              <button
                onClick={handleStopTracking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: "rgba(239,68,68,0.12)", color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer" }}
              >
                <Square size={12} /> Stop Tracking
              </button>
            )}
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Package size={32} style={{ color: "var(--text-tertiary)" }} />
                <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>No active deliveries</span>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 px-5 pb-5 overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: "thin" }}>
              {activeDeliveries.map((delivery) => {
                const cfg = STATUS_CONFIG[delivery.status];
                const isSelected = selectedDelivery === delivery.id;
                const isBeingTracked = trackingDeliveryId === delivery.id && tracking;

                return (
                  <div
                    key={delivery.id}
                    className="snap-start shrink-0 flex flex-col gap-3 p-4 transition-all cursor-pointer"
                    style={{
                      width: 290,
                      borderRadius: "var(--radius-lg)",
                      background: isBeingTracked ? "linear-gradient(145deg, rgba(59,130,246,0.06), var(--bg-card))" : "var(--bg-card)",
                      border: isBeingTracked ? "1.5px solid var(--accent-blue)" : isSelected ? "1.5px solid var(--accent-blue)" : "1px solid var(--border-soft)",
                      boxShadow: isBeingTracked ? "0 0 20px rgba(59,130,246,0.15)" : isSelected ? "0 0 16px rgba(59,130,246,0.2)" : "none",
                    }}
                    onClick={() => setSelectedDelivery(isSelected ? null : delivery.id)}
                    onMouseEnter={(e) => { if (!isSelected && !isBeingTracked) { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.borderColor = "var(--border-medium)"; } }}
                    onMouseLeave={(e) => { if (!isSelected && !isBeingTracked) { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--border-soft)"; } }}
                  >
                    {/* Tracking indicator */}
                    {isBeingTracked && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(34,197,94,0.1)", alignSelf: "flex-start" }}>
                        <Radio size={10} style={{ color: "var(--accent-green)" }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-green)" }}>LIVE TRACKING</span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                        <span className="block rounded-full" style={{ width: 6, height: 6, background: cfg.color, animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                        {cfg.label}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "var(--text-tertiary)", fontSize: 10 }}>{delivery.trackingNumber.slice(-8)}</span>
                    </div>

                    {/* Addresses */}
                    <div className="flex items-start gap-2.5">
                      <div className="flex flex-col items-center gap-0.5 pt-0.5" style={{ minWidth: 12 }}>
                        <span className="block rounded-full" style={{ width: 8, height: 8, background: "var(--accent-green)" }} />
                        <span className="block" style={{ width: 2, height: 24, background: "linear-gradient(var(--accent-green), var(--accent-red))", borderRadius: 1 }} />
                        <span className="block rounded-full" style={{ width: 8, height: 8, background: "var(--accent-red)" }} />
                      </div>
                      <div className="flex flex-col gap-2 min-w-0">
                        <span className="text-xs leading-tight truncate" style={{ color: "var(--text-secondary)" }} title={delivery.pickupAddress}>{delivery.pickupAddress}</span>
                        <span className="text-xs leading-tight truncate" style={{ color: "var(--text-secondary)" }} title={delivery.dropoffAddress}>{delivery.dropoffAddress}</span>
                      </div>
                    </div>

                    {/* Customer + phone */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{delivery.customerName}</span>
                      <button className="flex items-center justify-center rounded-full transition-colors" style={{ width: 28, height: 28, background: "rgba(34,197,94,0.1)", color: "var(--accent-green)", border: "none", cursor: "pointer" }} title={`Call ${delivery.customerPhone}`} onClick={(e) => e.stopPropagation()}>
                        <Phone size={13} />
                      </button>
                    </div>

                    {/* Footer: ETA + Distance + Action */}
                    <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid var(--border-soft)" }}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock size={12} style={{ color: "var(--accent-amber)" }} />
                          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{formatTime(delivery.estimatedArrival)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowRight size={12} style={{ color: "var(--text-tertiary)" }} />
                          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{delivery.distance} km</span>
                        </div>
                      </div>

                      {isBeingTracked ? (
                        <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "var(--accent-green)", color: "#fff", border: "none", cursor: "pointer" }} onClick={(e) => e.stopPropagation()}>
                          <Navigation size={12} />Navigate
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ background: "var(--accent-blue)", color: "#fff", border: "none", cursor: "pointer" }}
                          onClick={(e) => { e.stopPropagation(); handleStartTracking(delivery.id); }}
                        >
                          <Play size={12} />Start
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
