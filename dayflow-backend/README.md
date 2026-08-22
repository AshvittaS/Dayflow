# Dayflow Backend API

RESTful API backend for Dayflow HRMS built with **Node.js**, **Express**, **MySQL**, and **JWT authentication**.

---

## 🚀 Quick Setup

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server running locally (or remote)

### 2. Configure Environment
Create a `.env` file in the `dayflow-backend/` root:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dayflow
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=super_secret_jwt_key_for_dayflow_hrms
JWT_EXPIRES_IN=24h

PORT=4000
BCRYPT_ROUNDS=10
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create Database & Tables (Run Once)
```bash
npm run schema
```
This runs `src/runSchema.js` which creates the `dayflow` database and all required tables with foreign keys and constraints.

### 5. Seed Demo Data (Run Once)
```bash
npm run seed
```
This seeds:
- Company: Dayflow Inc.
- Leave types: `Paid Time Off`, `Sick Leave`, `Unpaid Leave`
- 1 Admin user + 5 Employee users
- Leave allocations, salary structures, and attendance records

#### Demo Credentials:
- **Admin**:
  - Login ID: `DF26JD0001` or Email: `jamie.doe@dayflow.dev`
  - Password: `Password@123`
- **Employee**:
  - Login ID: `DF26AK0002` or Email: `alex.kumar@dayflow.dev`
  - Password: `Password@123`

### 6. Start the API Server
```bash
# Development (with nodemon auto-restart):
npm run dev

# Or standard production start:
npm start
```
The server will run on **`http://localhost:4000`**.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth / Role |
|---|---|---|---|
| `POST` | `/auth/signup` | Register company admin + generate Login ID | Public |
| `POST` | `/auth/signin` | Sign in with Login ID or Email | Public |
| `POST` | `/auth/change-password` | Change password on first login | Authenticated |
| `GET` | `/employees` | List all company employees (with live status) | Authenticated |
| `GET` | `/employees/:id` | Get employee profile details | Authenticated |
| `POST` | `/employees` | Create a new employee | Admin Only |
| `PUT` | `/employees/:id` | Update profile fields | Self / Admin |
| `POST` | `/attendance/checkin` | Check in for today | Authenticated |
| `POST` | `/attendance/checkout` | Check out for today | Authenticated |
| `GET` | `/attendance` | Get monthly attendance records (`?month=YYYY-MM`) | Authenticated |
| `GET` | `/attendance/summary` | Get attendance summary stats | Authenticated |
| `GET` | `/timeoff` | List time off requests | Authenticated |
| `POST` | `/timeoff` | Submit a time off request (with optional cert) | Authenticated |
| `PUT` | `/timeoff/:id/status` | Approve or reject a leave request | Admin Only |
| `GET` | `/timeoff/allocations` | Get all employees' leave balances | Admin Only |
| `GET` | `/salary/:empId` | Get employee salary structure + components | Admin Only |
| `PUT` | `/salary/:empId` | Update employee salary structure | Admin Only |
