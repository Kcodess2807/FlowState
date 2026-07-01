import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  DashboardSquare01Icon,
  Logout01Icon,
  Menu01Icon,
  Cancel01Icon,
} from "hugeicons-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn, usernameFromName } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/problems", label: "Problems" },
  { to: "/explore", label: "Explore" },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-ink after:absolute after:inset-x-3 after:-bottom-px after:h-px after:bg-accent"
                      : "text-ink-muted hover:text-ink",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <DashboardSquare01Icon size={18} />
                  Dashboard
                </Link>
              </Button>
              <Link to={`/profile/${usernameFromName(user.display_name)}`}>
                <Avatar
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}&backgroundColor=e7e3fb`}
                  alt={user.display_name}
                  size={34}
                  className="hover-lift"
                />
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                <Logout01Icon size={18} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/problems">Start Practicing</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-md p-2 text-ink-muted hover:bg-ink/[0.06]"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <Cancel01Icon size={22} /> : <Menu01Icon size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-hairline bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.06]"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-hairline pt-3">
              {isAuthenticated && user ? (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/problems" onClick={() => setOpen(false)}>
                      Start Practicing
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
