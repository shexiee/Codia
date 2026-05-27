"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Boxes, GitBranch, ChevronRight } from "lucide-react";
import type { ParseResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ClassExplorerProps {
  result: ParseResult | null;
}

export function ClassExplorer({ result }: ClassExplorerProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!result || Object.keys(result.classes).length === 0) {
    return null;
  }

  const classList = Object.values(result.classes);
  const active = selected ?? classList[0]?.name ?? null;
  const activeClass = active ? result.classes[active] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <div className="md:col-span-1">
        <div className="gradient-border h-full">
          <div className="flex h-full flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Boxes className="h-4 w-4 text-violet-400" />
                Classes
              </h3>
              <span className="rounded-md bg-secondary/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {classList.length}
              </span>
            </div>
            <div className="scrollbar-thin -mx-1 flex flex-col gap-0.5 overflow-y-auto px-1">
              {classList.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelected(c.name)}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition",
                    active === c.name
                      ? "bg-violet-500/15 text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2 truncate font-mono text-xs">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        active === c.name ? "bg-violet-400" : "bg-muted-foreground/40"
                      )}
                    />
                    {c.name}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition",
                      active === c.name
                        ? "text-violet-300"
                        : "opacity-0 group-hover:opacity-100"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="gradient-border h-full">
          <AnimatePresence mode="wait">
            {activeClass && (
              <motion.div
                key={activeClass.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col p-5"
              >
                <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="font-mono text-lg font-semibold tracking-tight">
                      {activeClass.name}
                    </h3>
                    {activeClass.parents.length > 0 && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        extends{" "}
                        <span className="font-mono text-violet-300">
                          {activeClass.parents.join(", ")}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <Stat label="attrs" value={activeClass.attributes.length} />
                    <Stat label="methods" value={activeClass.methods.length} />
                  </div>
                </div>

                <div className="scrollbar-thin grid flex-1 gap-5 overflow-y-auto md:grid-cols-2">
                  <Section title="Attributes" items={activeClass.attributes} prefix="-" />
                  <Section title="Methods" items={activeClass.methods} prefix="+" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-2 py-1 font-mono">
      <span className="text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function Section({
  title,
  items,
  prefix,
}: {
  title: string;
  items: string[];
  prefix: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs italic text-muted-foreground/70">none</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-baseline gap-2 font-mono text-xs"
            >
              <span className="text-violet-400">{prefix}</span>
              <span className="text-foreground/90">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
