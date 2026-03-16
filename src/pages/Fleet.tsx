import { VEHICLE, CURRENT_DRIVER } from "../data/mock";
import { type Vehicle } from "../types";
import {
  Truck,
  Fuel,
  Wrench,
  Calendar,
  Shield,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isWithin30Days(dateStr: string): boolean {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return target - now <= thirtyDays && target >= now;
}

function isFuture(dateStr: string): boolean {
  return new Date(dateStr).getTime() > Date.now();
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Fleet() {
  const vehicle: Vehicle = VEHICLE;
  const driver = CURRENT_DRIVER;
  const isActive = vehicle.status === "active";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "0 0 32px" }}>
      {/* ── Vehicle Hero Card ── */}
      <div
        style={{
          background: "linear-gradient(145deg, #1a2332 0%, #162236 100%)",
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--radius-lg)",
          padding: 28,
          display: "flex",
          alignItems: "center",
          gap: 28,
          flexWrap: "wrap",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent-blue), #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px rgba(59,130,246,0.35)",
            flexShrink: 0,
          }}
        >
          <Truck size={30} color="#fff" />
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {vehicle.make} {vehicle.model}
          </h1>

          {/* Badges row */}
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {[String(vehicle.year), vehicle.color, vehicle.type].map((label) => (
              <span
                key={label}
                style={{
                  background: "rgba(59,130,246,0.12)",
                  color: "var(--accent-blue)",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Plate */}
          <div
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "6px 16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--radius-full)",
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: 1,
            }}
          >
            {vehicle.plate}
          </div>

          {/* Status */}
          <div style={{ marginTop: 12 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: 13,
                fontWeight: 600,
                background: isActive ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                color: isActive ? "var(--accent-green)" : "var(--accent-amber)",
              }}
            >
              {isActive ? <CheckCircle2 size={14} /> : <Wrench size={14} />}
              {isActive ? "Active" : "Maintenance"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div
        className="stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {/* Fuel Level */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(6,182,212,0.08), rgba(6,182,212,0.02))",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(6,182,212,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Fuel size={22} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
            {vehicle.fuelLevel}%
          </div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
            Fuel Level
          </div>
          {/* Mini progress bar */}
          <div
            style={{
              marginTop: 10,
              height: 6,
              borderRadius: "var(--radius-full)",
              background: "rgba(6,182,212,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${vehicle.fuelLevel}%`,
                height: "100%",
                borderRadius: "var(--radius-full)",
                background: "var(--accent-cyan)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* Mileage */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(59,130,246,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Gauge size={22} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
            {vehicle.mileage.toLocaleString()} km
          </div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>Mileage</div>
        </div>

        {/* Last Service */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(34,197,94,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Wrench size={22} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
            {formatDate(vehicle.lastService)}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
            Last Service
          </div>
        </div>

        {/* Next Service */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(245,158,11,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Calendar size={22} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
            {formatDate(vehicle.nextService)}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
            Next Service
          </div>
        </div>
      </div>

      {/* ── Vehicle Details Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
        className="stagger"
      >
        {/* Specifications Card */}
        <div
          className="surface-gradient"
          style={{
            background: "linear-gradient(145deg, #1a2332, #141c2c)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <Truck size={20} color="var(--accent-blue)" />
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Vehicle Details
            </h2>
          </div>

          {(
            [
              ["Type", vehicle.type],
              ["Make", vehicle.make],
              ["Model", vehicle.model],
              ["Year", String(vehicle.year)],
              ["Color", vehicle.color],
              ["Plate Number", vehicle.plate],
            ] as [string, string][]
          ).map(([label, value], i, arr) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-soft)" : "none",
              }}
            >
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>{label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 14 }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Maintenance & Insurance Card */}
        <div
          className="surface-gradient"
          style={{
            background: "linear-gradient(145deg, #1a2332, #141c2c)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <Shield size={20} color="var(--accent-blue)" />
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Maintenance
            </h2>
          </div>

          {/* Insurance */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Insurance</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                fontWeight: 500,
                color: isFuture(vehicle.insurance) ? "var(--accent-green)" : "var(--accent-red)",
              }}
            >
              {isFuture(vehicle.insurance) ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertTriangle size={14} />
              )}
              {formatDate(vehicle.insurance)}
            </span>
          </div>

          {/* Last Service */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Last Service</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 14 }}>
              {formatDate(vehicle.lastService)}
            </span>
          </div>

          {/* Next Service */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Next Service</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                fontWeight: 500,
                color: isWithin30Days(vehicle.nextService)
                  ? "var(--accent-amber)"
                  : "var(--text-primary)",
              }}
            >
              {isWithin30Days(vehicle.nextService) && <AlertTriangle size={14} />}
              {formatDate(vehicle.nextService)}
            </span>
          </div>

          {/* Mileage */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
            }}
          >
            <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Mileage</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 14 }}>
              {vehicle.mileage.toLocaleString()} km
            </span>
          </div>

          {/* Schedule Service Button */}
          <button
            style={{
              width: "100%",
              marginTop: 20,
              padding: "14px 0",
              borderRadius: "var(--radius-lg)",
              border: "none",
              background: "linear-gradient(135deg, var(--accent-blue), #6366f1)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "box-shadow 0.2s ease",
              boxShadow: "0 0 0 rgba(59,130,246,0)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 0 20px rgba(59,130,246,0.4)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 0 0 rgba(59,130,246,0)")
            }
          >
            Schedule Service
          </button>
        </div>
      </div>

      {/* ── Driver Assignment Card ── */}
      <div
        className="surface-gradient"
        style={{
          background: "linear-gradient(145deg, #1a2332, #141c2c)",
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
        }}
      >
        <h2
          style={{
            margin: "0 0 20px",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Assigned Driver
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-blue), #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {getInitials(driver.name)}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {driver.name}
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 4,
                fontSize: 13,
                color: "var(--text-secondary)",
                flexWrap: "wrap",
              }}
            >
              <span>{"\u2B50"} {driver.rating}</span>
              <span>{driver.totalDeliveries.toLocaleString()} deliveries</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>
              {driver.phone}
            </div>
          </div>

          {/* Contact Button */}
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--accent-blue)",
              background: "rgba(59,130,246,0.1)",
              color: "var(--accent-blue)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(59,130,246,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(59,130,246,0.1)")
            }
          >
            Contact Driver
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
