import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Wallet,
  CreditCard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { EARNINGS_SUMMARY, EARNINGS_CHART, DELIVERIES } from "../data/mock";

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

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-medium)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ color: "var(--text-tertiary)", fontSize: 12, marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 700 }}>
        {formatNaira(payload[0].value)}
      </p>
    </div>
  );
}

export default function Earnings() {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const deliveredOrders = DELIVERIES.filter((d) => d.status === "delivered");

  const summaryCards = [
    {
      label: "Today's Earnings",
      value: formatNaira(EARNINGS_SUMMARY.today),
      icon: <DollarSign size={24} />,
      color: "34,197,94",
      accent: "var(--accent-green)",
      badge: (
        <span
          className="flex items-center gap-1"
          style={{
            background: "rgba(34,197,94,0.14)",
            color: "var(--accent-green)",
            padding: "2px 8px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.7rem",
            fontWeight: 600,
          }}
        >
          <TrendingUp size={12} />
          +12%
        </span>
      ),
    },
    {
      label: "This Week",
      value: formatNaira(EARNINGS_SUMMARY.week),
      icon: <Calendar size={24} />,
      color: "59,130,246",
      accent: "var(--accent-blue)",
      badge: null,
    },
    {
      label: "This Month",
      value: formatNaira(EARNINGS_SUMMARY.month),
      icon: <Wallet size={24} />,
      color: "168,85,247",
      accent: "var(--accent-purple)",
      badge: null,
    },
    {
      label: "Pending Payout",
      value: formatNaira(EARNINGS_SUMMARY.pending),
      icon: <CreditCard size={24} />,
      color: "245,158,11",
      accent: "var(--accent-amber)",
      badge: null,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Summary Cards */}
      <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: `linear-gradient(135deg, rgba(${card.color},0.14), rgba(${card.color},0.04))`,
              border: `1px solid rgba(${card.color},0.25)`,
              borderRadius: "var(--radius-lg)",
              padding: "20px",
              cursor: "pointer",
              transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
              boxShadow: `0 4px 24px rgba(${card.color},0.08)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 32px rgba(${card.color},0.18)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 24px rgba(${card.color},0.08)`;
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center rounded-2xl"
                style={{
                  width: 48,
                  height: 48,
                  background: `linear-gradient(135deg, rgba(${card.color},0.3), rgba(${card.color},0.1))`,
                  color: card.accent,
                }}
              >
                {card.icon}
              </div>
              {card.badge && <div className="ml-auto">{card.badge}</div>}
            </div>
            <p
              style={{
                color: "var(--text-tertiary)",
                fontSize: "0.8rem",
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              {card.label}
            </p>
            <p
              className="text-3xl font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Earnings Chart */}
      <div
        className="surface-gradient"
        style={{
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          border: "1px solid var(--border-soft)",
        }}
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Weekly Earnings
          </h2>
          <div
            className="flex"
            style={{
              background: "var(--bg-primary)",
              borderRadius: "var(--radius-full)",
              padding: 3,
              border: "1px solid var(--border-soft)",
            }}
          >
            {(["week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  background: period === p ? "var(--accent-blue)" : "transparent",
                  color: period === p ? "#fff" : "var(--text-secondary)",
                  border: "none",
                  borderRadius: "var(--radius-full)",
                  padding: "6px 16px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease-out",
                }}
              >
                {p === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={EARNINGS_CHART}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar
              dataKey="amount"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div
        className="surface-gradient"
        style={{
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          border: "1px solid var(--border-soft)",
        }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Recent Transactions
        </h2>

        <div style={{ overflow: "hidden" }}>
          {deliveredOrders.map((delivery, idx) => {
            const date = new Date(delivery.scheduledAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={delivery.id}
                className="flex items-center gap-3"
                style={{
                  padding: "14px 0",
                  borderBottom:
                    idx < deliveredOrders.length - 1
                      ? "1px solid var(--border-soft)"
                      : "none",
                  cursor: "pointer",
                  transition: "background 0.2s ease-out",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Green checkmark */}
                <div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    background: "rgba(34,197,94,0.14)",
                    color: "var(--accent-green)",
                  }}
                >
                  <ArrowUpRight size={18} />
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0">
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {delivery.trackingNumber}
                  </p>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {delivery.customerName}
                  </p>
                </div>

                {/* Date */}
                <div
                  className="flex-shrink-0 hidden sm:block"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {date}
                </div>

                {/* Amount */}
                <div
                  className="flex-shrink-0"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--accent-green)",
                  }}
                >
                  {formatNaira(delivery.earnings)}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All */}
        <div
          className="flex items-center justify-center"
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid var(--border-soft)",
          }}
        >
          <button
            className="flex items-center gap-1"
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-blue)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: 8,
              transition: "background 0.2s ease-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59,130,246,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            View All
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
