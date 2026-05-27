"use client";

import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Wand2 className="h-3 w-3 text-violet-400" />
          100% client-side &middot; deploy anywhere
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-gradient">Code → diagram</span>
          <br />
          <span className="text-foreground/90">in one paste.</span>
        </h1>

        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Drop in <span className="text-foreground/90">Python</span>,{" "}
          <span className="text-foreground/90">Java</span>, or{" "}
          <span className="text-foreground/90">TypeScript</span> and instantly get a
          clean, exportable UML class diagram. No setup, no configuration.
        </p>
      </motion.div>
    </section>
  );
}
