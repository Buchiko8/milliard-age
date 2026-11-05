import { useEffect, useMemo, useState } from "react";



function getInitialDateTime() {
  const now = new Date();
  now.setSeconds(0, 0);
  const timezoneOffset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - timezoneOffset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(date);
}

function formatDuration(totalSeconds) {
  const absSeconds = Math.abs(totalSeconds);
  const days = Math.floor(absSeconds / 86400);
  const hours = Math.floor((absSeconds % 86400) / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  return `${formatNumber(days)} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
}

export default function App() {
  const [startDate, setStartDate] = useState("");
  const [useNowAsEndDate, setUseNowAsEndDate] = useState(true);
  const [endDate, setEndDate] = useState(getInitialDateTime);
  const [now, setNow] = useState(Date.now());
  const [donatePulse, setDonatePulse] = useState(0);
  const [hasChosenDate, setHasChosenDate] = useState(false);
  useEffect(() => {
    if (!parseDate(startDate)) {
      setHasChosenDate(false);
      return undefined;
    }
    // Wait until the native date picker has settled before showing the result.
    const timer = window.setTimeout(() => {
      setHasChosenDate(true);
      setDonatePulse((count) => count + 1);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [startDate]);

  useEffect(() => {
    if (!useNowAsEndDate || !hasChosenDate) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [useNowAsEndDate, hasChosenDate]);

  const selectedStartDate = useMemo(() => parseDate(startDate), [startDate]);
  const selectedEndDate = useMemo(() => {
    if (useNowAsEndDate) {
      return new Date(now);
    }

    return parseDate(endDate);
  }, [endDate, now, useNowAsEndDate]);

  const hasValidDates = Boolean(selectedStartDate && selectedEndDate);
  const secondsBetween = hasValidDates
    ? Math.floor(
        (selectedEndDate.getTime() - selectedStartDate.getTime()) / 1000,
      )
    : 0;

  return (
    <main className="page">
      <section className="card">
        <div className="page-title-row">
          <h1>Seconds Since...</h1>
          <a key={donatePulse} className={`donate-mini${donatePulse ? " donate-mini--pulse" : ""}`} href="https://ko-fi.com/buchiko" target="_blank" rel="noopener noreferrer" aria-label="Donate via Ko-fi" title="Support via Ko-fi">
            <svg viewBox="0 0 32 32" width="29" height="29" aria-hidden="true" fill="none"><path d="M5 9h19v10a8 8 0 0 1-8 8h-3a8 8 0 0 1-8-8V9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M24 12h2a4 4 0 0 1 0 8h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14.5 22 10 17.7c-2.4-2.7 1.1-5.6 3.4-3.1l1.1 1.1 1.1-1.1c2.3-2.5 5.8.4 3.4 3.1L14.5 22Z" fill="currentColor"/></svg>
            <span>Donate</span>
          </a>
        </div>

        <label className="field guided-date">
          <span>Choose your date and time</span>
          <input aria-label="Choose your date and time" type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={useNowAsEndDate}
            onChange={(event) => setUseNowAsEndDate(event.target.checked)}
          />
          <span>Use now as end date</span>
        </label>

        {!useNowAsEndDate ? (
          <label className="field">
            <span>End date and time</span>
            <input aria-label="End date and time" type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
        ) : null}

        {hasChosenDate && hasValidDates ? (
          <>
            <div className="result result-reveal">
              <div className="result-label">Seconds between the dates</div>
              <div className="result-value">{formatNumber(secondsBetween)}</div>
            </div>

            <div className="info-grid">
              <div className="info-box">
                <div className="info-label">Start date</div>
                <div className="info-text">{formatDateTime(selectedStartDate)}</div>
              </div>

              <div className="info-box">
                <div className="info-label">End date</div>
                <div className="info-text">{formatDateTime(selectedEndDate)}</div>
              </div>
            </div>

            <div className="info-box">
              <div className="info-label">Converted duration</div>
              <div className="info-text">
                {secondsBetween >= 0
                  ? formatDuration(secondsBetween)
                  : `${formatDuration(secondsBetween)} backwards`}
              </div>
            </div>
          </>
        ) : startDate && !hasValidDates ? (
          <div className="error-box">Enter valid dates and times.</div>
        ) : (
          <p className="result-prompt">Choose a date above to see your result.</p>
        )}

      </section>
    </main>
  );
}
