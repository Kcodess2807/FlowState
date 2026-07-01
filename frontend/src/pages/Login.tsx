import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircleIcon, Loading03Icon } from "hugeicons-react";
import { Logo } from "@/components/shared/Logo";
import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { DoodleUnderline } from "@/components/shared/DoodleUnderline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

type Mode = "login" | "register";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <AuroraBackground />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-lg border border-hairline bg-elevated p-8 shadow-card-lg">
          <div className="text-center">
            <h1 className="relative inline-block font-display text-2xl font-semibold tracking-tight text-ink">
              {mode === "login" ? "Welcome back" : "Create your account"}
              <DoodleUnderline className="-bottom-2" />
            </h1>
            <p className="mt-4 text-sm text-ink-muted">
              System design, practiced and showcased.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircleIcon size={18} className="mt-px shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <Field label="Display name">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ada Okeke"
                  required
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loading03Icon size={18} className="animate-spin" />
                  Please wait…
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-xs uppercase tracking-wide text-ink-faint">
              or
            </span>
            <span className="h-px flex-1 bg-hairline" />
          </div>
          <Button variant="outline" size="lg" className="mt-4 w-full" disabled>
            Continue with GitHub (coming soon)
          </Button>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {mode === "login" ? "New to FlowState?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="font-semibold text-accent hover:text-accent"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-ink-faint">
          <Link to="/" className="hover:text-ink-muted">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
