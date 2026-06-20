import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconDeviceFloppy,
  IconLoader2,
  IconLock,
} from "@tabler/icons-react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    getProblem(slug)
      .then((p) => {
        if (!active) return;
        setProblem(p);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setProblem(null);
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
          <IconLoader2 className="animate-spin text-accent" size={28} />
        </div>
      </SiteLayout>
    );
  }

  if (!problem) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-ink">Problem not found</h1>
          <p className="mt-2 text-ink-muted">
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
      <div className="border-b border-hairline bg-surface/40">
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
        <div className="border-hairline px-4 py-8 sm:px-6 lg:border-r lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            {!problem.is_published && <Badge variant="hard">Draft</Badge>}
            {problem.topics.map((t) => (
              <Badge key={t.id} variant="neutral">
                {t.name}
              </Badge>
            ))}
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
            {problem.title}
          </h1>

          <section className="mt-7">
            <h2 className="mono text-xs uppercase tracking-[0.18em] text-accent">
              Problem
            </h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-muted">
              {problem.description}
            </p>
          </section>

          {problem.rubric.length > 0 && (
            <section className="mt-8">
              <h2 className="mono text-xs uppercase tracking-[0.18em] text-accent">
                You'll be graded on
              </h2>
              <ul className="mt-3 space-y-2.5">
                {problem.rubric.map((c) => (
                  <li
                    key={c.key}
                    className="rounded-lg border border-hairline bg-elevated p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-ink">{c.title}</span>
                      <span className="mono shrink-0 rounded-full border border-hairline bg-surface px-2 py-0.5 text-[11px] text-ink-muted">
                        {c.weight}%
                      </span>
                    </div>
                    {c.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                        {c.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div
          id="flowstate-canvas"
          className="flex min-h-[60vh] flex-col bg-bg lg:min-h-[calc(100vh-8.5rem)]"
        >
          <div className="relative flex min-h-0 flex-1 flex-col">
            {authLoading ? (
              <CanvasMessage>
                <IconLoader2 className="animate-spin text-accent" size={26} />
              </CanvasMessage>
            ) : !isAuthenticated ? (
              <CanvasGate redirectFrom={location.pathname} />
            ) : canvasError ? (
              <CanvasMessage>
                <IconAlertTriangle className="text-rose-500" size={26} />
                <p className="mt-3 font-semibold text-ink-muted">
                  Canvas unavailable
                </p>
                <p className="mt-1 max-w-xs text-sm text-ink-muted">
                  {canvasError}
                </p>
              </CanvasMessage>
            ) : !canvasId ? (
              <CanvasMessage>
                <IconLoader2 className="animate-spin text-accent" size={26} />
                <p className="mt-3 text-sm text-ink-muted">Opening canvas…</p>
              </CanvasMessage>
            ) : (
              <FlowCanvas canvasId={canvasId} />
            )}
          </div>

          <div className="flex items-center justify-between border-t border-hairline bg-surface/40 px-4 py-3">
            <span className="mono inline-flex items-center gap-1.5 text-xs text-ink-faint">
              <IconDeviceFloppy size={16} className="text-accent" />
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
      <div className="max-w-sm rounded-2xl border border-hairline bg-elevated/90 p-8 text-center backdrop-blur">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent shadow-glow-sm">
          <IconLock size={22} />
        </span>
        <h3 className="mt-4 font-bold text-ink">
          Sign in to use the live canvas
        </h3>
        <p className="mt-1.5 text-sm text-ink-muted">
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
