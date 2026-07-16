"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

interface NavbarProps {
  brandName?: string;
}

export default function Navbar({ brandName }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pathname = usePathname() || "";
  const isDetailPage = pathname.includes("/projects");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-card-border shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand/Logo (Vibe Terminal & Developer) */}
        <div className="flex items-center gap-3">
          <a
            href={isDetailPage ? "/" : "#hero"}
            className="font-heading text-xs sm:text-sm font-semibold tracking-tight text-foreground transition-all duration-300 hover:opacity-90 flex items-center gap-1.5 font-mono group"
          >
            <span className="text-accent font-bold group-hover:translate-x-0.5 transition-transform">&gt;</span>
            <span>{brandName || "portfolio"}</span>
            <span className="h-3 w-1.5 bg-accent animate-pulse" />
          </a>

        </div>

        {/* Desktop Navigation & Actions */}
        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-1">
            {navLinks.map((link, idx) => {
              const targetHref = isDetailPage ? `/${link.href}` : link.href;
              return (
                <li key={link.href} className="relative">
                  <a
                    href={targetHref}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative z-10 px-3.5 py-1.5 text-[12px] font-medium tracking-wide text-zinc-500 transition-colors duration-300 hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 font-mono block"
                  >
                    {link.label}
                  </a>

                  {/* Sliding glassmorphism indicator pill */}
                  <AnimatePresence>
                    {hoveredIndex === idx && (
                      <motion.span
                        layoutId="navHover"
                        className="absolute inset-0 z-0 rounded-lg bg-zinc-200/50 dark:bg-white/[0.04] border border-zinc-300/10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      />
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
          <ThemeToggle />
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200/40 hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
            aria-label="Toggle navigation menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="4" y1="4" x2="14" y2="14" />
                  <line x1="14" y1="4" x2="4" y2="14" />
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="15" y2="5" />
                  <line x1="3" y1="9" x2="15" y2="9" />
                  <line x1="3" y1="13" x2="15" y2="13" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Panel */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-card-border bg-background/95 backdrop-blur-xl px-6 pb-6 pt-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const targetHref = isDetailPage ? `/${link.href}` : link.href;
              return (
                <li key={link.href}>
                  <a
                    href={targetHref}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-200/40 hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-100 font-mono"
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </motion.header>
  );
}
