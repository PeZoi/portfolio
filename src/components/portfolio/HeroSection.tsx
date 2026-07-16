"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Profile } from "@/types/database";

interface HeroSectionProps {
  profile: Profile | null;
}

const words = [
  "Fullstack Developer",
  "UI/UX Developer",
  "React / Next.js Specialist",
  "Spring Boot & Microservices",
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HeroSection({ profile }: HeroSectionProps) {
  const name = profile?.full_name ?? "Phạm Ngọc Viễn Đông";
  const title = profile?.title ?? "Fullstack Developer";
  const avatarUrl = profile?.avatar_url ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop";

  // State cho hiệu ứng Typewriter
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const word = words[currentWordIndex];
    const typingSpeed = isDeleting ? 30 : 80;

    if (!isDeleting && currentText === word) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timer = setTimeout(() => {
        setCurrentText((prev) =>
          isDeleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex]);

  const abstractArtUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=150&auto=format&fit=crop";

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden pt-24 pb-16"
    >
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="gradient-orb absolute -right-32 top-10 h-[600px] w-[600px] animate-float-slow opacity-50" />
        <div className="gradient-orb-secondary absolute -left-20 bottom-10 h-[500px] w-[500px] animate-float opacity-30" />
      </div>

      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30 dark:opacity-15" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-8 text-center flex flex-col items-center gap-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8"
        >
          {/* Status badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-4 py-1.5 text-[10px] font-mono tracking-widest text-accent uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              system.status = "ready_to_collaborate"
            </span>
          </motion.div>

          {/* Headline Typographic 3 dòng cao cấp (Bỏ ảnh oval vụn vặt) */}
          <motion.h1
            variants={itemVariants}
            className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] max-w-4xl text-center uppercase"
          >
            Tôi là{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-emerald-400 to-emerald-500 whitespace-nowrap">
              {name}
            </span>

          </motion.h1>

          {/* Typewriter text block */}
          <motion.div
            variants={itemVariants}
            className="h-8 flex items-center justify-center font-mono text-sm sm:text-base text-accent font-semibold tracking-wider"
          >
            <span>&gt; {currentText}</span>
            <span className="ml-1 w-2 h-4 bg-accent animate-pulse" />
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-7 py-3.5 text-xs font-semibold text-background transition-all duration-200 hover:opacity-90 active:scale-[0.96] hover:shadow-lg"
            >
              ./explore_projects.sh
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card/40 px-7 py-3.5 text-xs font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:bg-card hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[0.96]"
            >
              contact_me()
            </a>
          </motion.div>
        </motion.div>

        {/* Developer Static Mock Terminal Console Component */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl rounded-xl border border-zinc-200/80 dark:border-card-border bg-white/70 dark:bg-black/40 backdrop-blur-md shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden text-left"
        >
          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/80 dark:bg-black/60 border-b border-zinc-200/60 dark:border-card-border/60">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
              developer.ts &mdash; bash
            </span>
            <div className="w-10" />
          </div>

          {/* Terminal Body */}
          <div className="p-5 font-mono text-[11px] sm:text-xs leading-relaxed text-zinc-700 dark:text-zinc-400 overflow-x-auto space-y-2.5">
            <div>
              <span className="text-accent">dong@portfolio</span>
              <span className="text-zinc-400 dark:text-zinc-500">:~#</span> cat developer.ts
            </div>
            <div className="text-zinc-400 dark:text-zinc-500">// TypeScript profile definition</div>
            <div>
              <span className="text-purple-650 dark:text-purple-400">const</span>{" "}
              <span className="text-blue-600 dark:text-blue-400">developer</span> = <span className="text-zinc-600 dark:text-zinc-300">&#123;</span>
            </div>
            <div className="pl-4">
              <span className="text-zinc-700 dark:text-zinc-300">name:</span> <span className="text-emerald-600 dark:text-emerald-400">&quot;{name}&quot;</span>,
            </div>
            <div className="pl-4">
              <span className="text-zinc-700 dark:text-zinc-300">role:</span> <span className="text-emerald-600 dark:text-emerald-400">&quot;{profile?.title ?? title}&quot;</span>,
            </div>
            <div className="pl-4">
              <span className="text-zinc-700 dark:text-zinc-300">skills:</span> <span className="text-zinc-400 dark:text-zinc-500">[</span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;React&quot;</span>
              <span className="text-zinc-400 dark:text-zinc-300">, </span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;Next.js&quot;</span>
              <span className="text-zinc-400 dark:text-zinc-300">, </span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;TypeScript&quot;</span>
              <span className="text-zinc-400 dark:text-zinc-300">, </span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;Spring boot&quot;</span>
              <span className="text-zinc-400 dark:text-zinc-500">]</span>,
            </div>
            <div className="pl-4">
              <span className="text-zinc-700 dark:text-zinc-300">location:</span> <span className="text-emerald-600 dark:text-emerald-400">&quot;Vietnam (GMT+7)&quot;</span>,
            </div>
            <div className="pl-4">
              <span className="text-zinc-700 dark:text-zinc-300">available:</span> <span className="text-amber-600 dark:text-amber-400">true</span>
            </div>
            <div><span className="text-zinc-600 dark:text-zinc-300">&#125;;</span></div>
            <div>
              <span className="text-accent">dong@portfolio</span>
              <span className="text-zinc-400 dark:text-zinc-500">:~#</span> <span className="animate-pulse bg-accent w-1.5 h-3.5 inline-block" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-text-muted/40 font-medium">Cuộn xuống</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-muted/30">
              <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
