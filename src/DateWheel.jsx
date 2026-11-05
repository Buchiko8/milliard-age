import { useEffect, useRef, useState } from "react";
import WealthChallenge from "./WealthChallenge.jsx";

const MONTHS = Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2000, i, 1))));
const YEARS = Array.from({ length: 301 }, (_, i) => 1900 + i);
const ITEM_HEIGHT = 36;
const pad = (n) => String(n).padStart(2, "0");
const daysIn = (year, month) => new Date(year, month, 0).getDate();

function WheelColumn({ label, choices, selected, onSelect }) {
  const scroller = useRef(null);
  const timer = useRef(null);
  const ignoreScrollUntil = useRef(0);
  useEffect(() => {
    clearTimeout(timer.current);
    ignoreScrollUntil.current = Date.now() + 220;
    const index = choices.findIndex((item) => item.value === selected);
    if (scroller.current && index !== -1) scroller.current.scrollTop = index * ITEM_HEIGHT;
  }, [selected]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const settle = () => {
    if (Date.now() < ignoreScrollUntil.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = scroller.current;
      if (!el) return;
      const index = Math.max(0, Math.min(choices.length - 1, Math.round(el.scrollTop / ITEM_HEIGHT)));
      if (choices[index].value !== selected) onSelect(choices[index].value);
    }, 170);
  };
  const pick = (value) => {
    clearTimeout(timer.current);
    ignoreScrollUntil.current = Date.now() + 220;
    onSelect(value);
  };
  return (
    <div className="wheel-column">
      <span className="wheel-label">{label}</span>
      <div className="wheel-scroller" ref={scroller} onScroll={settle} onWheel={() => { ignoreScrollUntil.current = 0; }} onTouchStart={() => { ignoreScrollUntil.current = 0; }} role="listbox" aria-label={label} tabIndex={0} onKeyDown={(event) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        const index = choices.findIndex((c) => c.value === selected);
        pick(choices[Math.max(0, Math.min(choices.length - 1, index + (event.key === "ArrowUp" ? -1 : 1)))].value);
      }}>
        {choices.map((choice) => (
          <button type="button" role="option" aria-selected={choice.value === selected} className={choice.value === selected ? "wheel-option active" : "wheel-option"} key={choice.value} onClick={() => pick(choice.value)}>
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DateWheel({ label, value, onChange, onComplete, showChallenge = false }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const [date, time = "00:00"] = (value || "").split("T");
  const [yearText = "2026", monthText = "01", dayText = "01"] = date.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const maxDay = daysIn(year, month);
  const dateValue = new Date(year, month - 1, day);
  const formatted = Number.isFinite(dateValue.getTime())
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(dateValue)
    : "Select date";
  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (container.current && !container.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);
  const changeDate = (part, num) => {
    const y = part === "year" ? num : year;
    const m = part === "month" ? num : month;
    const d = Math.min(part === "day" ? num : day, daysIn(y, m));
    onChange(`${y}-${pad(m)}-${pad(d)}T${time}`);
  };
  const days = Array.from({ length: maxDay }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
  const months = MONTHS.map((name, i) => ({ value: i + 1, label: name }));
  const years = YEARS.map((y) => ({ value: y, label: String(y) }));
  return (
    <div className="date-wheel-field" ref={container}>
      <span className="date-wheel-label">{label}</span>
      <button className="date-wheel-trigger" type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>{formatted} <em>·</em> {time}</span><span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="date-wheel-popover">
          <p className="wheel-help">Scroll each column to choose a date</p>
          <div className="date-wheel-columns">
            <WheelColumn label="Day" choices={days} selected={day} onSelect={(n) => changeDate("day", n)} />
            <WheelColumn label="Month" choices={months} selected={month} onSelect={(n) => changeDate("month", n)} />
            <WheelColumn label="Year" choices={years} selected={year} onSelect={(n) => changeDate("year", n)} />
          </div>
          <label className="wheel-time">Time <input type="time" aria-label={`${label} time`} value={time} onChange={(event) => onChange(`${date}T${event.target.value}`)} /></label>
          {showChallenge && <WealthChallenge />}
          <button className="wheel-done" type="button" onClick={() => { setOpen(false); onComplete?.(); }}>Done</button>
        </div>
      )}
    </div>
  );
}
