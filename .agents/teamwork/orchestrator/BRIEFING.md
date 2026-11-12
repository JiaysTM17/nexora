# BRIEFING — 2026-11-12T09:18:00Z

## Mission
Triển khai hoàn chỉnh mã nguồn sẵn sàng vận hành (production) cho sàn thương mại điện tử Nexora theo hồ sơ thiết kế và đặc tả chuyên sâu (Prisma, contracts, API, worker, web Next.js, commit & push liên tục GitHub).

## 🔒 My Identity
- Archetype: orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: D:\A - Học Tập\Thương Mại Điện Tử\san-quan-ao
- State folder: d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\orchestrator
- Original parent: parent
- Original parent conversation ID: fd600b16-cbe2-4393-82c5-21a5036bf1e8

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: D:\A - Học Tập\Thương Mại Điện Tử\san-quan-ao\PROJECT.md
1. **Decompose**: Survey existing codebase, specs and docs, define feature inventory and core milestones (M1: Database & Contracts, M2: Backend REST API, M3: Background Worker, M4: Frontend Next.js Web, M5: E2E Integration & Verification & Git Sync)
2. **Dispatch & Execute** (pick ONE):
   - **Direct (iteration loop)**: Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: At 16 spawns, write handoff.md, spawn successor
- **Work items**:
  1. Survey & Architecture Specification [in-progress]
  2. M1: Database & Contracts (14 business tables, Prisma generate, contracts DTOs) [pending]
  3. M2: Backend REST API (Modular Domain / Clean Architecture) [pending]
  4. M3: Background Worker (Jobs, Queues, NDR 3-strike, Auto-reconciliation) [pending]
  5. M4: Frontend Next.js Web (App Router, OOTD, Trade-in, VAS, Checkout, Admin/Seller) [pending]
  6. M5: E2E Build, Verification & Continuous GitHub Push [pending]
- **Current phase**: 0 (Survey)
- **Current focus**: Survey & Architecture Specification

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation. Your analysis is limited to reading agent reports, gate verdicts, and state files to make dispatch decisions.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/teamwork/ folder.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.
- Always include ORIGINAL_REQUEST.md path in every dispatch.
- Mandatory commit & push continuously to GitHub `origin/main` (repo JiaysTM17/nexora).

## Current Parent
- Conversation ID: fd600b16-cbe2-4393-82c5-21a5036bf1e8
- Updated: 2026-11-12T08:26:15Z

## Key Decisions Made
- Phase 0 Survey: Explorer 1 completed (codebase clean, 0 errors, 35 models). Spec Miner 2 and Spec Miner 3 are generating final specification reports.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| survey_explorer_1 | teamwork_explorer | Codebase exploration | completed | 74070f84-fe73-4d68-b0d4-07ab58670371 |
| survey_spec_miner_2 | teamwork_spec_miner | 14 DB tables & business plan | running | 12ff8092-70ce-4438-b9e9-89147fe3e7d9 |
| survey_spec_miner_3 | teamwork_spec_miner | 7 Modules API/Worker/UI specs | generating report | b32e66b9-485d-4988-88bb-ff8fe481ffef |

## Succession Status
- Succession required: no
- Spawn count: 3 / 16
- Pending subagents: 12ff8092-70ce-4438-b9e9-89147fe3e7d9, b32e66b9-485d-4988-88bb-ff8fe481ffef
- Predecessor: none
- Successor spawned: not yet spawned
- Successor generation: none
- Successor state folder: none

## Active Timers
- Heartbeat cron: b88b23bb-b38a-4ae6-b1b3-b5b4bf5f5cdf/task-60
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: handle timers as step 4 of the State Recovery section of your prompt says

## Artifact Index
- d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\ORIGINAL_REQUEST.md — Original User Request
- d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\orchestrator\DISPATCH.md — Dispatch log
- d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\orchestrator\BRIEFING.md — Persistent context & memory
- d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\orchestrator\progress.md — Liveness & status
- d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\teamwork_explorer_survey_1\survey_codebase.md — Codebase survey report
- d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\teamwork_explorer_survey_1\handoff.md — Explorer 1 handoff
