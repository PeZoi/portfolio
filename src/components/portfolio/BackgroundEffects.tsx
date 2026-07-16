"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundEffects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Kiểm tra xem thiết bị có hỗ trợ touch (màn hình cảm ứng) hay không
    // hoặc có yêu cầu giảm hiệu ứng động không
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || prefersReducedMotion) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      // Sử dụng requestAnimationFrame để đồng bộ tối ưu hóa hiệu năng render trên GPU
      window.requestAnimationFrame(() => {
        containerRef.current?.style.setProperty("--mouse-x", `${e.clientX}px`);
        containerRef.current?.style.setProperty("--mouse-y", `${e.clientY}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        // Các tọa độ mặc định ban đầu nằm ngoài viewport
        "--mouse-x": "-999px",
        "--mouse-y": "-999px",
      } as React.CSSProperties}
    >
      {/* 1.A LIGHT THEME SPOTLIGHT */}
      <div 
        className="absolute inset-0 block dark:hidden"
        style={{
          background: `
            radial-gradient(
              600px circle at var(--mouse-x) var(--mouse-y),
              rgba(139, 92, 246, 0.045) 0%,
              rgba(245, 158, 11, 0.03) 45%,
              transparent 80%
            )
          `
        }}
      />

      {/* 1.B DARK THEME SPOTLIGHT */}
      <div 
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(
              650px circle at var(--mouse-x) var(--mouse-y),
              rgba(16, 185, 129, 0.07) 0%,
              rgba(59, 130, 246, 0.06) 50%,
              transparent 80%
            )
          `
        }}
      />

      {/* 2. AMBIENT AURORAS (Đốm sáng tĩnh cực quang trôi nổi tự động) */}
      {/* Đốm sáng 1: Góc trên bên trái */}
      <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 dark:bg-emerald-500/5 blur-[120px] pointer-events-none animate-aurora-1" />

      {/* Đốm sáng 2: Góc dưới bên phải */}
      <div className="absolute -bottom-[20%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-pink-500/5 dark:bg-indigo-500/5 blur-[120px] pointer-events-none animate-aurora-2" />
    </div>
  );
}
