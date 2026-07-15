"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    title: "",
    bio: "",
    avatar_url: "",
    resume_url: "",
    email: "",
    github_url: "",
    linkedin_url: "",
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      setError(fetchError.message);
    } else if (data) {
      const profile = data as Profile;
      setProfileId(profile.id);
      setFormData({
        full_name: profile.full_name ?? "",
        title: profile.title ?? "",
        bio: profile.bio ?? "",
        avatar_url: profile.avatar_url ?? "",
        resume_url: profile.resume_url ?? "",
        email: profile.email ?? "",
        github_url: profile.github_url ?? "",
        linkedin_url: profile.linkedin_url ?? "",
      });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      full_name: formData.full_name,
      title: formData.title || null,
      bio: formData.bio || null,
      avatar_url: formData.avatar_url || null,
      resume_url: formData.resume_url || null,
      email: formData.email || null,
      github_url: formData.github_url || null,
      linkedin_url: formData.linkedin_url || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (profileId) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", profileId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert(payload);
        if (insertError) throw insertError;
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full";

  if (loading) {
    return (
      <div className="p-8 lg:p-12">
        <div className="max-w-2xl space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800/60" />
              <div className="h-10 animate-pulse rounded-lg bg-card/40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Update your personal profile information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Feedback messages */}
        {error && (
          <div className="rounded-lg border border-red-900/30 bg-red-950/10 px-4 py-3 text-sm text-red-500 dark:border-red-900/50 dark:bg-red-950/20">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
            Profile updated successfully.
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <label
            htmlFor="full_name"
            className="block text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Alex Nguyen"
            className={inputClass}
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            Title / Role
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Senior Fullstack Engineer"
            className={inputClass}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label
            htmlFor="bio"
            className="block text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="A brief description about yourself..."
            className={cn(inputClass, "resize-none")}
          />
        </div>

        {/* Avatar URL + Resume URL */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="avatar_url"
              className="block text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Avatar URL
            </label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="resume_url"
              className="block text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Resume URL
            </label>
            <input
              id="resume_url"
              name="resume_url"
              type="url"
              value={formData.resume_url}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            Contact Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contact@example.com"
            className={inputClass}
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="github_url"
              className="block text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              GitHub URL
            </label>
            <input
              id="github_url"
              name="github_url"
              type="url"
              value={formData.github_url}
              onChange={handleChange}
              placeholder="https://github.com/..."
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="linkedin_url"
              className="block text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              LinkedIn URL
            </label>
            <input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "rounded-lg bg-foreground text-background px-5 py-2.5 text-[13px] font-medium transition-colors hover:opacity-90 active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
