import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { Button } from "@/components/ui/button";
import { DoodleUnderline } from "@/components/shared/DoodleUnderline";

export default function NotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
        <span className="relative font-display text-7xl font-bold tracking-tight text-accent">
          404
          <DoodleUnderline className="-bottom-3" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
          This page wandered off the canvas
        </h1>
        <p className="mt-2 text-ink-muted">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Button className="mt-7" asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}
