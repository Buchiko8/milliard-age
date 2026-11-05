import { useMemo, useState } from "react";

const MUSK_DKK = 5_319_916_504_000;
const DONATION_LINK = "https://ko-fi.com/buchiko";
const money = (amount) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);

export default function WealthChallenge() {
  const [enabled, setEnabled] = useState(false);
  const [ageInput, setAgeInput] = useState("");
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState(null);
  const currentYear = new Date().getFullYear();
  const age = Number(ageInput);
  const validAge = Number.isInteger(age) && age >= 1 && age <= 120;
  const calculation = useMemo(() => {
    if (!validAge) return null;
    const yourDays = (age + 1) * 365;
    const yourDaily = Math.floor((MUSK_DKK / yourDays) / 1_000_000) * 1_000_000;
    const yearsSinceJesus = currentYear + 1;
    const jesusDays = yearsSinceJesus * 365;
    const jesusDaily = Math.floor((MUSK_DKK / jesusDays) / 1_000_000) * 1_000_000;
    return {
      yourDays, yourDaily, yourTotal: yourDays * yourDaily,
      jesusDays, jesusDaily, jesusTotal: jesusDays * jesusDaily,
    };
  }, [age, currentYear, validAge]);

  const total = round === 1 ? calculation?.yourTotal : calculation?.jesusTotal;
  const winner = total >= MUSK_DKK ? "saver" : "musk";
  const isCorrect = answer === winner;
  const reset = () => {
    setRound(0);
    setAnswer(null);
  };

  return (
    <section className="wealth-challenge" aria-label="Fun wealth challenge">
      <label className="challenge-toggle">
        <input type="checkbox" checked={enabled} onChange={(event) => {
          setEnabled(event.target.checked);
          reset();
        }} />
        <span>Want to try a fun challenge?</span>
      </label>

      {enabled && (
        <div className="challenge-content">
          {round === 0 ? (
            <>
              <p>Could you save more than Elon Musk? Take a two-question challenge.</p>
              <label className="challenge-age">
                <span>Your age (years)</span>
                <input type="number" min="1" max="120" step="1" inputMode="numeric"
                  placeholder="e.g. 19" value={ageInput}
                  onChange={(event) => setAgeInput(event.target.value)} />
              </label>
              {ageInput !== "" && !validAge && <p className="challenge-error">Enter an age from 1 to 120.</p>}
              <button className="challenge-primary" type="button" disabled={!validAge}
                onClick={() => { setAnswer(null); setRound(1); }}>Start challenge</button>
              <p className="challenge-note">For fun only. Donations are always optional.</p>
            </>
          ) : (
            <>
              <span className="challenge-step">Question {round} of 2</span>
              {round === 1 ? (
                <>
                  <p>Imagine saving <strong>{money(calculation.yourDaily)} DKK every single day</strong> since the day you were born.</p>
                  <p className="challenge-math">Your age ({age}) + 1 = {age + 1} years × 365 = {money(calculation.yourDays)} days.</p>
                  <h2>Who would be richer today?</h2>
                </>
              ) : (
                <>
                  <p><strong>Double or nothing!</strong> Imagine Jesus saved <strong>{money(calculation.jesusDaily)} DKK every day</strong> from a hypothetical year 0 until today.</p>
                  <p className="challenge-math">({currentYear} + 1) × 365 = {money(calculation.jesusDays)} days.</p>
                  <h2>Who would be richer?</h2>
                </>
              )}
              <div className="challenge-options">
                <button type="button" disabled={answer !== null} onClick={() => setAnswer("saver")}>
                  {round === 1 ? "You" : "Jesus"}
                </button>
                <button type="button" disabled={answer !== null} onClick={() => setAnswer("musk")}>
                  Elon Musk
                </button>
              </div>
              {answer !== null && (
                <div className="challenge-reveal" role="status">
                  <strong>{isCorrect ? "Correct!" : "Not quite!"} {winner === "musk" ? "Elon Musk" : (round === 1 ? "You" : "Jesus")} would be richer.</strong>
                  <p>{round === 1 ? "Your" : "Jesus’"} savings: {money(total)} DKK. Elon Musk's reference wealth: {money(MUSK_DKK)} DKK.</p>
                  {!isCorrect && (
                    <p>Lost the challenge? <a href={DONATION_LINK} target="_blank" rel="noopener noreferrer">Make an optional donation ↗</a></p>
                  )}
                  {round === 1 ? (
                    <button className="challenge-primary" type="button" onClick={() => { setAnswer(null); setRound(2); }}>Double or nothing →</button>
                  ) : (
                    <div className="challenge-finish">
                      <a href={DONATION_LINK} target="_blank" rel="noopener noreferrer">Support this free tool ↗</a>
                      <button type="button" onClick={reset}>Play again</button>
                    </div>
                  )}
                </div>
              )}
              <p className="challenge-note">Illustrative calculation: 365 days per year, amounts rounded down to whole millions. Musk's wealth is a fixed example, not a live valuation.</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
