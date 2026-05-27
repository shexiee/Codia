"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { LANGUAGES } from "@/lib/parsers";
import type { Language } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LanguagePickerProps {
  value: Language;
  onChange: (lang: Language) => void;
}

export function LanguagePicker({ value, onChange }: LanguagePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const current = LANGUAGES[value];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1 font-mono text-xs text-muted-foreground transition hover:border-border/60 hover:bg-secondary/60 hover:text-foreground"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80" />
        {current.filename}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-border/60 bg-card/95 p-1 shadow-2xl backdrop-blur-xl">
          {Object.values(LANGUAGES).map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => {
                onChange(lang.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-xs transition",
                value === lang.id
                  ? "bg-violet-500/15 text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    value === lang.id ? "bg-violet-400" : "bg-muted-foreground/40"
                  )}
                />
                <span className="font-medium">{lang.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  {lang.filename}
                </span>
              </span>
              {value === lang.id && <Check className="h-3 w-3 text-violet-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
