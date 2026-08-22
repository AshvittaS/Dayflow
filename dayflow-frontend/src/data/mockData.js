// Shared mock data for UI development before the real API exists.
// Structured according to Dayflow HRMS specifications.

export const currentUser = {
  id: 'emp-001',
  loginId: 'DF23JD0001',
  name: 'Jamie Doe',
  role: 'admin', // 'employee' | 'admin'
  title: 'Lead Product Engineer',
  department: 'Engineering',
  location: 'Bengaluru, India',
  email: 'jamie.doe@dayflow.dev',
  manager: 'Ravi Shankar',
  mobile: '+91 98450 12345',
  dateOfBirth: '14 May 1994',
  gender: 'Female',
  address: '402, Highrise Residency, Indiranagar, Bengaluru, 560038',
  emergencyContact: {
    name: 'Sarah Doe',
    relation: 'Spouse',
    mobile: '+91 98450 98765'
  },
  bankDetails: {
    accountNumber: '•••• •••• •••• 4921',
    bankName: 'HDFC Bank',
    ifsc: 'HDFC0001234'
  },
  status: 'present', // 'present' | 'absent' | 'leave'
  about: 'Lead full-stack engineer passionate about crafting scalable distributed architectures, intuitive UI systems, and high-performance product workflows. Leading core engineering initiatives at Dayflow.',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design', 'Tailwind CSS', 'GraphQL', 'Docker'],
  certifications: ['AWS Certified Solutions Architect', 'Google Cloud Professional Cloud Architect', 'Certified Kubernetes Administrator'],
  interests: ['Open Source Tooling', 'Distributed Systems', 'Mountain Hiking', 'Acoustic Guitar']
}

export const employees = [
  {
    id: 'emp-001',
    loginId: 'DF23JD0001',
    name: 'Jamie Doe',
    title: 'Lead Product Engineer',
    department: 'Engineering',
    location: 'Bengaluru, India',
    status: 'present',
    avatar: null,
    email: 'jamie.doe@dayflow.dev',
    mobile: '+91 98450 12345',
    manager: 'Ravi Shankar',
    dateOfBirth: '14 May 1994',
    gender: 'Female',
    address: '402, Highrise Residency, Indiranagar, Bengaluru, 560038',
    emergencyContact: { name: 'Sarah Doe', relation: 'Spouse', mobile: '+91 98450 98765' },
    about: 'Lead full-stack engineer passionate about crafting scalable distributed architectures, intuitive UI systems, and high-performance product workflows.',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
    certifications: ['AWS Certified Solutions Architect', 'Google Cloud Architect'],
    interests: ['Open Source Tooling', 'Distributed Systems', 'Mountain Hiking']
  },
  {
    id: 'emp-002',
    loginId: 'DF23AK0002',
    name: 'Alex Kumar',
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'San Francisco, USA',
    status: 'leave',
    avatar: null,
    email: 'alex.kumar@dayflow.dev',
    mobile: '+1 (415) 890-1234',
    manager: 'Jamie Doe',
    dateOfBirth: '22 Aug 1992',
    gender: 'Male',
    address: '742 Evergreen Terrace, Mission District, SF, CA 94110',
    emergencyContact: { name: 'Anita Kumar', relation: 'Sister', mobile: '+1 (415) 890-5678' },
    about: 'Product designer focusing on enterprise ergonomics, design systems, micro-interactions, and accessibility standards.',
    skills: ['Figma', 'Design Systems', 'UX Research', 'Prototyping', 'Typography', 'WCAG Accessibility'],
    certifications: ['Nielsen Norman UX Master Certified', 'Interaction Design Specialist'],
    interests: ['Architecture Photography', 'Ceramics', 'Specialty Coffee']
  },
  {
    id: 'emp-003',
    loginId: 'DF23PN0003',
    name: 'Priya Nair',
    title: 'HR Operations Lead',
    department: 'HR',
    location: 'Mumbai, India',
    status: 'absent',
    avatar: null,
    email: 'priya.nair@dayflow.dev',
    mobile: '+91 99201 44556',
    manager: 'Sarah Jenkins',
    dateOfBirth: '03 Nov 1995',
    gender: 'Female',
    address: '12B Sea View Apartments, Bandra West, Mumbai, 400050',
    emergencyContact: { name: 'Kiran Nair', relation: 'Father', mobile: '+91 99201 99887' },
    about: 'People operations strategist with expertise in talent management, payroll governance, statutory compliance, and employee experience.',
    skills: ['HR Strategy', 'Payroll Compliance', 'Talent Acquisition', 'Labor Laws', 'People Analytics'],
    certifications: ['SHRM Certified Professional (SHRM-CP)', 'Certified Compensation Professional'],
    interests: ['Classical Dance', 'Volunteering', 'Book Club']
  },
  {
    id: 'emp-004',
    loginId: 'DF23SL0004',
    name: 'Sam Lee',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Singapore',
    status: 'present',
    avatar: null,
    email: 'sam.lee@dayflow.dev',
    mobile: '+65 9123 4567',
    manager: 'Jamie Doe',
    dateOfBirth: '19 Jan 1996',
    gender: 'Non-binary',
    address: 'Block 204, Tanjong Pagar Road, #14-02, Singapore 088540',
    emergencyContact: { name: 'David Lee', relation: 'Brother', mobile: '+65 9876 5432' },
    about: 'Frontend specialist obsessive about web performance, bundle size optimization, and modern reactivity models.',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Vite', 'Web Performance', 'Testing Library'],
    certifications: ['Meta Certified Front-End Developer', 'TypeScript Specialist'],
    interests: ['Synthesizers', 'Bouldering', 'Cycling']
  },
  {
    id: 'emp-005',
    loginId: 'DF23MI0005',
    name: 'Meera Iyer',
    title: 'Enterprise Account Executive',
    department: 'Sales',
    location: 'London, UK',
    status: 'present',
    avatar: null,
    email: 'meera.iyer@dayflow.dev',
    mobile: '+44 20 7946 0912',
    manager: 'Marcus Vance',
    dateOfBirth: '10 Jul 1993',
    gender: 'Female',
    address: '45 Kensington Gardens Square, London W2 4BQ',
    emergencyContact: { name: 'Arun Iyer', relation: 'Father', mobile: '+44 20 7946 0999' },
    about: 'Enterprise sales consultant connecting high-growth businesses with transformative HR and workflow automation tools.',
    skills: ['Enterprise SaaS', 'B2B Sales', 'Negotiation', 'CRM Strategy', 'Revenue Forecasting'],
    certifications: ['Meddicc Sales Certification', 'HubSpot Inbound Sales Certified'],
    interests: ['Contemporary Art', 'Tennis', 'Travel Writing']
  },
  {
    id: 'emp-006',
    loginId: 'DF23DP0006',
    name: 'Dev Patel',
    title: 'DevOps & Cloud Architect',
    department: 'Engineering',
    location: 'Bengaluru, India',
    status: 'absent',
    avatar: null,
    email: 'dev.patel@dayflow.dev',
    mobile: '+91 97110 55667',
    manager: 'Jamie Doe',
    dateOfBirth: '28 Sep 1991',
    gender: 'Male',
    address: '501, Green Glen Layout, Bellandur, Bengaluru, 560103',
    emergencyContact: { name: 'Neha Patel', relation: 'Spouse', mobile: '+91 97110 88990' },
    about: 'Infrastructure engineer automating multi-region cloud systems, CI/CD pipelines, and zero-downtime deployment workflows.',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD Pipelines', 'Linux Kernel', 'Prometheus'],
    certifications: ['AWS Solutions Architect Professional', 'HashiCorp Certified Terraform Associate'],
    interests: ['Home Automation', 'Formula 1', 'Mechanical Keyboards']
  }
]

// § 5 — Salary Info, admin-only.
export const salaryStructure = {
  wageType: 'Monthly',
  salaryType: 'Fixed',
  monthWage: 50000,
  yearWage: 600000,
  workingDaysPerWeek: 5,
  breakTimeHrs: 1,
  components: [
    { label: 'Basic Salary',          amount: 30000, percent: 60 },
    { label: 'House Rent Allowance',  amount: 15000, percent: 50 },
    { label: 'Standard Allowance',    amount: 4000,  percent: 8  },
    { label: 'Performance Bonus',     amount: 3000,  percent: 6  },
    { label: 'Leave Travel Allowance',amount: 2000,  percent: 4  },
    { label: 'Fixed Allowance',       amount: 1000,  percent: 2  }
  ],
  pf: { employeePercent: 12, employerPercent: 12 },
  professionalTax: 200
}

// § 6 — Attendance
export const attendanceRecords = [
  { date: '2026-08-01', checkIn: '09:15', checkOut: '18:30', workHours: '09:15', extraHours: '01:15' },
  { date: '2026-08-04', checkIn: '09:32', checkOut: '18:41', workHours: '09:09', extraHours: '01:09' },
  { date: '2026-08-05', checkIn: '10:02', checkOut: '18:05', workHours: '08:03', extraHours: '00:03' },
  { date: '2026-08-06', checkIn: '09:00', checkOut: '18:00', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-07', checkIn: '09:45', checkOut: '17:30', workHours: '07:45', extraHours: '00:00' },
  { date: '2026-08-08', checkIn: '09:10', checkOut: '18:20', workHours: '09:10', extraHours: '01:10' },
  { date: '2026-08-11', checkIn: '09:30', checkOut: '18:30', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-12', checkIn: '10:00', checkOut: '19:00', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-13', checkIn: '09:05', checkOut: '17:50', workHours: '08:45', extraHours: '00:45' },
  { date: '2026-08-14', checkIn: '09:20', checkOut: '18:10', workHours: '08:50', extraHours: '00:50' },
  { date: '2026-08-18', checkIn: '09:00', checkOut: '18:00', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-19', checkIn: '09:30', checkOut: '18:30', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-20', checkIn: '09:32', checkOut: '18:41', workHours: '09:09', extraHours: '01:09' },
  { date: '2026-08-21', checkIn: '10:02', checkOut: '19:05', workHours: '09:03', extraHours: '01:03' },
  { date: '2026-08-22', checkIn: '09:15', checkOut: null,    workHours: null,    extraHours: null    }
]

// § 7 — Time Off
export const timeOffTypes = ['Paid Time Off', 'Sick Leave', 'Unpaid Leave']

export const timeOffBalances = {
  'Paid Time Off': 24,
  'Sick Leave': 7,
  'Unpaid Leave': 0
}

export const leaveAllocations = [
  { id: 'emp-001', name: 'Jamie Doe',  paidTimeOff: 24, sickLeave: 7, unpaidLeave: 0 },
  { id: 'emp-002', name: 'Alex Kumar', paidTimeOff: 24, sickLeave: 7, unpaidLeave: 0 },
  { id: 'emp-003', name: 'Priya Nair', paidTimeOff: 20, sickLeave: 7, unpaidLeave: 2 },
  { id: 'emp-004', name: 'Sam Lee',    paidTimeOff: 24, sickLeave: 7, unpaidLeave: 0 },
  { id: 'emp-005', name: 'Meera Iyer',paidTimeOff: 24, sickLeave: 5, unpaidLeave: 0 },
  { id: 'emp-006', name: 'Dev Patel', paidTimeOff: 18, sickLeave: 7, unpaidLeave: 3 }
]

export const timeOffRequests = [
  { id: 'to-001', employee: 'Jamie Doe',  startDate: '2026-08-26', endDate: '2026-08-26', type: 'Paid Time Off', status: 'Pending',  daysRequested: 1 },
  { id: 'to-002', employee: 'Alex Kumar', startDate: '2026-08-15', endDate: '2026-08-16', type: 'Sick Leave',    status: 'Approved', daysRequested: 2 },
  { id: 'to-003', employee: 'Priya Nair', startDate: '2026-08-10', endDate: '2026-08-10', type: 'Unpaid Leave',  status: 'Rejected', daysRequested: 1 },
  { id: 'to-004', employee: 'Sam Lee',    startDate: '2026-09-01', endDate: '2026-09-05', type: 'Paid Time Off', status: 'Pending',  daysRequested: 5 }
]
