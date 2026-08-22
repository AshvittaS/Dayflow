# Dayflow — Cross-Page Design System

**Purpose:** generate every screen from this one file, not from a fresh
interpretation each time. The failure mode with tools like Stitch across
multiple prompts is each screen getting its *own* button radius, its own
spacing, its own gray — this doc exists so that never happens. Paste this
whole file as context before generating each screen, and reference it by
name in the per-screen prompt ("use the Dayflow design system, Button:
Primary — see §4").

Style direction: instrument-panel SaaS console — see `DESIGN.md` for the
full rationale. This file is the enforceable contract version of it.

---

## 1. Tokens (identical value on every screen — never override locally)

```
--bg:            #0b0d0f   (graphite-950 — app background, every page)
--panel:         #14171a   (graphite-900 — navbar, modals)
--card:          #1b1f23   (graphite-800 — cards, table rows)
--border:        #282e34   (steel-700 — every hairline divider)
--text:          #eef1f3   (ink-50 — primary text)
--text-muted:    #9aa4ad   (fog-300 — labels, secondary text)
--accent:        #e8a33d   (signal-amber — the ONLY accent, every page)
--status-ok:     #5fae86   (present / approved)
--status-warn:   #d1a24a   (absent / pending)
--status-off:    #8f97a3   (leave / rejected)

--radius:        4px       (every corner on every page — no exceptions)
--space:         4 8 12 16 24 32   (px scale — no arbitrary values)
```

## 2. Typography (identical on every screen)

- Page title (`h1`): Space Grotesk 600, 20–28px — appears once per page, top only.
- Body/UI: IBM Plex Sans 400/500, 13–14px — every label, button, cell.
- Data (IDs, dates, ₹ amounts, timestamps): IBM Plex Mono 400, 12–13px.
- Section/field labels: uppercase, 12px, `--text-muted`, `letter-spacing: 0.08em`.

Rule: if a number or code is on screen, it's mono. If it's a label, it's
uppercase-tracked. This is checked the same way on every page.

## 3. Global shell — build once, reuse everywhere

Every logged-in page (Employees, Profile, Attendance, Time Off) renders
inside the exact same shell — never a page-specific header or width:

```
┌──────────────────────────────────────────────┐
│ Navbar — 56px tall, --panel, 1px --border     │  ← identical component,
│ bottom. Logo left, 3 nav links, avatar right. │    same on every page
├──────────────────────────────────────────────┤
│                                                │
│  Content — max-width 1152px, centered,        │  ← identical container,
│  padding 32px top/bottom, 24px sides           │    only inner content differs
│                                                │
└──────────────────────────────────────────────┘
```

Auth pages (Sign In/Up) are the one exception — no navbar, centered card,
max-width 360px — but reuse the same tokens, radius, and input/button specs.

## 4. Component library — one canonical version, used everywhere

Every screen pulls from this exact list. No page invents its own button,
input, or tag style.

**Button**
- Primary: `--accent` fill, `--bg` text, `--radius`, 8px/16px padding, no shadow.
- Secondary: transparent fill, 1px `--border`, `--text`.
- Destructive: transparent fill, no border, `#c96a4f` text (used only for Reject).
- Used identically on: Sign In/Up submit, Check In/Out, Request Time Off, Approve/Reject.

**Input / Select**
- `--card` fill, 1px `--border`, `--radius`, 8px/12px padding.
- Focus: border becomes `--accent`, no glow/shadow.
- Label always above, uppercase style from §2.
- Used identically on: every auth field, the Time Off request modal, the
  employee search bar.

**Asset tag** (the one signature element — see `DESIGN.md` §4)
- Mono text on `--card` fill, 1px `--border`, `--radius`, 11px, `--text-muted`.
- Used identically on: employee cards, Profile header, Attendance rows,
  Time Off rows. Same chip, same size, everywhere an ID appears.

**Status chip**
- Rectangular (`--radius`), 6px square indicator + text label, never a
  bare dot. Colors from §1 status tokens only.
- Used identically on: employee card corner, Attendance status, Time Off
  status column.

**Card**
- `--card` fill, 1px `--border`, `--radius`, no shadow, 16–20px padding.
- Used identically on: employee grid, profile info fields, attendance
  stat tiles.

**Table**
- Header row: `--panel` fill, uppercase label style.
- Rows: `--card` fill, 1px `--border` between rows, left `--accent` 2px
  border on hover (not a background swap).
- Used identically on: Attendance list, admin Time Off list.

**Tabs**
- Text buttons, bottom-border 2px `--accent` on active, `--text-muted`
  when inactive. No pill/segmented-control style anywhere.
- Used identically on: Profile (Resume/Private Info/Salary Info).

**Modal**
- `--panel` fill, 1px `--border`, `--radius`, centered, `rgba(0,0,0,.6)` scrim.
- Used identically on: Time Off request — the only modal in the app; if a
  new one is added later, it must match this spec exactly, not invent a new one.

## 5. Page → template map (which pieces each page is built from)

| Page | Template | Components used |
|---|---|---|
| Sign In / Sign Up | Centered form | Input, Button (primary) |
| Employees | Shell + grid | Card, Asset tag, Status chip, Input (search), Button |
| Profile | Shell + detail | Tabs, Card, Asset tag, table (Salary Info) |
| Attendance | Shell + table | Table, Card (stat tiles), Button (check-in) |
| Time Off | Shell + table/list | Status chip, Card (balances), Modal, Table (admin) |

No page gets a layout pattern that isn't in this table. If a new page is
added later, pick the closest existing template instead of designing a new one.

## 6. Consistency checklist — run this against every screen before merge
- [ ] Uses the shared `AppLayout`/navbar component, not a locally rebuilt header
- [ ] All colors are §1 tokens — no new hex values introduced
- [ ] All corners are `--radius` (4px) — no `rounded-full`, no 8px/12px cards
- [ ] All IDs/dates/amounts render in the asset-tag or mono style, nothing in body font
- [ ] Status is always chip + label, never a bare colored dot
- [ ] Buttons match one of the 3 canonical variants — no one-off button styles
- [ ] Spacing values are from the §1 scale (4/8/12/16/24/32) — no arbitrary padding
- [ ] Page follows its assigned template from §5

## 7. Using this with Stitch (or any per-screen AI generator)
Generate one screen at a time, but open every prompt the same way:
```
Use the Dayflow design system below exactly — tokens, typography, and
component specs must match every other screen I generate in this project,
not just be "similar in style." Then build: [screen name].
[paste §1–§4 of this file]
```
If Stitch's output for a later screen drifts (different radius, a new
color, a redesigned button), don't accept it — regenerate with "match the
existing Button/Card/Tag spec from the design system, don't reinterpret it."
