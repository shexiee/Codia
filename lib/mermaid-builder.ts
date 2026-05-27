import type { ParseResult } from "./types";

const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9_]/g, "_");

const escapeMember = (s: string) =>
  s.replace(/[<>"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function buildMermaid({ classes, relationships }: ParseResult): string {
  if (Object.keys(classes).length === 0) {
    return "classDiagram\n  class Empty {\n    No classes found\n  }";
  }

  const lines: string[] = ["classDiagram"];

  for (const [name, info] of Object.entries(classes)) {
    const safe = sanitize(name);
    lines.push(`  class ${safe}["${name}"] {`);

    for (const attr of info.attributes) {
      lines.push(`    +${escapeMember(attr)}`);
    }

    if (info.attributes.length > 0 && info.methods.length > 0) {
      // mermaid auto-separates with a divider when both exist; no manual line needed
    }

    for (const method of info.methods) {
      lines.push(`    +${escapeMember(method)}`);
    }

    if (info.attributes.length === 0 && info.methods.length === 0) {
      lines.push(`    <<empty>>`);
    }

    lines.push(`  }`);
  }

  for (const rel of relationships) {
    if (rel.type === "inheritance") {
      lines.push(`  ${sanitize(rel.parent)} <|-- ${sanitize(rel.child)}`);
    }
  }

  return lines.join("\n");
}
