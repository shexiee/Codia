"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Upload, FileCode2, Loader2, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { LanguagePicker } from "./language-picker";
import { LANGUAGES } from "@/lib/parsers";
import type { Language } from "@/lib/types";
import { toast } from "sonner";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

interface CodeInputProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const ACCEPT: Record<Language, string> = {
  python: ".py",
  java: ".java",
  typescript: ".ts,.tsx",
};

const matchesLanguage = (filename: string, language: Language): boolean => {
  const ext = "." + filename.split(".").pop()!.toLowerCase();
  return ACCEPT[language].split(",").includes(ext);
};

export function CodeInput({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onGenerate,
  isLoading,
}: CodeInputProps) {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = LANGUAGES[language];

  const handleFile = async (file: File) => {
    if (!matchesLanguage(file.name, language)) {
      toast.error(
        `Expected a ${ACCEPT[language]} file (current language: ${config.label})`
      );
      return;
    }
    const text = await file.text();
    onCodeChange(text);
    setMode("paste");
    toast.success(`Loaded ${file.name}`);
  };

  return (
    <div className="flex h-full flex-col">
      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "paste" | "upload")}
        className="flex flex-1 flex-col"
      >
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="paste">
              <FileCode2 className="h-3.5 w-3.5" />
              Paste code
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-3.5 w-3.5" />
              Upload file
            </TabsTrigger>
          </TabsList>

          <Button
            variant="gradient"
            onClick={onGenerate}
            disabled={isLoading || !code.trim()}
            size="default"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Generate diagram
              </>
            )}
          </Button>
        </div>

        <TabsContent value="paste" className="mt-4 flex-1">
          <div className="gradient-border overflow-hidden">
            <div className="relative">
              <div className="flex items-center justify-between border-b border-border/60 bg-secondary/40 px-4 py-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                </div>
                <LanguagePicker value={language} onChange={onLanguageChange} />
              </div>
              <Editor
                height="420px"
                language={config.monacoLang}
                path={config.filename}
                value={code}
                onChange={(value) => onCodeChange(value ?? "")}
                theme="vs-dark"
                options={{
                  fontFamily:
                    "var(--font-jetbrains), ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 13,
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  padding: { top: 14, bottom: 14 },
                  renderLineHighlight: "gutter",
                  lineNumbersMinChars: 3,
                  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-4 flex-1">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="group flex h-[420px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 transition hover:border-violet-500/40 hover:bg-secondary/40"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 ring-1 ring-violet-500/30 transition group-hover:scale-105">
              <Upload className="h-6 w-6 text-violet-300" />
            </div>
            <p className="text-sm font-medium">
              Drop a {config.label} file here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Accepts{" "}
              <span className="font-mono text-foreground/80">
                {ACCEPT[language]}
              </span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT[language]}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
