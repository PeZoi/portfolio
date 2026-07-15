import { createClient } from "@/utils/supabase/server";
import type { Project } from "@/types/database";
import Link from "next/link";
import { DeleteProjectButton } from "./delete-button";

interface AdminProjectWithSkills extends Project {
  project_skills: {
    skills: {
      id: string;
      name: string;
      svg_icon: string | null;
    } | null;
  }[];
}

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  // Fetch projects cùng liên kết skills qua project_skills
  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      *,
      project_skills (
        skills (
          id,
          name,
          svg_icon
        )
      )
    `)
    .order("order_index", { ascending: true });

  if (error) {
    return (
      <div className="p-8 lg:p-12">
        <p className="text-sm text-red-400">
          Failed to load projects: {error.message}
        </p>
      </div>
    );
  }

  const typedProjects = (projects ?? []) as AdminProjectWithSkills[];

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Manage your portfolio projects.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-foreground text-background px-4 py-2 text-[13px] font-medium transition-colors hover:opacity-90 active:scale-[0.98]"
        >
          Add Project
        </Link>
      </div>

      {/* Projects Grid */}
      {typedProjects.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-card/30 p-12 text-center">
          <p className="text-sm text-text-muted">No projects yet.</p>
          <Link
            href="/admin/projects/new"
            className="mt-3 inline-block text-sm text-text-muted underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {typedProjects.map((project) => {
            // Lọc danh sách skills hợp lệ từ project_skills
            const associatedSkills = project.project_skills
              ? project.project_skills
                  .map((ps) => ps.skills)
                  .filter((s): s is NonNullable<typeof s> => !!s)
              : [];

            return (
              <div
                key={project.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-card-border bg-card/25 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-card/45 hover:shadow-lg"
              >
                {/* Project Preview Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-card-border bg-zinc-100/50 dark:bg-zinc-900/50">
                  {project.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200/50 dark:from-zinc-900/40 dark:to-zinc-900/20">
                      <span className="text-[10px] uppercase tracking-wider text-text-muted/60 font-medium">
                        No Preview Image
                      </span>
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {project.featured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="flex-1 p-5">
                  <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-zinc-900 dark:group-hover:text-white transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="mt-0.5 font-mono text-[10px] text-text-muted/60">
                    /{project.slug}
                  </p>
                  {project.description && (
                    <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-text-muted/80">
                      {project.description}
                    </p>
                  )}

                  {/* Skills SVG Logo Icons with Name */}
                  {associatedSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {associatedSkills.slice(0, 4).map((skill) => (
                        <div
                          key={skill.id}
                          title={skill.name}
                          className="flex items-center gap-1.5 rounded-full border border-card-border/50 bg-card/45 px-2.5 py-0.5 transition-colors hover:border-zinc-300 dark:hover:border-zinc-750"
                        >
                          {skill.svg_icon && (
                            <div
                              className="skill-icon h-3 w-3 text-zinc-500 dark:text-zinc-400 [&_svg]:h-full [&_svg]:w-full"
                              dangerouslySetInnerHTML={{ __html: skill.svg_icon }}
                            />
                          )}
                          <span className="text-[9.5px] font-medium text-text-muted dark:text-zinc-400">
                            {skill.name}
                          </span>
                        </div>
                      ))}
                      {associatedSkills.length > 4 && (
                        <span className="self-center text-[9px] text-text-muted/50 font-medium pl-0.5">
                          +{associatedSkills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-card-border/60 bg-zinc-50/10 dark:bg-black/5 px-5 py-3.5">
                  <span className="text-[10px] text-text-muted font-mono font-medium">
                    Order: {project.order_index}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="rounded-md border border-card-border bg-card/50 px-3 py-1.5 text-xs font-medium text-text-muted hover:border-zinc-350 dark:hover:border-zinc-700 hover:text-foreground transition-all duration-150"
                    >
                      Edit
                    </Link>
                    <DeleteProjectButton
                      projectId={project.id}
                      projectTitle={project.title}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
