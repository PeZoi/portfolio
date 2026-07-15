"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Skill, UserSkill } from "@/types/database";
import { SKILL_CATEGORIES } from "@/types/database";
import { cn } from "@/lib/utils";
import CustomSelect from "@/components/CustomSelect";
import { motion, AnimatePresence } from "framer-motion";

type ViewTab = "my-skills" | "library";

export default function AdminSkillsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<ViewTab>("my-skills");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states cho Kho Kỹ Năng (Library)
  const [isLibFormOpen, setIsLibFormOpen] = useState(false);
  const [editingLibSkill, setEditingLibSkill] = useState<Skill | null>(null);
  const [libFormData, setLibFormData] = useState({
    name: "",
    category: "Frontend",
    svg_icon: "",
  });

  // Form states cho Kỹ năng cá nhân (User Skills - Chỉ dùng khi sửa Order)
  const [editingUserSkill, setEditingUserSkill] = useState<UserSkill | null>(null);
  const [userFormData, setUserFormData] = useState({
    skill_id: "",
    level: 3,
    order_index: 0,
  });

  // States cho Grid Modal (Tích chọn nhiều kỹ năng cùng lúc)
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [selectedModalSkillIds, setSelectedModalSkillIds] = useState<string[]>([]);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: skillsData, error: skillsError } = await supabase
        .from("skills")
        .select("*")
        .order("name", { ascending: true });
      if (skillsError) throw skillsError;
      setSkills((skillsData ?? []) as Skill[]);

      const { data: userSkillsData, error: userSkillsError } = await supabase
        .from("user_skills")
        .select(`
          id,
          skill_id,
          order_index,
          created_at,
          skills (
            id,
            name,
            category,
            svg_icon
          )
        `)
        .order("order_index", { ascending: true });
      if (userSkillsError) throw userSkillsError;
      
      setUserSkills((userSkillsData ?? []) as unknown as UserSkill[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  // --- THAO TÁC TRÊN KHO KỸ NĂNG (LIBRARY) ---
  const handleLibSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      name: libFormData.name,
      category: libFormData.category,
      svg_icon: libFormData.svg_icon || null,
    };

    try {
      if (editingLibSkill) {
        const { error: updateError } = await supabase
          .from("skills")
          .update(payload)
          .eq("id", editingLibSkill.id);
        if (updateError) throw updateError;
        setSuccess(`Updated skill "${payload.name}" in library`);
      } else {
        const { error: insertError } = await supabase
          .from("skills")
          .insert(payload);
        if (insertError) throw insertError;
        setSuccess(`Added skill "${payload.name}" to library`);
      }

      setIsLibFormOpen(false);
      setEditingLibSkill(null);
      setLibFormData({ name: "", category: "Frontend", svg_icon: "" });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    }
  };

  const handleLibDelete = async (skill: Skill) => {
    const confirmed = window.confirm(
      `Delete "${skill.name}" from library? This will also remove it from your portfolio and any linked projects.`
    );
    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase
        .from("skills")
        .delete()
        .eq("id", skill.id);
      if (deleteError) throw deleteError;
      
      setSuccess(`Deleted skill "${skill.name}" from library`);
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      setError(message);
    }
  };

  // --- THAO TÁC TRÊN KỸ NĂNG CÁ NHÂN (USER SKILLS - SỬA THỨ TỰ) ---
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      skill_id: userFormData.skill_id,
      order_index: Number(userFormData.order_index),
      level: 3, // Gửi mặc định 3 ngầm để tương thích DB check constraint
    };

    try {
      if (editingUserSkill) {
        const { error: updateError } = await supabase
          .from("user_skills")
          .update({
            order_index: payload.order_index,
          })
          .eq("id", editingUserSkill.id);
        if (updateError) throw updateError;
        setSuccess("Updated active portfolio skill configuration");
      }

      setEditingUserSkill(null);
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    }
  };

  const handleUserDelete = async (us: UserSkill) => {
    const confirmed = window.confirm(
      `Remove "${us.skills?.name}" from your active portfolio display?`
    );
    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase
        .from("user_skills")
        .delete()
        .eq("id", us.id);
      if (deleteError) throw deleteError;

      setSuccess("Skill removed from active portfolio display");
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove";
      setError(message);
    }
  };

  // Tích chọn / Bỏ tích chọn kỹ năng tạm thời trong modal
  const handleToggleModalSkill = (skillId: string) => {
    setSelectedModalSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Lưu hàng loạt kỹ năng từ modal
  const handleSaveSelectedSkills = async () => {
    if (selectedModalSkillIds.length === 0) return;
    setModalSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const startOrder = userSkills.length;
      const payload = selectedModalSkillIds.map((sid, idx) => ({
        skill_id: sid,
        order_index: startOrder + idx,
        level: 3,
      }));

      const { error: insertError } = await supabase
        .from("user_skills")
        .insert(payload);

      if (insertError) throw insertError;

      setSuccess(`Successfully added ${selectedModalSkillIds.length} skills to display`);
      setIsGridModalOpen(false);
      setSelectedModalSkillIds([]);
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add skills";
      setError(message);
    } finally {
      setModalSubmitting(false);
    }
  };

  // Group user skills by category
  const groupedUserSkills = SKILL_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = userSkills.filter((s) => s.skills?.category === category);
      return acc;
    },
    {} as Record<string, UserSkill[]>
  );

  // Group library skills by category
  const groupedLibSkills = SKILL_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = skills.filter((s) => s.category === category);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  // Lọc danh sách kỹ năng trong kho chưa được add vào user_skills
  const availableLibSkills = skills.filter(
    (s) => !userSkills.some((us) => us.skill_id === s.id)
  );

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Skills Management
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Manage your master skills library and active portfolio skills.
          </p>
        </div>
        
        {activeTab === "library" ? (
          <button
            onClick={() => {
              clearAlerts();
              setEditingLibSkill(null);
              setLibFormData({ name: "", category: "Frontend", svg_icon: "" });
              setIsLibFormOpen(true);
            }}
            className="rounded-lg bg-foreground text-background px-4 py-2 text-[13px] font-medium transition-colors hover:opacity-90 active:scale-[0.98]"
          >
            New Library Skill
          </button>
        ) : (
          <button
            onClick={() => {
              clearAlerts();
              if (availableLibSkills.length === 0) {
                alert("No more skills available in library. Add new skills to library first.");
                return;
              }
              setEditingUserSkill(null);
              setSelectedModalSkillIds([]);
              setIsGridModalOpen(true);
            }}
            className="rounded-lg bg-foreground text-background px-4 py-2 text-[13px] font-medium transition-colors hover:opacity-90 active:scale-[0.98]"
          >
            Add to Portfolio
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-8 flex border-b border-card-border">
        <button
          onClick={() => {
            clearAlerts();
            setActiveTab("my-skills");
          }}
          className={cn(
            "relative px-4 py-2.5 text-[13px] font-medium transition-colors",
            activeTab === "my-skills" ? "text-foreground" : "text-text-muted hover:text-foreground"
          )}
        >
          My Portfolio Skills ({userSkills.length})
          {activeTab === "my-skills" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
        <button
          onClick={() => {
            clearAlerts();
            setActiveTab("library");
          }}
          className={cn(
            "relative px-4 py-2.5 text-[13px] font-medium transition-colors",
            activeTab === "library" ? "text-foreground" : "text-text-muted hover:text-foreground"
          )}
        >
          Skills Library ({skills.length})
          {activeTab === "library" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-900/30 bg-red-950/10 px-4 py-3 text-sm text-red-400 dark:border-red-900/50 dark:bg-red-950/20">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-900/30 bg-emerald-950/10 px-4 py-3 text-sm text-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          {success}
        </div>
      )}

      {/* --- FORM 1: LIBRARY SKILL (CREATE/EDIT) --- */}
      {activeTab === "library" && isLibFormOpen && (
        <div className="mb-8 rounded-xl border border-card-border bg-card/40 p-6">
          <h2 className="mb-4 text-sm font-medium text-foreground">
            {editingLibSkill ? `Edit Library Skill: ${editingLibSkill.name}` : "Add New Skill to Library"}
          </h2>
          <form onSubmit={handleLibSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Name</label>
                <input
                  type="text"
                  required
                  value={libFormData.name}
                  onChange={(e) => setLibFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Python"
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Category</label>
                <CustomSelect
                  options={SKILL_CATEGORIES.map((cat) => ({
                    value: cat,
                    label: cat,
                  }))}
                  value={libFormData.category}
                  onChange={(val) => setLibFormData((p) => ({ ...p, category: val }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-text-muted">
                SVG Code <span className="ml-1 text-[10px] text-zinc-400 dark:text-zinc-600 normal-case">(raw &lt;svg&gt;...&lt;/svg&gt; tags)</span>
              </label>
              <textarea
                rows={5}
                required
                value={libFormData.svg_icon}
                onChange={(e) => setLibFormData((p) => ({ ...p, svg_icon: e.target.value }))}
                placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">...</svg>'
                className="w-full font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-foreground text-background px-4 py-2 text-[13px] font-medium transition-colors hover:opacity-90 active:scale-[0.98]"
              >
                Save to Library
              </button>
              <button
                type="button"
                onClick={() => setIsLibFormOpen(false)}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-text-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- FORM 2: USER SKILL (CHỈ HIỆN KHI CHỈNH SỬA THỨ TỰ ORDER) --- */}
      {activeTab === "my-skills" && editingUserSkill && (
        <div className="mb-8 rounded-xl border border-card-border bg-card/40 p-6">
          <h2 className="mb-4 text-sm font-medium text-foreground">
            Edit Active Skill: {editingUserSkill.skills?.name}
          </h2>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Skill</label>
                <input
                  type="text"
                  disabled
                  value={editingUserSkill.skills?.name ?? ""}
                  className="w-full bg-zinc-150/40 dark:bg-zinc-900/10 text-text-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Order</label>
                <input
                  type="number"
                  required
                  value={userFormData.order_index}
                  onChange={(e) => setUserFormData((p) => ({ ...p, order_index: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-foreground text-background px-4 py-2 text-[13px] font-medium transition-colors hover:opacity-90 active:scale-[0.98]"
              >
                Update Configuration
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingUserSkill(null);
                }}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-text-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- RENDER DATA --- */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-card/40" />
          ))}
        </div>
      ) : activeTab === "my-skills" ? (
        /* VIEW 1: MY ACTIVE PORTFOLIO SKILLS */
        userSkills.length === 0 ? (
          <div className="rounded-xl border border-card-border bg-card/30 p-12 text-center">
            <p className="text-sm text-text-muted">No skills are set to display on your portfolio yet.</p>
            <button
              onClick={() => {
                clearAlerts();
                if (availableLibSkills.length === 0) {
                  alert("Add skills to library first.");
                  return;
                }
                setSelectedModalSkillIds([]);
                setIsGridModalOpen(true);
              }}
              className="mt-3 text-sm text-zinc-500 underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Add skills to your display
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {SKILL_CATEGORIES.map((category) => {
              const catSkills = groupedUserSkills[category];
              if (catSkills.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {catSkills.map((us) => (
                      <div
                        key={us.id}
                        className="group flex items-center justify-between rounded-xl border border-card-border bg-card/20 px-5 py-4 transition-colors hover:bg-card/40"
                      >
                        <div className="flex items-center gap-4">
                          {us.skills?.svg_icon ? (
                            <div
                              className="h-7 w-7 flex-shrink-0 text-zinc-400 dark:text-zinc-500 [&_svg]:h-full [&_svg]:w-full"
                              dangerouslySetInnerHTML={{ __html: us.skills.svg_icon }}
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                          )}
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {us.skills?.name}
                            </span>
                            <span className="ml-3 text-[11px] text-text-muted font-mono">
                              Order: {us.order_index}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => {
                                clearAlerts();
                                setEditingUserSkill(us);
                                setUserFormData({
                                  skill_id: us.skill_id,
                                  level: 3,
                                  order_index: us.order_index,
                                });
                              }}
                              className="rounded-md px-2.5 py-1.5 text-xs text-text-muted hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-foreground"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleUserDelete(us)}
                              className="rounded-md px-2.5 py-1.5 text-xs text-text-muted hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* VIEW 2: SKILLS LIBRARY */
        skills.length === 0 ? (
          <div className="rounded-xl border border-card-border bg-card/30 p-12 text-center">
            <p className="text-sm text-text-muted">Your skills library is empty.</p>
            <button
              onClick={() => {
                clearAlerts();
                setEditingLibSkill(null);
                setLibFormData({ name: "", category: "Frontend", svg_icon: "" });
                setIsLibFormOpen(true);
              }}
              className="mt-3 text-sm text-zinc-500 underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Add first skill to library
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {SKILL_CATEGORIES.map((category) => {
              const catLib = groupedLibSkills[category];
              if (catLib.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {catLib.map((skill) => (
                      <div
                        key={skill.id}
                        className="group flex items-center justify-between rounded-xl border border-card-border bg-card/30 p-4 transition-colors hover:bg-card/40"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {skill.svg_icon ? (
                            <div
                              className="skill-icon h-8 w-8 flex-shrink-0 text-zinc-400 dark:text-zinc-500 [&_svg]:h-full [&_svg]:w-full"
                              dangerouslySetInnerHTML={{ __html: skill.svg_icon }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                          )}
                          <span className="truncate text-sm font-medium text-foreground">
                            {skill.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => {
                              clearAlerts();
                              setEditingLibSkill(skill);
                              setLibFormData({
                                name: skill.name,
                                category: skill.category,
                                svg_icon: skill.svg_icon ?? "",
                              });
                              setIsLibFormOpen(true);
                            }}
                            className="rounded-md px-2 py-1 text-xs text-text-muted hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-foreground"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleLibDelete(skill)}
                            className="rounded-md px-2 py-1 text-xs text-text-muted hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* --- SKILL GRID SELECTION MODAL (MUTIPLE SELECT) --- */}
      <AnimatePresence>
        {isGridModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGridModalOpen(false)}
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
                    Add Skills to Portfolio
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Select multiple skills from the grid below to display on your portfolio.
                  </p>
                </div>
                <button
                  onClick={() => setIsGridModalOpen(false)}
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
                {availableLibSkills.length === 0 ? (
                  <div className="py-12 text-center text-sm text-text-muted">
                    No skills available in the library to select, or all skills have already been displayed.
                  </div>
                ) : (
                  SKILL_CATEGORIES.map((category) => {
                    const catLibSkills = availableLibSkills.filter((s) => s.category === category);
                    if (catLibSkills.length === 0) return null;

                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted dark:text-zinc-500">
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {catLibSkills.map((skill) => {
                            const isSelected = selectedModalSkillIds.includes(skill.id);
                            return (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleToggleModalSkill(skill.id)}
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

                                {/* Check status icon */}
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
                  Selected <strong className="text-foreground">{selectedModalSkillIds.length}</strong> skills
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGridModalOpen(false)}
                    className="rounded-lg px-4 py-2 text-[13px] font-medium text-text-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={selectedModalSkillIds.length === 0 || modalSubmitting}
                    onClick={handleSaveSelectedSkills}
                    className="rounded-lg bg-foreground text-background px-4 py-2 text-[13px] font-medium transition-colors hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {modalSubmitting ? "Adding..." : "Add to Portfolio"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
