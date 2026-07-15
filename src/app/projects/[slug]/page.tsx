import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Skill } from "@/types/database";
import Navbar from "@/components/Navbar";
import Footer from "@/components/portfolio/Footer";
import { marked } from "marked";

interface ProjectWithSkills {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  created_at: string;
  project_skills: {
    skills: Skill | null;
  }[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Bộ phân tích cú pháp Markdown siêu nhẹ nâng cao (Hỗ trợ HTML tag thô copy từ GitHub như img, p, bold...)
function parseMarkdown(md: string): string {
  if (!md) return "";
  return marked.parseSync(md);
}

// Markdown mẫu mặc định khi database chưa có content
const defaultMarkdownTemplate = (title: string, description: string, githubUrl: string, slug: string) => `# Giới thiệu dự án
${description}

## Kiến trúc giải pháp
Hệ thống được phát triển tuân thủ kiến trúc phân lớp (layered architecture), tách biệt giao diện Client (React) và cơ sở dữ liệu Supabase thông qua RESTful APIs & WebSockets thời gian thực.

## Hướng dẫn cài đặt
Khởi chạy dự án local với các lệnh sau:
\`\`\`bash
$ git clone ${githubUrl || "https://github.com/example/repo"}
$ cd ${slug}
$ npm install
$ npm run dev
\`\`\``;

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch profiles for Footer
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .single();

  // 2. Fetch project by slug JOIN skills
  const { data: projectData } = await supabase
    .from("projects")
    .select(`
      id, title, slug, description, content, image_url, demo_url, github_url, created_at,
      project_skills (
        skills (*)
      )
    `)
    .eq("slug", slug)
    .single();

  if (!projectData) {
    notFound();
  }

  const project = projectData as unknown as ProjectWithSkills;
  const skills = (project.project_skills ?? [])
    .map((ps) => ps.skills)
    .filter((s): s is Skill => !!s);

  // Chuẩn bị nội dung Markdown
  const rawMarkdown = project.content || defaultMarkdownTemplate(
    project.title,
    project.description || "Chưa có mô tả chi tiết.",
    project.github_url || "",
    project.slug
  );

  const parsedHTML = await marked.parse(rawMarkdown);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden pt-24 font-mono">
      <Navbar brandName={profile?.full_name} />

      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10 space-y-12">
        {/* Navigation quay lại */}
        <div>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-accent transition-colors"
          >
            <span>&lt; ./back_to_workspace.sh</span>
          </Link>
        </div>

        {/* --- PHẦN TRÊN (TOP SECTION): THÔNG TIN DỰ ÁN & ẢNH PREVIEW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-card-border bg-card/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient background light */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 bg-accent/5 rounded-full blur-3xl" />

          {/* Cột trái (lg:col-span-7): Metadata, Title, Description, Skills & Buttons */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] text-zinc-500 tracking-wider">
                ID: {project.id.slice(0, 8)}
              </span>
              <div className="h-3 w-[1px] bg-card-border" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-400 border border-emerald-500/20">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                deployed
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              {project.title}
            </h1>

            <p className="text-xs sm:text-sm leading-relaxed text-text-muted">
              {project.description || "Chưa có mô tả ngắn."}
            </p>

            {/* Dependency Modules (Skills) */}
            <div className="space-y-2 pt-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                Dependency Modules:
              </span>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-1.5 rounded-lg border border-card-border/60 bg-card/25 px-2.5 py-1 text-xs text-text-muted"
                  >
                    {skill.svg_icon && (
                      <div
                        className="skill-icon h-3.5 w-3.5 [&_svg]:h-full [&_svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: skill.svg_icon }}
                      />
                    )}
                    <span>{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Specifications (Phân loại động) */}
            {skills.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-card-border/50 text-xs font-mono">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                  Tech Stack Specifications:
                </span>
                {skills.filter(s => s.category?.toLowerCase() === "frontend").length > 0 && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-zinc-500 w-20 flex-shrink-0">Frontend</span>
                    <span className="flex-1 border-b border-dashed border-card-border/60 mx-1"></span>
                    <span className="text-foreground font-semibold">
                      {skills.filter(s => s.category?.toLowerCase() === "frontend").map(s => s.name).join(", ")}
                    </span>
                  </div>
                )}
                {skills.filter(s => s.category?.toLowerCase() === "backend").length > 0 && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-zinc-500 w-20 flex-shrink-0">Backend</span>
                    <span className="flex-1 border-b border-dashed border-card-border/60 mx-1"></span>
                    <span className="text-foreground font-semibold">
                      {skills.filter(s => s.category?.toLowerCase() === "backend").map(s => s.name).join(", ")}
                    </span>
                  </div>
                )}
                {skills.filter(s => s.category?.toLowerCase() === "database").length > 0 && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-zinc-500 w-20 flex-shrink-0">Database</span>
                    <span className="flex-1 border-b border-dashed border-card-border/60 mx-1"></span>
                    <span className="text-foreground font-semibold">
                      {skills.filter(s => s.category?.toLowerCase() === "database").map(s => s.name).join(", ")}
                    </span>
                  </div>
                )}
                {skills.filter(s => s.category?.toLowerCase() === "tools").length > 0 && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-zinc-500 w-20 flex-shrink-0">Tools/Ops</span>
                    <span className="flex-1 border-b border-dashed border-card-border/60 mx-1"></span>
                    <span className="text-foreground font-semibold">
                      {skills.filter(s => s.category?.toLowerCase() === "tools").map(s => s.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Executable Links (Nút bấm hành động chuyển lên trên cùng cột thông tin) */}
            <div className="pt-4 border-t border-card-border/50 flex flex-wrap gap-3">
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-xs font-semibold text-background transition-all hover:opacity-90 active:scale-[0.97] hover:shadow-lg"
                >
                  Run Demo Live
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-card/30 px-5 py-2.5 text-xs font-medium text-text-muted transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-foreground active:scale-[0.97]"
                >
                  GitHub Repository
                </a>
              )}
            </div>
          </div>

          {/* Cột phải (lg:col-span-5): Image Preview lớn và rõ nét */}
          <div className="lg:col-span-5 w-full flex justify-center items-center">
            <div className="w-full rounded-2xl border border-card-border bg-black/30 overflow-hidden aspect-[16/10] relative group shadow-inner">
              {project.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="h-full w-full object-cover brightness-105 contrast-[1.02] transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="eager"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                  <span className="text-xs uppercase tracking-wider text-text-muted/40">No preview image</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- PHẦN DƯỚI (BOTTOM SECTION): README.md CHIẾM TRỌN 1 DÒNG (100% CHIỀU RỘNG) --- */}
        <div className="rounded-2xl border border-card-border bg-card/15 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-card-border/70 pb-4">
            <span className="text-accent font-bold text-xs">&gt;</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              README.md
            </span>
          </div>

          {/* Markdown Content Reader Container chiếm trọn chiều ngang */}
          <article
            className="markdown-body select-text text-xs sm:text-sm font-mono"
            dangerouslySetInnerHTML={{ __html: parsedHTML }}
          />
        </div>
      </div>

      <Footer profile={profile} />
    </main>
  );
}
