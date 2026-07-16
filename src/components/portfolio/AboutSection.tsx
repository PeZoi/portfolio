"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@/types/database";

interface AboutSectionProps {
  profile: Profile | null;
}

export default function AboutSection({ profile }: AboutSectionProps) {
  const bio = profile?.bio ?? "Chưa có thông tin giới thiệu chi tiết.";
  const name = profile?.full_name ?? "Phạm Ngọc Viễn Đông";
  const email = profile?.email ?? "contact@example.com";
  const avatarUrl = profile?.avatar_url;

  // Cấu trúc nội dung Bio dưới dạng file bio.md có cả YAML Frontmatter và Markdown
  const rawBioTemplate = `---
title: About Me
developer: ${name}
status: Available for work
focus: Frontend & UX/UI
---

# Biography
${bio}`;

  // --- LOGIC 1: ĐỒNG HỒ REAL-TIME (GMT+7) ---
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- LOGIC 2: TYPEWRITER CHO BIO ---
  const [typedText, setTypedText] = useState("");
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    if (!startTyping) return;
    
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(rawBioTemplate.slice(0, i + 1));
      i++;
      if (i >= rawBioTemplate.length) {
        clearInterval(timer);
      }
    }, 4); // Tăng tốc độ gõ (4ms) để hiển thị nhanh chóng toàn bộ file md

    return () => clearInterval(timer);
  }, [startTyping, rawBioTemplate]);

  // Chia nhỏ text đã gõ thành các dòng
  const lines = typedText.split("\n");
  const displayLines = lines.length > 0 ? lines : [""];

  // --- HÀM TÔ MÀU CÚ PHÁP (SYNTAX HIGHLIGHTING) CHO TỪNG DÒNG MARKDOWN / YAML ---
  const renderSyntaxLine = (line: string, index: number) => {
    // 1. Dòng trống
    if (line.trim() === "") {
      return <div key={index} className="h-4" />;
    }

    // 2. Dòng YAML delimiter "---"
    if (line.trim() === "---") {
      return (
        <div key={index} className="text-zinc-400 dark:text-zinc-600 font-semibold select-none">
          {line}
        </div>
      );
    }

    // 3. Dòng YAML Key-value (chứa dấu hai chấm : và nằm ngoài Markdown H1/H2)
    if (line.includes(":") && !line.startsWith("#")) {
      const parts = line.split(":");
      const key = parts[0];
      const value = parts.slice(1).join(":");
      return (
        <div key={index}>
          <span className="text-purple-600 dark:text-purple-400 font-semibold">{key}</span>
          <span className="text-zinc-400">:</span>
          <span className="text-emerald-600 dark:text-emerald-400">{value}</span>
        </div>
      );
    }

    // 4. Dòng Header Markdown H1/H2 (# hoặc ##)
    if (line.startsWith("#")) {
      return (
        <div key={index} className="text-accent font-bold text-sm sm:text-base border-b border-zinc-200/60 dark:border-card-border/30 pb-1 mt-2 mb-1">
          {line}
        </div>
      );
    }

    // 5. Dòng gạch đầu dòng Markdown (- item)
    if (line.startsWith("-")) {
      return (
        <div key={index} className="pl-2">
          <span className="text-accent mr-1.5 font-bold">-</span>
          <span className="text-zinc-700 dark:text-zinc-300">{line.substring(2)}</span>
        </div>
      );
    }

    // 6. Dòng văn bản bình thường
    return (
      <div key={index} className="text-zinc-700 dark:text-zinc-300 font-mono leading-relaxed tracking-tight text-[11px] sm:text-[12px]">
        {line}
      </div>
    );
  };

  // --- LOGIC 3: GIẢ LẬP GITHUB CONTRIBUTION GRID ---
  const [commitGrid, setCommitGrid] = useState<number[][]>([]);
  useEffect(() => {
    const rows = 7;
    const cols = 15;
    const grid: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const rowArr: number[] = [];
      for (let c = 0; c < cols; c++) {
        const randVal = Math.random();
        if (randVal < 0.25) rowArr.push(0);
        else if (randVal < 0.55) rowArr.push(1);
        else if (randVal < 0.85) rowArr.push(2);
        else rowArr.push(3);
      }
      grid.push(rowArr);
    }
    setCommitGrid(grid);
  }, []);

  return (
    <section id="about" className="relative section-spacing overflow-hidden">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-15 dark:opacity-[0.07]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-left"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Tiểu sử
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl mt-2">
            Về bản thân tôi
          </h2>
        </motion.div>

        {/* --- BALANCED BENTO GRID SYSTEM --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: IDE Editor Bio Mockup (File Explorer + Line Numbers + Syntax Highlighting) - Chiếm 2 cột */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            onViewportEnter={() => setStartTyping(true)}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 flex flex-col justify-between rounded-2xl border border-zinc-200/80 dark:border-card-border bg-white/60 dark:bg-black/35 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-xl shadow-zinc-200/50 dark:shadow-none min-h-[380px] overflow-hidden"
          >
            {/* IDE Title Bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-zinc-150/40 dark:bg-black/50 border-b border-zinc-200/60 dark:border-card-border/60 select-none">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-white/60 dark:bg-card/60 px-2 py-0.5 rounded border border-zinc-200/60 dark:border-card-border/40">
                  bio.md
                </span>
              </div>
              <div className="w-10" />
            </div>

            {/* IDE Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* CỘT FILE EXPLORER MỜ ẢO (Xoá tan cảm giác trống trải bên trái) */}
              <div className="hidden sm:block w-36 border-r border-zinc-200/50 dark:border-card-border/40 bg-zinc-50/40 dark:bg-black/20 p-3.5 font-mono text-[10.5px] text-zinc-500 dark:text-zinc-500 space-y-3.5 select-none flex-shrink-0">
                <div className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-bold font-sans">Explorer</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-400">
                    <span>📁</span> <span className="font-semibold">portfolio</span>
                  </div>
                  <div className="pl-3.5 flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                    <span>📁</span> components
                  </div>
                  <div className="pl-7 flex items-center gap-1.5 text-accent font-semibold bg-accent/5 rounded px-2 py-0.5 border border-accent/15">
                    <span>📄</span> bio.md
                  </div>
                  <div className="pl-7 flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors">
                    <span>📄</span> skills.ts
                  </div>
                  <div className="pl-7 flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors">
                    <span>📄</span> contact.json
                  </div>
                </div>
              </div>

              {/* IDE Code Editor (Line Numbers + Syntax Highlighting) */}
              <div className="flex-1 flex p-5 font-mono text-[11px] sm:text-xs leading-relaxed overflow-y-auto max-h-[300px] select-text">
                {/* Line Numbers Column */}
                <div className="text-zinc-400 dark:text-zinc-600 pr-4 border-r border-zinc-200/50 dark:border-card-border/40 select-none text-right w-8 flex-shrink-0">
                  {displayLines.map((_, idx) => (
                    <div key={idx}>{String(idx + 1).padStart(2, "0")}</div>
                  ))}
                </div>
                
                {/* Content Area with Syntax Highlighting */}
                <div className="pl-4 text-zinc-700 dark:text-zinc-200 flex-1 space-y-0.5">
                  {displayLines.map((line, idx) => renderSyntaxLine(line, idx))}
                  {typedText.length < rawBioTemplate.length && (
                    <span className="inline-block w-1.5 h-4 bg-accent animate-pulse align-middle ml-1" />
                  )}
                </div>
              </div>

            </div>
            
            {/* IDE Status Bar */}
            <div className="px-5 py-2 bg-zinc-100/40 dark:bg-black/40 border-t border-zinc-200/50 dark:border-card-border/45 flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-zinc-500 select-none">
              <div className="flex items-center gap-3">
                <span>UTF-8</span>
                <span>Markdown</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-accent hover:underline"
                >
                  email_me()
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Chân dung ảnh nghệ thuật radar scanlines (1 cột dọc) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-2xl border border-zinc-200/80 dark:border-card-border bg-white/20 dark:bg-card/15 overflow-hidden min-h-[380px] hover:border-accent/40 transition-all duration-300 shadow-xl shadow-zinc-200/50 dark:shadow-none cursor-crosshair"
          >
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:brightness-105 group-hover:scale-[1.03] transition-all duration-700"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center">
                <span className="font-heading text-6xl font-bold text-text-muted/10">
                  {name.charAt(0)}
                </span>
              </div>
            )}
            
            {/* Radar Scanline & Screen Glitch mờ khi Hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(rgba(120,120,120,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(16,185,129,0.06),rgba(0,255,0,0.02),rgba(16,185,129,0.06))] bg-[size:100%_4px,3px_100%] z-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-75 group-hover:opacity-60 transition-opacity z-10" />
            
            <div className="absolute bottom-6 left-6 right-6 z-30">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
                Người sáng lập
              </span>
              <h4 className="font-heading text-base font-bold text-white mt-1">
                {name}
              </h4>
            </div>
          </motion.div>

          {/* Card 3: FULL WIDTH BOTTOM CARD (Tech Orbit + Clock + GitHub Grid) - Chiếm trọn 3 cột */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3 rounded-2xl border border-zinc-200/80 dark:border-card-border bg-white/60 dark:bg-card/15 p-6 sm:p-8 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden group"
          >
            {/* Đóng gói CSS Animation cho Orbit */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes orbit-ts-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes orbit-next-spin {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
              @keyframes orbit-node-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .animate-orbit-ts {
                transform-origin: 100px 100px;
                animation: orbit-ts-spin 15s linear infinite;
              }
              .animate-orbit-next {
                transform-origin: 100px 100px;
                animation: orbit-next-spin 25s linear infinite;
              }
              .animate-orbit-node {
                transform-origin: 100px 100px;
                animation: orbit-node-spin 35s linear infinite;
              }
              .animate-orbit-ts:hover, .animate-orbit-next:hover, .animate-orbit-node:hover {
                animation-play-state: paused;
              }
            `}} />

            {/* Split layout 3 cột trên desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              
              {/* Cột 1: Tech Orbit */}
              <div className="w-full flex flex-col justify-center items-center h-44 relative">
                <svg className="w-full h-full max-w-[160px] max-h-[160px]" viewBox="0 0 200 200">
                  {/* React Center */}
                  <circle cx="100" cy="100" r="10" fill="url(#center-grad)" className="filter drop-shadow-[0_0_6px_#10b981]" />
                  
                  <ellipse cx="100" cy="100" rx="35" ry="25" fill="none" className="stroke-zinc-200/80 dark:stroke-white/8" strokeWidth="1" strokeDasharray="3 3" />
                  <ellipse cx="100" cy="100" rx="60" ry="40" fill="none" className="stroke-zinc-200/60 dark:stroke-white/6" strokeWidth="1" />
                  <ellipse cx="100" cy="100" rx="85" ry="55" fill="none" className="stroke-zinc-200/40 dark:stroke-white/4" strokeWidth="1" />

                  {/* TS */}
                  <g className="animate-orbit-ts cursor-pointer group/node">
                    <circle cx="135" cy="100" r="5" fill="#3178c6" className="transition-transform group-hover/node:scale-125" />
                    <text x="135" y="90" className="text-[8px] fill-zinc-400 dark:fill-zinc-500 font-mono font-bold" textAnchor="middle">TS</text>
                  </g>

                  {/* Next */}
                  <g className="animate-orbit-next cursor-pointer group/node">
                    <circle cx="160" cy="100" r="6" className="fill-zinc-800 dark:fill-white transition-transform group-hover/node:scale-125" />
                    <text x="160" y="88" className="text-[8px] fill-zinc-400 dark:fill-zinc-500 font-mono font-bold" textAnchor="middle">Next</text>
                  </g>

                  {/* Node */}
                  <g className="animate-orbit-node cursor-pointer group/node">
                    <circle cx="185" cy="100" r="5" fill="#68a063" className="transition-transform group-hover/node:scale-125" />
                    <text x="185" y="88" className="text-[8px] fill-zinc-400 dark:fill-zinc-500 font-mono font-bold" textAnchor="middle">Node</text>
                  </g>

                  <defs>
                    <radialGradient id="center-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </radialGradient>
                  </defs>
                </svg>
                <span className="absolute text-[8px] font-mono text-emerald-500 dark:text-emerald-400 font-bold pointer-events-none select-none tracking-tight">React</span>
              </div>

              {/* Cột 2: Location & Clock */}
              <div className="space-y-4 px-2">
                <div className="flex items-center gap-2 select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted">
                    Specifications
                  </span>
                </div>
                <div className="space-y-3 text-xs font-mono border-l border-zinc-200/80 dark:border-card-border/60 pl-4 py-1">
                  <div className="space-y-0.5">
                    <span className="text-zinc-400 dark:text-zinc-500 block text-[10px]">CURRENT_LOCATION:</span>
                    <span className="text-foreground font-semibold">Việt Nam (GMT+7)</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-zinc-400 dark:text-zinc-500 block text-[10px]">LOCAL_TIME:</span>
                    <span className="text-accent font-bold tracking-wider">{time || "--:--:--"}</span>
                  </div>
                </div>
              </div>

              {/* Cột 3: Interactive simulated Github contribution grid */}
              <div className="flex flex-col justify-center items-center md:items-end gap-3 select-none">
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  GitHub Contribution Activity
                </span>
                
                {/* 7 rows x 15 columns Grid */}
                <div className="grid grid-flow-col grid-rows-7 gap-1 bg-zinc-50/40 dark:bg-black/25 p-3 rounded-lg border border-zinc-200/80 dark:border-card-border/50">
                  {commitGrid.map((row, rIdx) =>
                    row.map((val, cIdx) => {
                      let bgClass = "bg-zinc-200/60 dark:bg-zinc-900/40";
                      if (val === 1) bgClass = "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-250/20 dark:border-none";
                      if (val === 2) bgClass = "bg-emerald-300/80 dark:bg-emerald-700/40";
                      if (val === 3) bgClass = "bg-accent dark:bg-accent/80 animate-pulse-glow";
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`h-2.5 w-2.5 rounded-[1px] transition-colors duration-500 ${bgClass}`}
                          title={`Commits intensity: ${val}`}
                        />
                      );
                    })
                  )}
                </div>
                <span className="text-[8px] font-mono text-zinc-400 dark:text-text-muted/40">
                  less &bull; &bull; &bull; &bull; more
                </span>
              </div>

            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
