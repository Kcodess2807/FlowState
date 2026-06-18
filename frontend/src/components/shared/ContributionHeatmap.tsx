import { useMemo } from "react";
import type { ActivitySummary } from "@/lib/api";

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT = 28;
const TOP = 16;
const DOW = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const LEVELS = ["#1b212b", "#173f3b", "#1c6f66", "#23a596", "#2dd4bf"];

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function key(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function level(count: number): number {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

interface Cell {
  x: number;
  y: number;
  date: Date;
  count: number;
}

export function ContributionHeatmap({
  summary,
}: {
  summary: ActivitySummary;
}) {
  const { cells, monthLabels, width, height } = useMemo(() => {
    const counts = new Map(summary.daily.map((d) => [d.date, d.count]));
    const from = parseDate(summary.from_date);
    const to = parseDate(summary.to_date);

    // Start the grid on the Sunday on/before from_date.
    const start = new Date(from);
    start.setDate(start.getDate() - start.getDay());

    const out: Cell[] = [];
    const months: { x: number; label: string }[] = [];
    let lastMonth = -1;
    let week = 0;

    for (let d = new Date(start); d <= to; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0) week = Math.round((d.getTime() - start.getTime()) / 6.048e8);
      if (d >= from) {
        const cur = new Date(d);
        out.push({
          x: week * STEP,
          y: day * STEP,
          date: cur,
          count: counts.get(key(cur)) ?? 0,
        });
        if (day === 0 && cur.getMonth() !== lastMonth) {
          lastMonth = cur.getMonth();
          months.push({ x: week * STEP, label: MONTHS[cur.getMonth()] });
        }
      }
    }

    const weeks = Math.ceil((to.getTime() - start.getTime()) / 6.048e8) + 1;
    return {
      cells: out,
      monthLabels: months,
      width: LEFT + weeks * STEP,
      height: TOP + 7 * STEP,
    };
  }, [summary]);

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="block">
        {monthLabels.map((m, i) => (
          <text
            key={`${m.label}-${i}`}
            x={LEFT + m.x}
            y={11}
            className="fill-ink-faint"
            fontSize={10}
          >
            {m.label}
          </text>
        ))}
        {DOW.map((label, i) =>
          label ? (
            <text
              key={label}
              x={0}
              y={TOP + i * STEP + CELL - 2}
              className="fill-ink-faint"
              fontSize={10}
            >
              {label}
            </text>
          ) : null,
        )}
        {cells.map((c) => (
          <rect
            key={key(c.date)}
            x={LEFT + c.x}
            y={TOP + c.y}
            width={CELL}
            height={CELL}
            rx={2.5}
            fill={LEVELS[level(c.count)]}
          >
            <title>
              {c.count} contribution{c.count === 1 ? "" : "s"} on{" "}
              {c.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </title>
          </rect>
        ))}
      </svg>

      <div className="mt-2 flex items-center justify-end gap-1.5 pr-1 text-xs text-ink-faint">
        <span>Less</span>
        {LEVELS.map((c) => (
          <span
            key={c}
            className="inline-block h-3 w-3 rounded-[3px]"
            style={{ backgroundColor: c }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
