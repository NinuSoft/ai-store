import React, { useId } from 'react';

/* ---------- Smooth Path Helper for SVG Charts ---------- */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ---------- Sparkline Component ---------- */
export const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = "#6366f1" }) => {
  const id = useId().replace(/:/g, "");
  const W = 100;
  const H = 32;
  const pad = 3;
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1 || 1)) * (W - pad * 2) + pad,
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  const line = buildSmoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ---------- AreaChart Component ---------- */
export const AreaChart: React.FC<{ data: number[]; labels?: string[]; color?: string }> = ({
  data,
  labels,
  color = "#6366f1",
}) => {
  const id = useId().replace(/:/g, "");
  const W = 320;
  const H = 130;
  const padY = 12;
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1) * 1.15;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1 || 1)) * W,
    y: H - padY - (v / max) * (H - padY * 2),
  }));
  const line = buildSmoothPath(pts);
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 160 }}
      >
        <defs>
          <linearGradient id={`ar-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1="0"
            x2={W}
            y1={H * g}
            y2={H * g}
            stroke="rgba(148, 163, 184, 0.15)"
            strokeWidth={1}
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#ar-${id})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pts.length - 1 ? 4 : 0}
            fill={color}
            stroke="white"
            strokeWidth={2}
          />
        ))}
      </svg>
      {labels && (
        <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", padding: "0 2px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
          {labels.map((l, i) => (
            <span key={i} className="number-latin">{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- BarChart Component ---------- */
export const BarChart: React.FC<{
  data: number[];
  labels?: string[];
  formatValue?: (n: number) => string;
}> = ({ data, labels, formatValue }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: "144px", display: "flex", alignItems: "end", justifyContent: "space-between", gap: "8px" }}>
        {data.map((v, i) => (
          <div key={i} style={{ display: "flex", height: "100%", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "end", gap: "6px" }} className="group">
            <span
              style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", transition: "opacity 0.2s" }}
              className="opacity-0 group-hover:opacity-100 number-latin"
            >
              {formatValue ? formatValue(v) : v}
            </span>
            <div style={{ display: "flex", width: "100%", maxWidth: "36px", flex: 1, alignItems: "end" }}>
              <div
                style={{
                  width: "100%",
                  height: `${Math.max((v / max) * 100, 3)}%`,
                  background: "linear-gradient(to top, #6366f1 0%, #a78bfa 100%)",
                  borderRadius: "8px 8px 0 0",
                  transition: "all 0.5s ease"
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {labels && (
        <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", padding: "0 2px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
          {labels.map((l, i) => (
            <span key={i} style={{ flex: 1, textAlign: "center" }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- DonutChart Component ---------- */
export const DonutChart: React.FC<{
  segments: { label: string; value: number; color: string }[];
  center?: React.ReactNode;
}> = ({ segments, center }) => {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 42;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: "160px", height: "160px", flexShrink: 0 }}>
      <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="13"
        />
        {segments.map((s, i) => {
          const len = (s.value / total) * C;
          const offset = -acc;
          acc += len;
          return (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(len - 2, 0)} ${C}`}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          );
        })}
      </svg>
      {center && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {center}
        </div>
      )}
    </div>
  );
};
