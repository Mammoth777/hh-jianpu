# AGENTS.md - Agent Coding Guidelines for hh-jianpu

## Project Overview

**hh-jianpu** is a web-based dynamic numbered musical notation (jianpu) editor with:
- **Core library** (`@hh-jianpu/core`): Parsing, rendering, audio playback
- **Web app** (`@hh-jianpu/web`): React + Vite + Tailwind CSS
- **Tech Stack**: TypeScript 5.4, React 18, Vite 5.4, Zustand 4.5, Tone.js 15.0.4, Vitest

---

## Build/Lint/Test Commands

### Root Commands (monorepo with pnpm)
```bash
pnpm dev          # Start web app dev server
pnpm build        # Build core + web
pnpm build:core   # Build only core library
pnpm build:web    # Build only web app
pnpm lint         # Lint all packages
pnpm test         # Run all tests
```

### Core Package Commands
```bash
cd packages/core
pnpm test                    # Run all tests
pnpm test tokenizer.test.ts # Run single test file
pnpm test src/__tests__/parser.test.ts
pnpm test -t "createLayout" # Run tests matching pattern
pnpm test -- --run          # Run once (no watch mode)
```

### Web Package Commands
```bash
cd apps/web
pnpm dev    # Start dev server
pnpm build  # Build for production
pnpm lint   # Run ESLint
```

---

## Code Style Guidelines

### TypeScript
- **Strict mode**: Always enabled (`strict: true`)
- **Explicit types**: Prefer `interface` over `type` (except unions)
- **Naming**: Interfaces/Types: `PascalCase`, Functions: `camelCase`, Constants: `UPPER_SNAKE_CASE`
- **Readonly**: Use `readonly` for object properties by default
- **No `any`**: Use `unknown` or specific types

```typescript
// ✅ Good
interface Note { readonly pitch: number; readonly duration: number; }
// ❌ Bad
type Note = { pitch: any; duration: any };
```

### React Components
- Use arrow functions + `React.FC`
- Define clear Props interfaces for each component
- Hooks order: useState → useEffect → custom hooks
- Use `React.memo`, `useMemo`, `useCallback` for performance
- Event handlers: `handle` prefix (e.g., `handleClick`)

### File Organization
- Single responsibility: one main export per file
- Use `index.ts` to aggregate exports
- Core library uses `.js` extensions for ESM support

---

## Architecture

### Core Library - Three-Layer Design
1. **Parser Layer**: Text → AST (`tokenizer.ts`, `parser.ts`) → Returns `ParseResult<Score>`
2. **Renderer Layer**: AST → Layout (`layout.ts`) - pure data computation
3. **Player Layer**: AST → Audio (`scheduler.ts`, `synth.ts`)

**Key Rules**: Parser has no dependencies on Renderer/Player, Renderer has no dependency on Player, all pure functions.

### Web App - Component Hierarchy
```
App → AppLayout → HelpModal / ResizablePanels → Editor / ScoreView → PlayerBar
```

### State Management (Zustand)
- Single store: `useStore`
- Select minimal necessary state: `const { score, currentNoteIndex } = useStore();`
- Editor input uses 300ms debounce

---

## Testing (Vitest)
- Test files: `*.test.ts` (same directory or `__tests__/`)
- Structure: Arrange → Act → Assert

```typescript
describe('createLayout', () => {
  it('should calculate correct dimensions for a single measure', () => {
    const score: Score = { /* ... */ };
    const layout = createLayout(score);
    expect(layout.width).toBe(800);
  });
});
```
Run single test: `pnpm test src/__tests__/parser.test.ts` or `pnpm test -t "test name"`

---

## Error Handling

### Parser Errors
- Return `ParseResult<T>` with `data` and `errors`
- Errors include position info (line, column)
```typescript
interface ParseError { message: string; position: { line: number; column?: number }; }
interface ParseResult<T> { data: T | null; errors: ParseError[]; }
```

### Audio Errors
- Handle Tone.js initialization failures gracefully
- Show user-friendly error messages
- Disable play button on error

---

## Performance
- Debounce editor input: 300ms
- Lazy load Tone.js: dynamic import
- Use `React.memo`, `useMemo`, `useCallback` for expensive calculations

```typescript
const layout = useMemo(() => createLayout(score, config), [score, config]);
const handleChange = useCallback((value: string) => setSource(value), [setSource]);
```

---

## Tailwind CSS
- Use semantic class names: `text-ink`, `text-played`, `text-highlight`, `text-error`, `border-barline`, `bg-paper`
- Mobile-first: `sm:`, `md:`, `lg:` breakpoints
- Avoid inline styles

---

## Documentation
- JSDoc for all public APIs
- Use Chinese comments for internal code
- Use `// ===` to separate large sections

---

## Commit Messages
Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

---

## Prohibited
1. Using `any` type (unless absolutely necessary)
2. Mutating Props (React immutability)
3. Using Hooks inside loops
4. Inline large objects/functions (performance)
5. Direct DOM manipulation (use React refs)
6. Synchronous blocking operations (alert, etc.)

---

## Project-Specific Rules

### Audio
- Tone.js must initialize asynchronously
- Check `Tone.context.state` before playing
- Call `Tone.Transport.stop()` on cleanup

### Layout
- Responsive `measuresPerLine`: mobile 2, tablet 3, desktop 4
- SVG coordinates start from top-left
- Note Y coordinates are center-aligned

### State
- Editor debounce: 300ms
- Use `setSourceImmediate` for loading examples (no debounce)
- Stop playback when switching modes
