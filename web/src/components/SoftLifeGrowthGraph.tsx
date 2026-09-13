import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
} from "recharts";

import { vaultApi, Growth, MonthPoint } from "../api/vault";
import { Spinner } from "./Spinner";

interface MetricDef {
  key: keyof Growth;
  label: string;
  unit: string;
  accent: string;
}

const METRICS: MetricDef[] = [
  { key: "money", label: "Money", unit: "$", accent: "#D4AF37" },
  { key: "goals", label: "Goals", unit: "", accent: "#C97B95" },
  { key: "wellness", label: "Wellness", unit: "%", accent: "#8E9C7C" },
];

interface BalanceSlice {
  key: string;
  name: string;
  value: number;
  percent: number;
  color: string;
}

// Turns each metric's growth this season into a relative "balance" share.
// Uses growth amount, not raw value, so $ and % and counts stay comparable.
function computeBalance(data: Growth): BalanceSlice[] {
  const shares = METRICS.map(({ key, label, accent }) => {
    const series = data[key];
    const growth = Math.max(series[series.length - 1].value - series[0].value, 0.01);
    return { key, name: label, value: growth, color: accent };
  });
  const total = shares.reduce((sum, s) => sum + s.value, 0);
  return shares.map((s) => ({ ...s, percent: Math.round((s.value / total) * 100) }));
}

function formatValue(value: number, unit: string): string {
  if (unit === "$") return `$${value.toLocaleString()}`;
  if (unit === "%") return `${value}%`;
  return `${value}`;
}

function CustomTooltip({ active, payload, label, unit }: TooltipProps<number, string> & { unit: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#FFF9F6",
        border: "1px solid #F0DCE3",
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "0 4px 14px rgba(26,26,26,0.08)",
      }}
    >
      <div style={{ fontSize: 11, color: "#8A7A80", fontFamily: "Poppins, sans-serif" }}>{label}</div>
      <div style={{ fontSize: 15, color: "#1A1A1A", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
        {formatValue(payload[0].value as number, unit)}
      </div>
    </div>
  );
}

interface SoftLifeGrowthGraphProps {
  userName: string;
  joinedMonth: string;
}

export function SoftLifeGrowthGraph({ userName, joinedMonth }: SoftLifeGrowthGraphProps) {
  const [data, setData] = useState<Growth | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<keyof Growth>("money");

  useEffect(() => {
    vaultApi
      .getGrowth()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const balance = useMemo(() => (data ? computeBalance(data) : []), [data]);

  if (loading) return <Spinner />;
  if (!data) return null;

  const metric = METRICS.find((m) => m.key === activeMetric)!;
  const points: MonthPoint[] = data[activeMetric];
  const latest = points[points.length - 1].value;
  const first = points[0].value;
  const change = first === 0 ? (latest > 0 ? 100 : 0) : Math.round(((latest - first) / first) * 100);

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "var(--soft-pink)",
        borderRadius: 20,
        padding: "28px 26px",
        boxShadow: "0 10px 30px rgba(212,175,55,0.08)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, color: "#1A1A1A", marginBottom: 2 }}>
            {userName}&apos;s growth
          </div>
          <div style={{ fontSize: 12.5, color: "#8A7A80" }}>
            Your journey since {joinedMonth} — nobody else sees this view
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#1A1A1A" }}>{formatValue(latest, metric.unit)}</div>
          <div style={{ fontSize: 12, color: change >= 0 ? "#8E9C7C" : "#C97B95" }}>
            {change >= 0 ? "+" : ""}
            {change}% this season
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 20, marginBottom: 18 }}>
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "7px 16px",
              borderRadius: 999,
              fontSize: 12.5,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              background: activeMetric === m.key ? m.accent : "#FFFFFF",
              color: activeMetric === m.key ? "#FFF9F6" : "#1A1A1A",
              transition: "background 0.2s ease",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--ivory)", borderRadius: 14, padding: "14px 8px 4px" }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={points} margin={{ top: 6, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#F0DCE3" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#8A7A80", fontFamily: "Poppins, sans-serif" }}
              axisLine={{ stroke: "#F0DCE3" }}
              tickLine={false}
            />
            <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip content={<CustomTooltip unit={metric.unit} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={metric.accent}
              strokeWidth={2.5}
              dot={{ r: 3, fill: metric.accent, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 20, background: "var(--ivory)", borderRadius: 14, padding: "16px 14px" }}>
        <div style={{ fontSize: 12.5, color: "#1A1A1A", fontWeight: 500, marginBottom: 6 }}>
          Where {userName}&apos;s growth is coming from
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 120, height: 120, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={balance} dataKey="value" nameKey="name" innerRadius={34} outerRadius={56} paddingAngle={3} stroke="none">
                  {balance.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            {balance.map((entry) => (
              <div key={entry.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: entry.color, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#1A1A1A", flex: 1 }}>{entry.name}</span>
                <span style={{ fontSize: 12, color: "#8A7A80", fontWeight: 600 }}>{entry.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 11.5, color: "#8A7A80", textAlign: "center" }}>
        Show up like you already are who you want to become.
      </div>
    </div>
  );
}
