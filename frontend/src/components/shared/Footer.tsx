import { Link } from "react-router-dom";
import { IconBrandGithub } from "@tabler/icons-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Logo />
          <p className="text-sm text-slate-500">
            System design, practiced and showcased.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <Link to="/problems" className="hover:text-brand-700">
            Problems
          </Link>
          <Link to="/explore" className="hover:text-brand-700">
            Explore
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-brand-700"
          >
            <IconBrandGithub size={18} />
            GitHub
          </a>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} FlowState. Built for practicing system design.
      </div>
    </footer>
  );
}
