"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { motion } from "framer-motion";
import { Download, Image as ImageIcon, FileCode } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    darkMode: true,
    background: "transparent",
    primaryColor: "#1a1625",
    primaryTextColor: "#fafafa",
    primaryBorderColor: "#7c3aed",
    lineColor: "#a78bfa",
    secondaryColor: "#211b32",
    tertiaryColor: "#16131f",
    classText: "#fafafa",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  },
  securityLevel: "loose",
  flowchart: { htmlLabels: true },
});

interface DiagramViewerProps {
  mermaidSource: string | null;
}

export function DiagramViewer({ mermaidSource }: DiagramViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgString, setSvgString] = useState<string>("");
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!mermaidSource) {
      setSvgString("");
      setRenderError(null);
      return;
    }

    let cancelled = false;
    const id = `diagram-${Date.now()}`;

    mermaid
      .render(id, mermaidSource)
      .then(({ svg }) => {
        if (cancelled) return;
        setSvgString(svg);
        setRenderError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setRenderError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [mermaidSource]);

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    triggerDownload(blob, "class-diagram.svg");
    toast.success("Downloaded SVG");
  };

  const downloadPng = async () => {
    if (!svgString || !containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) return;

    const rect = svgEl.getBoundingClientRect();
    const width = Math.max(800, rect.width * 2);
    const height = Math.max(600, rect.height * 2);

    const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], {
      type: "image/svg+xml",
    });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((b) => {
        if (b) {
          triggerDownload(b, "class-diagram.png");
          toast.success("Downloaded PNG");
        }
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (!mermaidSource) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-secondary/10 text-center">
        <div className="mb-3 rounded-full bg-secondary/50 p-3">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground/80">
          Your diagram will appear here
        </p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Paste some Python and hit{" "}
          <span className="font-mono text-foreground/80">Generate diagram</span>
        </p>
      </div>
    );
  }

  if (renderError) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-xl border border-red-500/40 bg-red-500/5 p-6 text-center">
        <p className="text-sm font-medium text-red-300">Diagram render failed</p>
        <p className="mt-2 max-w-md font-mono text-xs text-red-200/80">
          {renderError}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={mermaidSource}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex h-full flex-col"
    >
      <div className="mb-3 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={downloadSvg}>
          <FileCode className="h-3.5 w-3.5" /> SVG
        </Button>
        <Button variant="outline" size="sm" onClick={downloadPng}>
          <Download className="h-3.5 w-3.5" /> PNG
        </Button>
      </div>
      <div
        ref={containerRef}
        className="scrollbar-thin flex flex-1 items-center justify-center overflow-auto rounded-xl border border-border/60 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,hsl(263_60%_12%/_0.5),transparent_70%)] p-6 [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
    </motion.div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
