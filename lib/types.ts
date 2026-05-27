export interface ClassInfo {
  name: string;
  methods: string[];
  attributes: string[];
  parents: string[];
}

export interface Relationship {
  parent: string;
  child: string;
  type: "inheritance";
}

export interface ParseResult {
  classes: Record<string, ClassInfo>;
  relationships: Relationship[];
}

export type Language = "python" | "java" | "typescript";

export interface LanguageConfig {
  id: Language;
  label: string;
  monacoLang: string;
  filename: string;
  sample: string;
}
