import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconDeviceFloppy,
  IconLoader2,
  IconLock,
  IconUsers,
} from "@tabler/icons-react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { FlowCanvas } from "@/components/canvas/FlowCanvas";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  getOrCreateProblemCanvas,
  getProblem,
  submitSolution,
} from "@/lib/api";
import type { Problem } from "@/types";
import { formatCount } from "@/lib/utils";

export default function ProblemDetail() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProblem(slug).then((p) => {
      if (!active) return;
      setProblem(p ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!problem || !isAuthenticated) return;
    let active = true;
    setCanvasError(null);
    setCanvasId(null);
    getOrCreateProblemCanvas(problem.title)
      .then((c) => {
        if (active) setCanvasId(c.id);
      })
      .catch((err) => {
        if (!active) return;
        setCanvasError(
          err instanceof ApiError
            ? err.message
            : "Could not open the canvas. Is the backend running?",
        );
      });
    return () => {
      active = false;
    };
  }, [problem, isAuthenticated]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitSolution(slug);
      // TODO: toast / navigate to published solution
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SiteLayout showFooter={false}>
        <div className="flex min-h-[70vh] items-center justify-center">
          <IconLoader2 className="animate-spin text-brand-500" size={28} />
        </div>
      </SiteLayout>
    );
  }

  if (!problem) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Problem not found</h1>
          <p className="mt-2 text-slate-500">
            We couldn't find a problem with that slug.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/problems">Back to Problems</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout showFooter={false}>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/problems">
              <IconArrowLeft size={16} />
              Problems
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[2fr_3fr]">
        <div className="border-slate-200 px-4 py-8 sm:px-6 lg:border-r lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
              <IconUsers size={15} />
              {formatCount(problem.solveCount)} solved
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
            {problem.title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {problem.tags.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
          </div>

          <section className="mt-7">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Problem
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">
              {problem.statement}
            </p>
          </section>

          <section className="mt-7">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Constraints
            </h2>
            <ul className="mt-3 space-y-2">
              {problem.constraints.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-7">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
              Hints
            </h2>
            <Accordion
              items={problem.hints.map((h, i) => ({
                id: `hint-${i}`,
                title: `Hint ${i + 1}`,
                content: h,
              }))}
            />
          </section>
        </div>

        <div
          id="flowstate-canvas"
          className="flex min-h-[60vh] flex-col bg-slate-50 lg:min-h-[calc(100vh-8.5rem)]"
        >
          <div className="relative flex min-h-0 flex-1 flex-col">
            {authLoading ? (
              <CanvasMessage>
                <IconLoader2 className="animate-spin text-brand-500" size={26} />
              </CanvasMessage>
            ) : !isAuthenticated ? (
              <CanvasGate redirectFrom={location.pathname} />
            ) : canvasError ? (
              <CanvasMessage>
                <IconAlertTriangle className="text-rose-500" size={26} />
                <p className="mt-3 font-semibold text-slate-700">
                  Canvas unavailable
                </p>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  {canvasError}
                </p>
              </CanvasMessage>
            ) : !canvasId ? (
              <CanvasMessage>
                <IconLoader2 className="animate-spin text-brand-500" size={26} />
                <p className="mt-3 text-sm text-slate-500">Opening canvas…</p>
              </CanvasMessage>
            ) : (
              <FlowCanvas canvasId={canvasId} />
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
              <IconDeviceFloppy size={16} className="text-brand-500" />
              Changes auto-save in real time
            </span>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Solution"
              )}
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function CanvasMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      {children}
    </div>
  );
}

function CanvasGate({ redirectFrom }: { redirectFrom: string }) {
  return (
    <div className="surface-dots flex flex-1 items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-card backdrop-blur">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
          <IconLock size={22} />
        </span>
        <h3 className="mt-4 font-bold text-slate-900">
          Sign in to use the live canvas
        </h3>
        <p className="mt-1.5 text-sm text-slate-500">
          The drawing surface is backed by FlowState's realtime engine —
          operations persist and sync across collaborators.
        </p>
        <Button className="mt-5" asChild>
          <Link to="/login" state={{ from: redirectFrom }}>
            Sign in to start drawing
          </Link>
        </Button>
      </div>
    </div>
  );
}
