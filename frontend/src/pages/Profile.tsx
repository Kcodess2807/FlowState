import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  IconBrandGithub,
  IconCalendar,
  IconHeart,
  IconLoader2,
  IconShare3,
  IconTrophy,
} from "@tabler/icons-react";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SolutionCard } from "@/components/shared/SolutionCard";
import { DoodleUnderline } from "@/components/shared/DoodleUnderline";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { getProfile, getProblems, getSolutionsByAuthor } from "@/lib/api";
import type { Problem, Profile as ProfileType, Solution } from "@/types";
import { formatCount, formatDate } from "@/lib/utils";

export default function Profile() {
  const { username = "" } = useParams();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [saved, setSaved] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      getProfile(username),
      getSolutionsByAuthor(username),
      getProblems(),
    ]).then(([p, sols, problems]) => {
      if (!active) return;
      setProfile(p ?? null);
      setSolutions(sols);
      if (p) {
        setSaved(problems.filter((pr) => p.savedProblems.includes(pr.slug)));
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [username]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <IconLoader2 className="animate-spin text-brand-500" size={28} />
        </div>
      </SiteLayout>
    );
  }

  if (!profile) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900">User not found</h1>
          <p className="mt-2 text-slate-500">
            No profile exists for “{username}”.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const stats = [
    {
      icon: IconTrophy,
      label: "Problems Solved",
      value: profile.stats.problemsSolved,
    },
    {
      icon: IconShare3,
      label: "Solutions Shared",
      value: profile.stats.solutionsShared,
    },
    {
      icon: IconHeart,
      label: "Likes Received",
      value: profile.stats.likesReceived,
    },
  ];

  return (
    <SiteLayout>
      {/* Cover */}
      <div className="border-b border-slate-200 bg-gradient-to-b from-brand-50/70 to-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar
              src={profile.avatarUrl}
              alt={profile.displayName}
              size={88}
              className="shadow-card"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {profile.displayName}
              </h1>
              <p className="text-sm text-slate-500">@{profile.username}</p>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                {profile.bio}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-brand-700"
                >
                  <IconBrandGithub size={16} />
                  GitHub
                </a>
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar size={16} />
                  Joined {formatDate(profile.joinedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-lg">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card"
              >
                <s.icon size={20} className="mx-auto text-brand-500" />
                <div className="mt-2 text-xl font-extrabold text-slate-900">
                  {formatCount(s.value)}
                </div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Tabs defaultValue="solutions">
          <TabsList>
            <TabsTrigger value="solutions">
              My Solutions ({solutions.length})
            </TabsTrigger>
            <TabsTrigger value="saved">
              Saved Problems ({saved.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solutions">
            {solutions.length === 0 ? (
              <EmptyTab
                title="No solutions yet"
                body="Solve a problem and publish it to see it here."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {solutions.map((s) => (
                  <SolutionCard key={s.id} solution={s} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {saved.length === 0 ? (
              <EmptyTab
                title="Nothing saved"
                body="Bookmark problems to revisit them later."
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card divide-y divide-slate-100">
                {saved.map((p) => (
                  <Link
                    key={p.id}
                    to={`/problems/${p.slug}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-brand-50/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="truncate font-semibold text-slate-900">
                          {p.title}
                        </span>
                        <DifficultyBadge difficulty={p.difficulty} />
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {p.summary}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-brand-600">
                      Solve →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}

function EmptyTab({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="relative inline-block text-lg font-semibold text-slate-700">
        {title}
        <DoodleUnderline className="-bottom-2 text-brand-300" />
      </span>
      <p className="mt-3 text-sm text-slate-500">{body}</p>
    </div>
  );
}
