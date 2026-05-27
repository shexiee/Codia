import type { ParseResult, ClassInfo, Relationship } from "../types";

const stripJavaTokens = (code: string): string =>
  code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");

function splitTopLevel(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of s) {
    if (ch === "<" || ch === "(" || ch === "[") depth++;
    else if (ch === ">" || ch === ")" || ch === "]") depth--;
    if (ch === sep && depth === 0) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) out.push(current);
  return out;
}

const bareTypeName = (raw: string): string | null => {
  const stripped = raw.trim().split("<")[0].trim();
  const last = stripped.split(".").pop()!;
  return /^[A-Za-z_]\w*$/.test(last) ? last : null;
};

function findMatchingBrace(code: string, openIdx: number): number {
  let depth = 1;
  for (let i = openIdx + 1; i < code.length; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

interface BodyStmt {
  kind: "method" | "field" | "skip";
  signature?: string;
  text?: string;
}

function splitBodyStatements(body: string): BodyStmt[] {
  const stmts: BodyStmt[] = [];
  let i = 0;
  let chunkStart = 0;

  while (i < body.length) {
    const ch = body[i];

    if (ch === "(") {
      let depth = 1;
      i++;
      while (i < body.length && depth > 0) {
        if (body[i] === "(") depth++;
        else if (body[i] === ")") depth--;
        i++;
      }
      continue;
    }

    if (ch === "{") {
      const sig = body.slice(chunkStart, i).trim();
      const end = findMatchingBrace(body, i);
      if (end === -1) break;
      if (/\b(class|interface|enum|record)\b/.test(sig)) {
        stmts.push({ kind: "skip" });
      } else if (sig === "" || /^static\s*$/.test(sig)) {
        stmts.push({ kind: "skip" });
      } else {
        stmts.push({ kind: "method", signature: sig });
      }
      i = end + 1;
      chunkStart = i;
      continue;
    }

    if (ch === ";") {
      const stmt = body.slice(chunkStart, i).trim();
      if (stmt) stmts.push({ kind: "field", text: stmt });
      i++;
      chunkStart = i;
      continue;
    }

    i++;
  }

  return stmts;
}

function parseMethodSignature(sig: string): { name: string; params: string[] } | null {
  const cleaned = sig.replace(/@\w+(?:\([^)]*\))?\s*/g, "").trim();
  const m = cleaned.match(/([A-Za-z_]\w*)\s*\(([\s\S]*)\)\s*(?:throws\s+[\w.,\s]+)?$/);
  if (!m) return null;
  const name = m[1];
  if (["if", "for", "while", "switch", "catch", "synchronized"].includes(name)) return null;
  const params = splitTopLevel(m[2], ",")
    .map((p) => {
      const tokens = p
        .replace(/@\w+(?:\([^)]*\))?\s*/g, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      return tokens[tokens.length - 1]?.replace(/[.,]+$/, "") ?? "";
    })
    .filter((p) => /^[A-Za-z_]\w*$/.test(p));
  return { name, params };
}

function extractFieldNames(stmt: string): string[] {
  const noAnn = stmt.replace(/@\w+(?:\([^)]*\))?\s*/g, "").trim();
  if (!noAnn) return [];
  const decl = noAnn.split("=")[0].trim();
  const reverseTail = decl.split("").reverse().join("").match(/^[\w\s,]+/);
  if (!reverseTail) return [];
  const tail = reverseTail[0].split("").reverse().join("").trim();
  const parts = tail.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return [];
  const firstTokens = parts[0].split(/\s+/);
  parts[0] = firstTokens[firstTokens.length - 1];
  return parts.filter((n) => /^[a-zA-Z_]\w*$/.test(n));
}

export function parseJava(code: string): ParseResult {
  const cleaned = stripJavaTokens(code);
  const classes: Record<string, ClassInfo> = {};
  const relationships: Relationship[] = [];

  const declRe =
    /(?:^|[;{}])\s*(?:(?:public|private|protected|abstract|final|static|sealed|non-sealed)\s+)*(class|interface|enum|record)\s+([A-Z]\w*)\s*(?:<[^>]+>)?\s*(?:extends\s+([\w.<>,\s]+?))?\s*(?:implements\s+([\w.<>,\s]+?))?\s*\{/g;

  let m: RegExpExecArray | null;
  while ((m = declRe.exec(cleaned))) {
    const name = m[2];
    const parents: string[] = [];

    if (m[3]) {
      for (const p of splitTopLevel(m[3], ",")) {
        const n = bareTypeName(p);
        if (n) parents.push(n);
      }
    }
    if (m[4]) {
      for (const p of splitTopLevel(m[4], ",")) {
        const n = bareTypeName(p);
        if (n) parents.push(n);
      }
    }

    const openBrace = cleaned.indexOf("{", m.index);
    const closeBrace = findMatchingBrace(cleaned, openBrace);
    if (closeBrace === -1) continue;
    const body = cleaned.slice(openBrace + 1, closeBrace);

    const info: ClassInfo = { name, methods: [], attributes: [], parents };

    for (const stmt of splitBodyStatements(body)) {
      if (stmt.kind === "method" && stmt.signature) {
        const parsed = parseMethodSignature(stmt.signature);
        if (parsed) {
          info.methods.push(`${parsed.name}(${parsed.params.join(", ")})`);
        }
      } else if (stmt.kind === "field" && stmt.text) {
        for (const fieldName of extractFieldNames(stmt.text)) {
          if (!info.attributes.includes(fieldName)) info.attributes.push(fieldName);
        }
      }
    }

    classes[name] = info;
    for (const p of parents) {
      relationships.push({ parent: p, child: name, type: "inheritance" });
    }
  }

  return { classes, relationships };
}
