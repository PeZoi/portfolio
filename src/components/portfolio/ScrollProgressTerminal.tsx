"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LogLine {
  timestamp: string;
  type: "system" | "db" | "net" | "sec";
  message: string;
}

export default function ScrollProgressTerminal() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [minimized, setMinimized] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  function getTimestamp() {
    const now = new Date();
    return now.toTimeString().split(" ")[0];
  }

  // Khởi tạo log đầu tiên ở Client để tránh lệch Hydration SSR
  useEffect(() => {
    setLogs([
      {
        timestamp: getTimestamp(),
        type: "system",
        message: "portfolio.init() successful.",
      },
    ]);
  }, []);

  // Theo dõi các section khi cuộn trang
  useEffect(() => {
    const sections = ["hero", "about", "skills", "projects", "contact"];
    const observedMessages: Record<string, LogLine> = {
      hero: {
        timestamp: "",
        type: "system",
        message: "Viewport anchored on hero.tsx.",
      },
      about: {
        timestamp: "",
        type: "system",
        message: "Fetching user biography from profiles...",
      },
      skills: {
        timestamp: "",
        type: "db",
        message: 'SELECT * FROM skills WHERE category IN ("Frontend", "Backend", "Database", "Tools");',
      },
      projects: {
        timestamp: "",
        type: "net",
        message: "git status & --fetch projects metadata: 200 OK (118ms)",
      },
      contact: {
        timestamp: "",
        type: "sec",
        message: "Secure socket listening on port 443... waiting for user message.",
      },
    };

    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const logTemplate = observedMessages[id];
            
            // Tránh ghi lặp lại log giống hệt nhau liên tiếp
            setLogs((prev) => {
              const lastLog = prev[prev.length - 1];
              if (lastLog && lastLog.message === logTemplate.message) return prev;
              
              return [
                ...prev,
                {
                  ...logTemplate,
                  timestamp: getTimestamp(),
                },
              ].slice(-6); // Chỉ giữ lại 6 dòng log mới nhất để không tràn widget
            });
          }
        },
        { threshold: 0.25 } // Trigger khi 25% section hiện diện trong khung nhìn
      );

      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  // Tự động cuộn xuống dòng log mới nhất
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimized(!minimized);
  };

  const getLogTypeColor = (type: LogLine["type"]) => {
    switch (type) {
      case "system":
        return "text-blue-400";
      case "db":
        return "text-purple-400";
      case "net":
        return "text-amber-400";
      case "sec":
        return "text-accent";
      default:
        return "text-zinc-400";
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden lg:block font-mono">
      <div
        className={`rounded-lg border border-card-border bg-black/80 backdrop-blur-md shadow-2xl transition-all duration-300 overflow-hidden ${
          minimized ? "w-48" : "w-72"
        }`}
      >
        {/* Title bar */}
        <div
          onClick={() => setMinimized(!minimized)}
          className="flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-card-border/60 cursor-pointer hover:bg-black/80 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[9px] font-semibold text-zinc-400 tracking-wider">
              monitor.log
            </span>
          </div>
          <button
            onClick={toggleMinimize}
            className="text-zinc-500 hover:text-zinc-300 text-[10px] p-0.5"
          >
            {minimized ? "[+]" : "[-]"}
          </button>
        </div>

        {/* Console lines (Ẩn khi thu nhỏ) */}
        <AnimatePresence>
          {!minimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3 text-[9px] leading-relaxed space-y-1.5 overflow-hidden"
            >
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-1.5 items-start">
                  <span className="text-zinc-500 flex-shrink-0">{log.timestamp}</span>
                  <span className={`${getLogTypeColor(log.type)} flex-shrink-0 font-bold`}>
                    [{log.type.toUpperCase()}]
                  </span>
                  <span className="text-zinc-300 break-all">{log.message}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
