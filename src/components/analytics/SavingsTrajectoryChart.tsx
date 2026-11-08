import React from "react";

export default function SavingsTrajectoryChart() {
  const dataPoints = [
    { month: "May", lossPct: 0.42, label: "420mg/100g" },
    { month: "Jun", lossPct: 0.39, label: "390mg/100g" },
    { month: "Jul", lossPct: 0.32, label: "320mg/100g" },
    { month: "Aug", lossPct: 0.24, label: "240mg/100g" },
    { month: "Sep", lossPct: 0.18, label: "180mg/100g" },
    { month: "Oct", lossPct: 0.14, label: "140mg/100g" },
    { month: "Nov (Now)", lossPct: 0.12, label: "120mg/100g" },
  ];

  // SVG Chart bounds: width 600, height 180
  // X from 50 to 550 (step 83.3)
  // Y: 0.50% at Y=20, 0.00% at Y=150
  const getY = (val: number) => 150 - (val / 0.5) * 130;
  const targetY = getY(0.15); // 0.15% target line

  const pointsString = dataPoints
    .map((pt, idx) => `${50 + idx * 83.3},${getY(pt.lossPct)}`)
    .join(" ");

  return (
    <div className="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-hover block">
            Executive Trajectory &amp; ROI
          </span>
          <h3 className="text-sm font-bold text-ink-primary">
            6-Month Gold Loss Reduction &amp; Cost Recovery
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-ink-secondary block">Cumulative Savings YTD:</span>
            <strong className="font-mono text-base font-bold text-emerald-800 tabular-numbers">
              ₹71,25,000
            </strong>
          </div>
          <div className="text-right border-l border-border pl-3">
            <span className="text-[10px] text-ink-secondary block">Labor Saved:</span>
            <strong className="font-mono text-base font-bold text-ink-primary tabular-numbers">
              180 Days
            </strong>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 600 180" className="w-full min-w-[500px] h-44">
          {/* Grid lines */}
          <line x1="40" y1="20" x2="570" y2="20" stroke="#E6E0D4" strokeWidth="1" strokeDasharray="3 3" />
          <text x="35" y="24" fontSize="9" fill="#78716C" textAnchor="end" fontFamily="monospace">0.50%</text>

          <line x1="40" y1={targetY} x2="570" y2={targetY} stroke="#8C6820" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="575" y={targetY + 3} fontSize="9" fill="#8C6820" fontWeight="bold" fontFamily="monospace">Target: 0.15%</text>

          <line x1="40" y1="150" x2="570" y2="150" stroke="#D3CDC0" strokeWidth="1" />
          <text x="35" y="153" fontSize="9" fill="#78716C" textAnchor="end" fontFamily="monospace">0.00%</text>

          {/* Shaded Area under curve */}
          <polygon
            points={`50,150 ${pointsString} 550,150`}
            fill="#EBF5EE"
            opacity="0.7"
          />

          {/* Trendline */}
          <polyline
            points={pointsString}
            fill="none"
            stroke="#1E5E3A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Labels */}
          {dataPoints.map((pt, idx) => {
            const cx = 50 + idx * 83.3;
            const cy = getY(pt.lossPct);
            const isLatest = idx === dataPoints.length - 1;

            return (
              <g key={pt.month}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isLatest ? 5 : 3.5}
                  fill={isLatest ? "#1E5E3A" : "#FFFFFF"}
                  stroke="#1E5E3A"
                  strokeWidth={isLatest ? 3 : 2}
                />
                <text
                  x={cx}
                  y={cy - 9}
                  fontSize="9.5"
                  fontWeight="bold"
                  fill="#1C1917"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {pt.lossPct.toFixed(2)}%
                </text>
                <text
                  x={cx}
                  y="166"
                  fontSize="10"
                  fontWeight={isLatest ? "bold" : "normal"}
                  fill={isLatest ? "#1E5E3A" : "#57534E"}
                  textAnchor="middle"
                >
                  {pt.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-[11px] text-ink-muted text-center pt-1 border-t border-border/60">
        Continuous statistical drift monitoring prevents year-end surprises by detecting losses at the job level.
      </p>
    </div>
  );
}

