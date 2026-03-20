import { useEffect, useState } from "react";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  Bell,
} from "lucide-react";
import { useDeliveries } from "../contexts/DeliveryContext";

/**
 * Full-screen alert overlay when a new delivery is assigned.
 * Shows delivery details with Accept / Decline actions.
 * Auto-dismisses after 30 seconds if no action taken.
 */
export default function DeliveryAlert() {
  const { alerts, acceptDelivery, rejectDelivery, dismissAlert } = useDeliveries();
  const [countdown, setCountdown] = useState(30);

  const currentAlert = alerts[0]; // Show one at a time

  // Countdown timer
  useEffect(() => {
    if (!currentAlert) return;
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          dismissAlert(currentAlert.delivery.id);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentAlert, dismissAlert]);

  if (!currentAlert) return null;

  const { delivery } = currentAlert;
  const formatNaira = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 })
      .format(n)
      .replace("NGN", "\u20A6");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        padding: 16,
        animation: "fade-in 0.2s ease-out",
      }}
    >
      <style>{`
        @keyframes alert-slide-up { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes alert-ring { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(145deg, #1a2332, #0f172a)",
          borderRadius: 24,
          border: "1px solid rgba(59,130,246,0.2)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.1)",
          overflow: "hidden",
          animation: "alert-slide-up 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.08))",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid var(--border-soft)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "alert-ring 1s ease-in-out infinite",
              boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
            }}
          >
            <Bell size={24} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>New Delivery Assignment</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Respond within {countdown}s
            </p>
          </div>
          <button
            onClick={() => dismissAlert(delivery.id)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border-soft)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-tertiary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          {/* Tracking number */}
          <div className="flex items-center justify-between mb-4">
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "var(--text-tertiary)",
                background: "rgba(255,255,255,0.04)",
                padding: "4px 10px",
                borderRadius: 6,
              }}
            >
              {delivery.trackingNumber}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#22c55e",
                background: "rgba(34,197,94,0.12)",
                padding: "4px 10px",
                borderRadius: 6,
              }}
            >
              {formatNaira(delivery.earnings)}
            </span>
          </div>

          {/* Route */}
          <div className="flex gap-3 mb-4">
            <div className="flex flex-col items-center gap-0.5 pt-1">
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }} />
              <div style={{ width: 2, flex: 1, background: "linear-gradient(#22c55e, #ef4444)", borderRadius: 1, minHeight: 32 }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.4)" }} />
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>Pickup</p>
                <p style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{delivery.pickupAddress}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>Dropoff</p>
                <p style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{delivery.dropoffAddress}</p>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-5" style={{ flexWrap: "wrap" }}>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} style={{ color: "var(--accent-cyan)" }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{delivery.distance} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Package size={14} style={{ color: "var(--accent-blue)" }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{delivery.items} items &middot; {delivery.weight} kg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} style={{ color: "var(--accent-amber)" }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {delivery.estimatedArrival
                  ? new Date(delivery.estimatedArrival).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
                  : "ASAP"}
              </span>
            </div>
          </div>

          {/* Customer */}
          <div
            className="flex items-center gap-3 mb-5"
            style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-soft)" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              {delivery.customerName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{delivery.customerName}</p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{delivery.customerPhone}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => rejectDelivery(delivery.id)}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 14,
                border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.08)",
                color: "#ef4444",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 150ms",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            >
              <X size={16} /> Decline
            </button>
            <button
              onClick={() => acceptDelivery(delivery.id)}
              style={{
                flex: 2,
                height: 48,
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 150ms",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(34,197,94,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,197,94,0.3)"; }}
            >
              <CheckCircle2 size={18} /> Accept Delivery
            </button>
          </div>

          {/* Countdown bar */}
          <div style={{ marginTop: 16, height: 3, borderRadius: 2, background: "var(--border-soft)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 2,
                background: countdown > 10 ? "#3b82f6" : "#ef4444",
                width: `${(countdown / 30) * 100}%`,
                transition: "width 1s linear, background 300ms",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
