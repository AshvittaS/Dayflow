---
name: dayflow-hrms-spec
description: Authoritative functional spec and UI/business-rule reference for the Dayflow HRMS hackathon project (auth, dashboard, employee profile, attendance, leave/time-off, payroll). Consult this BEFORE writing or reviewing any code, schema, endpoint, or copy for Dayflow. Prevents inventing fields, roles, statuses, or formulas that aren't in the wireframes/PRD.
---

# Dayflow — HRMS Ground Truth Spec

Source docs: `Dayflow - Human Resource Management System.pdf` (PRD) +
`Human_Resource_Management_System - 8 hours.excalidraw` (wireframes).
This file is the single source of truth for what to build. If a detail isn't
here, it isn't confirmed — ask a teammate instead of guessing.

## 0. Rule for AI agents on this repo
Before generating code for any module below: re-read that module's section.
Never invent a field name, role, status value, %, or formula that isn't
written here or in the PRD/wireframe. If something is genuinely missing,
add it to "§9 Open Questions" instead of silently deciding it — then flag
it in the PR description.

## 1. Roles & Auth
- Exactly 2 roles: **Admin / HR Officer** and **Employee**.
- Sign Up screen fields: Company Name (+ logo upload), Name, Email, Phone,
  Password, Confirm Password.
- Sign In screen fields: Login ID/Email, Password.
- **Employees do not self-register.** Only Admin/HR create employee
  accounts. (The Sign Up screen represents the *company's* first
  admin account creation — do not build open self-signup for employees.)
- Login ID is **system-generated**, never typed by the user:
  `[CompanyCode][Initials of first+last name][YearOfJoining][4-digit serial no. for that year]`
  The exact company-code scheme and "initials" rule are illustrated but not
  precisely spelled out in the wireframe — confirm the exact algorithm with
  the team before hardcoding it. Treat it as a pure function
  `generateLoginId(company, firstName, lastName, joinYear, serial)` so it's
  easy to correct later.
- First login uses a system-generated password (emailed or shown once);
  user must be able to change it after first login.

## 2. Navigation shell (applies to every page)
Top nav: `Company Logo | Employees | Attendance | Time Off` + notification
icon + avatar (avatar has a small status dot).
Avatar click → dropdown: **My Profile**, **Log Out**.
`Employees` tab is the default landing page right after login.

## 3. Employees / Dashboard (Admin & HR view)
- Grid of employee cards with search bar above it.
- Each card: photo + basic info + a status indicator top-right:
  - 🟢 green dot = present in office today
  - ✈️ airplane icon = on approved leave
  - 🟡 yellow dot = absent, no leave applied
- Cards are **clickable → opens that employee's profile in VIEW-ONLY
  (non-editable) mode.** This is browsing mode, not the edit form.
- The logged-in user has a Check In / Check Out control; on a successful
  check-in their own status dot updates live (confirm exact color
  transition with design before assuming red→green).

## 4. My Profile
Tabs: **Resume | Private Info | Salary Info**
- Resume / Private Info: name, company, login ID, department, email,
  manager, mobile, about, skills, certifications, interests.
- **Salary Info tab is Admin-only.** Never render or expose it for an
  Employee viewing their own profile, and never allow Employee edits to
  any salary field. (The PRD separately says employees get a *read-only
  payroll view* elsewhere — that is a different, simpler view, not this
  tab. If this is ambiguous in practice, flag it — don't merge both.)

## 5. Salary / Payroll (Admin-only, editable)
Header fields: Wage Type, Salary Type, Month Wage, Yearly Wage,
Working days/week, Break time.
Salary components (each has an amount **and** a %): Basic Salary, House
Rent Allowance, Standard Allowance, Performance Bonus, Leave Travel
Allowance, Fixed Allowance.
Also: PF Contribution (Employee % + Employer %), Tax Deductions
(Professional Tax).

Business rules stated in the wireframe:
- Each component amount is **calculated automatically from % of the
  defined wage** — never manually typed by the admin.
- Example shown (illustrative only, not a hardcoded constant): wage
  ₹50,000, Basic = 60% of wage → ₹30,000; HRA = 50% of Basic → ₹15,000.
- Sum of all components should not exceed the defined wage.
- PF is a % of Basic salary; Professional Tax is a flat deduction from
  gross salary. **Confirm exact %/₹ values with the team before coding —
  do not hardcode the numbers from the wireframe example as real defaults.**
  Store rates as config, not literals, so they're a one-line fix.

## 6. Attendance
- Employee default view: day-wise attendance for the current month, own
  record only. Columns: Day/Date, Check In, Check Out, Work Hours, Extra
  Hours. Header shows count of days present / leaves count / total
  working days.
- Admin/HR view: same table shape but for **all** employees, with a
  date/day switcher.
- **Attendance drives payroll.** Unpaid leave or missing attendance must
  automatically reduce payable days in the payroll calculation — never
  compute payroll independent of attendance records.
- PRD mentions status values Present/Absent/Half-day/Leave; the dashboard
  card only shows Present/On-leave/Absent. Confirm if Half-day needs its
  own UI state before building it.

## 7. Time Off / Leave
- Exactly 3 types: **Paid Time Off, Sick Leave, Unpaid Leave.** Don't add
  more without confirming.
- Employee view: own Time Off tab only, calendar + balance summary (e.g.
  "24 Days Available" paid / "07 Days Available" sick in the wireframe
  are **example seed balances**, not universal constants — real balances
  come from each employee's Allocation record).
- "Time off Type Request" modal fields: Employee (self, locked), Time off
  Type, Validity Period (date range), Allocation/Days requested,
  Attachment (**required for Sick Leave** — "for sick leave certificate").
  Buttons: Submit, Discard.
- Admin/HR Time Off view has two sub-tabs: **Time Off** (all requests —
  Name, Start Date, End Date, Type, Status chip) and **Allocation**
  (per-employee leave balances/config).
- Only Admin/HR see Approve/Reject controls — never show them to an
  employee on their own request.
- Status enum (from PRD §3.5.1): `Pending | Approved | Rejected`. Map the
  wireframe's colored status dot to these three — confirm exact color
  mapping with whoever owns the design before coding it in.

## 8. Cross-cutting invariants — check every PR against this list
- [ ] Employee can never see the Salary Info tab or another employee's data.
- [ ] Only Admin/HR can approve/reject leave or edit salary structure.
- [ ] Attendance records feed the payroll payable-days calculation.
- [ ] Login IDs are system-generated, never free-typed at signup.
- [ ] Time Off types are limited to exactly the 3 listed above.
- [ ] Any numeric business rule (%, ₹, day counts) not explicitly written
      here → flagged to the team, not silently guessed.

## 9. Open questions the wireframe does NOT answer
Track these here as they're resolved by the team — don't let each branch
answer them differently:
- Exact company-code scheme for Login ID generation.
- Exact PF % and Professional Tax ₹ value.
- Exact status-color → enum mapping for leave requests.
- Whether Half-day needs its own attendance UI state.
- Whether "view-only mode" on employee cards is the same for HR viewing
  peers vs. Admin viewing anyone.
- Tech stack (not specified in the PRD/wireframe at all — see the git
  plan doc for the assumed default; change it there if the team picks
  something else, and update this file's "no framework-specific code"
  rule stays true regardless).
