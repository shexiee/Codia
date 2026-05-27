import type { ParseResult, ClassInfo, Relationship } from "../types";

const stripStringsAndComments = (line: string): string =>
  line
    .replace(/'''[\s\S]*?'''/g, "")
    .replace(/"""[\s\S]*?"""/g, "")
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/#.*$/, "");

function joinMultilineParens(code: string): string {
  const lines = code.split("\n");
  const out: string[] = [];
  let buffer = "";
  let depth = 0;

  for (const line of lines) {
    const cleaned = stripStringsAndComments(line);
    const opens = (cleaned.match(/[([{]/g) ?? []).length;
    const closes = (cleaned.match(/[)\]}]/g) ?? []).length;

    if (depth > 0) {
      buffer += " " + line.trim();
      depth += opens - closes;
      if (depth <= 0) {
        out.push(buffer);
        buffer = "";
        depth = 0;
      }
    } else {
      depth = opens - closes;
      if (depth > 0) {
        buffer = line.replace(/\s+$/, "");
      } else {
        out.push(line);
      }
    }
  }

  if (buffer) out.push(buffer);
  return out.join("\n");
}

const indentOf = (line: string): number => {
  const m = line.match(/^([\t ]*)/);
  if (!m) return 0;
  return m[1].replace(/\t/g, "    ").length;
};

const cleanParamName = (raw: string): string =>
  raw.trim().replace(/^\*+/, "").split(/[:=]/)[0].trim();

function parseParents(basesSrc: string): string[] {
  if (!basesSrc.trim()) return [];
  const parents: string[] = [];
  let depth = 0;
  let current = "";

  for (const ch of basesSrc) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      pushBase(current, parents);
      current = "";
    } else {
      current += ch;
    }
  }
  pushBase(current, parents);
  return parents;
}

function pushBase(raw: string, parents: string[]) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes("=")) return;
  const last = trimmed.split(".").pop()!;
  if (/^[A-Za-z_]\w*$/.test(last)) parents.push(last);
}

export function parsePython(code: string): ParseResult {
  const joined = joinMultilineParens(code);
  const lines = joined.split("\n");

  const classes: Record<string, ClassInfo> = {};
  const relationships: Relationship[] = [];

  let currentClass: ClassInfo | null = null;
  let classIndent = -1;
  let currentMethod: { name: string; indent: number } | null = null;

  const classRe = /^class\s+([A-Za-z_]\w*)\s*(?:\(([\s\S]*?)\))?\s*:/;
  const defRe = /^(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\(([\s\S]*?)\)\s*(?:->[\s\S]*?)?:/;
  const selfAttrRe = /^self\.([A-Za-z_]\w*)\s*(?::[\s\S]*?)?=(?!=)/;
  const classAttrRe = /^([A-Za-z_]\w*)\s*(?::[\s\S]*?)?=(?!=)/;
  const classAnnRe = /^([A-Za-z_]\w*)\s*:[^=]+$/;

  for (const rawLine of lines) {
    const stripped = rawLine.trim();
    if (!stripped || stripped.startsWith("#")) continue;

    const indent = indentOf(rawLine);

    if (currentClass && indent <= classIndent) {
      currentClass = null;
      classIndent = -1;
      currentMethod = null;
    }
    if (currentMethod && indent <= currentMethod.indent) {
      currentMethod = null;
    }

    const classMatch = stripped.match(classRe);
    if (classMatch) {
      const name = classMatch[1];
      const parents = parseParents(classMatch[2] ?? "");
      const info: ClassInfo = { name, methods: [], attributes: [], parents };
      classes[name] = info;
      for (const p of parents) {
        relationships.push({ parent: p, child: name, type: "inheritance" });
      }
      currentClass = info;
      classIndent = indent;
      currentMethod = null;
      continue;
    }

    if (!currentClass) continue;

    const defMatch = stripped.match(defRe);
    if (defMatch && indent > classIndent) {
      const name = defMatch[1];
      const params = defMatch[2]
        .split(",")
        .map(cleanParamName)
        .filter((p) => p && p !== "self" && p !== "cls");
      currentClass.methods.push(`${name}(${params.join(", ")})`);
      currentMethod = { name, indent };
      continue;
    }

    const selfMatch = stripped.match(selfAttrRe);
    if (selfMatch && currentMethod) {
      const attr = selfMatch[1];
      if (!currentClass.attributes.includes(attr)) {
        currentClass.attributes.push(attr);
      }
      continue;
    }

    if (!currentMethod && indent > classIndent) {
      const ann = stripped.match(classAttrRe) ?? stripped.match(classAnnRe);
      if (ann) {
        const attr = ann[1];
        const reserved = new Set(["class", "def", "return", "if", "else", "for", "while", "with", "try", "except", "import", "from", "pass", "raise", "yield", "lambda", "async", "await"]);
        if (!reserved.has(attr) && !currentClass.attributes.includes(attr)) {
          currentClass.attributes.push(attr);
        }
      }
    }
  }

  return { classes, relationships };
}
