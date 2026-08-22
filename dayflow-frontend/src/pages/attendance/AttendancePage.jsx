import React, { useState, useEffect, useRef, useLayoutEffect, useMemo, useCallback } from "react";

/* ============================================================
   Attendance.jsx
   Self-contained drop-in component (no external CSS files, no
   extra deps besides React). Two views — Employee and Admin/HR —
   built around a shared timeline-bar component on an 8am–8pm axis.

   Usage:
     import AttendancePage from "./attendance/Attendance.jsx";
     <AttendancePage />
   ============================================================ */

/* ---------------- date / format utils ---------------- */
function seededRand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function pad(n) {
  return String(n).padStart(2, "0");
}
function hourToClock(h) {
  let hh = Math.floor(h);
  let mm = Math.round((h - hh) * 60);
  if (mm === 60) {
    mm = 0;
    hh += 1;
  }
  const period = hh >= 12 ? "PM" : "AM";
  let h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${pad(mm)} ${period}`;
}
function hoursToDur(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}h ${pad(mm)}m`;
}
function dateOffset(base, deltaDays) {
  const d = new Date(base);
  d.setDate(d.getDate() + deltaDays);
  return d;
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AXIS_START = 8;
const AXIS_END = 20;
const AXIS_SPAN = AXIS_END - AXIS_START;

// Fixed reference date for this demo dataset (swap for `new Date()` and
// wire genRecord to real attendance data in production).
const DEMO_TODAY = new Date(2026, 7, 21); // Fri Aug 21 2026
const DEMO_NOW_HOUR = 13.35; // ~1:21pm — "now" used for ongoing-day calculations

/* ---------------- people ---------------- */
const ME = { id: 0, name: "Priya Nair", initials: "PN" };
const TEAM = [
  { id: 0, name: "Priya Nair", initials: "PN" },
  { id: 1, name: "Daniel Cho", initials: "DC" },
  { id: 2, name: "Maria Lopez", initials: "ML" },
  { id: 3, name: "Jordan Blake", initials: "JB" },
  { id: 4, name: "Sofia Rossi", initials: "SR" },
  { id: 5, name: "Wei Chen", initials: "WC" },
  { id: 6, name: "Liam O\u2019Connor", initials: "LO" },
  { id: 7, name: "Noah Fischer", initials: "NF" },
  { id: 8, name: "Grace Kim", initials: "GK" },
];

/**
 * Deterministic demo attendance generator.
 * Replace with a real data fetch (e.g. `records[employeeId][dateKey]`)
 * — the rest of the component only depends on the shape returned here:
 *   { status: 'present'|'leave'|'absent'|'weekend', ongoing?, checkIn?, checkOut?, workedHours? }
 */
function genRecord(empId, dateObj, isToday) {
  const dow = dateObj.getDay();
  if (dow === 0 || dow === 6) return { status: "weekend" };

  const seed = empId * 137 + dateObj.getDate() * 31 + (dateObj.getMonth() + 1) * 11 + 1;
  const roll = seededRand(seed);
  if (roll < 0.055) return { status: "absent" };
  if (roll < 0.13) return { status: "leave" };

  const checkIn = 8 + seededRand(seed * 1.7) * 1.6; // 8:00–9:36
  const plannedHours = 7.4 + seededRand(seed * 2.3) * 2.6; // 7.4–10h

  if (isToday) {
    const elapsed = DEMO_NOW_HOUR - checkIn;
    if (elapsed < plannedHours) {
      return { status: "present", ongoing: true, checkIn, checkOut: null, workedHours: Math.max(0.15, elapsed) };
    }
  }
  const checkOut = checkIn + plannedHours;
  return { status: "present", ongoing: false, checkIn, checkOut, workedHours: plannedHours };
}

/* ---------------- icons ---------------- */
function IconFlame(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.5 1.5c1 3.6-2.3 5-2.3 8.4a3.8 3.8 0 007.6 0c0-1.1-.5-2-.9-2.6 1.4 3.9-.7 6.1-.7 6.1a5.6 5.6 0 01-9.3-4.2c0-4 3-5.6 4-8.2a5 5 0 011.6.5z" />
    </svg>
  );
}
function IconPlane(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  );
}
function IconWarn(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3 2 21h20L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
function IconChevron(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function IconStop(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
function IconPower(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v12" />
      <path d="M8 6a7 7 0 108 0" />
    </svg>
  );
}

/* ---------------- shared timeline-bar pieces ---------------- */
function TrackContent({ rec, showNow }) {
  if (rec.status === "weekend") {
    return (
      <div className="att-weekend-fill">
        <span>Weekend</span>
      </div>
    );
  }
  if (rec.status === "leave") {
    return (
      <div className="att-dash-fill">
        <IconPlane />
        <span>On leave</span>
      </div>
    );
  }
  if (rec.status === "absent") {
    return (
      <div className="att-dash-fill att-absent">
        <IconWarn />
        <span>No check-in</span>
      </div>
    );
  }

  const endHour = rec.ongoing ? DEMO_NOW_HOUR : rec.checkOut;
  const worked = endHour - rec.checkIn;
  const base = Math.min(worked, 8);
  const extra = Math.max(0, worked - 8);
  const leftPct = ((rec.checkIn - AXIS_START) / AXIS_SPAN) * 100;
  const basePct = (base / AXIS_SPAN) * 100;
  const extraPct = (extra / AXIS_SPAN) * 100;
  const extraLeftPct = ((rec.checkIn - AXIS_START + base) / AXIS_SPAN) * 100;
  const nowPct = ((DEMO_NOW_HOUR - AXIS_START) / AXIS_SPAN) * 100;

  return (
    <>
      <div
        className={"att-bar-seg att-present" + (rec.ongoing ? " att-ongoing" : "")}
        style={{ left: leftPct + "%", width: basePct + "%" }}
      />
      {extra > 0.01 && (
        <div className="att-bar-seg att-extra-tail" style={{ left: extraLeftPct + "%", width: extraPct + "%" }} />
      )}
      {showNow && <div className="att-now-line" style={{ left: nowPct + "%" }} />}
    </>
  );
}

function trackClassFor(rec) {
  if (rec.status === "weekend") return "att-track att-weekend-track";
  if (rec.status === "leave") return "att-track att-leave-track";
  if (rec.status === "absent") return "att-track att-absent-track";
  return "att-track";
}

function TrackMeta({ rec, chevronOpen, showChevron }) {
  if (rec.status === "weekend") return <span className="att-hrs att-mono" style={{ color: "var(--att-ink-faint)" }}>—</span>;
  if (rec.status === "leave") return <span className="att-hrs" style={{ color: "var(--att-leave)" }}>Full day</span>;
  if (rec.status === "absent") return <span className="att-hrs" style={{ color: "var(--att-absent)" }}>Unrecorded</span>;

  const endHour = rec.ongoing ? DEMO_NOW_HOUR : rec.checkOut;
  const worked = endHour - rec.checkIn;
  const extra = Math.max(0, worked - 8);

  return (
    <>
      <span className="att-hrs">
        {hoursToDur(worked)}
        {rec.ongoing && <span style={{ color: "var(--att-present)" }}> ●</span>}
      </span>
      {extra > 0.01 && <div className="att-extra">+{hoursToDur(extra)} extra</div>}
      {showChevron && (
        <span className={"att-chev" + (chevronOpen ? " att-open" : "")}>
          <IconChevron />
        </span>
      )}
    </>
  );
}

function ringClassFor(rec) {
  if (rec.status === "present") return rec.ongoing ? "att-ring-ongoing" : "att-ring-present";
  if (rec.status === "leave") return "att-ring-leave";
  if (rec.status === "absent") return "att-ring-absent";
  return "";
}

/* Employee "recent days" row — expandable detail line */
function EmployeeTimelineRow({ rec, dayLabel, dateLabel, index, showNow }) {
  const [open, setOpen] = useState(false);
  const expandable = rec.status !== "weekend";

  return (
    <div
      className={"att-tl-row att-cascade" + (expandable ? "" : " att-no-expand")}
      style={{ animationDelay: index * 70 + "ms" }}
      onClick={() => expandable && setOpen((o) => !o)}
    >
      <div className="att-tl-label">
        <div className="att-day-txt">
          <span className="att-d1">{dayLabel}</span>
          <span className="att-d2 att-mono">{dateLabel}</span>
        </div>
      </div>
      <div className={trackClassFor(rec)}>
        <TrackContent rec={rec} showNow={showNow} />
      </div>
      <div className="att-tl-meta">
        <TrackMeta rec={rec} chevronOpen={open} showChevron={expandable} />
      </div>

      {expandable && (
        <div className={"att-tl-detail" + (open ? " att-open" : "")}>
          <div className="att-tl-detail-inner">
            {rec.status === "present" && (
              <>
                <div>
                  Check-in <b>{hourToClock(rec.checkIn)}</b>
                </div>
                <div>
                  Check-out <b>{rec.ongoing ? "—" : hourToClock(rec.checkOut)}</b>
                </div>
                <div>
                  Worked <b>{hoursToDur(rec.ongoing ? DEMO_NOW_HOUR - rec.checkIn : rec.checkOut - rec.checkIn)}</b>
                </div>
                {(() => {
                  const worked = (rec.ongoing ? DEMO_NOW_HOUR : rec.checkOut) - rec.checkIn;
                  const extra = Math.max(0, worked - 8);
                  return extra > 0.01 ? (
                    <div style={{ color: "var(--att-extra)" }}>
                      Extra <b style={{ color: "var(--att-extra)" }}>{hoursToDur(extra)}</b>
                    </div>
                  ) : null;
                })()}
              </>
            )}
            {rec.status === "leave" && <div>Full-day leave — no check-in expected.</div>}
            {rec.status === "absent" && (
              <div style={{ color: "var(--att-absent)" }}>
                No check-in was recorded for this day. Flagged for payroll review.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* Admin row — one employee, non-expandable */
function AdminTimelineRow({ emp, rec, index, showNow }) {
  return (
    <div className="att-tl-row att-no-expand att-cascade" style={{ animationDelay: index * 65 + "ms" }}>
      <div className="att-tl-label">
        <div className={"att-avatar " + ringClassFor(rec)}>{emp.initials}</div>
        <div className="att-day-txt">
          <span className="att-d1 att-trunc">{emp.name}</span>
          <span className="att-d2 att-trunc">{emp.id === 0 ? "You" : "Team member"}</span>
        </div>
      </div>
      <div className={trackClassFor(rec)}>
        <TrackContent rec={rec} showNow={showNow} />
      </div>
      <div className="att-tl-meta">
        <TrackMeta rec={rec} showChevron={false} />
      </div>
    </div>
  );
}

/* ---------------- count-up number (imperative, avoids per-frame re-render) ---------------- */
function CountUp({ target, duration = 900, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = performance.now();
    let raf;
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return (
    <span className={className} ref={ref}>
      0
    </span>
  );
}

/* ---------------- main component ---------------- */
export default function AttendancePage() {
  const [view, setView] = useState("employee"); // 'employee' | 'admin'
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [cascadeKey, setCascadeKey] = useState(0); // bump to replay stagger animations on view switch

  /* ---- header text ---- */
  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    return hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  }, []);

  /* ---- month summary counts ---- */
  const monthCounts = useMemo(() => {
    let present = 0,
      leave = 0,
      absent = 0,
      workingDays = 0;
    for (let day = 1; day <= 21; day++) {
      const d = new Date(2026, 7, day);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      workingDays++;
      const rec = genRecord(ME.id, d, d.toDateString() === DEMO_TODAY.toDateString());
      if (rec.status === "present") present++;
      else if (rec.status === "leave") leave++;
      else if (rec.status === "absent") absent++;
    }
    return { present, leave, absent, workingDays };
  }, []);

  /* ---- streak ---- */
  const streak = useMemo(() => {
    let s = 0;
    for (let offset = 0; offset < 40; offset++) {
      const d = dateOffset(DEMO_TODAY, -offset);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const rec = genRecord(ME.id, d, offset === 0);
      if (rec.status === "present") s++;
      else break;
    }
    return s;
  }, []);

  /* ---- employee recent-days list (last 6 workdays) ---- */
  const recentDays = useMemo(() => {
    const days = [];
    let offset = 0,
      count = 0;
    while (count < 6) {
      const d = dateOffset(DEMO_TODAY, -offset);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.push(d);
        count++;
      }
      offset++;
    }
    return days;
  }, []);

  /* ---- heatmap data (August 2026) ---- */
  const heatmap = useMemo(() => {
    const year = 2026,
      month = 7;
    const firstDay = new Date(year, month, 1);
    const leadBlanks = (firstDay.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < leadBlanks; i++) cells.push({ empty: true, key: "lead-" + i });
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const isFuture = d > DEMO_TODAY;
      if (isFuture) {
        cells.push({ future: true, day, key: "d" + day });
        continue;
      }
      const rec = genRecord(ME.id, d, d.toDateString() === DEMO_TODAY.toDateString());
      let bg, tip, opacity;
      if (rec.status === "weekend") {
        bg = "var(--att-weekend-soft)";
        tip = "Weekend";
        opacity = 1;
      } else if (rec.status === "leave") {
        bg = "var(--att-leave)";
        tip = "On leave";
        opacity = 1;
      } else if (rec.status === "absent") {
        bg = "var(--att-absent)";
        tip = "No check-in";
        opacity = 1;
      } else {
        const endHour = rec.ongoing ? DEMO_NOW_HOUR : rec.checkOut;
        const worked = endHour - rec.checkIn;
        opacity = Math.min(1, Math.max(0.28, worked / 10));
        bg = "var(--att-present)";
        tip = hoursToDur(worked) + " worked";
      }
      cells.push({ day, key: "d" + day, bg, opacity, tip });
    }
    return cells;
  }, []);

  /* ---- dial (check-in ring) ---- */
  const dialFillRef = useRef(null);
  const dialHrsRef = useRef(null);
  const dialTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const tickHandle = useRef(null);
  const CIRC = 2 * Math.PI * 72;

  const initialTodayRec = useMemo(() => genRecord(ME.id, DEMO_TODAY, true), []);
  const [checkedIn, setCheckedIn] = useState(initialTodayRec.status === "present" && initialTodayRec.ongoing);
  const [dialLabel, setDialLabel] = useState(
    initialTodayRec.status === "present" && initialTodayRec.ongoing ? "Checked in" : "Check in"
  );
  const [dialTimeText, setDialTimeText] = useState(
    initialTodayRec.status === "present" && initialTodayRec.ongoing ? hourToClock(initialTodayRec.checkIn) : "—"
  );
  const [dialPressed, setDialPressed] = useState(false);

  const setDialVisual = useCallback((hoursWorked) => {
    const pct = Math.min(1, hoursWorked / 8);
    const offset = CIRC * (1 - pct);
    if (dialFillRef.current) {
      dialFillRef.current.style.strokeDashoffset = String(offset);
      dialFillRef.current.style.stroke = hoursWorked > 8 ? "var(--att-extra)" : "var(--att-present)";
    }
    if (dialHrsRef.current) {
      dialHrsRef.current.textContent =
        hoursToDur(hoursWorked) + (hoursWorked > 8 ? ` (+${hoursToDur(hoursWorked - 8)} extra)` : "");
    }
  }, [CIRC]);

  // initialize dial fill on mount
  useEffect(() => {
    if (initialTodayRec.status === "present" && initialTodayRec.ongoing) {
      elapsedRef.current = initialTodayRec.workedHours;
    } else {
      elapsedRef.current = 0;
    }
    setDialVisual(elapsedRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ticking interval while checked in (demo-accelerated: 1 real second ≈ 45 simulated seconds)
  useEffect(() => {
    if (checkedIn) {
      tickHandle.current = setInterval(() => {
        elapsedRef.current += 45 / 3600;
        setDialVisual(elapsedRef.current);
      }, 1000);
    }
    return () => {
      if (tickHandle.current) clearInterval(tickHandle.current);
    };
  }, [checkedIn, setDialVisual]);

  const handleDialClick = useCallback(() => {
    setDialPressed(true);
    setTimeout(() => setDialPressed(false), 180);

    if (!checkedIn) {
      elapsedRef.current = 0.02;
      setDialLabel("Checked in");
      setDialTimeText(hourToClock(DEMO_NOW_HOUR));
      setDialVisual(elapsedRef.current);
      setCheckedIn(true);
    } else {
      setDialLabel("Checked out");
      setCheckedIn(false);
    }
  }, [checkedIn, setDialVisual]);

  /* ---- view switch sliding pill ---- */
  const viewBtnRefs = useRef({});
  const viewPillRef = useRef(null);
  useLayoutEffect(() => {
    const el = viewBtnRefs.current[view];
    if (el && viewPillRef.current) {
      viewPillRef.current.style.transform = `translateX(${el.offsetLeft - 3}px)`;
      viewPillRef.current.style.width = el.offsetWidth + "px";
    }
  }, [view]);

  /* ---- day switcher sliding pill ---- */
  const dayBtnRefs = useRef({});
  const dayPillRef = useRef(null);
  useLayoutEffect(() => {
    const el = dayBtnRefs.current[selectedDayOffset];
    if (el && dayPillRef.current) {
      dayPillRef.current.style.transform = `translateX(${el.offsetLeft - 4}px)`;
      dayPillRef.current.style.width = el.offsetWidth + "px";
    }
  }, [selectedDayOffset, view]);

  useEffect(() => {
    function onResize() {
      const vEl = viewBtnRefs.current[view];
      if (vEl && viewPillRef.current) {
        viewPillRef.current.style.transform = `translateX(${vEl.offsetLeft - 3}px)`;
        viewPillRef.current.style.width = vEl.offsetWidth + "px";
      }
      const dEl = dayBtnRefs.current[selectedDayOffset];
      if (dEl && dayPillRef.current) {
        dayPillRef.current.style.transform = `translateX(${dEl.offsetLeft - 4}px)`;
        dayPillRef.current.style.width = dEl.offsetWidth + "px";
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [view, selectedDayOffset]);

  function switchView(next) {
    if (next === view) return;
    setView(next);
    setCascadeKey((k) => k + 1);
  }

  /* ---- admin: presence + selected-day rows ---- */
  const presence = useMemo(() => {
    let inOffice = 0;
    const list = TEAM.map((emp) => {
      const rec = genRecord(emp.id, DEMO_TODAY, true);
      if (rec.status === "present") inOffice++;
      return { emp, rec };
    });
    return { list, inOffice, total: TEAM.length };
  }, []);

  const dayOptions = useMemo(() => {
    const arr = [];
    for (let offset = 6; offset >= 0; offset--) arr.push(offset);
    return arr;
  }, []);

  const adminRows = useMemo(() => {
    const d = dateOffset(DEMO_TODAY, -selectedDayOffset);
    const isToday = selectedDayOffset === 0;
    return TEAM.map((emp) => ({ emp, rec: genRecord(emp.id, d, isToday), isToday }));
  }, [selectedDayOffset]);

  const selectedDayLabel = useMemo(() => {
    const d = dateOffset(DEMO_TODAY, -selectedDayOffset);
    return (selectedDayOffset === 0 ? "Today · " : "") + `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;
  }, [selectedDayOffset]);

  return (
    <div className="att-shell">
      <style>{STYLES}</style>

      <div className="att-topbar">
        <div>
          <h1 className="att-disp">Attendance</h1>
          <p className="att-sub">Timelines mapped to an 8:00–20:00 shared axis</p>
        </div>
        <div className="att-segmented">
          <div className="att-pill-bg" ref={viewPillRef} />
          <button
            ref={(el) => (viewBtnRefs.current.employee = el)}
            className={view === "employee" ? "att-active" : ""}
            onClick={() => switchView("employee")}
          >
            Employee
          </button>
          <button
            ref={(el) => (viewBtnRefs.current.admin = el)}
            className={view === "admin" ? "att-active" : ""}
            onClick={() => switchView("admin")}
          >
            Admin / HR
          </button>
        </div>
      </div>

      {/* ============ EMPLOYEE VIEW ============ */}
      {view === "employee" && (
        <div className="att-view att-active" key={"emp-" + cascadeKey}>
          <div className="att-emp-hero">
            <div className="att-greet">
              <h2 className="att-disp">
                {greeting}, {ME.name.split(" ")[0]}
              </h2>
              <p>
                {DOW[DEMO_TODAY.getDay()]}, {MON[DEMO_TODAY.getMonth()]} {DEMO_TODAY.getDate()} — today’s view
              </p>
            </div>
            <div className="att-streak-badge">
              <IconFlame style={{ width: 18, height: 18, color: "#E0782B" }} />
              <div>
                <div className="att-streak-n">
                  <CountUp target={streak} duration={700} /> days
                </div>
                <div className="att-streak-lbl">Check-in streak</div>
              </div>
            </div>
          </div>

          <div className="att-emp-main">
            <div className="att-card att-dial-card">
              <div className="att-dial-wrap">
                <svg viewBox="0 0 170 170">
                  <circle className="att-dial-track" cx="85" cy="85" r="72" />
                  <circle
                    className="att-dial-fill"
                    ref={dialFillRef}
                    cx="85"
                    cy="85"
                    r="72"
                    strokeDasharray={CIRC}
                    strokeDashoffset={CIRC}
                  />
                </svg>
                <button
                  className={"att-dial-btn" + (dialPressed ? " att-pressed" : "") + (checkedIn ? " att-checked-in" : "")}
                  onClick={handleDialClick}
                >
                  {checkedIn ? (
                    <IconStop className="att-ico" style={{ color: "var(--att-absent)" }} />
                  ) : (
                    <IconPower className="att-ico" style={{ color: "var(--att-present)" }} />
                  )}
                  <span className="att-state">{dialLabel}</span>
                  <span className="att-time att-mono" ref={dialTimeRef}>
                    {dialTimeText}
                  </span>
                </button>
              </div>
              <div className="att-dial-caption">
                Worked <b className="att-mono" ref={dialHrsRef}>0h 00m</b> of 8h target
              </div>
            </div>

            <div className="att-summary-grid">
              <div className="att-stat att-cascade" style={{ animationDelay: "0ms" }}>
                <span className="att-dot" style={{ background: "var(--att-present)" }} />
                <span className="att-num att-disp">
                  <CountUp target={monthCounts.present} />
                </span>
                <span className="att-lbl">Present days</span>
              </div>
              <div className="att-stat att-cascade" style={{ animationDelay: "70ms" }}>
                <span className="att-dot" style={{ background: "var(--att-leave)" }} />
                <span className="att-num att-disp">
                  <CountUp target={monthCounts.leave} />
                </span>
                <span className="att-lbl">On leave</span>
              </div>
              <div className="att-stat att-cascade" style={{ animationDelay: "140ms" }}>
                <span className="att-dot" style={{ background: "var(--att-absent)" }} />
                <span className="att-num att-disp">
                  <CountUp target={monthCounts.absent} />
                </span>
                <span className="att-lbl">Absent</span>
              </div>
              <div className="att-stat att-cascade" style={{ animationDelay: "210ms" }}>
                <span className="att-dot" style={{ background: "var(--att-ink-faint)" }} />
                <span className="att-num att-disp">
                  <CountUp target={monthCounts.workingDays} />
                </span>
                <span className="att-lbl">Working days</span>
              </div>
            </div>
          </div>

          <div className="att-card">
            <div className="att-card-head">
              <h2 className="att-disp">August · month heatmap</h2>
              <span className="att-hint">Color = status · intensity = hours worked</span>
            </div>
            <div className="att-heat-grid">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div className="att-heat-dow" key={i}>
                  {d}
                </div>
              ))}
            </div>
            <div className="att-heat-grid" style={{ marginTop: 5 }}>
              {heatmap.map((cell, i) => {
                if (cell.empty) return <div className="att-heat-cell att-empty" key={cell.key} />;
                if (cell.future)
                  return (
                    <div
                      className="att-heat-cell"
                      key={cell.key}
                      style={{
                        animationDelay: i * 22 + "ms",
                        background: "var(--att-surface-2)",
                        border: "1px solid var(--att-line)",
                      }}
                      title={`${MON[7]} ${cell.day} — upcoming`}
                    />
                  );
                return (
                  <div
                    className="att-heat-cell"
                    key={cell.key}
                    style={{ animationDelay: i * 22 + "ms", background: cell.bg, opacity: cell.opacity }}
                  >
                    <div className="att-heat-tip">
                      {MON[7]} {cell.day} · {cell.tip}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="att-heat-legend">
              <div className="att-item">
                <span className="att-sw" style={{ background: "var(--att-present)" }} />
                Present
              </div>
              <div className="att-item">
                <span className="att-sw" style={{ background: "var(--att-leave-soft)", border: "1.5px dashed var(--att-leave-line)" }} />
                Leave
              </div>
              <div className="att-item">
                <span className="att-sw" style={{ background: "var(--att-absent-soft)", border: "1.5px dashed var(--att-absent-line)" }} />
                Absent
              </div>
              <div className="att-item">
                <span className="att-sw" style={{ background: "var(--att-weekend-soft)" }} />
                Weekend
              </div>
              <div className="att-item">
                <span className="att-sw" style={{ background: "var(--att-surface-2)", border: "1px solid var(--att-line)" }} />
                Upcoming
              </div>
            </div>
          </div>

          <div className="att-card">
            <div className="att-card-head">
              <h2 className="att-disp">Recent days</h2>
              <span className="att-hint">Tap a row for details</span>
            </div>
            <div className="att-axis-row">
              <div />
              <div className="att-axis-ticks att-mono">
                <span>8am</span>
                <span>10</span>
                <span>12pm</span>
                <span>14</span>
                <span>16</span>
                <span>18</span>
                <span>8pm</span>
              </div>
              <div />
            </div>
            <div>
              {recentDays.map((d, i) => {
                const isToday = d.toDateString() === DEMO_TODAY.toDateString();
                const rec = genRecord(ME.id, d, isToday);
                return (
                  <EmployeeTimelineRow
                    key={d.toISOString()}
                    rec={rec}
                    dayLabel={isToday ? "Today" : DOW[d.getDay()]}
                    dateLabel={`${MON[d.getMonth()]} ${d.getDate()}`}
                    index={i}
                    showNow={isToday && rec.status === "present"}
                  />
                );
              })}
            </div>
            <div className="att-legend-row">
              <div className="att-item">
                <span className="att-sw att-present" />
                Worked
              </div>
              <div className="att-item">
                <span className="att-sw att-ongoing" />
                Ongoing
              </div>
              <div className="att-item">
                <span className="att-sw att-extra" />
                Extra hours
              </div>
              <div className="att-item">
                <span className="att-sw att-leave" />
                Leave
              </div>
              <div className="att-item">
                <span className="att-sw att-absent" />
                No check-in
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ ADMIN VIEW ============ */}
      {view === "admin" && (
        <div className="att-view att-active" key={"admin-" + cascadeKey}>
          <div className="att-card att-presence-strip">
            <div className="att-card-head">
              <h2 className="att-disp">Team presence</h2>
              <span className="att-hint">Live</span>
            </div>
            <div className="att-presence-row">
              <div className="att-presence-avatars">
                {presence.list.map(({ emp, rec }, i) => (
                  <div
                    className={"att-avatar " + ringClassFor(rec) + " att-cascade"}
                    style={{ animationDelay: i * 45 + "ms" }}
                    key={emp.id}
                    title={`${emp.name} — ${rec.status}`}
                  >
                    {emp.initials}
                  </div>
                ))}
              </div>
              <div className="att-presence-count">
                <b className="att-disp">{presence.inOffice}</b> of <b className="att-disp">{presence.total}</b> in office
                today
              </div>
            </div>
          </div>

          <div className="att-card">
            <div className="att-card-head">
              <h2 className="att-disp">Select day</h2>
              <span className="att-hint">{selectedDayLabel}</span>
            </div>
            <div className="att-day-switcher">
              <div className="att-day-pill-bg" ref={dayPillRef} />
              {dayOptions.map((offset) => {
                const d = dateOffset(DEMO_TODAY, -offset);
                const isToday = offset === 0;
                return (
                  <button
                    key={offset}
                    ref={(el) => (dayBtnRefs.current[offset] = el)}
                    className={offset === selectedDayOffset ? "att-active" : ""}
                    onClick={() => setSelectedDayOffset(offset)}
                  >
                    <span className="att-dow">{isToday ? "TODAY" : DOW[d.getDay()].toUpperCase()}</span>
                    <span className="att-dom att-disp">
                      {MON[d.getMonth()]} {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="att-card att-admin-timeline">
            <div className="att-card-head">
              <h2 className="att-disp">Team timeline</h2>
              <span className="att-hint">Same axis for every employee — shapes are directly comparable</span>
            </div>
            <div className="att-axis-row">
              <div />
              <div className="att-axis-ticks att-mono">
                <span>8am</span>
                <span>10</span>
                <span>12pm</span>
                <span>14</span>
                <span>16</span>
                <span>18</span>
                <span>8pm</span>
              </div>
              <div />
            </div>
            <div key={selectedDayOffset}>
              {adminRows.map(({ emp, rec, isToday }, i) => (
                <AdminTimelineRow key={emp.id} emp={emp} rec={rec} index={i} showNow={isToday && rec.status === "present"} />
              ))}
            </div>
            <div className="att-legend-row">
              <div className="att-item">
                <span className="att-sw att-present" />
                Worked
              </div>
              <div className="att-item">
                <span className="att-sw att-ongoing" />
                Ongoing
              </div>
              <div className="att-item">
                <span className="att-sw att-extra" />
                Extra hours
              </div>
              <div className="att-item">
                <span className="att-sw att-leave" />
                Leave
              </div>
              <div className="att-item">
                <span className="att-sw att-absent" />
                No check-in
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- styles ---------------- */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.att-shell{
  --att-paper:#F2F4EF;
  --att-surface:#FFFFFF;
  --att-surface-2:#F8F9F6;
  --att-line:#E1E4DC;
  --att-line-strong:#CBCFC5;
  --att-ink:#12161A;
  --att-ink-soft:#5B6360;
  --att-ink-faint:#93998F;

  --att-present:#1E8E5A;
  --att-present-soft:#DCF0E5;
  --att-present-line:#B7E0C9;

  --att-leave:#3C6FB0;
  --att-leave-soft:#DEE8F6;
  --att-leave-line:#B9CDEA;

  --att-absent:#C4791E;
  --att-absent-soft:#F7E7CE;
  --att-absent-line:#EDC993;

  --att-extra:#6C4FD1;
  --att-extra-soft:#EAE3FA;

  --att-weekend:#C9CDC3;
  --att-weekend-soft:#EDEFEA;

  --att-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --att-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --att-radius: 10px;

  background:var(--att-paper);
  color:var(--att-ink);
  font-family:'Inter', sans-serif;
  -webkit-font-smoothing:antialiased;
  padding:28px 22px 60px;
  max-width:1080px;
  margin:0 auto;
}
.att-shell *{ box-sizing:border-box; }
.att-mono{ font-family:'IBM Plex Mono', monospace; }
.att-disp{ font-family:'Space Grotesk', sans-serif; }
.att-shell button{ font-family:inherit; cursor:pointer; border:none; background:none; color:inherit; }
.att-shell :focus-visible{ outline:2px solid var(--att-ink); outline-offset:2px; }

/* ---------- Topbar ---------- */
.att-topbar{ display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.att-topbar h1{ font-size:26px; font-weight:700; letter-spacing:-0.01em; }
.att-sub{ color:var(--att-ink-soft); font-size:13px; margin-top:4px; }

.att-segmented{ position:relative; display:inline-flex; background:var(--att-surface-2); border:1px solid var(--att-line); border-radius:999px; padding:3px; gap:2px; }
.att-pill-bg{ position:absolute; top:3px; bottom:3px; left:0; background:var(--att-ink); border-radius:999px; transition: transform 0.5s var(--att-spring), width 0.5s var(--att-spring); z-index:0; }
.att-segmented button{ position:relative; z-index:1; padding:8px 20px; font-size:13px; font-weight:600; border-radius:999px; color:var(--att-ink-soft); transition: color 0.3s var(--att-ease); white-space:nowrap; }
.att-segmented button.att-active{ color:#fff; }

/* ---------- Card ---------- */
.att-card{ background:var(--att-surface); border:1px solid var(--att-line); border-radius:var(--att-radius); padding:20px; margin-top:16px; }
.att-card-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; gap:10px; flex-wrap:wrap; }
.att-card-head h2{ font-size:15px; font-weight:600; }
.att-card-head .att-hint{ font-size:12px; color:var(--att-ink-faint); }

.att-view.att-active{ animation: att-fadein 0.42s var(--att-ease); }
@keyframes att-fadein{ from{opacity:0; transform:translateY(4px);} to{opacity:1; transform:translateY(0);} }

.att-cascade{ opacity:0; transform:translateY(6px); animation: att-rise 0.5s var(--att-spring) forwards; }
@keyframes att-rise{ to{ opacity:1; transform:translateY(0);} }

/* ---------- Employee hero ---------- */
.att-emp-hero{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:14px; }
.att-greet h2{ font-size:20px; font-weight:600; }
.att-greet p{ font-size:13px; color:var(--att-ink-soft); margin-top:2px; }

.att-streak-badge{ display:flex; align-items:center; gap:8px; background:var(--att-surface-2); border:1px solid var(--att-line); padding:8px 14px 8px 10px; border-radius:999px; opacity:0; transform:scale(0.4); animation: att-streakIn 0.6s var(--att-spring) 0.15s forwards; }
@keyframes att-streakIn{ to{ opacity:1; transform:scale(1); } }
.att-streak-n{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:15px; }
.att-streak-lbl{ font-size:11px; color:var(--att-ink-soft); }

.att-emp-main{ display:grid; grid-template-columns:220px 1fr; gap:16px; margin-top:16px; }
@media (max-width:720px){ .att-emp-main{ grid-template-columns:1fr; } }

.att-dial-card{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; margin-top:0; }
.att-dial-wrap{ position:relative; width:170px; height:170px; }
.att-dial-wrap svg{ width:100%; height:100%; transform:rotate(-90deg); }
.att-dial-track{ fill:none; stroke:var(--att-surface-2); stroke-width:10; }
.att-dial-fill{ fill:none; stroke:var(--att-present); stroke-width:10; stroke-linecap:round; transition: stroke-dashoffset 0.9s var(--att-spring), stroke 0.4s var(--att-ease); }
.att-dial-btn{ position:absolute; inset:14px; border-radius:50%; background:var(--att-surface); border:1px solid var(--att-line); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; transition: transform 0.22s var(--att-spring), background 0.25s var(--att-ease), border-color .25s; }
.att-dial-btn:active{ transform:scale(0.92); }
.att-dial-btn.att-pressed{ transform:scale(0.9); }
.att-dial-btn .att-ico{ width:22px; height:22px; }
.att-dial-btn .att-state{ font-size:11px; font-weight:600; color:var(--att-ink-soft); margin-top:2px; }
.att-dial-btn .att-time{ font-size:15px; font-weight:600; }
.att-dial-caption{ font-size:12px; color:var(--att-ink-soft); text-align:center; }
.att-dial-caption b{ color:var(--att-ink); }

.att-summary-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
@media (max-width:520px){ .att-summary-grid{ grid-template-columns:repeat(2,1fr); } }
.att-stat{ background:var(--att-surface-2); border:1px solid var(--att-line); border-radius:var(--att-radius); padding:14px; display:flex; flex-direction:column; gap:8px; }
.att-stat .att-dot{ width:8px; height:8px; border-radius:50%; }
.att-stat .att-num{ font-size:26px; font-weight:700; letter-spacing:-0.02em; }
.att-stat .att-lbl{ font-size:12px; color:var(--att-ink-soft); }

/* ---------- Heatmap ---------- */
.att-heat-grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:5px; }
.att-heat-dow{ font-size:10px; color:var(--att-ink-faint); text-align:center; padding-bottom:2px; }
.att-heat-cell{ position:relative; aspect-ratio:1/1; border-radius:5px; background:var(--att-surface-2); opacity:0; transform:scale(0.5); animation: att-cellIn 0.4s var(--att-spring) forwards; cursor:default; }
.att-heat-cell.att-empty{ background:transparent; animation:none; opacity:0; }
@keyframes att-cellIn{ to{ opacity:var(--o,1); transform:scale(1);} }
.att-heat-cell:hover .att-heat-tip{ display:block; }
.att-heat-tip{ display:none; position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%); background:var(--att-ink); color:#fff; font-size:10px; padding:5px 8px; border-radius:6px; white-space:nowrap; z-index:5; font-family:'IBM Plex Mono',monospace; }
.att-heat-legend{ display:flex; align-items:center; gap:14px; margin-top:14px; flex-wrap:wrap; }
.att-heat-legend .att-item{ display:flex; align-items:center; gap:6px; font-size:11px; color:var(--att-ink-soft); }
.att-heat-legend .att-sw{ width:10px; height:10px; border-radius:3px; }

/* ---------- Timeline axis + rows (shared signature component) ---------- */
.att-axis-row{ display:grid; grid-template-columns:var(--att-label-col,190px) 1fr var(--att-meta-col,150px); gap:14px; align-items:center; padding:0 2px 8px; }
.att-axis-row .att-axis-ticks{ display:flex; justify-content:space-between; }
.att-axis-row .att-axis-ticks span{ font-size:10px; color:var(--att-ink-faint); }

.att-tl-row{ display:grid; grid-template-columns:var(--att-label-col,190px) 1fr var(--att-meta-col,150px); gap:14px; align-items:center; padding:10px 2px; border-radius:8px; opacity:0; transform:translateY(6px); animation: att-rise 0.45s var(--att-spring) forwards; transition: background 0.2s var(--att-ease); cursor:pointer; }
.att-tl-row:hover{ background:var(--att-surface-2); }
.att-tl-row:hover .att-track .att-bar-seg{ transform:scaleY(1.16); }
.att-tl-row.att-no-expand{ cursor:default; }

.att-tl-label{ display:flex; align-items:center; gap:10px; min-width:0; }
.att-tl-label .att-day-txt{ display:flex; flex-direction:column; gap:1px; min-width:0; }
.att-tl-label .att-day-txt .att-d1{ font-size:13px; font-weight:600; }
.att-tl-label .att-day-txt .att-d2{ font-size:11px; color:var(--att-ink-faint); }
.att-tl-label .att-day-txt .att-trunc{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.att-avatar{ width:30px; height:30px; border-radius:50%; flex:none; background:var(--att-surface-2); border:2px solid transparent; display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700; color:var(--att-ink-soft); }
.att-avatar.att-ring-present{ border-color:var(--att-present); }
.att-avatar.att-ring-leave{ border-color:var(--att-leave); }
.att-avatar.att-ring-absent{ border-color:var(--att-absent); }
.att-avatar.att-ring-ongoing{ border-color:var(--att-present); box-shadow:0 0 0 2px var(--att-surface); animation:att-breathe 2.2s ease-in-out infinite; }

.att-track{ position:relative; height:26px; border-radius:6px;
  background:
    linear-gradient(to right, transparent calc(100%/6 - 1px), var(--att-line) calc(100%/6 - 1px), var(--att-line) calc(100%/6), transparent calc(100%/6)),
    repeating-linear-gradient(to right, transparent, transparent calc(100%/6 - 1px), var(--att-line) calc(100%/6 - 1px), var(--att-line) calc(100%/6));
  background-color:var(--att-surface-2); overflow:visible; }
.att-bar-seg{ position:absolute; top:3px; bottom:3px; border-radius:5px; transition: left 0.6s var(--att-spring), width 0.6s var(--att-spring), transform 0.22s var(--att-ease); transform-origin:center; }
.att-bar-seg.att-present{ background:var(--att-present); }
.att-bar-seg.att-extra-tail{ background:var(--att-extra); border-radius: 0 5px 5px 0; }
.att-bar-seg.att-present.att-ongoing{ background-image: repeating-linear-gradient(135deg, var(--att-present), var(--att-present) 5px, #16794c 5px, #16794c 10px); animation: att-breathe 1.8s ease-in-out infinite; }
@keyframes att-breathe{ 0%,100%{ opacity:1;} 50%{ opacity:0.62;} }

.att-track.att-leave-track, .att-track.att-absent-track{ background-image:none; background-color:transparent; border-radius:6px; }
.att-dash-fill{ position:absolute; inset:2px; border-radius:5px; border:1.5px dashed var(--att-leave-line); background:var(--att-leave-soft); display:flex; align-items:center; justify-content:center; gap:6px; }
.att-dash-fill.att-absent{ border-color:var(--att-absent-line); background:var(--att-absent-soft); }
.att-dash-fill svg{ width:13px; height:13px; color:var(--att-leave); flex:none; }
.att-dash-fill.att-absent svg{ color:var(--att-absent); }
.att-dash-fill span{ font-size:11px; font-weight:600; color:var(--att-leave); }
.att-dash-fill.att-absent span{ color:var(--att-absent); }

.att-track.att-weekend-track{ background-image:none; background-color:var(--att-weekend-soft); }
.att-weekend-fill{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
.att-weekend-fill span{ font-size:10px; color:var(--att-ink-faint); letter-spacing:.04em; text-transform:uppercase; }

.att-now-line{ position:absolute; top:-3px; bottom:-3px; width:0; border-left:1.5px dashed var(--att-ink-faint); }
.att-now-line::after{ content:'now'; position:absolute; top:-15px; left:-11px; font-size:9px; color:var(--att-ink-faint); font-family:'IBM Plex Mono',monospace; }

.att-tl-meta{ text-align:right; }
.att-tl-meta .att-hrs{ font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:600; }
.att-tl-meta .att-extra{ font-size:10.5px; color:var(--att-extra); font-weight:600; margin-top:2px; }
.att-tl-meta .att-chev{ display:inline-flex; margin-left:6px; transition: transform 0.35s var(--att-spring); vertical-align:middle; width:14px; height:14px; }
.att-tl-meta .att-chev.att-open{ transform:rotate(180deg); }

.att-tl-detail{ grid-column: 1 / -1; overflow:hidden; max-height:0; transition: max-height 0.4s var(--att-ease); }
.att-tl-detail.att-open{ max-height:70px; }
.att-tl-detail-inner{ display:flex; gap:22px; flex-wrap:wrap; padding:12px 2px 4px 44px; font-size:12px; color:var(--att-ink-soft); }
.att-tl-detail-inner b{ color:var(--att-ink); font-family:'IBM Plex Mono',monospace; font-weight:600; }

/* ---------- Admin view ---------- */
.att-presence-row{ display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.att-presence-avatars{ display:flex; }
.att-presence-avatars .att-avatar{ margin-left:-8px; border-width:2.5px; background:var(--att-surface); }
.att-presence-avatars .att-avatar:first-child{ margin-left:0; }
.att-presence-count{ font-size:13px; color:var(--att-ink-soft); }
.att-presence-count b{ color:var(--att-ink); font-size:15px; }

.att-day-switcher{ display:flex; gap:4px; overflow-x:auto; position:relative; padding:4px; background:var(--att-surface-2); border:1px solid var(--att-line); border-radius:999px; scrollbar-width:none; }
.att-day-switcher::-webkit-scrollbar{ display:none; }
.att-day-pill-bg{ position:absolute; top:4px; bottom:4px; left:4px; width:70px; background:var(--att-ink); border-radius:999px; transition: transform 0.5s var(--att-spring), width 0.5s var(--att-spring); z-index:0; }
.att-day-switcher button{ position:relative; z-index:1; flex:none; width:70px; padding:8px 6px; border-radius:999px; text-align:center; display:flex; flex-direction:column; gap:1px; }
.att-day-switcher button .att-dow{ font-size:10px; color:var(--att-ink-faint); font-weight:600; }
.att-day-switcher button .att-dom{ font-size:13px; font-weight:700; }
.att-day-switcher button.att-active .att-dow{ color:#cfd3ea; }
.att-day-switcher button.att-active .att-dom{ color:#fff; }

.att-admin-timeline .att-axis-row{ --att-label-col:170px; --att-meta-col:140px; }
.att-admin-timeline .att-tl-row{ --att-label-col:170px; --att-meta-col:140px; }

/* legend chips */
.att-legend-row{ display:flex; gap:16px; flex-wrap:wrap; margin-top:16px; }
.att-legend-row .att-item{ display:flex; align-items:center; gap:6px; font-size:11px; color:var(--att-ink-soft); }
.att-legend-row .att-sw{ width:14px; height:8px; border-radius:3px; }
.att-legend-row .att-sw.att-present{ background:var(--att-present); }
.att-legend-row .att-sw.att-extra{ background:var(--att-extra); }
.att-legend-row .att-sw.att-leave{ background:var(--att-leave-soft); border:1.5px dashed var(--att-leave-line); }
.att-legend-row .att-sw.att-absent{ background:var(--att-absent-soft); border:1.5px dashed var(--att-absent-line); }
.att-legend-row .att-sw.att-ongoing{ background-image: repeating-linear-gradient(135deg, var(--att-present), var(--att-present) 3px, #16794c 3px, #16794c 6px); }

@media (max-width:680px){
  .att-axis-row, .att-tl-row{ --att-label-col:110px; --att-meta-col:84px; gap:8px; }
  .att-tl-label .att-day-txt .att-d2{ display:none; }
  .att-tl-detail-inner{ padding-left:24px; gap:12px; }
  .att-presence-count{ width:100%; }
}
`;
