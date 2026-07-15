"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Message } from "@/types/database";
import { cn } from "@/lib/utils";

type ActiveTab = "unread" | "read" | "archived";

export default function AdminMessagesPage() {
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("unread");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setMessages((data ?? []) as Message[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load messages";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const updateMessageStatus = async (id: string, newStatus: "unread" | "read" | "archived") => {
    try {
      const { error: updateError } = await supabase
        .from("messages")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;
      
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update message";
      alert(message);
    }
  };

  const deleteMessage = async (id: string, senderName: string) => {
    const confirmed = window.confirm(`Delete message from "${senderName}" permanently?`);
    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase
        .from("messages")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete message";
      alert(message);
    }
  };

  const filteredMessages = messages.filter((msg) => msg.status === activeTab);

  const counts = {
    unread: messages.filter((msg) => msg.status === "unread").length,
    read: messages.filter((msg) => msg.status === "read").length,
    archived: messages.filter((msg) => msg.status === "archived").length,
  };

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const tabClass = (tab: ActiveTab) =>
    cn(
      "relative px-4 py-2 text-[13px] font-medium transition-colors duration-150",
      activeTab === tab ? "text-foreground" : "text-text-muted hover:text-foreground"
    );

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Messages
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Submissions from your portfolio contact form.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-card-border">
        <div className="flex gap-2">
          {(["unread", "read", "archived"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={tabClass(tab)}
            >
              <span className="capitalize">{tab}</span>
              {counts[tab] > 0 && (
                <span className="ml-2 rounded bg-zinc-200 dark:bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-text-muted dark:text-zinc-400">
                  {counts[tab]}
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-900/30 bg-red-950/10 px-4 py-3 text-sm text-red-400 dark:border-red-900/50 dark:bg-red-950/20">
          {error}
        </div>
      )}

      {/* Message List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-card/40"
            />
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-card/30 p-12 text-center">
          <p className="text-sm text-text-muted">No {activeTab} messages.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "group rounded-xl border border-card-border bg-card/15 p-6 transition-colors hover:bg-card/25",
                msg.status === "unread" && "border-zinc-350 dark:border-zinc-700/60"
              )}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading text-sm font-semibold text-foreground">
                      {msg.name}
                    </h3>
                    <span className="text-xs text-text-muted/40">&bull;</span>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs text-text-muted transition-colors hover:text-foreground"
                    >
                      {msg.email}
                    </a>
                  </div>
                  <p className="mt-1 text-[11px] text-text-muted/80">
                    Received {formatDate(msg.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {msg.status === "unread" && (
                    <button
                      onClick={() => updateMessageStatus(msg.id, "read")}
                      className="rounded-md px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-foreground"
                    >
                      Mark as Read
                    </button>
                  )}
                  {msg.status === "read" && (
                    <button
                      onClick={() => updateMessageStatus(msg.id, "unread")}
                      className="rounded-md px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-foreground"
                    >
                      Mark Unread
                    </button>
                  )}
                  {msg.status !== "archived" ? (
                    <button
                      onClick={() => updateMessageStatus(msg.id, "archived")}
                      className="rounded-md px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-foreground"
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => updateMessageStatus(msg.id, "read")}
                      className="rounded-md px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-foreground"
                    >
                      Restore
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(msg.id, msg.name)}
                    className="rounded-md px-2.5 py-1 text-xs text-text-muted hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="mt-4 border-t border-card-border/60 pt-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
