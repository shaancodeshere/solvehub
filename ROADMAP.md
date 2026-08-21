# SolveHub — Engineering Roadmap

This roadmap defines the sequential implementation milestones for SolveHub following the locked `v1.0.0-production` baseline specifications.

---

## Phase 1: Toolchain & Baseline Freeze (Completed)
- [x] Lock technical and functional baseline specification (`v1.0.0-production-baseline.md`)
- [x] Establish version changelog ledger (`CHANGELOG.md`)
- [x] Generate release summary and governance contracts (`RELEASE_SUMMARY.md`)
- [x] Initialize local Git repository and sync remote GitHub origin

---

## Phase 2: Application Scaffolding & Environment Setup
- [ ] Initialize Next.js (App Router) with TypeScript configuration
- [ ] Configure Tailwind CSS design tokens and utility rules
- [ ] Establish directory structure (`/app`, `/components`, `/lib`, `/types`)
- [ ] Verify local development server build and zero-warning compilation

---

## Phase 3: Spatial Shell & Layout Architecture
- [ ] Build locked 3-section desktop viewport grid:
  - Section A (260px Left Navigator)
  - Section B (Fluid Center Workspace)
  - Section C (320px Right Receipt Column)
- [ ] Implement responsive mobile viewports (<768px):
  - Off-canvas sidebar overlay drawer
  - Sliding bottom sheet receipt panel (60vh)
- [ ] Integrate dual-layer persistence provider (`localStorage` + in-memory store)

---

## Phase 4: Core Calculation Engines
- [ ] **Canvas Mode Engine:**
  - Build borderless text block workspace
  - Integrate AST natural language math tokenizer
  - Live numerical evaluation line alignment
- [ ] **Curated Mode Library:**
  - Build categorized tool directory & search filter
  - Implement dual-slider parameter controls
  - Interactive formula visualizers & copyable receipts

---

## Phase 5: CI/CD Pipeline & Production Deployment
- [ ] Configure automated GitHub Actions workflows (linting, type checking)
- [ ] Connect Firebase App Hosting infrastructure
- [ ] Validate preview channels and branch protection rules
- [ ] Final end-to-end production build deployment