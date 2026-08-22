-- Dayflow HRMS — MySQL Schema
-- Run via: node src/runSchema.js
-- Or manually: mysql -u root -p dayflow < src/schema.sql

CREATE DATABASE IF NOT EXISTS dayflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dayflow;

-- ─── Companies ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id         INT          PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  code       VARCHAR(10)  NOT NULL UNIQUE,   -- used in login_id generation
  logo_url   VARCHAR(255),
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- ─── Users (auth accounts) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT          PRIMARY KEY AUTO_INCREMENT,
  company_id    INT          NOT NULL,
  login_id      VARCHAR(30)  NOT NULL UNIQUE,  -- system-generated (SKILL.md §1)
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','employee') NOT NULL DEFAULT 'employee',
  first_login   TINYINT(1)   NOT NULL DEFAULT 1, -- force password change on first login
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ─── Employees (profile data, separate from auth) ─────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id           INT          PRIMARY KEY AUTO_INCREMENT,
  user_id      INT          NOT NULL UNIQUE,
  name         VARCHAR(100) NOT NULL,
  department   VARCHAR(100),
  manager      VARCHAR(100),
  mobile       VARCHAR(20),
  about        TEXT,
  skills       JSON,          -- e.g. ["React","Node.js"]
  certifications JSON,
  interests    JSON,
  status       ENUM('present','absent','leave') NOT NULL DEFAULT 'absent',
  avatar_url   VARCHAR(255),
  join_date    DATE,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Attendance ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id           INT     PRIMARY KEY AUTO_INCREMENT,
  employee_id  INT     NOT NULL,
  date         DATE    NOT NULL,
  check_in     TIME,
  check_out    TIME,
  work_hours   VARCHAR(10),   -- HH:MM, computed on checkout
  extra_hours  VARCHAR(10),   -- HH:MM above 8h standard day
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emp_date (employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ─── Leave Types (seeded — exactly 3 per SKILL.md §7) ────────────────────────
CREATE TABLE IF NOT EXISTS leave_types (
  id   INT         PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- ─── Leave Allocations (per employee per type) ───────────────────────────────
CREATE TABLE IF NOT EXISTS leave_allocations (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  employee_id   INT NOT NULL,
  leave_type_id INT NOT NULL,
  total_days    INT NOT NULL DEFAULT 0,
  used_days     INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_emp_type (employee_id, leave_type_id),
  FOREIGN KEY (employee_id)   REFERENCES employees(id)   ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
);

-- ─── Time Off Requests ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS time_off_requests (
  id              INT      PRIMARY KEY AUTO_INCREMENT,
  employee_id     INT      NOT NULL,
  leave_type_id   INT      NOT NULL,
  start_date      DATE     NOT NULL,
  end_date        DATE     NOT NULL,
  days_requested  INT      NOT NULL,
  attachment_url  VARCHAR(255),         -- required for Sick Leave (SKILL.md §7)
  status          ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  reviewed_by     INT,                  -- user_id of admin who acted
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id)   REFERENCES employees(id)   ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by)   REFERENCES users(id)       ON DELETE SET NULL
);

-- ─── Salary Structures (one per employee, admin-only, SKILL.md §5) ──────────
CREATE TABLE IF NOT EXISTS salary_structures (
  id                    INT            PRIMARY KEY AUTO_INCREMENT,
  employee_id           INT            NOT NULL UNIQUE,
  wage_type             VARCHAR(50)    NOT NULL DEFAULT 'Monthly',
  salary_type           VARCHAR(50)    NOT NULL DEFAULT 'Fixed',
  month_wage            DECIMAL(12,2)  NOT NULL DEFAULT 0,
  year_wage             DECIMAL(12,2)  GENERATED ALWAYS AS (month_wage * 12) STORED,
  working_days_per_week INT            NOT NULL DEFAULT 5,
  break_time_hrs        DECIMAL(4,2)   NOT NULL DEFAULT 1,
  -- PF % and Professional Tax ₹ are NOT confirmed; stored as config (SKILL.md §9)
  pf_employee_pct       DECIMAL(5,2)   NOT NULL DEFAULT 12,
  pf_employer_pct       DECIMAL(5,2)   NOT NULL DEFAULT 12,
  professional_tax      DECIMAL(10,2)  NOT NULL DEFAULT 200,
  updated_at            DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ─── Salary Components (per structure, auto-calculated) ─────────────────────
CREATE TABLE IF NOT EXISTS salary_components (
  id                   INT            PRIMARY KEY AUTO_INCREMENT,
  salary_structure_id  INT            NOT NULL,
  label                VARCHAR(100)   NOT NULL,
  percent              DECIMAL(5,2)   NOT NULL,   -- % of month_wage
  amount               DECIMAL(12,2)  NOT NULL,   -- computed: percent * month_wage / 100
  sort_order           INT            NOT NULL DEFAULT 0,
  FOREIGN KEY (salary_structure_id) REFERENCES salary_structures(id) ON DELETE CASCADE
);
