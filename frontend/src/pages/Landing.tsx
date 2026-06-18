import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconBolt,
  IconChartDots3,
  IconPencil,
  IconPlayerPlayFilled,
  IconSparkles,
  IconTrophy,
} from "@tabler/icons-react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { Button } from "@/components/ui/button";
import { DotGrid } from "@/components/shared/DotGrid";
import { DoodleUnderline } from "@/components/shared/DoodleUnderline";
import { FadeIn } from "@/components/shared/FadeIn";
import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { GradientText } from "@/components/shared/GradientText";
import { Spotlight } from "@/components/shared/Spotlight";
import { CountUp } from "@/components/shared/CountUp";
import { Marquee } from "@/components/shared/Marquee";

const FEATURES = [
  {
    icon: IconChartDots3,
    title: "Solve Problems",
    body: "Curated system design challenges — from URL shorteners to distributed caches — with real constraints and progressive hints.",
    accent: "from-brand-500/10 to-cyan-400/10",
  },
  {
    icon: IconPencil,
    title: "Draw on Canvas",
    body: "Sketch architecture on an infinite dot-grid. Boxes, arrows, and components — exactly how you'd whiteboard it in an interview.",
    accent: "from-cyan-400/10 to-brand-500/10",
  },
  {
    icon: IconTrophy,
    title: "Showcase Work",
    body: "Publish to the community feed, collect likes, and build a portfolio of designs that proves your skills to anyone.",
    accent: "from-brand-400/10 to-teal-300/10",
  },
];

const STEPS = [
  { n: "1", title: "Pick a problem", body: "Browse by difficulty and topic." },
  { n: "2", title: "Design on canvas", body: "Diagram your architecture live." },
  { n: "3", title: "Share & get feedback", body: "Publish to the community." },
];

const STATS = [
  { value: 60, suffix: "+", label: "Design problems" },
  { value: 2400, suffix: "+", label: "Solutions shared" },
  { value: 5200, suffix: "+", label: "Engineers practicing" },
  { value: 98, suffix: "%", label: "Would recommend" },
];

const TOPICS = [
  "Caching",
  "Load Balancing",
  "Sharding",
  "Message Queues",
  "Consistent Hashing",
  "Rate Limiting",
  "WebSockets",
  "Replication",
  "CDN",
  "Pub/Sub",
  "Snapshots",
  "Tries",
];

export default function Landing() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            LeetCode, but for system design
            <IconSparkles size={15} className="text-cyan-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-7xl"
          >
            System Design.
            <br className="hidden sm:block" />{" "}
            <span className="relative inline-block">
              <GradientText animate>Practiced</GradientText>
              <DoodleUnderline animate />
            </span>{" "}
            <span className="text-slate-900">&amp; Showcased.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mx-auto mt-6 max-w-xl text-lg text-slate-600"
          >
            Practice real system design problems on an interactive canvas, then
            showcase your architecture to a community of engineers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" asChild>
              <Link to="/problems">
                Start Practicing
                <IconArrowRight size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/explore">
                <IconPlayerPlayFilled size={15} />
                Explore the community
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.24, ease: "easeOut" }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <FloatingPill className="-left-3 top-10 sm:-left-8" delay="0s">
              <IconBolt size={13} className="text-cyan-500" /> p99 &lt; 100ms
            </FloatingPill>
            <FloatingPill className="-right-3 top-24 sm:-right-10" delay="-2s">
              10M daily users
            </FloatingPill>
            <FloatingPill className="bottom-8 left-6 sm:left-2" delay="-4s">
              99.99% uptime
            </FloatingPill>

            <HeroCanvasPreview />
          </motion.div>

          <FadeIn delay={0.1}>
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/80 px-4 py-5 backdrop-blur">
                  <div className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    <GradientText>
                      <CountUp value={s.value} suffix={s.suffix} />
                    </GradientText>
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Topics marquee */}
      <section className="border-y border-slate-200 bg-white/60 py-5">
        <div className="mx-auto max-w-6xl">
          <Marquee>
            {TOPICS.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm"
              >
                {t}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-brand-600">
            The loop
          </span>
          <h2 className="relative mt-3 inline-block text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to get good
            <DoodleUnderline className="-bottom-3" />
          </h2>
          <p className="mt-6 text-slate-600">
            Three tools, one tight loop: solve, draw, showcase.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <Spotlight className="h-full">
                <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                      <f.icon size={24} />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {f.body}
                    </p>
                  </div>
                </div>
              </Spotlight>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <FadeIn className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              From prompt to portfolio in three steps
            </h2>
          </FadeIn>

          <div className="relative mt-20 grid gap-12 md:grid-cols-3">
            <svg
              aria-hidden="true"
              viewBox="0 0 800 40"
              preserveAspectRatio="none"
              className="pointer-events-none absolute left-0 top-8 hidden h-10 w-full text-brand-300 md:block"
              fill="none"
            >
              <path
                d="M130 20C250 4 320 36 410 20C500 4 560 36 670 20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="2 9"
                className="animate-dash"
              />
            </svg>

            {STEPS.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.1} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-2xl font-extrabold text-white shadow-glow">
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{s.body}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient bg-[length:200%_auto] px-8 py-16 text-center shadow-float animate-gradient-pan">
            <div className="pointer-events-none absolute inset-0 bg-line-grid bg-lines opacity-10" />
            <div className="pointer-events-none absolute inset-0 noise opacity-[0.06]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to design something?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-brand-50">
              Jump into your first problem — no setup, just a canvas and a
              prompt.
            </p>
            <div className="relative mt-8">
              <Button
                size="lg"
                className="bg-white !bg-none text-brand-700 shadow-lg hover:!bg-white hover:text-brand-800"
                asChild
              >
                <Link to="/problems">
                  Start Practicing
                  <IconArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>
    </SiteLayout>
  );
}

function FloatingPill({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay: string;
}) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={`absolute z-10 hidden animate-float items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-float sm:inline-flex ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function HeroCanvasPreview() {
  const nodes = [
    { x: 40, y: 120, label: "Client", color: "#0d9488" },
    { x: 230, y: 120, label: "API Gateway", color: "#0d9488" },
    { x: 430, y: 50, label: "Cache", color: "#22d3ee" },
    { x: 430, y: 190, label: "Database", color: "#0d9488" },
    { x: 630, y: 120, label: "Key Gen", color: "#22d3ee" },
  ];
  const edges = [
    "M160 148H230",
    "M350 140C390 110 400 96 430 84",
    "M350 156C390 186 400 200 430 212",
    "M550 120C590 100 600 96 630 130",
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-float">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 backdrop-blur">
        <span className="h-3 w-3 rounded-full bg-rose-300" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-300" />
        <span className="ml-3 text-xs font-medium text-slate-400">
          design-a-url-shortener · canvas
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-brand-600">
          <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-brand-500" />
          live
        </span>
      </div>
      <DotGrid className="p-6 sm:p-8">
        <svg viewBox="0 0 800 280" className="h-auto w-full" fill="none">
          {edges.map((d, i) => (
            <g key={d}>
              <path d={d} stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
              <path
                d={d}
                stroke="#22d3ee"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="6 10"
                className="animate-dash"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            </g>
          ))}
          {nodes.map((box, i) => (
            <g key={box.label} className="animate-float" style={{ animationDelay: `${-i}s` }}>
              <rect
                x={box.x}
                y={box.y}
                width="120"
                height="56"
                rx="12"
                fill="white"
                stroke={box.color}
                strokeWidth="2.5"
              />
              <circle cx={box.x + 16} cy={box.y + 28} r="4" fill={box.color}>
                <animate
                  attributeName="opacity"
                  values="1;0.3;1"
                  dur="2.4s"
                  begin={`${i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x={box.x + 64}
                y={box.y + 33}
                textAnchor="middle"
                className="fill-slate-700 text-[14px] font-semibold"
              >
                {box.label}
              </text>
            </g>
          ))}
        </svg>
      </DotGrid>
    </div>
  );
}
