# Dayflow

Dayflow is a modern human resource management system (HRMS) frontend for managing employee information, attendance, payroll details, and time-off requests in one place.

## Features

- Sign-in and sign-up screens
- Employee directory with employee profiles
- Attendance calendar and work-hour records
- Salary structure and payroll information
- Time-off balances, requests, and approvals
- Role-aware admin views

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
cd dayflow-frontend
npm install
```

### Run the development server

```bash
npm run dev
```

Open the local URL shown by Vite, then visit `/signin` to enter the application. Authentication and application data currently use mock data for frontend development; no backend service is required.

### Create a production build

```bash
npm run build
```

## Application Routes

| Route | Description |
| --- | --- |
| `/signin` | Sign in |
| `/signup` | Create an account |
| `/employees` | Employee directory |
| `/profile` | Current user profile |
| `/profile/:id` | Employee profile |
| `/attendance` | Attendance records |
| `/timeoff` | Time-off management |

## Project Structure

The frontend lives in [`dayflow-frontend`](dayflow-frontend/). Shared mock records are in [`src/data/mockData.js`](dayflow-frontend/src/data/mockData.js), while pages are organized by feature under [`src/pages`](dayflow-frontend/src/pages/).

## Contributing

Keep feature work focused on the relevant module and coordinate changes to shared files such as `src/data/mockData.js`, `tailwind.config.js`, and `src/components/ui/StatusDot.jsx`. See [`dayflow-frontend/HACKATHON_GIT_PLAN.md`](dayflow-frontend/HACKATHON_GIT_PLAN.md) for the branch ownership and merge plan.