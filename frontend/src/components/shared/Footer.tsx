import { Link } from "react-router-dom";
import { IconBrandGithub } from "@tabler/icons-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Logo />
          <p className="text-sm text-ink-muted">
            System design, practiced and showcased.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-ink-muted">
          <Link to="/problems" className="hover:text-accent">
            Problems
          </Link>
          <Link to="/explore" className="hover:text-accent">
            Explore
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-accent"
          >
            <IconBrandGithub size={18} />
            GitHub
          </a>
        </div>
      </div>
      <div className="mono border-t border-hairline py-4 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} FlowState — built for practicing system design.
      </div>
    </footer>
  );
}
