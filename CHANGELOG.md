# Changelog

All notable changes to the SolveHub project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-16

### Added
* **Master System Architecture:** Official production architecture establishing Next.js (React), TypeScript, and Tailwind CSS as the core application stack[cite: 1, 5, 6].
* **Locked 3-Section Workspace Layout:**
  * **Section A (Left Navigator):** Fixed 260px sidebar for workspace navigation, search, mode switching, history, and preferences[cite: 1, 5, 6].
  * **Section B (Center Workspace):** Fluid-width calculation interface supporting both block text editing and structured form inputs[cite: 1, 5, 6].
  * **Section C (Right Results Column):** Fixed 320px panel rendering real-time line evaluations, variable tags, calculation receipts, and logic breakdown graphs[cite: 1, 5, 6].
  * **Mobile Adaptation:** Responsive viewports (<768px) collapsing Section A to an off-canvas drawer and converting Section C into an interactive floating bottom sheet[cite: 1, 5, 6].
* **Dual Calculation Operating Modes:**
  * **Canvas Mode:** Freeform natural-language block editor with line-by-line real-time evaluation and variable tagging[cite: 1, 5, 6].
  * **Curated Mode:** Structured catalog interface with category filters, dynamic parameter sliders, calculation receipts, and visual logic visualizers[cite: 1, 5, 6].
* **Math Kernel & Parser Engine:** Abstract Syntax Tree (AST) grammar specifications for natural language math parsing and Single Source of Truth (SSOT) variable schema enforcement[cite: 1, 5, 6].
* **Dual-Layer Persistence Engine:** Partitioned Web Storage (`localStorage`) integration backed by an automatic in-memory fallback store for zero-latency execution across SSR hydration and private browser sessions[cite: 1, 5, 6].
* **AI-First Toolchain Governance Matrix:** Formal boundary definitions and prompt directives across the 8-agent toolchain (Project Owner, Gemini, Google AI Studio, Stitch, Omni, Antigravity, GitHub, Firebase App Hosting)[cite: 1, 5, 6].
* **Automated CI/CD Pipeline:** Infrastructure configuration specs for GitHub Actions workflows targeting Firebase App Hosting (Cloud Run SSR execution and Cloud CDN edge distribution)[cite: 1, 5, 6].

### Changed
* **Production Baseline Realignment:** Transitioned project foundation from client-side prototype architecture to full-stack Next.js and Firebase App Hosting infrastructure[cite: 1, 5, 6].

### Deprecated
* **Vanilla Prototype Stack:** Deprecated initial Vanilla HTML5/ES6/CSS `/src/` prototype structure in favor of the production Next.js/TypeScript component architecture.

### Security
* **SSOT Variable Isolation:** Enforced immutable mathematical schema key preservation to prevent injection, scope pollution, or variable mutation during cross-mode synchronization[cite: 1, 5, 6].
* **Edge Routing & Secret Protection:** Configured deployment pipeline parameters to isolate build secrets (`FIREBASE_SERVICE_ACCOUNT`, `GITHUB_TOKEN`) within GitHub Actions environments[cite: 5, 6].

---

## [Unreleased]

### Planned
* Ingestion and implementation of initial Curated financial calculator engines (Amortized Loan & NPV Engine)[cite: 5, 6].
* Stitch component skeleton generation for the locked 3-section layout framework[cite: 1, 5, 6].
* Google AI Studio mathematical sandbox validation for natural language math tokens[cite: 1, 5, 6].