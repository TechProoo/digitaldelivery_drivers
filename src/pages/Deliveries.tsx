import { useState } from "react";
import { useDeliveries } from "../contexts/DeliveryContext";
import { STATUS_CONFIG, type Delivery } from "../types";
import {
  Package,
  Search,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Navigation,
  AlertTriangle,
  ExternalLink,
  DollarSign,
  ChevronDown,
  Truck,
  X,
  Lock,
  Plane,
  Ship,
  Info,
  Weight,
  Layers,
  FileText,
  Calendar,
  Hash,
} from "lucide-react";

function formatNaira(amount: number): string {
  return `\u20A6${amount.toLocaleString()}`;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

export default function Deliveries() {
  const {
    deliveries, activeDeliveryId,
    acceptDelivery, pickUpDelivery, startDelivery,
    completeDelivery, failDelivery, rejectDelivery,
    handOffDelivery,
  } = useDeliveries();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [tab, setTab] = useState<"active" | "history">("active");
  const [detailDelivery, setDetailDelivery] = useState<Delivery | null>(null);

  // Current delivery = the one actively being worked on (assigned, picked_up, in_transit)
  const currentDelivery = deliveries.find(
    (d) => d.status === "assigned" || d.status === "picked_up" || d.status === "in_transit" || d.status === "handed_off",
  );
  const hasActiveDelivery = !!currentDelivery && currentDelivery.status !== "handed_off";

  // Pending = waiting for driver to accept (can only accept if no active delivery)
  const pendingDeliveries = deliveries.filter((d) => d.status === "pending");

  // History = delivered or failed
  const historyDeliveries = deliveries.filter((d) => d.status === "delivered" || d.status === "failed");

  // Apply search
  const searchFilter = (d: Delivery) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return d.customerName.toLowerCase().includes(q) || d.trackingNumber.toLowerCase().includes(q) || d.pickupAddress.toLowerCase().includes(q) || d.dropoffAddress.toLowerCase().includes(q);
  };

  const filteredPending = pendingDeliveries.filter(searchFilter);
  const filteredHistory = historyDeliveries.filter(searchFilter);

  const totalEarnings = historyDeliveries.filter((d) => d.status === "delivered").reduce((s, d) => s + d.earnings, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold mb-3" style={{ color: "#fff", letterSpacing: "-0.02em" }}>My Deliveries</h1>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Current", value: currentDelivery ? "1" : "0", rgb: "168,85,247" },
            { label: "Pending", value: pendingDeliveries.length, rgb: "245,158,11" },
            { label: "Completed", value: historyDeliveries.filter((d) => d.status === "delivered").length, rgb: "34,197,94" },
            { label: "Earned", value: formatNaira(totalEarnings), rgb: "59,130,246" },
          ].map((pill) => (
            <div key={pill.label} style={{ background: `rgba(${pill.rgb},0.08)`, border: `1px solid rgba(${pill.rgb},0.12)`, borderRadius: 10, padding: "5px 11px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: `rgb(${pill.rgb})` }}>{pill.value}</span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500 }}>{pill.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          CURRENT DELIVERY (hero card)
          ═══════════════════════════════════════ */}
      {currentDelivery ? (
        <CurrentDeliveryCard
          delivery={currentDelivery}
          activeDeliveryId={activeDeliveryId}
          onPickUp={pickUpDelivery}
          onStartDelivery={startDelivery}
          onCompleteDelivery={completeDelivery}
          onFailDelivery={failDelivery}
          onHandOff={handOffDelivery}
          onViewDetails={setDetailDelivery}
        />
      ) : (
        <div style={{ background: "linear-gradient(145deg, rgba(168,85,247,0.04), #1a2332 30%, #141c2c)", borderRadius: 16, border: "1px solid rgba(168,85,247,0.15)", padding: "32px 20px", textAlign: "center" }}>
          <Truck size={36} strokeWidth={1.4} style={{ color: "var(--text-tertiary)", margin: "0 auto 8px", opacity: 0.4 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>No active delivery</p>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3 }}>
            {pendingDeliveries.length > 0 ? "Accept a pending delivery below to get started" : "New assignments will appear here"}
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════
          TABS: Pending / History
          ═══════════════════════════════════════ */}
      <div className="flex items-center gap-1" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 3 }}>
        {(["active", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, transition: "all 150ms",
              background: tab === t ? "rgba(59,130,246,0.12)" : "transparent",
              color: tab === t ? "#3b82f6" : "var(--text-tertiary)",
            }}
          >
            {t === "active" ? `Pending (${pendingDeliveries.length})` : `History (${historyDeliveries.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: searchFocused ? "#3b82f6" : "var(--text-tertiary)", transition: "color 150ms" }} />
        <input
          type="text" placeholder="Search deliveries..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
          style={{ width: "100%", padding: "9px 34px 9px 36px", background: "rgba(255,255,255,0.03)", border: searchFocused ? "1px solid #3b82f6" : "1px solid var(--border-soft)", borderRadius: 11, color: "var(--text-primary)", fontSize: 13, outline: "none", boxShadow: searchFocused ? "0 0 0 3px rgba(59,130,246,0.08)" : "none", transition: "all 200ms" }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-tertiary)" }}>
            <X size={11} />
          </button>
        )}
      </div>

      {/* ── List ── */}
      {tab === "active" ? (
        filteredPending.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredPending.map((delivery) => (
              <PendingCard
                key={delivery.id}
                delivery={delivery}
                locked={hasActiveDelivery}
                expanded={expandedCard === delivery.id}
                onToggle={() => setExpandedCard(expandedCard === delivery.id ? null : delivery.id)}
                onAccept={acceptDelivery}
                onDecline={rejectDelivery}
                onViewDetails={setDetailDelivery}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={<Package size={40} />} title="No pending deliveries" subtitle="New assignments from admin will show up here" />
        )
      ) : (
        filteredHistory.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filteredHistory.map((delivery) => (
              <HistoryRow key={delivery.id} delivery={delivery} onViewDetails={setDetailDelivery} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<CheckCircle2 size={40} />} title="No delivery history" subtitle="Completed deliveries will appear here" />
        )
      )}
      {/* Details modal */}
      {detailDelivery && (
        <DeliveryDetailsModal delivery={detailDelivery} onClose={() => setDetailDelivery(null)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   CURRENT DELIVERY — Big hero card
   ═══════════════════════════════════════ */

function CurrentDeliveryCard({ delivery, activeDeliveryId, onPickUp, onStartDelivery, onCompleteDelivery, onFailDelivery, onHandOff, onViewDetails }: {
  delivery: Delivery; activeDeliveryId: string | null;
  onPickUp: (id: string) => void; onStartDelivery: (id: string) => void;
  onCompleteDelivery: (id: string) => void; onFailDelivery: (id: string) => void;
  onHandOff: (id: string) => void; onViewDetails: (d: Delivery) => void;
}) {
  const sc = STATUS_CONFIG[delivery.status];
  const isLive = delivery.status === "in_transit" && activeDeliveryId === delivery.id;
  const pickupUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.pickupAddress)}`;
  const dropoffUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.dropoffAddress)}`;

  // Step indicator
  const isAirSea = delivery.serviceType === "AIR" || delivery.serviceType === "SEA";
  const steps = [
    { label: "Assigned", done: ["assigned", "picked_up", "in_transit", "handed_off"].includes(delivery.status), active: delivery.status === "assigned" },
    { label: "Picked Up", done: ["picked_up", "in_transit", "handed_off"].includes(delivery.status), active: delivery.status === "picked_up" },
    { label: "In Transit", done: ["in_transit", "handed_off"].includes(delivery.status), active: delivery.status === "in_transit" },
    ...(isAirSea ? [{ label: "Handed Off", done: delivery.status === "handed_off", active: delivery.status === "handed_off" }] : []),
  ];

  return (
    <div style={{
      background: isLive
        ? "linear-gradient(145deg, rgba(34,197,94,0.05), #1a2332 20%, #141c2c)"
        : "linear-gradient(145deg, rgba(59,130,246,0.05), #1a2332 20%, #141c2c)",
      borderRadius: 18, overflow: "hidden",
      border: isLive ? "1.5px solid rgba(34,197,94,0.25)" : "1.5px solid rgba(59,130,246,0.2)",
      boxShadow: isLive ? "0 0 24px rgba(34,197,94,0.08)" : "0 0 24px rgba(59,130,246,0.06)",
    }}>
      {/* Live banner */}
      {isLive && (
        <div className="flex items-center gap-2 px-5 py-2" style={{ background: "rgba(34,197,94,0.06)", borderBottom: "1px solid rgba(34,197,94,0.08)" }}>
          <span className="animate-pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px rgba(34,197,94,0.5)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.05em" }}>LIVE TRACKING</span>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>— Your location is being shared with admin</span>
        </div>
      )}

      <div style={{ padding: "18px 18px 16px" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Current Delivery</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, padding: "2px 8px", borderRadius: 6 }}>{sc.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-tertiary)", background: "rgba(255,255,255,0.03)", padding: "3px 8px", borderRadius: 6 }}>{delivery.trackingNumber}</span>
            <button onClick={() => onViewDetails(delivery)} style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", color: "#3b82f6", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }}>
              <Info size={12} /> Details
            </button>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-1 mb-5">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1" style={{ flex: 1 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: step.done ? "linear-gradient(135deg, #22c55e, #16a34a)" : step.active ? "#3b82f6" : "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: step.active ? "0 0 10px rgba(59,130,246,0.3)" : step.done ? "0 0 8px rgba(34,197,94,0.2)" : "none",
              }}>
                {step.done ? <CheckCircle2 size={13} color="#fff" /> : <span style={{ fontSize: 10, fontWeight: 700, color: step.active ? "#fff" : "var(--text-tertiary)" }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: step.done || step.active ? "#fff" : "var(--text-tertiary)" }}>{step.label}</span>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: step.done ? "#22c55e" : "rgba(255,255,255,0.06)", borderRadius: 1, marginLeft: 4, marginRight: 4 }} />}
            </div>
          ))}
        </div>

        {/* Route */}
        <div className="flex gap-3 mb-4">
          <div className="flex flex-col items-center gap-0.5 pt-1">
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }} />
            <div style={{ width: 2, flex: 1, background: "linear-gradient(to bottom, #22c55e, #ef4444)", borderRadius: 1, minHeight: 24 }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.4)" }} />
          </div>
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Pickup</span>
                <a href={pickupUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                  Open Maps <ExternalLink size={9} />
                </a>
              </div>
              <p style={{ fontSize: 13, color: "#fff", marginTop: 2 }}>{delivery.pickupAddress}</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Dropoff</span>
                <a href={dropoffUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#ef4444", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                  Open Maps <ExternalLink size={9} />
                </a>
              </div>
              <p style={{ fontSize: 13, color: "#fff", marginTop: 2 }}>{delivery.dropoffAddress}</p>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap mb-4" style={{ padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 10 }}>
          <div className="flex items-center gap-1.5"><span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{delivery.customerName}</span></div>
          <div style={{ width: 1, height: 14, background: "var(--border-soft)" }} />
          <a href={`tel:${delivery.customerPhone}`} className="flex items-center gap-1" style={{ textDecoration: "none" }}><Phone size={11} style={{ color: "#3b82f6" }} /><span style={{ fontSize: 11, color: "#3b82f6" }}>{delivery.customerPhone}</span></a>
          <div style={{ width: 1, height: 14, background: "var(--border-soft)" }} />
          <div className="flex items-center gap-1"><Clock size={11} style={{ color: "#f59e0b" }} /><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>ETA {formatTime(delivery.estimatedArrival)}</span></div>
          <div style={{ width: 1, height: 14, background: "var(--border-soft)" }} />
          <div className="flex items-center gap-1"><MapPin size={11} style={{ color: "#06b6d4" }} /><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{delivery.distance} km</span></div>
          <div style={{ width: 1, height: 14, background: "var(--border-soft)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>{formatNaira(delivery.earnings)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {delivery.status === "assigned" && (
            <button onClick={() => onPickUp(delivery.id)} style={{ height: 40, borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", padding: "0 20px", display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #a855f7, #9333ea)", color: "#fff", boxShadow: "0 4px 12px rgba(168,85,247,0.25)", flex: 1, justifyContent: "center" }}>
              <Package size={15} /> Confirm Pickup
            </button>
          )}
          {delivery.status === "picked_up" && (
            <button onClick={() => onStartDelivery(delivery.id)} style={{ height: 40, borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", padding: "0 22px", display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.3)", flex: 1, justifyContent: "center" }}>
              <Navigation size={15} /> Start Delivery & Track
            </button>
          )}
          {delivery.status === "in_transit" && isAirSea && (
            <>
              <button onClick={() => onHandOff(delivery.id)} style={{ height: 40, borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", padding: "0 20px", display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", boxShadow: "0 4px 12px rgba(249,115,22,0.25)", flex: 1, justifyContent: "center" }}>
                {delivery.serviceType === "AIR" ? <Plane size={15} /> : <Ship size={15} />} Hand Off to Carrier
              </button>
              <button onClick={() => onFailDelivery(delivery.id)} style={{ height: 40, borderRadius: 11, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1.5px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0 14px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <AlertTriangle size={13} /> Issue
              </button>
            </>
          )}
          {delivery.status === "in_transit" && !isAirSea && (
            <>
              <button onClick={() => onCompleteDelivery(delivery.id)} style={{ height: 40, borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", padding: "0 20px", display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", boxShadow: "0 4px 12px rgba(34,197,94,0.25)", flex: 1, justifyContent: "center" }}>
                <CheckCircle2 size={15} /> Mark as Delivered
              </button>
              <button onClick={() => onFailDelivery(delivery.id)} style={{ height: 40, borderRadius: 11, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1.5px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0 14px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <AlertTriangle size={13} /> Issue
              </button>
            </>
          )}
          {delivery.status === "handed_off" && (
            <div style={{ width: "100%", padding: "12px 16px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: 11 }}>
              <div className="flex items-center gap-2 mb-1">
                {delivery.serviceType === "AIR" ? <Plane size={14} style={{ color: "#f97316" }} /> : <Ship size={14} style={{ color: "#f97316" }} />}
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f97316" }}>Package handed off to carrier</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Admin will track this shipment until it arrives at the destination hub.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   PENDING CARD — accept/decline
   ═══════════════════════════════════════ */

function PendingCard({ delivery, locked, expanded, onToggle, onAccept, onDecline, onViewDetails }: {
  delivery: Delivery; locked: boolean; expanded: boolean;
  onToggle: () => void; onAccept: (id: string) => void; onDecline: (id: string) => void;
  onViewDetails: (d: Delivery) => void;
}) {
  const pickupUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.pickupAddress)}`;
  const dropoffUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.dropoffAddress)}`;

  return (
    <div style={{ background: "linear-gradient(145deg, #1a2332, #141c2c)", borderRadius: 14, border: expanded ? "1px solid var(--border-medium)" : "1px solid var(--border-soft)", overflow: "hidden", transition: "all 200ms", opacity: locked ? 0.6 : 1 }}>
      {/* Locked banner */}
      {locked && (
        <div className="flex items-center gap-2 px-4 py-1.5" style={{ background: "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.08)" }}>
          <Lock size={11} style={{ color: "#f59e0b" }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "#f59e0b" }}>Complete your current delivery first</span>
        </div>
      )}

      {/* Row */}
      <div className="flex items-center gap-3 p-3.5 cursor-pointer" onClick={onToggle}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Package size={18} style={{ color: "#f59e0b" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{delivery.customerName}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "1px 6px", borderRadius: 4 }}>New</span>
          </div>
          <p className="truncate" style={{ fontSize: 11, color: "var(--text-secondary)" }}>{delivery.pickupAddress} → {delivery.dropoffAddress}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>{formatNaira(delivery.earnings)}</span>
          <ChevronDown size={13} style={{ color: "var(--text-tertiary)", transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms" }} />
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--border-soft)", padding: "12px 14px" }}>
          {/* Route */}
          <div className="flex gap-3 mb-3">
            <div className="flex flex-col items-center gap-0.5 pt-1">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <div style={{ width: 2, flex: 1, background: "linear-gradient(to bottom, #22c55e, #ef4444)", borderRadius: 1, minHeight: 20 }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div>
                <div className="flex items-center justify-between"><span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pickup</span><a href={pickupUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 9, color: "#22c55e", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>Map <ExternalLink size={8} /></a></div>
                <p className="truncate" style={{ fontSize: 12, color: "#fff", marginTop: 1 }}>{delivery.pickupAddress}</p>
              </div>
              <div>
                <div className="flex items-center justify-between"><span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dropoff</span><a href={dropoffUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 9, color: "#ef4444", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>Map <ExternalLink size={8} /></a></div>
                <p className="truncate" style={{ fontSize: 12, color: "#fff", marginTop: 1 }}>{delivery.dropoffAddress}</p>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap mb-3" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            <span className="flex items-center gap-1"><Clock size={11} style={{ color: "#f59e0b" }} /> ETA {formatTime(delivery.estimatedArrival)}</span>
            <span className="flex items-center gap-1"><MapPin size={11} style={{ color: "#06b6d4" }} /> {delivery.distance} km</span>
            <span className="flex items-center gap-1"><DollarSign size={11} style={{ color: "#22c55e" }} /> <b style={{ color: "#22c55e" }}>{formatNaira(delivery.earnings)}</b></span>
          </div>

          {/* View details link */}
          <button onClick={(e) => { e.stopPropagation(); onViewDetails(delivery); }} style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", color: "#3b82f6", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 10 }}>
            <Info size={12} /> View full delivery details
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); if (!locked) onAccept(delivery.id); }}
              disabled={locked}
              style={{
                height: 38, borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: locked ? "not-allowed" : "pointer",
                border: "none", padding: "0 18px", display: "inline-flex", alignItems: "center", gap: 5, flex: 1, justifyContent: "center",
                background: locked ? "rgba(100,116,139,0.15)" : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: locked ? "var(--text-tertiary)" : "#fff",
                boxShadow: locked ? "none" : "0 3px 10px rgba(34,197,94,0.25)",
              }}
            >
              {locked ? <><Lock size={13} /> Locked</> : <><CheckCircle2 size={14} /> Accept</>}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDecline(delivery.id); }}
              style={{ height: 38, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1.5px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0 14px", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   HISTORY ROW — compact delivered/failed
   ═══════════════════════════════════════ */

function HistoryRow({ delivery, onViewDetails }: { delivery: Delivery; onViewDetails: (d: Delivery) => void }) {
  const isDone = delivery.status === "delivered";
  return (
    <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => onViewDetails(delivery)} style={{ background: "linear-gradient(145deg, #1a2332, #141c2c)", borderRadius: 12, border: "1px solid var(--border-soft)", opacity: 0.85 }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "var(--border-medium)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.borderColor = "var(--border-soft)"; }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: isDone ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {isDone ? <CheckCircle2 size={16} style={{ color: "#22c55e" }} /> : <AlertTriangle size={16} style={{ color: "#ef4444" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{delivery.customerName}</span>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-tertiary)" }}>{delivery.trackingNumber}</span>
        </div>
        <p className="truncate" style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{delivery.pickupAddress} → {delivery.dropoffAddress}</p>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span style={{ fontSize: 13, fontWeight: 700, color: isDone ? "#22c55e" : "#ef4444" }}>{isDone ? formatNaira(delivery.earnings) : "Failed"}</span>
        <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{delivery.distance} km</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ background: "linear-gradient(145deg, #1a2332, #141c2c)", borderRadius: 14, border: "1px solid var(--border-soft)", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ color: "var(--text-tertiary)", margin: "0 auto 8px", opacity: 0.4, display: "flex", justifyContent: "center" }}>{icon}</div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{title}</p>
      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{subtitle}</p>
    </div>
  );
}

/* ═══════════════════════════════════════
   DELIVERY DETAILS MODAL
   ═══════════════════════════════════════ */

const SERVICE_LABELS: Record<string, string> = {
  ROAD: "Road", AIR: "Air Freight", SEA: "Sea Freight", DOOR_TO_DOOR: "Door to Door",
};

function DeliveryDetailsModal({ delivery, onClose }: { delivery: Delivery; onClose: () => void }) {
  const sc = STATUS_CONFIG[delivery.status];
  const pickupUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.pickupAddress)}`;
  const dropoffUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.dropoffAddress)}`;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />

      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", width: "100%", maxWidth: 520, maxHeight: "90vh",
          background: "linear-gradient(180deg, #1a2332, #111827)",
          borderRadius: "20px 20px 0 0", overflow: "hidden",
          border: "1px solid var(--border-soft)", borderBottom: "none",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3" style={{ borderBottom: "1px solid var(--border-soft)" }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: 0 }}>Delivery Details</h2>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-tertiary)" }}>{delivery.trackingNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg, padding: "3px 10px", borderRadius: 6 }}>{sc.label}</span>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", color: "var(--text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>

          {/* Route */}
          <div style={{ marginBottom: 20 }}>
            <h3 className="flex items-center gap-2" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>
              <Navigation size={13} /> Route
            </h3>
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-0.5 pt-1.5">
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }} />
                <div style={{ width: 2, flex: 1, background: "linear-gradient(to bottom, #22c55e, #ef4444)", borderRadius: 1, minHeight: 28 }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.4)" }} />
              </div>
              <div className="flex flex-col gap-4 flex-1 min-w-0">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pickup</span>
                    <a href={pickupUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#3b82f6", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                      Navigate <ExternalLink size={9} />
                    </a>
                  </div>
                  <p style={{ fontSize: 13, color: "#fff", margin: 0, lineHeight: 1.5 }}>{delivery.pickupAddress}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dropoff</span>
                    <a href={dropoffUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#3b82f6", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                      Navigate <ExternalLink size={9} />
                    </a>
                  </div>
                  <p style={{ fontSize: 13, color: "#fff", margin: 0, lineHeight: 1.5 }}>{delivery.dropoffAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border-soft)", overflow: "hidden", marginBottom: 16 }}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-soft)", background: "rgba(255,255,255,0.01)" }}>
              <Phone size={13} style={{ color: "#3b82f6" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Customer</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Name</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{delivery.customerName}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Phone</span>
              <a href={`tel:${delivery.customerPhone}`} style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", textDecoration: "none" }}>{delivery.customerPhone}</a>
            </div>
          </div>

          {/* Package Details */}
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border-soft)", overflow: "hidden", marginBottom: 16 }}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-soft)", background: "rgba(255,255,255,0.01)" }}>
              <Package size={13} style={{ color: "#a855f7" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Package Details</span>
            </div>
            {[
              { label: "Service Type", value: SERVICE_LABELS[delivery.serviceType] || delivery.serviceType, icon: <Truck size={13} /> },
              { label: "Weight", value: `${delivery.weight} kg`, icon: <Weight size={13} /> },
              { label: "Items", value: `${delivery.items} item${delivery.items !== 1 ? "s" : ""}`, icon: <Layers size={13} /> },
              { label: "Distance", value: `${delivery.distance} km`, icon: <MapPin size={13} /> },
            ].map((row, i, arr) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--text-tertiary)" }}>{row.icon}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{row.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Delivery Info */}
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border-soft)", overflow: "hidden", marginBottom: 16 }}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-soft)", background: "rgba(255,255,255,0.01)" }}>
              <Calendar size={13} style={{ color: "#f59e0b" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Delivery Info</span>
            </div>
            {[
              { label: "Tracking Number", value: delivery.trackingNumber, icon: <Hash size={13} />, mono: true },
              { label: "Scheduled", value: new Date(delivery.scheduledAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), icon: <Calendar size={13} /> },
              { label: "ETA", value: delivery.estimatedArrival ? new Date(delivery.estimatedArrival).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "TBD", icon: <Clock size={13} /> },
              { label: "Earnings", value: formatNaira(delivery.earnings), icon: <DollarSign size={13} />, green: true },
            ].map((row, i, arr) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--text-tertiary)" }}>{row.icon}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{row.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: row.green ? "#22c55e" : "#fff", fontFamily: row.mono ? "monospace" : "inherit", letterSpacing: row.mono ? 1 : 0 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Notes */}
          {delivery.notes && (
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border-soft)", overflow: "hidden" }}>
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-soft)", background: "rgba(255,255,255,0.01)" }}>
                <FileText size={13} style={{ color: "#06b6d4" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Notes</span>
              </div>
              <div style={{ padding: "12px 16px" }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{delivery.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
