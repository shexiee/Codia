# Codia — Code to Diagram

Turn **Python**, **Java**, or **TypeScript** code into beautiful UML class diagrams. Paste, parse, and visualize in seconds.

**100% client-side.** No backend, no API keys, no language runtime required. Deploy anywhere that serves static files.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** + **Tailwind CSS** with a shadcn-style component layer
- **Monaco Editor** for the code-paste experience
- **Mermaid.js** for rendering class diagrams
- **Framer Motion** for smooth UI transitions
- **In-browser parsers** for Python, Java, and TypeScript — handle classes, methods, attributes, inheritance, type annotations, and multi-line definitions ([lib/parsers/](lib/parsers/))

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — everything runs in the browser, including the parser.

## Deploy

### Vercel (easiest — one-click)

1. Push the repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Click **Deploy**. No env vars, no settings, no configuration.

You can also deploy from the command line:

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

### Any other static host

Because there's no backend, you can also deploy to **Netlify**, **Cloudflare Pages**, **GitHub Pages**, or any static host. Build with:

```bash
npm run build
```

And serve the `.next` output (or run `next start` on a Node host).

## Project layout

```
app/
  layout.tsx, page.tsx, globals.css     # Next.js App Router
components/
  ui/                                   # Button, Tabs, Card primitives
  header.tsx, hero.tsx                  # Page chrome
  code-input.tsx                        # Monaco editor + upload
  diagram-viewer.tsx                    # Mermaid rendering + SVG/PNG export
  class-explorer.tsx                    # Class details panel
lib/
  types.ts                              # Shared types + Language type
  parsers/
    index.ts                            # LANGUAGES config + parse() dispatcher
    python.ts                           # Python class parser
    java.ts                             # Java class parser
    typescript.ts                       # TypeScript class parser
  mermaid-builder.ts                    # Builds Mermaid source from parsed data
  utils.ts                              # cn() helper
examples/
  animals.py                            # Sample input
```

## How it works

1. You pick a language and paste (or upload) code into the Monaco editor.
2. On **Generate diagram**, the language-specific parser in [lib/parsers/](lib/parsers/) walks the code to extract classes, methods, attributes, and inheritance.
3. [lib/mermaid-builder.ts](lib/mermaid-builder.ts) converts the parsed structure into Mermaid `classDiagram` syntax.
4. Mermaid.js renders it as SVG in the browser.
5. Download as **SVG** or **PNG**.

## Parser scope

All three parsers are hand-rolled (no AST-library dependencies) and target the common cases for class-diagram extraction.

### Python ([lib/parsers/python.ts](lib/parsers/python.ts))
- `class Foo:` / `class Bar(Foo):` / `class Baz(Foo, Mixin):`
- Methods (`def`, `async def`) with parameter names — type hints and defaults stripped
- `self.attr = ...` assignments in `__init__`
- Class-level attributes (`x = 1`, `x: int = 1`)
- Dotted base classes (e.g. `class X(abc.ABC)` → parent `ABC`)

### Java ([lib/parsers/java.ts](lib/parsers/java.ts))
- `class`, `interface`, `enum`, `record` declarations
- `extends` and `implements` (both contribute to inheritance edges)
- Methods and constructors with parameter names (modifiers and annotations stripped)
- Fields (including comma-separated declarations like `int x, y, z;`)
- Generics (`List<String>`) handled in types

### TypeScript ([lib/parsers/typescript.ts](lib/parsers/typescript.ts))
- `class`, `abstract class`, `export class` declarations
- `extends` and `implements`
- Methods, async methods, getters/setters
- Class fields with type annotations, optional / definite modifiers (`?`, `!`)
- Constructor parameter properties (`constructor(public name: string)`) — automatically become fields

Each parser handles ~90% of typical OO code. Exotic dynamic constructs (Python `type(...)`, Java reflection, TypeScript decorators that rewrite classes) are not modeled.

### Adding a language

1. Create `lib/parsers/<lang>.ts` exporting a `parse<Lang>(code: string): ParseResult` function.
2. Add an entry to `LANGUAGES` in [lib/parsers/index.ts](lib/parsers/index.ts) with the Monaco language ID, default filename, and sample code.
3. Add the language to the `Language` union in [lib/types.ts](lib/types.ts) and the dispatcher in `parse()`.
4. The language picker UI updates automatically.
