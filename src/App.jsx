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
  const [startDate, setStartDate] = useState(getInitialDateTime);
  const [useNowAsEndDate, setUseNowAsEndDate] = useState(true);
  const [endDate, setEndDate] = useState(getInitialDateTime);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!useNowAsEndDate) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [useNowAsEndDate]);

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
        <h1>Seconds Between Dates</h1>
        <p className="lead">
          Choose a start date and an end time. You can use the current time or
          pick a custom end date.
        </p>

        <label className="field">
          <span>Start date and time</span>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
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
            <input
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        ) : null}

        {hasValidDates ? (
          <>
            <div className="result">
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
        ) : (
          <div className="error-box">Enter valid dates and times.</div>
        )}
      </section>
    </main>
  );
}
