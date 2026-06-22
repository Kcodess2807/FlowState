import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight01Icon,
  Idea01Icon,
  PencilEdit01Icon,
  PlayIcon,
  Share08Icon,
} from "hugeicons-react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/FadeIn";
import { Marquee } from "@/components/shared/Marquee";
import { GradientText } from "@/components/shared/GradientText";

const TOPICS = [
  "Consistent Hashing",
  "Rate Limiting",
  "WebSockets",
  "Replication",
  "CDN",
  "Caching",
  "Load Balancing",
  "Sharding",
  "Message Queues",
  "Pub/Sub",
  "Snapshots",
  "Tries",
];

const FEATURES = [
  {
    n: "01",
    icon: Idea01Icon,
    title: "Solve Problems",
    body: "Curated system design challenges — from URL shorteners to distributed caches — with real constraints and progressive hints.",
  },
  {
    n: "02",
    icon: PencilEdit01Icon,
    title: "Draw on Canvas",
    body: "Sketch architecture on an infinite, glowing dot-grid. Nodes, edges, and components — exactly how you'd whiteboard it in an interview.",
  },
  {
    n: "03",
    icon: Share08Icon,
    title: "Showcase Work",
    body: "Publish to the community feed, collect likes, and build a portfolio of designs that proves your skills to anyone.",
  },
];

const STEPS = [
  { n: "1", title: "Pick a problem", body: "Browse by difficulty and topic." },
  {
    n: "2",
    title: "Design on canvas",
    body: "Diagram your architecture live.",
  },
  { n: "3", title: "Share & get feedback", body: "Publish to the community." },
];

export default function Landing() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <HeroBackdrop />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1.25fr]">
            {/* Left: copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mono inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 text-xs text-ink-muted"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                LeetCode, but for system design
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-[4.25rem]"
              >
                System Design.
                <br />
                <GradientText>Practiced</GradientText>
                <span className="text-ink-faint"> &amp; </span>
                Showcased.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="mt-6 max-w-md text-lg text-ink-muted"
              >
                Practice real system design problems on an interactive canvas,
                then showcase your architecture to a community of engineers.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Button size="lg" asChild>
                  <Link to="/problems">
                    Start Practicing
                    <ArrowRight01Icon size={18} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/explore">
                    <PlayIcon size={15} />
                    Explore the community
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right: 3D diagram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <HeroDiagram />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- Topic marquee ---------------- */}
      <section className="border-y border-hairline bg-bg/60 py-4">
        <div className="mx-auto max-w-6xl">
          <Marquee>
            {TOPICS.map((t) => (
              <span
                key={t}
                className="mono rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 text-sm text-ink-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                {t}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ---------------- The Loop ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <FadeIn className="max-w-2xl">
          <span className="mono text-xs uppercase tracking-[0.2em] text-accent">
            The loop
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Solve. Draw. Showcase.
          </h2>
          <p className="mt-4 text-ink-muted">
            One tight loop that turns practice into a portfolio.
          </p>
        </FadeIn>

        <div className="mt-16 flex flex-col gap-px overflow-hidden rounded-lg border border-hairline bg-hairline">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div className="group grid items-center gap-6 bg-elevated p-7 sm:grid-cols-[auto_1fr_auto] sm:p-8">
                <span className="mono text-3xl font-semibold text-ink-faint transition-colors group-hover:text-accent">
                  {f.n}
                </span>
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface text-accent">
                    <f.icon size={20} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-muted">
                      {f.body}
                    </p>
                  </div>
                </div>
                <span className="hidden text-ink-faint transition-all group-hover:translate-x-1 group-hover:text-accent sm:block">
                  <ArrowRight01Icon size={20} />
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ---------------- Steps ---------------- */}
      <section className="border-y border-hairline bg-bg">
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <FadeIn>
            <span className="mono text-xs uppercase tracking-[0.2em] text-accent">
              Workflow
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              From prompt to portfolio in three steps
            </h2>
          </FadeIn>

          <div className="relative mt-16 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.1} className="relative">
                <div className="mono flex h-14 w-14 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-xl font-semibold text-accent">
                  {s.n}
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">{s.body}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-lg border border-hairline bg-elevated px-8 py-16 text-center">
            <div className="blueprint absolute inset-0" />
            <div className="absolute inset-0 noise opacity-[0.03]" />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Ready to design something?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-ink-muted">
                Jump into your first problem — no setup, just a canvas and a
                prompt.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link to="/problems">
                    Start Practicing
                    <ArrowRight01Icon size={18} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </SiteLayout>
  );
}

function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="blueprint absolute inset-0 opacity-60" />
      <div
        className="absolute inset-x-0 bottom-0 h-72 origin-bottom bg-dot-grid bg-dots opacity-40"
        style={{
          transform: "perspective(700px) rotateX(62deg) scale(1.6)",
          maskImage: "linear-gradient(to top, #000, transparent)",
          WebkitMaskImage: "linear-gradient(to top, #000, transparent)",
        }}
      />
      <div className="absolute inset-0 noise opacity-[0.03]" />
    </div>
  );
}

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  active?: boolean;
}

const NODE_W = 124;
const NODE_H = 50;
const NODES: Node[] = [
  { id: "client", x: 36, y: 150, label: "Client" },
  { id: "api", x: 232, y: 150, label: "API Gateway" },
  { id: "cache", x: 446, y: 56, label: "Cache", active: true },
  { id: "db", x: 446, y: 246, label: "Database" },
  { id: "kgs", x: 612, y: 150, label: "Key Gen" },
];

function nodeCenter(id: string) {
  const n = NODES.find((x) => x.id === id)!;
  return { x: n.x + NODE_W / 2, y: n.y + NODE_H / 2 };
}

const EDGES: [string, string][] = [
  ["client", "api"],
  ["api", "cache"],
  ["api", "db"],
  ["cache", "kgs"],
  ["db", "kgs"],
];

/** Tier-1 hero centerpiece: a tilted 3D plane of glowing glass nodes wired by
 *  animated edges with data-packet dots. Subtle mouse-parallax. */
function HeroDiagram() {
  const planeRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = planeRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - 0.5;
    const my = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${14 - my * 8}deg) rotateY(${mx * 12}deg) translateZ(0)`;
  };

  const reset = () => {
    if (planeRef.current)
      planeRef.current.style.transform = "rotateX(14deg) rotateY(0deg)";
  };

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="relative mx-auto w-full max-w-2xl"
      style={{ perspective: "1200px" }}
    >
      <Telemetry className="left-2 top-2" label="p99 < 100ms" dot />
      <Telemetry className="bottom-6 left-6" label="99.99% uptime" />

      <div
        ref={planeRef}
        className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{ transform: "rotateX(14deg)" }}
      >
        <svg viewBox="0 0 760 360" className="h-auto w-full overflow-visible">
          <defs>
            <marker
              id="hero-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10z" fill="rgb(var(--ink) / 0.35)" />
            </marker>
          </defs>

          {EDGES.map(([a, b], i) => {
            const p1 = nodeCenter(a);
            const p2 = nodeCenter(b);
            const d = `M${p1.x} ${p1.y} C ${(p1.x + p2.x) / 2} ${p1.y}, ${
              (p1.x + p2.x) / 2
            } ${p2.y}, ${p2.x} ${p2.y}`;
            const id = `edge-${i}`;
            return (
              <g key={id}>
                <path
                  id={id}
                  d={d}
                  fill="none"
                  stroke="rgb(var(--ink) / 0.14)"
                  strokeWidth={1.5}
                />
                <path
                  d={d}
                  fill="none"
                  stroke="rgb(var(--accent))"
                  strokeWidth={1.5}
                  strokeDasharray="2 9"
                  opacity={0.6}
                  className="animate-dash"
                />
                <circle r={3} fill="rgb(var(--accent))">
                  <animateMotion
                    dur="2.4s"
                    begin={`${i * 0.35}s`}
                    repeatCount="indefinite"
                  >
                    <mpath href={`#${id}`} />
                  </animateMotion>
                </circle>
              </g>
            );
          })}

          {NODES.map((n) => (
            <foreignObject
              key={n.id}
              x={n.x}
              y={n.y}
              width={NODE_W}
              height={NODE_H}
            >
              <div
                className={
                  "flex h-full w-full items-center gap-2 rounded-lg border bg-elevated px-3 " +
                  (n.active
                    ? "border-accent/50 shadow-card-lg"
                    : "border-hairline-strong shadow-card")
                }
              >
                <span
                  className={
                    "h-1.5 w-1.5 shrink-0 rounded-full " +
                    (n.active ? "animate-soft-pulse bg-accent" : "bg-ink-faint")
                  }
                />
                <span className="mono truncate text-[12px] font-medium text-ink">
                  {n.label}
                </span>
              </div>
            </foreignObject>
          ))}
        </svg>
      </div>
    </div>
  );
}

function Telemetry({
  label,
  className,
  dot,
}: {
  label: string;
  className?: string;
  dot?: boolean;
}) {
  return (
    <div
      className={`absolute z-10 inline-flex animate-float items-center gap-1.5 rounded-md border border-hairline bg-elevated/80 px-2.5 py-1 text-[11px] text-ink-muted shadow-card backdrop-blur-sm mono ${className ?? ""}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
      {label}
    </div>
  );
}
