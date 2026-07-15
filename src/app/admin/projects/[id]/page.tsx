import { createClient } from "@/utils/supabase/server";
import type { Project } from "@/types/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectForm from "../project-form";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const project = data as Project;

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/projects"
          className="mb-4 inline-block text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          &larr; Back to Projects
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-100">
          Edit Project
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">{project.title}</p>
      </div>

      <ProjectForm project={project} />
    </div>
  );
}
