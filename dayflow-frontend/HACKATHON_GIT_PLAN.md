# Dayflow — 8-Hour Build Plan (4 people, 4 branches)

Assumption stated up front: the wireframe/PRD don't name a stack, so this
plan assumes **React (Vite) + Tailwind** frontend, **Node/Express +
MongoDB (Mongoose)** backend, **JWT** auth — a fast, well-known hackathon
stack. Swap freely; the module split and cadence below don't depend on it.

Pair this doc with `SKILL.md` — every teammate's AI agent should have
`SKILL.md` in context (repo root, or `.claude/skills/dayflow-hrms-spec/SKILL.md`
if using Claude Code) so four parallel "vibe coding" sessions don't invent
four different data models.

## Why the wireframe splits into exactly 4 modules
The 4 wireframe pages map 1:1 to 4 owners — no overlap fighting, clean PRs:

| # | Module | Covers |
|---|--------|--------|
| 1 | **Auth & Shell** | Sign up/in, login-ID generation, JWT, nav bar, avatar dropdown, role guarding |
| 2 | **Profile & Payroll** | Employee dashboard cards, My Profile tabs, Admin Salary Info + calculations |
| 3 | **Attendance** | Check-in/out, attendance list views (self + admin), payroll linkage |
| 4 | **Time Off** | Leave request modal, calendar, allocations, admin approve/reject |

## Branches
```
main                          ← protected, always demoable
├─ feature/auth-shell         ← owner A
├─ feature/profile-payroll    ← owner B
├─ feature/attendance         ← owner C
└─ feature/timeoff-leave      ← owner D
```
No long-lived `develop` branch — with only 8 hours, merge straight to
`main` at each checkpoint below, but never merge broken code (each PR
should at least build and not crash the app shell).

## Commit rules (this is what makes commit history look "even" to judges)
- Small, frequent commits beat one big dump — aim for a commit **every
  30–45 min** you're actively working, not one commit per phase.
- Conventional prefix + module tag, e.g. `feat(attendance): check-in endpoint`,
  `fix(auth): login-id serial collision`, `chore(payroll): PF config`.
- Every teammate commits directly on their own branch; nobody force-pushes
  over someone else's commits.
- At each checkpoint (below), open a PR into `main` even if small — a
  thin PR merged 6 times looks (and is) more collaborative than 1 giant
  PR at hour 7.
- Optional but recommended: each person reviews/approves one teammate's
  PR per checkpoint, so the commit *and* review history is spread across
  all 4 people, not just author counts.

## Hour-by-hour

**H0:00–0:30 — Kickoff & shared contracts**
Whole team together: lock the data model before splitting up — this is
the #1 thing that breaks vibe-coded hackathon integrations. Agree on:
- Mongo collections/tables: `Users`(role, loginId, companyId), `Employees`
  (profile fields from §4), `SalaryStructures` (§5 fields), `Attendance`
  (§6 columns), `LeaveRequests` + `LeaveAllocations` (§7 fields).
- REST endpoint prefixes per module (`/api/auth`, `/api/employees`,
  `/api/attendance`, `/api/timeoff`) so branches never collide on routes.
- One person scaffolds the repo (Vite app, Express server, `.env.example`,
  README stub, `SKILL.md` committed at root) and pushes to `main` first;
  everyone else branches off that.

**H0:30–1:00 — Branch out, first commits**
Each owner creates their branch, stubs routes/pages/empty components per
their module. First commit each: `scaffold(<module>): routes + pages`.

**H1:00–3:00 — Build phase 1 (core CRUD + UI)**
- Auth: signup/login forms, login-ID generator function, JWT middleware,
  nav bar + avatar dropdown, role-based route guards.
- Profile & Payroll: employee card grid, status-dot logic, profile tabs,
  admin-only Salary Info tab with the % → amount calculation.
- Attendance: check-in/out button + endpoint, self attendance table.
- Time Off: request modal, leave-type enum, employee calendar view.
Commit every 30–45 min per person.

**H3:00–3:30 — Checkpoint 1: merge & integrate**
All 4 PRs into `main`. Run the app end-to-end even if ugly: signup → see
dashboard → check in → request leave. Fix broken contracts now, not later.

**H3:30–5:30 — Build phase 2 (business logic + cross-module wiring)**
- Auth: password-change-on-first-login, edge cases.
- Profile & Payroll: wire payroll payable-days to Attendance module's data.
- Attendance: admin all-employees view, date switcher.
- Time Off: admin Time Off + Allocation tabs, approve/reject, status
  chips wired to `Pending/Approved/Rejected`.
Keep committing every 30–45 min.

**H5:30–6:00 — Checkpoint 2: merge & integrate**
Second full merge to `main`. Full-flow smoke test again, this time
including the cross-module link (attendance affecting payroll days,
approved leave flipping the dashboard status icon to the airplane).

**H6:00–7:00 — Polish**
Match wireframe styling, seed realistic demo data (a few employees with
varied statuses so the demo dashboard looks alive), handle empty/error
states, fix anything that broke integration.

**H7:00–7:30 — Feature freeze + final smoke test**
No new merges after this except critical-path fixes. Full run-through of
the demo script end to end.

**H7:30–8:00 — Demo prep**
README with setup/run instructions and screenshots, deploy if there's
time, assign who presents which module (matches who built it — judges
often ask module-specific questions), final commit.

## Quick pre-flight checklist before you start coding
- [ ] `SKILL.md` committed at repo root, everyone's AI agent pointed at it
- [ ] Shared schema/endpoint contract agreed in H0 and written down
      somewhere all 4 can see (a shared doc or `API_CONTRACT.md`)
- [ ] Branch protection or at least a team agreement: no force-push to
      someone else's branch, no direct pushes to `main` after H0:30
- [ ] Everyone knows their 2 checkpoint times (H3:00, H5:30) in advance
