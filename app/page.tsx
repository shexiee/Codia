"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { CodeInput } from "@/components/code-input";
import { DiagramViewer } from "@/components/diagram-viewer";
import { ClassExplorer } from "@/components/class-explorer";
import { buildMermaid } from "@/lib/mermaid-builder";
import { parse, LANGUAGES } from "@/lib/parsers";
import type { Language, ParseResult } from "@/lib/types";

export default function Page() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(LANGUAGES.python.sample);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [mermaidSrc, setMermaidSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleSetRef = useRef<Record<string, true>>({
    [LANGUAGES.python.sample]: true,
  });

  const handleLanguageChange = (next: Language) => {
    if (next === language) return;
    setLanguage(next);
    if (sampleSetRef.current[code] || !code.trim()) {
      const nextSample = LANGUAGES[next].sample;
      setCode(nextSample);
      sampleSetRef.current[nextSample] = true;
    }
    setResult(null);
    setMermaidSrc(null);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 60));
      const parsed = parse(code, language);

      const count = Object.keys(parsed.classes).length;
      if (count === 0) {
        toast.warning("No classes found in the provided code");
      } else {
        toast.success(`Parsed ${count} class${count === 1 ? "" : "es"}`);
      }

      setResult(parsed);
      setMermaidSrc(buildMermaid(parsed));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Parse error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
          <div className="gradient-border p-5">
            <CodeInput
              code={code}
              onCodeChange={setCode}
              language={language}
              onLanguageChange={handleLanguageChange}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>

          <div className="gradient-border p-5">
            <DiagramViewer mermaidSource={mermaidSrc} />
          </div>
        </motion.div>

        {result && Object.keys(result.classes).length > 0 && (
          <div className="mt-6">
            <ClassExplorer result={result} />
          </div>
        )}
      </section>

      <footer className="border-t border-border/40 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <span>Codia &middot; built with Next.js + Mermaid</span>
          <span>Python &middot; Java &middot; TypeScript</span>
        </div>
      </footer>
    </main>
  );
}
