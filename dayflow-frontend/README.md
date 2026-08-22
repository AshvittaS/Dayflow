# Dayflow — Frontend Scaffold

React (Vite) + Tailwind. Dark theme, purple accent — matches the wireframe.
Uses mock data (`src/data/mockData.js`) so every page renders without a
backend yet. Read `SKILL.md` (repo root, copy it in from the earlier
deliverable) before touching business logic.

## Run it
```
npm install
npm run dev
```
Visit `/signin` — Sign In has no real check yet, it just routes to
`/employees` on submit.

## Who owns what (matches HACKATHON_GIT_PLAN.md)

| Branch | Owner | Files |
|---|---|---|
| `feature/auth-shell` | A | `src/pages/auth/*`, `src/components/shell/*` |
| `feature/profile-payroll` | B | `src/pages/employees/*`, `src/pages/profile/*` |
| `feature/attendance` | C | `src/pages/attendance/*` |
| `feature/timeoff-leave` | D | `src/pages/timeoff/*` |

Shared, edit-with-care files (touching these needs a heads-up to the
team so branches don't silently diverge):
- `src/data/mockData.js` — shape of every mock object
- `tailwind.config.js` — color tokens everyone uses
- `src/components/ui/StatusDot.jsx` — used by both the dashboard and avatar

## Branch workflow
```
git checkout -b feature/<your-module>
# ...edit only your module's files...
git add -A
git commit -m "feat(<module>): <what you did>"
git push -u origin feature/<your-module>
```
Open a PR into `main` at each checkpoint (see HACKATHON_GIT_PLAN.md) —
small PRs merged often beat one big PR at the end, both for avoiding merge
conflicts and for how the commit history looks to judges.

To pull a teammate's branch and merge:
```
git fetch origin
git checkout main
git merge origin/feature/<their-branch>
```

## Every page has visible TODOs
Search the codebase for `TODO(` — those mark exactly where each owner
should focus (admin attendance view, real time-off calendar, wiring
payroll to attendance, etc.), so nobody has to guess what's left.
