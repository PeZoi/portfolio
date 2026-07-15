"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: string | null; // Chuỗi SVG thô
  subLabel?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find((opt) => opt.value === value);

  // Đóng dropdown khi click bên ngoài component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-left text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/20",
          "dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:text-zinc-200 dark:focus:border-zinc-600 dark:focus:ring-zinc-500/20"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon && (
            <div
              className="h-4.5 w-4.5 flex-shrink-0 text-zinc-500 [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: selectedOption.icon }}
            />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.subLabel && (
            <span className="text-[10px] text-text-muted font-normal uppercase tracking-wider">
              ({selectedOption.subLabel})
            </span>
          )}
        </div>
        
        {/* Chevron Icon */}
        <svg
          className={cn(
            "h-4 w-4 text-zinc-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-lg border border-card-border bg-card p-1 shadow-lg focus:outline-none",
            "animate-in fade-in slide-in-from-top-1 duration-150"
          )}
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-text-muted text-center">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3.5 py-2 text-left text-sm transition-colors duration-100",
                    isSelected
                      ? "bg-zinc-100 text-zinc-900 dark:bg-white/[0.08] dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.03] hover:text-zinc-900 dark:hover:text-zinc-200"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {option.icon && (
                      <div
                        className="h-4.5 w-4.5 flex-shrink-0 text-zinc-400 [&_svg]:h-full [&_svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: option.icon }}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                    {option.subLabel && (
                      <span className="text-[9px] text-text-muted/70 font-normal uppercase tracking-wider">
                        &bull; {option.subLabel}
                      </span>
                    )}
                  </div>
                  
                  {/* Selected checkmark */}
                  {isSelected && (
                    <svg
                      className="h-4 w-4 text-zinc-800 dark:text-zinc-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
