"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Skill } from "@/types/database";

interface ProjectWithSkills {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  featured: boolean;
  order_index: number;
  skills: Skill[];
}

interface ProjectsSectionProps {
  projects: ProjectWithSkills[];
}

// Đoạn code 1: main.tsx (Khởi chạy ứng dụng)
const reactMainCode = (title: string, slug: string) => `
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/components/ThemeProvider";
import App from "./App";
import "./globals.css";

// Khởi chạy dự án: ${title}
ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <App projectSlug="${slug}" />
    </ThemeProvider>
  </React.StrictMode>
);`;

// Đoạn code 2: App.tsx (Logic component chính)
const reactAppCode = (title: string, slug: string) => `
import React, { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Loader } from "@/components/Loader";

// Component cốt lõi của ${title}
export default function App({ projectSlug }: { projectSlug: string }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập tải workspace dữ liệu
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [projectSlug]);

  if (loading) {
    return <Loader label="Compiling workspace..." />;
  }
  return <Dashboard slug={projectSlug} active={true} />;
}`;

// Hàm tô màu cú pháp (Syntax Highlighting) giống VS Code bằng phương pháp Tokenize thô an toàn
function highlightCode(line: string): string {
  if (!line) return "&nbsp;";

  // Danh sách từ khóa JS/TS
  const keywords = new Set([
    "import", "from", "const", "let", "var", "export", "default",
    "function", "return", "if", "else", "new", "async", "await",
    "try", "catch", "class", "extends", "as", "typeof", "null",
    "undefined", "true", "false", "void"
  ]);

  // Các hàm và biến dựng sẵn
  const builtins = new Set([
    "document", "window", "console", "log", "error", "createRoot",
    "render", "setTimeout", "clearTimeout", "useState", "useEffect"
  ]);

  // Các thuộc tính/props trong JSX
  const props = new Set([
    "defaultTheme", "projectSlug", "storageKey", "active", "slug", "project"
  ]);

  // Tách comment ra trước để bảo vệ không bị highlight nhầm
  let comment = "";
  const commentIdx = line.indexOf("//");
  let codePart = line;
  if (commentIdx !== -1) {
    comment = line.substring(commentIdx);
    codePart = line.substring(0, commentIdx);
  }

  // Hàm escape HTML an toàn
  const escapeHTML = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Phân tách dòng code thô thành các token biệt lập
  // - Chuỗi: "..." hoặc '...' hoặc `...`
  // - Số: \b\d+\b
  // - Từ (word): \b[a-zA-Z_][a-zA-Z0-9_]*\b
  // - Ký tự đặc biệt khác: [^\w\s'"`]+
  // - Khoảng trắng: \s+
  const tokenRegex = /("[^"]*"|'[^']*'|`[^`]*`|\b\d+\b|\b[a-zA-Z_][a-zA-Z0-9_]*\b|[^\w\s'"`]+|\s+)/g;
  const tokens = codePart.match(tokenRegex) || [codePart];

  const highlightedTokens = tokens.map((token) => {
    // 3.A Tô màu Chuỗi (Strings)
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith("`") && token.endsWith("`"))
    ) {
      return `<span class="text-emerald-400">${escapeHTML(token)}</span>`;
    }

    // 3.B Tô màu Số (Numbers)
    if (/^\d+$/.test(token)) {
      return `<span class="text-[#b5cea8]">${token}</span>`;
    }

    // 3.C Tô màu Từ định danh (Identifiers)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
      if (keywords.has(token)) {
        return `<span class="text-[#c586c0] font-semibold">${token}</span>`;
      }
      if (builtins.has(token)) {
        return `<span class="text-[#dcdcaa]">${token}</span>`;
      }
      if (props.has(token)) {
        return `<span class="text-[#9cdcfe]">${token}</span>`;
      }
      // Chữ viết hoa đầu dòng -> React Components / Classes
      if (/^[A-Z]/.test(token)) {
        return `<span class="text-[#4ec9b0] font-medium">${token}</span>`;
      }
      return token;
    }

    // 3.D Trả về ký tự đặc biệt được escape HTML
    return escapeHTML(token);
  });

  // 4. Ghép nối tokens và comment bảo vệ ban đầu
  let result = highlightedTokens.join("");
  if (comment) {
    result += `<span class="text-zinc-500 font-normal italic">${escapeHTML(comment)}</span>`;
  }

  return result;
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"main.tsx" | "App.tsx">("main.tsx");
  const [typedCode, setTypedCode] = useState("");

  if (projects.length === 0) return null;

  const currentProject = projects[activeProjectIndex];

  // Khi người dùng click chuyển đổi sang dự án khác, reset về tab đầu tiên (main.tsx)
  useEffect(() => {
    setActiveTab("main.tsx");
  }, [activeProjectIndex]);

  // Hiệu ứng Typewriter tự động gõ code + swap tab liên tục sau khi chờ 2 giây
  useEffect(() => {
    const fullCode =
      activeTab === "main.tsx"
        ? reactMainCode(currentProject.title, currentProject.slug)
        : reactAppCode(currentProject.title, currentProject.slug);

    setTypedCode("");

    let index = 0;
    const typingSpeed = 5; // 5ms mỗi ký tự để code gõ nhanh và mượt mà
    let timeoutId: NodeJS.Timeout;

    const interval = setInterval(() => {
      setTypedCode((prev) => prev + fullCode.charAt(index));
      index++;

      if (index >= fullCode.length) {
        clearInterval(interval);

        // Gõ xong hoàn tất -> Chờ 2 giây rồi tự động swap sang tab kia (Infinity loop)
        timeoutId = setTimeout(() => {
          setActiveTab((prev) => (prev === "main.tsx" ? "App.tsx" : "main.tsx"));
        }, 2000);
      }
    }, typingSpeed);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeTab, activeProjectIndex, currentProject]);

  return (
    <section id="projects" className="relative section-spacing overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 max-w-2xl text-left"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Sản phẩm
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl mt-2">
            Workspace Dự án
          </h2>
        </motion.div>

        {/* --- IDE INTERACTIVE LAYOUT --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-2xl border border-card-border bg-black/50 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]"
        >
          {/* 1. Sidebar Explorer (Trái) */}
          <div className="w-full md:w-56 bg-black/60 border-r border-card-border/70 flex-shrink-0 flex flex-col justify-between">
            <div>
              {/* Explorer Header */}
              <div className="px-4 py-3 border-b border-card-border/50 flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                  Explorer
                </span>
                <span className="text-[9px] font-mono text-zinc-600">WORKSPACE</span>
              </div>

              {/* Explorer File List */}
              <div className="p-2 space-y-1 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest font-mono">
                  src/projects/
                </div>
                {projects.map((project, idx) => {
                  const isActive = idx === activeProjectIndex;

                  return (
                    <button
                      key={project.id}
                      onClick={() => setActiveProjectIndex(idx)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-all duration-150 font-mono text-xs ${isActive
                        ? "bg-zinc-800/60 text-zinc-100 border-l-2 border-accent"
                        : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-350"
                        }`}
                    >
                      {/* React/TS File Badge */}
                      <span className="font-bold text-[9px] px-1 rounded text-blue-400 bg-blue-500/10">
                        TSX
                      </span>
                      <span className="truncate">{project.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Git status info */}
            <div className="p-4 border-t border-card-border/50 font-mono text-[9px] text-zinc-600 space-y-1 hidden md:block">
              <p>Branch: <span className="text-zinc-400">main</span></p>
              <p>Sync: <span className="text-emerald-500">up-to-date</span></p>
            </div>
          </div>

          {/* 2. Main Workspace: Code Editor & Live Preview Split */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Editor Tabs bar */}
            <div className="h-10 bg-black/45 border-b border-card-border/60 flex items-center px-2 gap-1 overflow-x-auto">
              {/* Tab 1: main.tsx */}
              <button
                onClick={() => setActiveTab("main.tsx")}
                className={`flex items-center gap-1.5 px-4 py-2 border-t text-xs font-mono transition-all ${activeTab === "main.tsx"
                  ? "bg-zinc-850/80 border-t-accent text-zinc-100"
                  : "border-t-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                <span className="text-blue-400 text-[9px] font-bold">TSX</span>
                <span>main.tsx</span>
              </button>

              {/* Tab 2: App.tsx */}
              <button
                onClick={() => setActiveTab("App.tsx")}
                className={`flex items-center gap-1.5 px-4 py-2 border-t text-xs font-mono transition-all ${activeTab === "App.tsx"
                  ? "bg-zinc-850/80 border-t-accent text-zinc-100"
                  : "border-t-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                <span className="text-blue-400 text-[9px] font-bold">TSX</span>
                <span>App.tsx</span>
              </button>
            </div>

            {/* Split layout: Editor Trái, Preview Phải */}
            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 min-h-0">
              {/* 2.A Code Display Panel (Trái - Có Typewriter & Syntax Highlighting) */}
              <div className="flex-1 p-5 overflow-y-auto bg-black/25 border-b lg:border-b-0 lg:border-r border-card-border/50 font-mono text-[10.5px] sm:text-xs leading-relaxed text-zinc-300 selection:bg-accent/20">
                <pre className="whitespace-pre-wrap sm:whitespace-pre">
                  <code>
                    {typedCode.split("\n").map((line, idx) => (
                      <div key={idx} className="table-row">
                        <span className="table-cell pr-4 text-zinc-650 text-right select-none w-8">{idx + 1}</span>
                        <span
                          className="table-cell"
                          dangerouslySetInnerHTML={{ __html: highlightCode(line) }}
                        />
                      </div>
                    ))}
                    {typedCode.length < (activeTab === "main.tsx" ? reactMainCode(currentProject.title, currentProject.slug).length : reactAppCode(currentProject.title, currentProject.slug).length) && (
                      <span className="inline-block w-1.5 h-3.5 bg-accent/80 ml-0.5 animate-pulse" />
                    )}
                  </code>
                </pre>
              </div>

              {/* 2.B Compilation / Live Preview Panel (Phải - Không cuộn dọc, fit content) */}
              <div className="flex-1 p-5 flex flex-col justify-between bg-black/10 min-h-0 overflow-hidden">
                <div className="space-y-3">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                      Compilation Output
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono text-emerald-400 border border-emerald-500/20">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                      Status: Deployed
                    </span>
                  </div>

                  {/* Project Image */}
                  <a
                    href={`/projects/${currentProject.slug}`}
                    className="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden border border-card-border bg-zinc-900 shadow-inner flex-shrink-0 block group/img"
                  >
                    {currentProject.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={currentProject.image_url}
                        alt={currentProject.title}
                        className="h-full w-full object-cover brightness-105 contrast-[1.02] transition-all duration-300 group-hover/img:scale-[1.03]"
                        loading="eager"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted/40 font-mono">No preview image</span>
                      </div>
                    )}
                  </a>

                  {/* Info */}
                  <div className="space-y-1">
                    <a
                      href={`/projects/${currentProject.slug}`}
                      className="hover:text-accent transition-colors block"
                    >
                      <h3 className="font-heading text-base font-bold">
                        {currentProject.title}
                      </h3>
                    </a>
                    <p className="text-xs leading-relaxed text-text-muted line-clamp-2">
                      {currentProject.description}
                    </p>
                  </div>

                  {/* Project Skill Badges */}
                  {currentProject.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {currentProject.skills.slice(0, 4).map((skill) => (
                        <div
                          key={skill.id}
                          title={skill.name}
                          className="flex items-center gap-1.5 rounded-full border border-card-border/50 bg-card/40 px-2.5 py-0.5"
                        >
                          {skill.svg_icon && (
                            <div
                              className="skill-icon h-3 w-3 text-zinc-400 [&_svg]:h-full [&_svg]:w-full"
                              dangerouslySetInnerHTML={{ __html: skill.svg_icon }}
                            />
                          )}
                          <span className="text-[9px] font-medium text-text-muted">
                            {skill.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Action Links */}
                <div className="pt-3.5 border-t border-card-border/50 flex gap-2 flex-wrap flex-shrink-0">
                  <a
                    href={`/projects/${currentProject.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-card/40 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-card hover:border-zinc-350 dark:hover:border-zinc-700 active:scale-[0.97]"
                  >
                    View Details
                  </a>
                  {currentProject.demo_url && (
                    <a
                      href={currentProject.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background transition-all hover:opacity-90 active:scale-[0.97]"
                    >
                      Run Application
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </a>
                  )}
                  {currentProject.github_url && (
                    <a
                      href={currentProject.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-4 py-2 text-xs font-medium text-text-muted transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-foreground"
                    >
                      Source Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
