"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface DeleteProjectButtonProps {
  projectId: string;
  projectTitle: string;
}

export function DeleteProjectButton({
  projectId,
  projectTitle,
}: DeleteProjectButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    // Xác nhận trước khi xóa để tránh thao tác nhầm
    const confirmed = window.confirm(
      `Are you sure you want to delete "${projectTitle}"?`
    );
    if (!confirmed) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      alert(`Failed to delete: ${error.message}`);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-md px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-red-950/30 hover:text-red-400"
    >
      Delete
    </button>
  );
}
