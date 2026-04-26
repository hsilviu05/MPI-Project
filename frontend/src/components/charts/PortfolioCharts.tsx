import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HoldingRead } from "../../types/holding";
import type { PortfolioValuationRead } from "../../types/portfolio";

const PALETTE = [
  "#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
  "#6366f1", "#84cc16",
];

const GREEN = "#10b981";
const RED   = "#ef4444";

type Props = {
  valuation: PortfolioValuationRead;
  holdings: HoldingRead[];
};

type ChartRow    = { name: string; value: number };
type ProfitRow   = { name: string; profit: number; pct: number; hasAvgCost: boolean };

function fmt(v: number): string {
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildValueRows(valuation: PortfolioValuationRead): ChartRow[] {
  return valuation.assets
    .filter((a) => a.value !== null && Number(a.value) > 0)
    .map((a) => ({ name: a.symbol ?? `#${a.asset_id}`, value: Number(a.value) }))
    .sort((a, b) => b.value - a.value);
}

function buildProfitRows(
  valuation: PortfolioValuationRead,
  holdings: HoldingRead[],
): ProfitRow[] {
  const holdingByAsset = new Map(holdings.map((h) => [h.asset_id, h]));

  return valuation.assets
    .filter((a) => a.value !== null && !a.missing_price)
    .map((a) => {
      const holding = holdingByAsset.get(a.asset_id);
      const hasAvgCost = holding?.avg_cost !== null && holding?.avg_cost !== undefined;
      const costBasis = hasAvgCost
        ? Number(holding!.quantity) * Number(holding!.avg_cost)
        : null;
      const currentValue = Number(a.value);
      const profit = costBasis !== null ? currentValue - costBasis : 0;
      const pct = costBasis !== null && costBasis !== 0 ? (profit / costBasis) * 100 : 0;
      return {
        name: a.symbol ?? `#${a.asset_id}`,
        profit,
        pct,
        hasAvgCost: hasAvgCost && costBasis !== null,
      };
    })
    .filter((r) => r.hasAvgCost)
    .sort((a, b) => b.profit - a.profit);
}

export function PortfolioCharts({ valuation, holdings }: Props) {
  const valueRows  = buildValueRows(valuation);
  const profitRows = buildProfitRows(valuation, holdings);

  if (valueRows.length === 0) return null;

  const total      = valueRows.reduce((s, r) => s + r.value, 0);
  const totalProfit = profitRows.reduce((s, r) => s + r.profit, 0);

  return (
    <div className="charts-section">
      <div className="charts-grid">
        {/* ── Allocation donut ── */}
        <div className="chart-card">
          <p className="chart-title">Allocation</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={valueRows}
                dataKey="value"
                nameKey="name"
                innerRadius="50%"
                outerRadius="78%"
                paddingAngle={2}
              >
                {valueRows.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`$${fmt(Number(v))}`, "Value"]}
                contentStyle={{ fontSize: "0.82rem", borderRadius: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {valueRows.map((r, i) => (
              <span key={r.name} className="legend-item">
                <span className="legend-dot" style={{ background: PALETTE[i % PALETTE.length] }} />
                <span className="legend-name">{r.name}</span>
                <span className="legend-pct">{((r.value / total) * 100).toFixed(1)}%</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Value by asset ── */}
        <div className="chart-card">
          <p className="chart-title">Value by asset</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={valueRows} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                width={55}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`
                }
              />
              <Tooltip
                formatter={(v) => [`$${fmt(Number(v))}`, "Value"]}
                contentStyle={{ fontSize: "0.82rem", borderRadius: "8px" }}
                cursor={{ fill: "rgba(14,165,233,0.06)" }}
              />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={56}>
                {valueRows.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── P&L chart (only shown when avg_cost data exists) ── */}
      {profitRows.length > 0 && (
        <div className="chart-card chart-card--wide">
          <div className="chart-title-row">
            <p className="chart-title">Profit / Loss</p>
            <span className={`chart-pnl-badge ${totalProfit >= 0 ? "chart-pnl-badge--pos" : "chart-pnl-badge--neg"}`}>
              {totalProfit >= 0 ? "+" : ""}${fmt(totalProfit)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={profitRows} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                width={60}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : v <= -1000 ? `-$${(Math.abs(v) / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`
                }
              />
              <Tooltip
                formatter={(v, name) =>
                  name === "profit"
                    ? [`${Number(v) >= 0 ? "+" : ""}$${fmt(Number(v))}`, "P&L"]
                    : [`${Number(v) >= 0 ? "+" : ""}${fmt(Number(v))}%`, "Return"]
                }
                contentStyle={{ fontSize: "0.82rem", borderRadius: "8px" }}
                cursor={{ fill: "rgba(14,165,233,0.06)" }}
              />
              <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
              <Bar dataKey="profit" radius={[5, 5, 0, 0]} maxBarSize={56}>
                {profitRows.map((r, i) => (
                  <Cell key={i} fill={r.profit >= 0 ? GREEN : RED} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {profitRows.map((r) => (
              <span key={r.name} className="legend-item">
                <span className="legend-dot" style={{ background: r.profit >= 0 ? GREEN : RED }} />
                <span className="legend-name">{r.name}</span>
                <span className={r.profit >= 0 ? "legend-profit-pos" : "legend-profit-neg"}>
                  {r.profit >= 0 ? "+" : ""}${fmt(r.profit)}
                </span>
                <span className="legend-pct">
                  ({r.pct >= 0 ? "+" : ""}{r.pct.toFixed(1)}%)
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
