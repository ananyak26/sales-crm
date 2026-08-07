"use client";

import { useEffect, useState } from "react";
import { Handshake, FileText, Wallet, Receipt } from "lucide-react";

type Stat = { label: string; value: string | number; sub?: string };
type StageDatum = { stage: string; count: number; amount: number };
type StatusDatum = { status: string; count: number; value: number };
type TrendDatum = { label: string; value: number };
type AccountDatum = { name: string; value: number };

const stageColors: Record<string, string> = {
  Prospecting: "#3b82f6",
  Proposal: "#f59e0b",
  Negotiation: "#f97316",
  Won: "#10b981",
  Lost: "#9ca3af",
};

const statusColors: Record<string, string> = {
  Draft: "#9ca3af",
  Sent: "#3b82f6",
  Accepted: "#10b981",
  Rejected: "#f43f5e",
};

const statIcons = [Handshake, FileText, Wallet, Receipt];

function fmtINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function DashboardCharts({
  stats,
  dealsByStage,
  quotesByStatus,
  revenueTrend,
  topAccounts,
}: {
  stats: Stat[];
  dealsByStage: StageDatum[];
  quotesByStatus: StatusDatum[];
  revenueTrend: TrendDatum[];
  topAccounts: AccountDatum[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const stageMax = Math.max(...dealsByStage.map((d) => d.amount), 1);
  const accountMax = Math.max(...topAccounts.map((a) => a.value), 1);

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = statIcons[i % statIcons.length];
          return (
            <div key={s.label} className="card-hover p-5 relative overflow-hidden">
              <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full bg-brand-50" />
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow mb-3">
                  <Icon size={16} className="text-white" />
                </div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold mt-0.5 text-ink-900">{s.value}</p>
                {s.sub && <p className="text-xs text-gray-400 mt-1">{s.sub}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline by stage + quote status donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <h2 className="font-semibold text-ink-900 mb-0.5">Pipeline by Stage</h2>
          <p className="text-xs text-gray-400 mb-5">Deal count and value across each stage</p>
          <div className="space-y-4">
            {dealsByStage.map((d) => {
              const pct = mounted ? (d.amount / stageMax) * 100 : 0;
              return (
                <div key={d.stage}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-ink-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: stageColors[d.stage] }} />
                      {d.stage}
                      <span className="text-gray-400 font-normal">({d.count})</span>
                    </span>
                    <span className="text-gray-500 text-xs font-medium">{fmtINR(d.amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, background: stageColors[d.stage] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-ink-900 mb-0.5">Quotes by Status</h2>
          <p className="text-xs text-gray-400 mb-5">Distribution of all quotes</p>
          <DonutChart
            data={quotesByStatus.map((q) => ({ label: q.status, value: q.count, color: statusColors[q.status] }))}
            mounted={mounted}
          />
        </div>
      </div>

      {/* Revenue trend + top accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <h2 className="font-semibold text-ink-900 mb-0.5">Revenue Collected</h2>
          <p className="text-xs text-gray-400 mb-2">Paid Sales Orders, last 6 months</p>
          <AreaChart data={revenueTrend} mounted={mounted} />
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-ink-900 mb-0.5">Top Customers</h2>
          <p className="text-xs text-gray-400 mb-5">By open pipeline value</p>
          <div className="space-y-3.5">
            {topAccounts.length === 0 && <p className="text-sm text-gray-400">No open pipeline yet.</p>}
            {topAccounts.map((a) => {
              const pct = mounted ? (a.value / accountMax) * 100 : 0;
              return (
                <div key={a.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-ink-700 truncate max-w-[65%]">{a.name}</span>
                    <span className="text-gray-500 text-xs font-medium">{fmtINR(a.value)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-gradient transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DonutChart({ data, mounted }: { data: { label: string; value: number; color: string }[]; mounted: boolean }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 148;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offsetAcc = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        {total > 0 &&
          data.map((d) => {
            if (d.value === 0) return null;
            const frac = d.value / total;
            const dash = mounted ? frac * c : 0;
            const gap = c - dash;
            const rotation = (offsetAcc / total) * 360;
            offsetAcc += d.value;
            return (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                style={{
                  transformOrigin: "50% 50%",
                  transform: `rotate(${rotation}deg)`,
                  transition: "stroke-dasharray 0.8s ease-out",
                }}
              />
            );
          })}
      </svg>
      <div className="space-y-1.5 min-w-0">
        {total === 0 && <p className="text-xs text-gray-400">No quotes yet</p>}
        {data.map(
          (d) =>
            d.value > 0 && (
              <div key={d.label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-ink-600">{d.label}</span>
                <span className="text-gray-400 ml-auto pl-3">{d.value}</span>
              </div>
            )
        )}
      </div>
    </div>
  );
}

function AreaChart({ data, mounted }: { data: { label: string; value: number }[]; mounted: boolean }) {
  const w = 480;
  const h = 180;
  const padX = 20;
  const padTop = 16;
  const padBottom = 26;
  const max = Math.max(...data.map((d) => d.value), 1);
  const stepX = (w - padX * 2) / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = padTop + (1 - d.value / max) * (h - padTop - padBottom);
    return { x, y, ...d };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - padBottom} L ${points[0].x} ${h - padBottom} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minWidth: 380, height: 190 }}>
        <defs>
          <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={w - padX}
            y1={padTop + f * (h - padTop - padBottom)}
            y2={padTop + f * (h - padTop - padBottom)}
            stroke="#f1f2f4"
            strokeWidth={1}
          />
        ))}

        <path
          d={areaPath}
          fill="url(#revenueAreaGradient)"
          opacity={mounted ? 1 : 0}
          style={{ transition: "opacity 0.9s ease-out" }}
        />
        <path
          d={linePath}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: mounted ? 0 : 1,
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill="#4f46e5"
            stroke="white"
            strokeWidth={1.5}
            opacity={mounted ? 1 : 0}
            style={{ transition: `opacity 0.4s ease-out ${0.5 + i * 0.06}s` }}
          />
        ))}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={h - 6} textAnchor="middle" fill="#9aa3b6" style={{ fontSize: 10 }}>
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
