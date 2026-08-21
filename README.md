# SolveHub

SolveHub is a production-grade, hybrid calculation workspace designed to merge natural language scratchpad calculations with structured, domain-specific calculators.

---

## Core Paradigms

* **Canvas Mode (Natural Language Playground):** A borderless, block-based calculation editor that compiles natural language equations into evaluated mathematical results line-by-line using an Abstract Syntax Tree (AST).
* **Curated Mode (Structured Tool Library):** A categorized directory of specialized calculators featuring dual-slider parameter controls, interactive logic visualizers, and copyable calculation receipts.

---

## Layout Architecture

SolveHub strictly enforces a locked, 3-section horizontal viewport structure:

* **Section A (Left Navigator):** Fixed `260px` sidebar for workspace navigation, history logs, and mode switching.
* **Section B (Center Workspace):** Fluid-width core interaction area hosting the Canvas block editor or Curated calculator interface.
* **Section C (Right Column):** Fixed `320px` panel displaying real-time calculation receipts, variable tokens, and visual logic graphs.

On mobile viewports (`<768px`), Section A converts to an off-canvas drawer, Section B expands to full width (`100vw`), and Section C elevates as an interactive bottom sheet (`60vh`).

---

## Technical Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Persistence:** Dual-layer client storage (`localStorage` + in-memory fallback)
* **Hosting & CI/CD:** Firebase App Hosting & GitHub Actions

---

## Getting Started

### Prerequisites
* Node.js 20.x or later
* npm / yarn / pnpm

### Local Setup
```bash
# Clone repository
git clone [https://github.com/shaancodeshere/solvehub.git](https://github.com/shaancodeshere/solvehub.git)

# Navigate into directory
cd solvehub

# Install dependencies
npm install

# Run local development server
npm run dev