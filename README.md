# ⚡ Dayflow — Human Resource Management System (HRMS)

A modern, fast, and comprehensive Human Resource Management System built for streamlined workforce operations, employee profile management, attendance tracking, leave/time-off requests, and payroll calculation.

---

## 🔗 Repository Links

- **Upstream Central Repository**: [https://github.com/AshvittaS/Dayflow.git](https://github.com/AshvittaS/Dayflow.git)
- **Origin Fork**: [https://github.com/Sanjayprathmanyu02/Dayflow.git](https://github.com/Sanjayprathmanyu02/Dayflow.git)
- **Active Feature Branch**: `spm`

---

## 🚀 Key Modules & Capabilities

### 1. 🔐 Authentication & Access Control
- **Dual Role Architecture**: Strict privilege separation between **Admin / HR Officer** and **Employee**.
- **Company Sign-Up**: Admin onboarding flow with company profile & brand logo branding.
- **Automated Login-ID Generation**: Deterministic ID generation based on company code, employee initials, joining year, and serial counter.
- **Secure Password Flow**: System-generated first credentials with forced password update on initial login.

### 2. 👥 Employee Directory & Profiles
- **Interactive Directory Grid**: Real-time searchable card grid categorized by department and active status.
- **Live Presence Indicators**:
  - 🟢 **Green**: Active / Checked-in today
  - 🟡 **Yellow**: Absent / Pending check-in
  - ✈️ **Airplane**: On approved leave
- **Comprehensive Profile Views**: Resume, contact information, skills, certifications, and private records with view-only protection for peer employees.

### 3. 💰 Payroll & Compensation (Admin-Only)
- **Dynamic Wage Structure**: Flexible configuration supporting monthly/annual wages, hourly/salaried wage types, working schedules, and break allocations.
- **Automated Component Calculation**: Auto-calculated Basic Salary, House Rent Allowance (HRA), Standard Allowance, Fixed Allowance, and Performance Bonus based on percentage formulas.
- **Taxation & Deductions**: Automated calculations for Employee/Employer PF contributions and Professional Tax (PT).
- **Attendance-Linked Payroll**: Automatic deduction adjustments based on unpaid leaves and attendance metrics.

### 4. ⏱️ Attendance Management
- **One-Click Check-In / Check-Out**: Live status updates directly reflecting across the dashboard.
- **Self-Service Attendance Log**: Monthly day-by-day table showing check-in times, check-out times, total hours worked, and extra hours.
- **Admin Multi-Employee Attendance**: Comprehensive cross-organization attendance view with date-filtering and status audits.

### 5. 🌴 Time Off & Leave Management
- **Standardized Leave Types**: Paid Time Off (PTO), Sick Leave (with medical certificate attachment upload), and Unpaid Leave.
- **Interactive Leave Calendar**: Visual month-grid displaying personal approved, pending, and rejected leave intervals alongside current balances.
- **Admin Approval Queue & Allocations**: Centralized review interface for Admin/HR to evaluate leave requests and manage annual leave quotas per employee.

---

## 🛠️ Technology Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Layer**: Modular mock data layer structured for seamless REST API integration

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sanjayprathmanyu02/Dayflow.git
   cd Dayflow
   ```

2. **Configure Upstream Remote:**
   ```bash
   git remote add upstream https://github.com/AshvittaS/Dayflow.git
   git fetch upstream
   ```

3. **Navigate to the frontend application:**
   ```bash
   cd dayflow-frontend
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Start the local development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌿 Git Workflow & Branching Strategy

- `main`: Protected baseline branch (stable, buildable state).
- `spm`: Working and feature branch for development by `@Sanjayprathmanyu02`.
- Upstream sync:
  ```bash
  git fetch upstream
  git merge upstream/main
  ```

---

## 📄 License & Attribution
Developed for the Dayflow HRMS Project.
