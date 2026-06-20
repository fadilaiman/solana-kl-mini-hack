# Timeline

> Status: Planning. Indicative phasing; adjust to team size and validation results.

## Phasing approach
Two tracks run in parallel where possible: **Protocol/Engine** and **Surfaces/UX**, converging at each milestone.

## Indicative schedule (relative weeks)

| Phase | Milestones | Rough effort |
|-------|------------|--------------|
| Phase 0 — Foundations | M0 | ~1 week |
| Phase 1 — Core billing loop | M1, M2, M3 | ~2–3 weeks |
| Phase 2 — Control & visibility | M4, M5 | ~1–2 weeks |
| Phase 3 — Resilience & demo | M6 | ~1 week |
| Phase 4 — Hardening gate | M7 | ~2–4 weeks (incl. external audit) |

> Note: A minimal end-to-end **proof of concept** (create → authorize → one automatic debit → revoke) can be reached quickly within Phases 0–1; the remaining time is reliability, visibility, and hardening.

## Critical path
```
M0 ─▶ M1 ─▶ M2 ─▶ M3 ─▶ (M4, M5 parallel) ─▶ M6 ─▶ M7
```
- M2 depends on M0 (config/keys) + M1 (a mandate to authorize).
- M3 is the riskiest core piece (on-chain reliability) — schedule buffer here.
- M7 (audit) is calendar-bound by third parties — start scheduling early.

## Milestone gates
- Each milestone has explicit exit criteria (see Milestones.md) and acceptance tests (see `08_Testing_QA`).
- Do not begin mainnet considerations until **M7** gates pass.

## Assumptions affecting the timeline
- Devnet/RPC availability is adequate (mitigations: provider RPC).
- No custom on-chain program is needed in v1 (native SPL delegation suffices).
- Audit scheduling lead time is secured during Phase 2–3.
