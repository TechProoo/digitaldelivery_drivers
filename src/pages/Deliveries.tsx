import { useState } from "react";
import { DELIVERIES } from "../data/mock";
import { STATUS_CONFIG, type Delivery, type DeliveryStatus } from "../types";
import {
  Package,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  Phone,
} from "lucide-react";

const FILTER_OPTIONS: { value: DeliveryStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "picked_up", label: "Picked Up" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
];

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export default function Deliveries() {
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDeliveries = DELIVERIES.filter((d) => {
    if (activeFilter !== "all" && d.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.customerName.toLowerCase().includes(q) ||
        d.trackingNumber.toLowerCase().includes(q) ||
        d.pickupAddress.toLowerCase().includes(q) ||
        d.dropoffAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCount = DELIVERIES.length;
  const activeCount = DELIVERIES.filter((d) =>
    ["pending", "assigned", "picked_up", "in_transit"].includes(d.status)
  ).length;
  const completedCount = DELIVERIES.filter((d) => d.status === "delivered").length;

  return (
    <div style={{ padding: "24px 16px", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          className="text-2xl font-extrabold"
          style={{ color: "var(--text-primary)", marginBottom: 12 }}
        >
          My Deliveries
        </h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span
            className="badge"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {totalCount} Total
          </span>
          <span
            className="badge"
            style={{
              background: "rgba(59,130,246,0.12)",
              color: "var(--accent-blue)",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {activeCount} Active
          </span>
          <span
            className="badge"
            style={{
              background: "rgba(34,197,94,0.12)",
              color: "var(--accent-green)",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {completedCount} Completed
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search
          size={18}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-tertiary)",
          }}
        />
        <input
          type="text"
          placeholder="Search by name, tracking #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px 10px 40px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-lg)",
            color: "var(--text-primary)",
            fontSize: 14,
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent-blue)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-soft)")
          }
        />
      </div>

      {/* Filter pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 20,
          scrollbarWidth: "none",
        }}
      >
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.value;
          const statusConf =
            opt.value !== "all" ? STATUS_CONFIG[opt.value] : null;
          return (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              style={{
                padding: "6px 16px",
                borderRadius: "var(--radius-full)",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                background: isActive
                  ? statusConf
                    ? statusConf.color
                    : "var(--accent-blue)"
                  : "var(--bg-card)",
                color: isActive
                  ? "#fff"
                  : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "var(--bg-card-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "var(--bg-card)";
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Delivery Cards */}
      {filteredDeliveries.length > 0 ? (
        <div className="stagger" style={{ display: "grid", gap: 14 }}>
          {filteredDeliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 16px",
            color: "var(--text-tertiary)",
          }}
        >
          <Package size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: 4,
            }}
          >
            No deliveries found
          </p>
          <p style={{ fontSize: 14 }}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

function DeliveryCard({ delivery }: { delivery: Delivery }) {
  const status = STATUS_CONFIG[delivery.status];
  const eta = delivery.estimatedArrival
    ? new Date(delivery.estimatedArrival).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div
      className="surface-gradient"
      style={{
        padding: 16,
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-soft)",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.borderColor = "var(--border-medium)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border-soft)";
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Status badge */}
          <span
            className="badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: status.bg,
              color: status.color,
              padding: "3px 10px",
              borderRadius: "var(--radius-full)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: status.color,
                display: "inline-block",
              }}
            />
            {status.label}
          </span>
          {/* Tracking number */}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "var(--text-tertiary)",
            }}
          >
            {delivery.trackingNumber}
          </span>
        </div>
        {/* Distance badge */}
        <span
          className="badge"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            fontSize: 12,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <MapPin size={12} />
          {delivery.distance} km
        </span>
      </div>

      {/* Route */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {/* Route indicator dots + line */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 3,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent-green)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              width: 2,
              flex: 1,
              background: "linear-gradient(to bottom, var(--accent-green), var(--accent-red))",
              margin: "4px 0",
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent-red)",
              flexShrink: 0,
            }}
          />
        </div>
        {/* Addresses */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-primary)",
              marginBottom: 12,
              lineHeight: 1.4,
            }}
          >
            {delivery.pickupAddress}
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-primary)",
              lineHeight: 1.4,
            }}
          >
            {delivery.dropoffAddress}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "var(--border-soft)",
          marginBottom: 12,
        }}
      />

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {/* Customer info */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            {delivery.customerName}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 12,
              color: "var(--text-tertiary)",
            }}
          >
            <Phone size={11} />
            {delivery.customerPhone}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* ETA */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            <Clock size={12} />
            {eta}
          </span>
          {/* Earnings */}
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--accent-green)",
            }}
          >
            {formatNaira(delivery.earnings)}
          </span>
          {/* Details button */}
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              color: "var(--accent-blue)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Details <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
