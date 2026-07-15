import Link from "next/link";
import ProjectForm from "../project-form";

export default function NewProjectPage() {
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
          New Project
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Add a new project to your portfolio.
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}
