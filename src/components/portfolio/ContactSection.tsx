"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function ContactSection() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("messages").insert({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        status: "unread",
      });

      if (insertError) throw insertError;

      setSent(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gửi tin nhắn thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="relative section-spacing overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0 bg-zinc-50/50 dark:bg-zinc-950/30" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 md:grid-cols-[1fr_1.2fr] items-start">
          {/* Bên trái — Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Liên hệ
            </h2>
            <div className="h-[2px] w-12 rounded-full bg-accent/60" />
            <p className="max-w-md text-base leading-[1.8] text-text-muted">
              Bạn có ý tưởng dự án hoặc muốn hợp tác? Hãy gửi tin nhắn cho tôi.
              Tôi sẽ phản hồi sớm nhất có thể.
            </p>

            {/* Decorative elements */}
            <div className="hidden md:block pt-8">
              <div className="flex items-center gap-3 text-sm text-text-muted/60">
                <div className="h-[1px] w-8 bg-card-border" />
                <span className="text-[10px] uppercase tracking-widest font-medium">hoặc qua email</span>
              </div>
            </div>
          </motion.div>

          {/* Bên phải — Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {sent ? (
              /* Trạng thái gửi thành công */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-accent/20 bg-accent/5 p-12 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Đã gửi thành công!
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  Cảm ơn bạn, tôi sẽ phản hồi sớm nhất.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 rounded-lg border border-card-border px-4 py-2 text-xs font-medium text-text-muted transition-colors hover:text-foreground"
                >
                  Gửi tin nhắn khác
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-card-border bg-card/30 p-8 backdrop-blur-sm"
              >
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium uppercase tracking-wider text-text-muted/70"
                  >
                    Họ tên
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium uppercase tracking-wider text-text-muted/70"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium uppercase tracking-wider text-text-muted/70"
                  >
                    Tin nhắn
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nội dung tin nhắn..."
                    className="w-full resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Đang gửi..." : "Gửi tin nhắn"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
