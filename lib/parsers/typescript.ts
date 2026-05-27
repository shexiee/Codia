import type { ParseResult, ClassInfo, Relationship } from "../types";

const stripTsTokens = (code: string): string =>
  code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");

function splitTopLevel(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of s) {
    if (ch === "<" || ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ">" || ch === ")" || ch === "]" || ch === "}") depth--;
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
  return /^[A-Za-z_$]\w*$/.test(last) ? last : null;
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

    if (ch === "(" || ch === "[") {
      const close = ch === "(" ? ")" : "]";
      let depth = 1;
      i++;
      while (i < body.length && depth > 0) {
        if (body[i] === ch) depth++;
        else if (body[i] === close) depth--;
        i++;
      }
      continue;
    }

    if (ch === "{") {
      const sig = body.slice(chunkStart, i).trim();
      const end = findMatchingBrace(body, i);
      if (end === -1) break;

      if (sig === "" || /^static\s*$/.test(sig)) {
        stmts.push({ kind: "skip" });
      } else {
        stmts.push({ kind: "method", signature: sig });
      }
      i = end + 1;
      chunkStart = i;
      continue;
    }

    if (ch === ";" || ch === "\n") {
      if (ch === "\n") {
        const stmtSoFar = body.slice(chunkStart, i);
        if (!stmtSoFar.includes("=") && !/[:?\w]\s*$/.test(stmtSoFar.trim())) {
          i++;
          continue;
        }
      }
      const stmt = body.slice(chunkStart, i).trim();
      if (stmt) stmts.push({ kind: "field", text: stmt });
      i++;
      chunkStart = i;
      continue;
    }

    i++;
  }

  const tail = body.slice(chunkStart).trim();
  if (tail) stmts.push({ kind: "field", text: tail });

  return stmts;
}

function parseMethodSignature(
  sig: string,
  className: string
): { name: string; params: string[]; ctorParamProps: string[] } | null {
  const cleaned = sig.replace(/@\w+(?:\([^)]*\))?\s*/g, "").trim();
  const m = cleaned.match(
    /(?:^|\s)(?:(?:public|private|protected|static|readonly|async|abstract|override)\s+)*(?:(get|set)\s+)?([A-Za-z_$][\w$]*)\s*(?:<[^>]+>)?\s*\(([\s\S]*)\)\s*(?::\s*[\s\S]+?)?$/
  );
  if (!m) return null;

  const accessor = m[1];
  let name = m[2];
  const rawParams = m[3];

  if (["if", "for", "while", "switch", "catch"].includes(name)) return null;

  if (accessor === "get") name = `get ${name}`;
  else if (accessor === "set") name = `set ${name}`;

  const ctorParamProps: string[] = [];
  const params: string[] = [];
  for (const raw of splitTopLevel(rawParams, ",")) {
    const p = raw.trim();
    if (!p) continue;
    const propMatch = p.match(
      /^(?:(?:public|private|protected|readonly)\s+)+([A-Za-z_$][\w$]*)/
    );
    if (propMatch && name === "constructor") {
      ctorParamProps.push(propMatch[1]);
    }
    const cleanName = p
      .replace(/^(?:(?:public|private|protected|readonly)\s+)+/, "")
      .split(/[:=?]/)[0]
      .replace(/^\.\.\./, "")
      .trim();
    if (/^[A-Za-z_$][\w$]*$/.test(cleanName)) params.push(cleanName);
  }

  return { name, params, ctorParamProps };
}

function extractFieldName(stmt: string): string | null {
  const cleaned = stmt
    .replace(/@\w+(?:\([^)]*\))?\s*/g, "")
    .replace(/^(?:(?:public|private|protected|static|readonly|abstract|override|declare)\s+)+/, "")
    .trim();
  const m = cleaned.match(/^([A-Za-z_$][\w$]*)\s*[?!]?\s*(?::|=|$)/);
  if (!m) return null;
  const name = m[1];
  if (["constructor", "get", "set", "static", "public", "private", "protected"].includes(name))
    return null;
  return name;
}

export function parseTypeScript(code: string): ParseResult {
  const cleaned = stripTsTokens(code);
  const classes: Record<string, ClassInfo> = {};
  const relationships: Relationship[] = [];

  const declRe =
    /(?:^|[;{}\s])\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+([A-Z_$][\w$]*)\s*(?:<[^>]+>)?\s*(?:extends\s+([\w.<>,\s]+?))?\s*(?:implements\s+([\w.<>,\s]+?))?\s*\{/g;

  let m: RegExpExecArray | null;
  while ((m = declRe.exec(cleaned))) {
    const name = m[1];
    const parents: string[] = [];

    if (m[2]) {
      for (const p of splitTopLevel(m[2], ",")) {
        const n = bareTypeName(p);
        if (n) parents.push(n);
      }
    }
    if (m[3]) {
      for (const p of splitTopLevel(m[3], ",")) {
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
        const parsed = parseMethodSignature(stmt.signature, name);
        if (parsed) {
          info.methods.push(`${parsed.name}(${parsed.params.join(", ")})`);
          for (const pp of parsed.ctorParamProps) {
            if (!info.attributes.includes(pp)) info.attributes.push(pp);
          }
        }
      } else if (stmt.kind === "field" && stmt.text) {
        const fieldName = extractFieldName(stmt.text);
        if (fieldName && !info.attributes.includes(fieldName)) {
          info.attributes.push(fieldName);
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
