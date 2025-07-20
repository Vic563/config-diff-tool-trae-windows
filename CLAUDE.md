# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development
npm run dev          # Start development server (http://localhost:5173)

# Building
npm run build        # TypeScript compile + production build
npm run preview      # Preview production build

# Testing
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # ESLint with TypeScript rules (--max-warnings 0)
```

## Architecture Overview

This is a **Configuration Diff Tool** - a React SPA for comparing configurations with visual diff display and export capabilities.

### Core Architecture Pattern

```
App.tsx (Main orchestrator)
    ├── useDiff hook (State management & diff logic)
    ├── ConfigDiffEngine (Core diff algorithm)
    └── DiffViewer (Virtualized rendering)
```

### Key Architectural Decisions

1. **Diff Logic Separation**: The diff algorithm is encapsulated in `ConfigDiffEngine` class (`utils/diffEngine.ts`), separate from React components. The `useDiff` hook bridges the engine with React state.

2. **Virtual Scrolling**: Large diffs are rendered efficiently using `react-window` in `DiffViewer.tsx`. This prevents performance issues with thousands of lines.

3. **Type-Safe Diff Lines**: Uses discriminated unions for diff line types:
   - `added`, `removed`, `unchanged`, `modified`, `ellipsis`
   - Each type has specific properties (e.g., `added` has `postLineNum` but `preLineNum` is null)

4. **Error Handling Hierarchy**:
   ```
   DiffError (base)
   ├── InvalidConfigError
   ├── ParseError
   ├── DiffCalculationError
   └── ValidationError
   ```

5. **Export System**: Modular exporters in `utils/exporters.ts` support multiple formats (text, CSV, PDF, markdown) through a unified interface.

## Key Components and Their Responsibilities

- **App.tsx**: Main component, orchestrates the UI and manages the diff workflow
- **useDiff hook**: Manages diff state, handles errors, and provides the interface between components and the diff engine
- **ConfigDiffEngine**: Core diff algorithm implementation with configurable options
- **DiffViewer**: Virtualized component for rendering large diffs efficiently
- **ThemeContext**: Provides light/dark theme support throughout the app

## Testing Approach

Tests use Vitest (Jest-compatible) with React Testing Library. Key test files:
- `diffEngine.test.ts`: Comprehensive unit tests for the diff algorithm
- Test setup includes mocks for browser APIs (ResizeObserver, matchMedia)

Run a single test file:
```bash
npx vitest src/__tests__/diffEngine.test.ts
```

## Common Development Scenarios

### Adding a New Export Format
1. Add the format type to `ExportFormat` in `types/index.ts`
2. Implement the exporter function in `utils/exporters.ts`
3. Add the button to `ExportButtons.tsx`

### Modifying Diff Display
- The diff visualization logic is in `DiffViewer.tsx`
- Line grouping happens in the `groupedLines` memoized calculation
- Styling is controlled by the `getLineStyle` function

### Working with TypeScript Errors
- The project uses strict TypeScript settings
- Pay attention to discriminated unions when working with `DiffLine` types
- Use type guards (`isAddedLine`, `isRemovedLine`, etc.) for type narrowing

## Performance Considerations

- The `DiffViewer` uses virtual scrolling - be careful when modifying the row rendering logic
- The `groupedLines` calculation is memoized - ensure dependencies are correctly specified
- Large configurations are handled efficiently, but the diff algorithm itself is O(n*m) complexity