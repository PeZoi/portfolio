"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Project, Skill } from "@/types/database";
import { SKILL_CATEGORIES } from "@/types/database";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectFormProps {
  /** Nếu truyền project = chế độ Edit, không truyền = chế độ Create */
  project?: Project;
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!project;
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States cho Kho kỹ năng và liên kết
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    description: project?.description ?? "",
    content: project?.content ?? "",
    image_url: project?.image_url ?? "",
    demo_url: project?.demo_url ?? "",
    github_url: project?.github_url ?? "",
    featured: project?.featured ?? false,
    order_index: project?.order_index ?? 0,
  });

  // Load kho kỹ năng và các kỹ năng đã liên kết với dự án này
  useEffect(() => {
    async function loadSkillsData() {
      try {
        // 1. Load toàn bộ kho kỹ năng
        const { data: skillsData, error: skillsError } = await supabase
          .from("skills")
          .select("*")
          .order("name", { ascending: true });
        
        if (skillsError) throw skillsError;
        setSkillsList((skillsData ?? []) as Skill[]);

        // 2. Nếu đang sửa dự án, load danh sách liên kết kỹ năng
        if (isEditing && project) {
          const { data: linkedData, error: linkedError } = await supabase
            .from("project_skills")
            .select("skill_id")
            .eq("project_id", project.id);

          if (linkedError) throw linkedError;
          if (linkedData) {
            setSelectedSkillIds(linkedData.map((d) => d.skill_id));
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load skills";
        setError(msg);
      }
    }

    loadSkillsData();
  }, [supabase, isEditing, project]);

  /** Tự động tạo slug từ title */
  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      // Tự sinh slug khi thay đổi title (chỉ ở chế độ tạo mới)
      if (name === "title" && !isEditing) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  }

  // Toggle chọn skill
  function handleToggleSkill(skillId: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Đồng bộ trường tags của projects bằng cách lấy tên của các kỹ năng được chọn
    const selectedSkillsNames = skillsList
      .filter((s) => selectedSkillIds.includes(s.id))
      .map((s) => s.name);

    const projectPayload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description || null,
      content: formData.content || null,
      image_url: formData.image_url || null,
      demo_url: formData.demo_url || null,
      github_url: formData.github_url || null,
      tags: selectedSkillsNames,
      featured: formData.featured,
      order_index: Number(formData.order_index),
      updated_at: new Date().toISOString(),
    };

    try {
      let targetProjectId = project?.id;

      // 1. Lưu thông tin dự án
      if (isEditing && project) {
        const { error: updateError } = await supabase
          .from("projects")
          .update(projectPayload)
          .eq("id", project.id);

        if (updateError) throw updateError;
      } else {
        const { data: insertedProject, error: insertError } = await supabase
          .from("projects")
          .insert(projectPayload)
          .select("id")
          .single();

        if (insertError) throw insertError;
        targetProjectId = insertedProject.id;
      }

      if (!targetProjectId) {
        throw new Error("Project ID not resolved for skills association");
      }

      // 2. Cập nhật bảng liên kết project_skills
      const { error: deleteLinkError } = await supabase
        .from("project_skills")
        .delete()
        .eq("project_id", targetProjectId);

      if (deleteLinkError) throw deleteLinkError;

      if (selectedSkillIds.length > 0) {
        const linksPayload = selectedSkillIds.map((sid) => ({
          project_id: targetProjectId,
          skill_id: sid,
        }));

        const { error: insertLinkError } = await supabase
          .from("project_skills")
          .insert(linksPayload);

        if (insertLinkError) throw insertLinkError;
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Nhóm kho kỹ năng theo category
  const groupedSkills = SKILL_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = skillsList.filter((s) => s.category === cat);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-900/30 bg-red-950/10 px-4 py-3 text-sm text-red-400 dark:border-red-900/50 dark:bg-red-950/20">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="My Awesome Project"
          className="w-full"
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <label
          htmlFor="slug"
          className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
        >
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={formData.slug}
          onChange={handleChange}
          placeholder="my-awesome-project"
          className="w-full font-mono text-zinc-500 dark:text-zinc-400"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
        >
          Short Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          value={formData.description}
          onChange={handleChange}
          placeholder="A brief summary of the project..."
          className="w-full resize-none"
        />
      </div>

      {/* Content (Markdown) */}
      <div className="space-y-2">
        <label
          htmlFor="content"
          className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
        >
          Detailed Content
          <span className="ml-2 normal-case tracking-normal text-zinc-700 dark:text-zinc-600">
            (Markdown supported)
          </span>
        </label>
        <textarea
          id="content"
          name="content"
          rows={6}
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your detailed project description here..."
          className="w-full font-mono"
        />
      </div>

      {/* Image, Demo, Github URLs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label
            htmlFor="image_url"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            type="url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="demo_url"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            Demo URL
          </label>
          <input
            id="demo_url"
            name="demo_url"
            type="url"
            value={formData.demo_url}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="github_url"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            GitHub URL
          </label>
          <input
            id="github_url"
            name="github_url"
            type="url"
            value={formData.github_url}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full"
          />
        </div>
      </div>

      {/* Skills Selection (Kho Kỹ Năng - Pop up Grid Selection) */}
      <div className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Associate Skills
          <span className="ml-2 normal-case tracking-normal text-zinc-700 dark:text-zinc-600">
            (Select from library)
          </span>
        </label>

        {skillsList.length === 0 ? (
          <p className="text-xs text-zinc-600 dark:text-zinc-500">
            No skills available in the library. Create skills in the library first.
          </p>
        ) : selectedSkillIds.length === 0 ? (
          <button
            type="button"
            onClick={() => setIsSkillModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 hover:border-zinc-350 dark:border-zinc-800 dark:hover:border-zinc-750 bg-white/40 dark:bg-zinc-900/10 px-4 py-5 text-sm text-text-muted hover:text-foreground transition-all duration-150 active:scale-[0.99]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-muted"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Associate skills from library grid...
          </button>
        ) : (
          <div className="flex flex-wrap gap-2 rounded-xl border border-card-border bg-card/20 p-4">
            {skillsList
              .filter((s) => selectedSkillIds.includes(s.id))
              .map((skill) => (
                <span
                  key={skill.id}
                  className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {skill.svg_icon && (
                    <div
                      className="skill-icon h-4 w-4 text-zinc-400 dark:text-zinc-500 [&_svg]:h-full [&_svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: skill.svg_icon }}
                    />
                  )}
                  {skill.name}
                  <button
                    type="button"
                    onClick={() => handleToggleSkill(skill.id)}
                    className="ml-1 rounded p-0.5 text-text-muted hover:bg-zinc-250 dark:hover:bg-white/[0.08] hover:text-foreground transition-colors"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </span>
              ))}
            
            <button
              type="button"
              onClick={() => setIsSkillModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white/10 dark:bg-zinc-900/10 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-foreground transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Manage
            </button>
          </div>
        )}
      </div>

      {/* Order Index + Featured */}
      <div className="flex items-end gap-6">
        <div className="w-28 space-y-2">
          <label
            htmlFor="order_index"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            Order
          </label>
          <input
            id="order_index"
            name="order_index"
            type="number"
            value={formData.order_index}
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-3 pb-2.5">
          <input
            name="featured"
            type="checkbox"
            checked={formData.featured}
            onChange={handleChange}
            className="h-4 w-4 rounded border-zinc-200 bg-white text-zinc-900 accent-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:accent-zinc-300 focus:ring-zinc-500"
          />
          <span className="text-sm text-zinc-400">Featured project</span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "rounded-lg bg-zinc-100 px-5 py-2.5 text-[13px] font-medium text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900",
            "transition-all hover:bg-white active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Project"
              : "Create Project"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="rounded-lg px-5 py-2.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>

      {/* --- SKILL SELECTION GRID MODAL FOR PROJECT --- */}
      <AnimatePresence>
        {isSkillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSkillModalOpen(false)}
              className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm dark:bg-zinc-950/60"
            />

            {/* Modal Content Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-card-border bg-card p-6 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-card-border pb-4 mb-4">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Associate Skills with Project
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Select technologies used in this project.
                  </p>
                </div>
                <button
                  onClick={() => setIsSkillModalOpen(false)}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:text-foreground transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Modal Body (Scrollable Grid) */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
                {skillsList.length === 0 ? (
                  <div className="py-12 text-center text-sm text-text-muted">
                    No skills available in the library to select.
                  </div>
                ) : (
                  SKILL_CATEGORIES.map((category) => {
                    const catSkills = groupedSkills[category];
                    if (catSkills.length === 0) return null;

                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted dark:text-zinc-500">
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {catSkills.map((skill) => {
                            const isSelected = selectedSkillIds.includes(skill.id);
                            return (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleToggleSkill(skill.id)}
                                className={cn(
                                  "flex items-center justify-between rounded-lg border p-3 text-left text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                                  isSelected
                                    ? "border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                    : "border-card-border bg-card/40 hover:border-zinc-350 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                                )}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {skill.svg_icon ? (
                                    <div
                                      className="skill-icon h-5 w-5 flex-shrink-0 text-zinc-400 [&_svg]:h-full [&_svg]:w-full"
                                      dangerouslySetInnerHTML={{ __html: skill.svg_icon }}
                                    />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                  )}
                                  <span className="truncate text-foreground">{skill.name}</span>
                                </div>

                                {/* Check status */}
                                {isSelected ? (
                                  <div className="h-4.5 w-4.5 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="h-4.5 w-4.5 rounded-full border border-card-border flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-card-border pt-4 mt-auto flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  Selected <strong className="text-foreground">{selectedSkillIds.length}</strong> technologies
                </span>
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="rounded-lg bg-foreground text-background px-5 py-2 text-[13px] font-medium transition-colors hover:opacity-90 active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}
