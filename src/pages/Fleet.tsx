import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useDeliveries } from "../contexts/DeliveryContext";
import { getBankDetails, updateBankDetails as apiUpdateBankDetails } from "../services/api";
import {
  Truck,
  Wrench,
  Calendar,
  Shield,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Star,
  Hash,
  Palette,
  Car,
  FileText,
  Clock,
  Landmark,
  Save,
  Edit3,
  User,
  CreditCard,
  Building2,
} from "lucide-react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isWithin30Days(dateStr: string): boolean {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return target - now <= 30 * 86400000 && target >= now;
}

function isExpired(dateStr: string): boolean {
  return new Date(dateStr).getTime() < Date.now();
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function Fleet() {
  const { driver } = useAuth();
  const { deliveries } = useDeliveries();
  const allCompleted = deliveries.filter((d) => d.status === "delivered");

  // Build vehicle info from driver data (backend doesn't have a separate vehicle model)
  const v = {
    type: driver?.vehicleType || "—",
    make: "—",
    model: "—",
    year: "—",
    plate: driver?.plateNumber || "—",
    color: "—",
    mileage: 0,
    status: "active" as const,
    insurance: "",
    lastService: "",
    nextService: "",
  };
  const isActive = true;

  const hasInsurance = Boolean(v.insurance);
  const hasNextService = Boolean(v.nextService);
  const insuranceDays = hasInsurance ? daysUntil(v.insurance) : 999;
  const serviceDays = hasNextService ? daysUntil(v.nextService) : 999;
  const insuranceExpired = hasInsurance && isExpired(v.insurance);
  const serviceOverdue = hasNextService && isExpired(v.nextService);

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ Vehicle Hero ═══ */}
      <div
        style={{
          background:
            "linear-gradient(145deg, rgba(59,130,246,0.06), #1a2332 30%, #141c2c)",
          border: "1px solid rgba(59,130,246,0.12)",
          borderRadius: 18,
          padding: "22px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative orb */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="flex items-center gap-4 flex-wrap"
          style={{ position: "relative" }}
        >
          {/* Vehicle icon */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "linear-gradient(135deg, #1E40AF, #3b82f6)",
              boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Truck size={28} color="#fff" />
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className="text-xl md:text-2xl font-extrabold"
              style={{ color: "#fff", letterSpacing: "-0.02em", margin: 0 }}
            >
              {driver?.driverName || "My Vehicle"}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {[String(v.year), v.color, v.type].map((label) => (
                <span
                  key={label}
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    color: "#3b82f6",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 8,
                  }}
                >
                  {label}
                </span>
              ))}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  background: isActive
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(245,158,11,0.1)",
                  color: isActive ? "#22c55e" : "#f59e0b",
                }}
              >
                {isActive ? <CheckCircle2 size={11} /> : <Wrench size={11} />}
                {isActive ? "Active" : "Maintenance"}
              </span>
            </div>
          </div>

          {/* Plate number */}
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border-soft)",
              fontFamily: "monospace",
              fontSize: 16,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: 2,
              flexShrink: 0,
            }}
          >
            {v.plate}
          </div>
        </div>
      </div>

      {/* ═══ Alerts (if any) ═══ */}
      {(hasInsurance || hasNextService) && (insuranceExpired ||
        (hasInsurance && isWithin30Days(v.insurance)) ||
        serviceOverdue ||
        (hasNextService && isWithin30Days(v.nextService))) && (
        <div className="flex flex-col gap-2">
          {(insuranceExpired || isWithin30Days(v.insurance)) && (
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderRadius: 12,
                background: insuranceExpired
                  ? "rgba(239,68,68,0.06)"
                  : "rgba(245,158,11,0.06)",
                border: insuranceExpired
                  ? "1px solid rgba(239,68,68,0.15)"
                  : "1px solid rgba(245,158,11,0.15)",
              }}
            >
              <AlertTriangle
                size={16}
                style={{
                  color: insuranceExpired ? "#ef4444" : "#f59e0b",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: insuranceExpired ? "#ef4444" : "#f59e0b",
                    margin: 0,
                  }}
                >
                  {insuranceExpired
                    ? "Insurance expired"
                    : `Insurance expires in ${insuranceDays} days`}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-tertiary)",
                    margin: 0,
                    marginTop: 1,
                  }}
                >
                  Expiry: {formatDate(v.insurance)} — Contact admin to update
                </p>
              </div>
            </div>
          )}
          {(serviceOverdue || isWithin30Days(v.nextService)) && (
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderRadius: 12,
                background: serviceOverdue
                  ? "rgba(239,68,68,0.06)"
                  : "rgba(245,158,11,0.06)",
                border: serviceOverdue
                  ? "1px solid rgba(239,68,68,0.15)"
                  : "1px solid rgba(245,158,11,0.15)",
              }}
            >
              <Wrench
                size={16}
                style={{
                  color: serviceOverdue ? "#ef4444" : "#f59e0b",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: serviceOverdue ? "#ef4444" : "#f59e0b",
                    margin: 0,
                  }}
                >
                  {serviceOverdue
                    ? "Service overdue"
                    : `Service due in ${serviceDays} days`}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-tertiary)",
                    margin: 0,
                    marginTop: 1,
                  }}
                >
                  Next service: {formatDate(v.nextService)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Quick Stats ═══ */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Mileage",
            value: `${v.mileage.toLocaleString()} km`,
            icon: <Gauge size={18} />,
            rgb: "59,130,246",
          },
          {
            label: "Rating",
            value: "—",
            icon: <Star size={18} />,
            rgb: "245,158,11",
          },
          {
            label: "Deliveries",
            value: allCompleted.length.toLocaleString(),
            icon: <Truck size={18} />,
            rgb: "34,197,94",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: `linear-gradient(145deg, rgba(${stat.rgb},0.08), rgba(${stat.rgb},0.02))`,
              border: `1px solid rgba(${stat.rgb},0.1)`,
              borderRadius: 14,
              padding: "14px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `rgba(${stat.rgb},0.12)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
                color: `rgb(${stat.rgb})`,
              }}
            >
              {stat.icon}
            </div>
            <p
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
                margin: 0,
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: 10,
                color: "var(--text-tertiary)",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ═══ Vehicle Specifications ═══ */}
      <div
        style={{
          background: "linear-gradient(145deg, #1a2332, #141c2c)",
          border: "1px solid var(--border-soft)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{ borderBottom: "1px solid var(--border-soft)" }}
        >
          <Car size={16} style={{ color: "#3b82f6" }} />
          <h2
            style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}
          >
            Vehicle Specifications
          </h2>
        </div>
        {[
          { label: "Type", value: v.type, icon: <Truck size={14} /> },
          { label: "Make", value: v.make, icon: <Car size={14} /> },
          { label: "Model", value: v.model, icon: <FileText size={14} /> },
          {
            label: "Year",
            value: String(v.year),
            icon: <Calendar size={14} />,
          },
          { label: "Color", value: v.color, icon: <Palette size={14} /> },
          {
            label: "Plate Number",
            value: v.plate,
            icon: <Hash size={14} />,
            mono: true,
          },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            className="flex items-center gap-3 px-5 py-3"
            style={{
              borderBottom:
                i < arr.length - 1 ? "1px solid var(--border-soft)" : "none",
            }}
          >
            <div
              style={{
                color: "var(--text-tertiary)",
                flexShrink: 0,
                width: 20,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {row.icon}
            </div>
            <span
              style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                fontFamily: row.mono ? "monospace" : "inherit",
                letterSpacing: row.mono ? 1 : 0,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* ═══ Insurance & Service ═══ */}
      <div
        style={{
          background: "linear-gradient(145deg, #1a2332, #141c2c)",
          border: "1px solid var(--border-soft)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{ borderBottom: "1px solid var(--border-soft)" }}
        >
          <Shield size={16} style={{ color: "#3b82f6" }} />
          <h2
            style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}
          >
            Insurance & Maintenance
          </h2>
        </div>

        {/* Insurance */}
        <div
          className="flex items-center gap-3 px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border-soft)" }}
        >
          <div
            style={{
              color: "var(--text-tertiary)",
              flexShrink: 0,
              width: 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Shield size={14} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Insurance
            </span>
            {insuranceExpired && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#ef4444",
                  marginLeft: 8,
                  background: "rgba(239,68,68,0.1)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                EXPIRED
              </span>
            )}
            {!insuranceExpired && isWithin30Days(v.insurance) && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#f59e0b",
                  marginLeft: 8,
                  background: "rgba(245,158,11,0.1)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                EXPIRING SOON
              </span>
            )}
          </div>
          <span
            className="flex items-center gap-1.5"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: insuranceExpired
                ? "#ef4444"
                : isWithin30Days(v.insurance)
                  ? "#f59e0b"
                  : "#22c55e",
            }}
          >
            {insuranceExpired ? (
              <AlertTriangle size={13} />
            ) : (
              <CheckCircle2 size={13} />
            )}
            {formatDate(v.insurance)}
          </span>
        </div>

        {/* Last Service */}
        <div
          className="flex items-center gap-3 px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border-soft)" }}
        >
          <div
            style={{
              color: "var(--text-tertiary)",
              flexShrink: 0,
              width: 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Wrench size={14} />
          </div>
          <span
            style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}
          >
            Last Service
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
            {formatDate(v.lastService)}
          </span>
        </div>

        {/* Next Service */}
        <div
          className="flex items-center gap-3 px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border-soft)" }}
        >
          <div
            style={{
              color: "var(--text-tertiary)",
              flexShrink: 0,
              width: 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Calendar size={14} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Next Service
            </span>
            {serviceOverdue && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#ef4444",
                  marginLeft: 8,
                  background: "rgba(239,68,68,0.1)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                OVERDUE
              </span>
            )}
            {!serviceOverdue && isWithin30Days(v.nextService) && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#f59e0b",
                  marginLeft: 8,
                  background: "rgba(245,158,11,0.1)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                DUE SOON
              </span>
            )}
          </div>
          <span
            className="flex items-center gap-1.5"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: serviceOverdue
                ? "#ef4444"
                : isWithin30Days(v.nextService)
                  ? "#f59e0b"
                  : "#fff",
            }}
          >
            {(serviceOverdue || isWithin30Days(v.nextService)) && (
              <AlertTriangle size={13} />
            )}
            {formatDate(v.nextService)}
          </span>
        </div>

        {/* Mileage */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <div
            style={{
              color: "var(--text-tertiary)",
              flexShrink: 0,
              width: 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Gauge size={14} />
          </div>
          <span
            style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}
          >
            Total Mileage
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
            {v.mileage.toLocaleString()} km
          </span>
        </div>
      </div>

      {/* ═══ Bank Details ═══ */}
      <BankDetailsSection />

      {/* ═══ Help note ═══ */}
      <div
        className="flex items-start gap-3 px-4 py-3"
        style={{
          borderRadius: 12,
          background: "rgba(59,130,246,0.04)",
          border: "1px solid rgba(59,130,246,0.08)",
        }}
      >
        <Clock
          size={14}
          style={{ color: "#3b82f6", flexShrink: 0, marginTop: 1 }}
        />
        <p
          style={{
            fontSize: 11,
            color: "var(--text-tertiary)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Vehicle information is managed by the admin team. If any details are
          incorrect or need updating, please send a message via the Messages
          page.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BANK DETAILS SECTION
   ═══════════════════════════════════════ */

function BankDetailsSection() {
  const { driver } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  // Fetch bank details from API on mount
  useEffect(() => {
    if (!driver?.id) return;
    getBankDetails(driver.id)
      .then((data) => {
        setBankName(data.bankName || "");
        setBankAccount(data.bankAccount || "");
        setBankAccountName(data.bankAccountName || "");
      })
      .catch(() => {
        // Use whatever we have from driver object
        setBankName(driver.bankName || "");
        setBankAccount(driver.bankAccount || "");
        setBankAccountName(driver.bankAccountName || "");
      })
      .finally(() => setLoading(false));
  }, [driver?.id]);

  const hasDetails = bankName && bankAccount && bankAccountName;

  function handleSave() {
    if (!driver?.id) return;
    apiUpdateBankDetails(driver.id, { bankName, bankAccount, bankAccountName })
      .then(() => {
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to save bank details:", err);
        alert("Failed to save bank details. Please try again.");
      });
  }

  if (loading) return null;

  const inputStyle = (): React.CSSProperties => ({
    width: "100%",
    height: 40,
    padding: "0 12px",
    borderRadius: 10,
    fontSize: 13,
    color: "#fff",
    outline: "none",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--border-soft)",
    transition: "all 200ms",
  });

  if (!editing && hasDetails) {
    // Display mode
    return (
      <div
        style={{
          background: "linear-gradient(145deg, #1a2332, #141c2c)",
          border: "1px solid var(--border-soft)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--border-soft)" }}
        >
          <div className="flex items-center gap-2">
            <Landmark size={16} style={{ color: "#22c55e" }} />
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Bank Details
            </h2>
          </div>
          <button
            onClick={() => setEditing(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              color: "#3b82f6",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Edit3 size={12} /> Edit
          </button>
        </div>

        {[
          {
            label: "Bank Name",
            value: bankName,
            icon: <Building2 size={14} />,
          },
          {
            label: "Account Number",
            value: bankAccount,
            icon: <CreditCard size={14} />,
            mono: true,
          },
          {
            label: "Account Name",
            value: bankAccountName,
            icon: <User size={14} />,
          },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            className="flex items-center gap-3 px-5 py-3.5"
            style={{
              borderBottom:
                i < arr.length - 1 ? "1px solid var(--border-soft)" : "none",
            }}
          >
            <div
              style={{
                color: "var(--text-tertiary)",
                flexShrink: 0,
                width: 20,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {row.icon}
            </div>
            <span
              style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                fontFamily: row.mono ? "monospace" : "inherit",
                letterSpacing: row.mono ? 1 : 0,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}

        {saved && (
          <div
            className="flex items-center gap-2 px-5 py-2"
            style={{
              background: "rgba(34,197,94,0.06)",
              borderTop: "1px solid rgba(34,197,94,0.1)",
            }}
          >
            <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#22c55e" }}>
              Bank details saved
            </span>
          </div>
        )}
      </div>
    );
  }

  // Edit / empty mode
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #1a2332, #141c2c)",
        border: hasDetails
          ? "1px solid var(--border-soft)"
          : "1px solid rgba(245,158,11,0.15)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--border-soft)" }}
      >
        <div className="flex items-center gap-2">
          <Landmark
            size={16}
            style={{ color: hasDetails ? "#3b82f6" : "#f59e0b" }}
          />
          <h2
            style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}
          >
            Bank Details
          </h2>
        </div>
        {!hasDetails && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#f59e0b",
              background: "rgba(245,158,11,0.1)",
              padding: "2px 8px",
              borderRadius: 5,
            }}
          >
            REQUIRED
          </span>
        )}
      </div>

      {!hasDetails && !editing && (
        <div style={{ padding: "24px 20px", textAlign: "center" }}>
          <Building2
            size={28}
            style={{
              color: "var(--text-tertiary)",
              margin: "0 auto 8px",
              opacity: 0.4,
            }}
          />
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              margin: "0 0 3px",
            }}
          >
            No bank details added
          </p>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-tertiary)",
              margin: "0 0 14px",
            }}
          >
            Add your bank details so we can send your earnings
          </p>
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(245,158,11,0.25)",
            }}
          >
            Add Bank Details
          </button>
        </div>
      )}

      {editing && (
        <div style={{ padding: "16px 18px" }}>
          <div className="flex flex-col gap-3">
            {/* Bank Name */}
            <div>
              <label
                className="flex items-center gap-1.5 mb-1.5"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-tertiary)",
                }}
              >
                <Building2 size={12} /> Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g. First Bank, GTBank, Access Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                style={inputStyle()}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(59,130,246,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-soft)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Account Number */}
            <div>
              <label
                className="flex items-center gap-1.5 mb-1.5"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-tertiary)",
                }}
              >
                <CreditCard size={12} /> Account Number
              </label>
              <input
                type="text"
                placeholder="e.g. 0123456789"
                inputMode="numeric"
                value={bankAccount}
                onChange={(e) =>
                  setBankAccount(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                style={{
                  ...inputStyle(),
                  fontFamily: "monospace",
                  letterSpacing: 2,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(59,130,246,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-soft)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Account Name */}
            <div>
              <label
                className="flex items-center gap-1.5 mb-1.5"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-tertiary)",
                }}
              >
                <User size={12} /> Account Name
              </label>
              <input
                type="text"
                placeholder="e.g. Chidi Okonkwo"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                style={inputStyle()}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(59,130,246,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-soft)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={
                !bankName.trim() ||
                !bankAccount.trim() ||
                !bankAccountName.trim()
              }
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  bankName.trim() &&
                  bankAccount.trim() &&
                  bankAccountName.trim()
                    ? "pointer"
                    : "not-allowed",
                background:
                  bankName.trim() &&
                  bankAccount.trim() &&
                  bankAccountName.trim()
                    ? "linear-gradient(135deg, #22c55e, #16a34a)"
                    : "rgba(100,116,139,0.15)",
                color:
                  bankName.trim() &&
                  bankAccount.trim() &&
                  bankAccountName.trim()
                    ? "#fff"
                    : "var(--text-tertiary)",
                boxShadow:
                  bankName.trim() &&
                  bankAccount.trim() &&
                  bankAccountName.trim()
                    ? "0 3px 10px rgba(34,197,94,0.25)"
                    : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Save size={14} /> Save Bank Details
            </button>
            {hasDetails && (
              <button
                onClick={() => {
                  setEditing(false);
                  setBankName(driver?.bankName || "");
                  setBankAccount(driver?.bankAccount || "");
                  setBankAccountName(driver?.bankAccountName || "");
                }}
                style={{
                  height: 40,
                  borderRadius: 10,
                  border: "1px solid var(--border-soft)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "0 16px",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
