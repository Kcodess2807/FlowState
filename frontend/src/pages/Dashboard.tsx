import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IconActivity,
  IconArrowRight,
  IconCalendar,
  IconFlame,
} from "@tabler/icons-react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { DoodleUnderline } from "@/components/shared/DoodleUnderline";
import { ProblemCard } from "@/components/shared/ProblemCard";
import { SolutionCard } from "@/components/shared/SolutionCard";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/FadeIn";
import { GradientText } from "@/components/shared/GradientText";
import { useAuth } from "@/context/AuthContext";
import { ContributionHeatmap } from "@/components/shared/ContributionHeatmap";
import { getMyActivity, getProblems, getSolutions } from "@/lib/api";
import type { ActivitySummary } from "@/lib/api";
import type { Problem, Solution } from "@/types";
import { formatCount, todayLong } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [highlights, setHighlights] = useState<Solution[]>([]);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);

  useEffect(() => {
    getProblems().then(setProblems);
    getSolutions("Most Liked").then((s) => setHighlights(s.slice(0, 2)));
    getMyActivity()
      .then(setActivity)
      .catch(() => setActivity(null));
  }, []);

  const metrics = [
    {
      icon: IconActivity,
      label: "Contributions",
      value: activity?.total_contributions ?? 0,
    },
    {
      icon: IconFlame,
      label: "Current Streak",
      value: activity?.current_streak ?? 0,
    },
    {
      icon: IconCalendar,
      label: "Active Days",
      value: activity?.active_days ?? 0,
    },
  ];

  const firstName = user?.display_name?.split(" ")[0] ?? "there";
  const lastAttempted = problems[3];
  const recommended = problems.slice(0, 3);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Greeting */}
        <FadeIn>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Hey <GradientText>{firstName}</GradientText>{" "}
            <span className="inline-block">👋</span>
          </h1>
          <p className="mt-1 text-slate-500">{todayLong()}</p>
        </FadeIn>

        {/* Metrics */}
        <FadeIn delay={0.05}>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                  <m.icon size={24} />
                </span>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {formatCount(m.value)}
                  </div>
                  <div className="text-sm text-slate-500">{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {activity && (
          <FadeIn delay={0.08}>
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold text-slate-900">Your activity</h2>
                <p className="text-sm text-slate-500">
                  {formatCount(activity.total_contributions)} contributions in the
                  last year
                </p>
              </div>
              <div className="mt-6">
                <ContributionHeatmap summary={activity} />
              </div>
            </section>
          </FadeIn>
        )}

        {/* Continue where you left off */}
        {lastAttempted && (
          <FadeIn delay={0.1}>
            <section className="mt-12">
              <h2 className="relative inline-block text-lg font-bold text-slate-900">
                Continue where you left off
                <DoodleUnderline className="-bottom-2" />
              </h2>
              <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-6 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      {lastAttempted.title}
                    </span>
                    <DifficultyBadge difficulty={lastAttempted.difficulty} />
                  </div>
                  <p className="mt-1 max-w-xl text-sm text-slate-600">
                    {lastAttempted.summary}
                  </p>
                </div>
                <Button asChild>
                  <Link to={`/problems/${lastAttempted.slug}`}>
                    Resume
                    <IconArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </section>
          </FadeIn>
        )}

        {/* Recommended */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Recommended Problems
            </h2>
            <Link
              to="/problems"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all →
            </Link>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.06}>
                <ProblemCard problem={p} />
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Community highlights */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Community Highlights
            </h2>
            <Link
              to="/explore"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Explore →
            </Link>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {highlights.map((s, i) => (
              <FadeIn key={s.id} delay={i * 0.06}>
                <SolutionCard solution={s} />
              </FadeIn>
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
