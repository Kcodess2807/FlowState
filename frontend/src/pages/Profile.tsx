import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  IconActivity,
  IconBrandGithub,
  IconCalendar,
  IconCalendarStats,
  IconFlame,
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
import { ContributionHeatmap } from "@/components/shared/ContributionHeatmap";
import { useAuth } from "@/context/AuthContext";
import {
  getMyActivity,
  getProblems,
  getProfile,
  getSolutionsByAuthor,
} from "@/lib/api";
import type { ActivitySummary } from "@/lib/api";
import type { Problem, Profile as ProfileType, Solution } from "@/types";
import { formatCount, formatDate, usernameFromName } from "@/lib/utils";

const avatarFor = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    seed,
  )}&backgroundColor=ccfbf1`;

export default function Profile() {
  const { username = "" } = useParams();
  const { user, loading: authLoading } = useAuth();
  const isSelf = !!user && usernameFromName(user.display_name) === username;

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [saved, setSaved] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setLoading(true);
    setActivity(null);

    async function load() {
      if (isSelf && user) {
        const self: ProfileType = {
          username,
          displayName: user.display_name,
          bio: "Building system-design muscle on FlowState.",
          avatarUrl: avatarFor(user.email),
          githubUrl: "",
          joinedAt: user.created_at,
          stats: { problemsSolved: 0, solutionsShared: 0, likesReceived: 0 },
          savedProblems: [],
        };
        const summary = await getMyActivity().catch(() => null);
        const sols = await getSolutionsByAuthor(username).catch(() => []);
        if (!active) return;
        setProfile(self);
        setActivity(summary);
        setSolutions(sols);
        setSaved([]);
      } else {
        const [p, sols, problems] = await Promise.all([
          getProfile(username),
          getSolutionsByAuthor(username),
          getProblems(),
        ]);
        if (!active) return;
        setProfile(p ?? null);
        setSolutions(sols);
        setSaved(
          p ? problems.filter((pr) => p.savedProblems.includes(pr.slug)) : [],
        );
      }
      if (active) setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [username, isSelf, user, authLoading]);

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

  const stats =
    isSelf && activity
      ? [
          { icon: IconFlame, label: "Current Streak", value: activity.current_streak },
          { icon: IconCalendarStats, label: "Longest Streak", value: activity.longest_streak },
          { icon: IconActivity, label: "Contributions", value: activity.total_contributions },
          { icon: IconCalendar, label: "Active Days", value: activity.active_days },
        ]
      : [
          { icon: IconTrophy, label: "Problems Solved", value: profile.stats.problemsSolved },
          { icon: IconShare3, label: "Solutions Shared", value: profile.stats.solutionsShared },
          { icon: IconHeart, label: "Likes Received", value: profile.stats.likesReceived },
        ];

  return (
    <SiteLayout>
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {profile.displayName}
                </h1>
                {isSelf && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    You
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">@{profile.username}</p>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                {profile.bio}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-brand-700"
                  >
                    <IconBrandGithub size={16} />
                    GitHub
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar size={16} />
                  Joined {formatDate(profile.joinedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-2xl sm:grid-cols-4">
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

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {isSelf && activity && (
          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="relative inline-block text-lg font-bold text-slate-900">
                Activity
                <DoodleUnderline className="-bottom-2" />
              </h2>
              <p className="text-sm text-slate-500">
                {formatCount(activity.total_contributions)} contributions in the
                last year
              </p>
            </div>
            <div className="mt-6">
              <ContributionHeatmap summary={activity} />
            </div>
          </section>
        )}

        <Tabs defaultValue="solutions">
          <TabsList>
            <TabsTrigger value="solutions">
              {isSelf ? "My" : ""} Solutions ({solutions.length})
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
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
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
