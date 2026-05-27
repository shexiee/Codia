<div align="center">

<br />

<img src="https://img.shields.io/badge/Codia-7c3aed?style=for-the-badge&logoColor=white&labelColor=0a0a0f" alt="Codia" height="32" />

<h1>Code → diagram in one paste.</h1>

<p>
  Beautiful UML class diagrams from <b>Python</b>, <b>Java</b>, and <b>TypeScript</b>.<br />
  100% client-side. No backend. Deploy anywhere.
</p>

<br />

<p>
  <img src="https://img.shields.io/badge/Next.js_15-0a0a0f?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-149ECA?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Mermaid-FF3670?style=flat-square&logo=mermaid&logoColor=white" alt="Mermaid" />
  <img src="https://img.shields.io/badge/Deploy_on-Vercel-0a0a0f?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<br />

</div>

---

## Quick start

```bash
npm install
npm run dev
```

Open <a href="http://localhost:3000">localhost:3000</a> — pick a language, paste your code, click **Generate diagram**.

<br />

## Supported languages

<table>
  <thead>
    <tr>
      <th align="left">Language</th>
      <th align="left">Extension</th>
      <th align="left">Captures</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Python</b></td>
      <td><code>.py</code></td>
      <td><code>class</code>, methods, <code>self.x</code> attrs, inheritance, type hints</td>
    </tr>
    <tr>
      <td><b>Java</b></td>
      <td><code>.java</code></td>
      <td><code>class</code> / <code>interface</code> / <code>enum</code> / <code>record</code>, <code>extends</code>, <code>implements</code>, fields, methods, generics</td>
    </tr>
    <tr>
      <td><b>TypeScript</b></td>
      <td><code>.ts</code> <code>.tsx</code></td>
      <td><code>class</code>, <code>extends</code>, <code>implements</code>, getters/setters, ctor param properties</td>
    </tr>
  </tbody>
</table>

> [!NOTE]
> All parsers are hand-rolled in TypeScript — no AST libraries, no WASM, no bundle bloat. Each parser is ~150 lines and handles ~90% of typical OO code.

<br />

## How it works

```
    ┌──────────────┐     ┌────────────────┐     ┌──────────────────┐     ┌──────────────┐
    │   Monaco     │ ──▶ │  Language      │ ──▶ │  Mermaid         │ ──▶ │  SVG / PNG   │
    │   editor     │     │  parser (TS)   │     │  classDiagram    │     │  download    │
    └──────────────┘     └────────────────┘     └──────────────────┘     └──────────────┘
```

1. Pick a language from the dropdown in the editor toolbar
2. Paste or upload your code
3. The matching parser in [lib/parsers/](lib/parsers/) walks the source to extract classes, methods, fields, and inheritance
4. [lib/mermaid-builder.ts](lib/mermaid-builder.ts) emits Mermaid `classDiagram` syntax
5. Mermaid renders SVG in the browser — export as SVG or PNG

<br />

## Deploy

<table>
<tr>
<td width="50%" valign="top">

#### Vercel (recommended)

```bash
vercel --prod
```

Or push to GitHub and import at [vercel.com/new](https://vercel.com/new).

</td>
<td width="50%" valign="top">

#### Any static host

```bash
npm run build
```

Drop on Netlify, Cloudflare Pages, GitHub Pages, or run `next start` on a Node host.

</td>
</tr>
</table>

No env vars. No backend. No configuration.

<br />

## Project layout

```text
codia/
├─ app/                         Next.js App Router (layout · page · globals.css)
├─ components/
│  ├─ ui/                       Button · Tabs primitives
│  ├─ header.tsx · hero.tsx     Page chrome
│  ├─ code-input.tsx            Monaco editor + upload zone
│  ├─ language-picker.tsx       Inline language dropdown
│  ├─ diagram-viewer.tsx        Mermaid render + SVG / PNG export
│  └─ class-explorer.tsx        Side panel with class details
├─ lib/
│  ├─ types.ts                  Shared types + Language union
│  ├─ parsers/
│  │  ├─ index.ts               LANGUAGES config + parse() dispatcher
│  │  ├─ python.ts              Python class parser
│  │  ├─ java.ts                Java class parser
│  │  └─ typescript.ts          TypeScript class parser
│  ├─ mermaid-builder.ts        Builds Mermaid source from parsed data
│  └─ utils.ts                  cn() helper
└─ tailwind.config.ts           Design tokens (violet / indigo)
```

<br />

## Parser details

<details>
<summary><b>Python</b> — <code>lib/parsers/python.ts</code></summary>

<br />

- `class Foo:` / `class Bar(Foo):` / `class Baz(Foo, Mixin):`
- Methods (`def`, `async def`) with parameter names — type hints and defaults stripped
- `self.attr = ...` assignments in `__init__`
- Class-level attributes (`x = 1`, `x: int = 1`)
- Dotted base classes (e.g. `class X(abc.ABC)` → parent `ABC`)
- Multi-line class / method signatures (joined via paren-depth tracking)

</details>

<details>
<summary><b>Java</b> — <code>lib/parsers/java.ts</code></summary>

<br />

- `class`, `interface`, `enum`, `record` declarations
- `extends` and `implements` both contribute to inheritance edges
- Methods and constructors with parameter names — modifiers and annotations stripped
- Fields including comma-separated declarations like `int x, y, z;`
- Generics (`List<String>`) handled in types

</details>

<details>
<summary><b>TypeScript</b> — <code>lib/parsers/typescript.ts</code></summary>

<br />

- `class`, `abstract class`, `export class` declarations
- `extends` and `implements`
- Methods, async methods, getters/setters
- Class fields with type annotations and optional / definite modifiers (`?`, `!`)
- Constructor parameter properties (`constructor(public name: string)`) → fields

</details>

> [!IMPORTANT]
> Exotic dynamic constructs (Python `type(...)`, Java reflection, TypeScript decorators that rewrite classes) are not modeled. For typical OO code, results match a real AST parse.

<br />

## Add a language

1. Create `lib/parsers/<lang>.ts` exporting `parse<Lang>(code: string): ParseResult`
2. Add an entry to `LANGUAGES` in [lib/parsers/index.ts](lib/parsers/index.ts) with the Monaco language ID, default filename, and sample code
3. Add the language to the `Language` union in [lib/types.ts](lib/types.ts) and the dispatch in `parse()`
4. The language picker UI updates automatically

<br />

---

<div align="center">
  <sub>
    Built with <b>Next.js 15</b> · <b>TypeScript</b> · <b>Tailwind CSS</b> · <b>Mermaid.js</b> · <b>Monaco Editor</b> · <b>Framer Motion</b>
  </sub>
</div>
