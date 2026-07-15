import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  description: string;
}

function StatCard({ label, value, href, description }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-6 transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-900/70"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-3 font-heading text-3xl font-semibold tracking-tight text-zinc-100">
        {value}
      </p>
      <p className="mt-1.5 text-[13px] text-zinc-600 transition-colors group-hover:text-zinc-500">
        {description}
      </p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Lấy số liệu thống kê song song để tối ưu thời gian tải
  const [projectsRes, skillsRes, userSkillsRes, unreadRes] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("skills").select("*", { count: "exact", head: true }),
    supabase.from("user_skills").select("*", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread"),
  ]);

  const stats = {
    projects: projectsRes.count ?? 0,
    skills: skillsRes.count ?? 0,
    userSkills: userSkillsRes.count ?? 0,
    unread: unreadRes.count ?? 0,
  };

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Overview of your portfolio content.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={stats.projects}
          href="/admin/projects"
          description="Total projects in portfolio"
        />
        <StatCard
          label="Skills Library"
          value={stats.skills}
          href="/admin/skills"
          description="Total skills in library store"
        />
        <StatCard
          label="My Skills"
          value={stats.userSkills}
          href="/admin/skills"
          description="Skills active on portfolio"
        />
        <StatCard
          label="Unread Messages"
          value={stats.unread}
          href="/admin/messages"
          description="New messages awaiting review"
        />
      </div>
    </div>
  );
}
