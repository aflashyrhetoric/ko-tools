import { useMemo, useState } from 'react'
import ProjectionChart from './ProjectionChart'
import { MAX_DELAY, MAX_MONTHS, MIN_MONTHS, addMonths, money, monthYear, project } from './projection'
import './projection.css'

function TakeHomeSummary({ income }) {
  return (
    <p className="pj-takehome">
      Take-home <b>{money(income.perPaycheck)}</b> per bi-weekly paycheck ·{' '}
      <b>{money(income.perMonth)}</b>/mo
      <small>
        {Math.round(income.effectiveRate * 1000) / 10}% total tax · federal {money(income.federal)}, NY{' '}
        {money(income.state)}, FICA {money(income.socialSecurity + income.medicare)}, SDI/PFL{' '}
        {money(income.sdi + income.pfl)} per year
      </small>
    </p>
  )
}

export default function ProjectionPage() {
  const [startingMoney, setStartingMoney] = useState('380000')
  const [burnRate, setBurnRate] = useState('1000')
  const [continuedSalary, setContinuedSalary] = useState('0')
  const [months, setMonths] = useState(36)
  const [salary, setSalary] = useState('140000')
  const [delay, setDelay] = useState(0)

  const data = useMemo(
    () => project({ startingMoney, burnRate, continuedSalary, months, salary, delay }),
    [startingMoney, burnRate, continuedSalary, months, salary, delay],
  )

  const years = months / 12
  const runsOutInRange = data.runOutMonth != null && data.runOutMonth <= months

  return (
    <main className="app">
      <header>
        <h1>Money projection</h1>
        <p className="sub">How long your money lasts at a steady monthly burn rate.</p>
      </header>

      <div className="layout">
        <section className="controls">
          <fieldset>
            <legend>1. Starting money</legend>
            <label className="field">
              <span>Amount ($)</span>
              <div className="pj-money-input">
                <span aria-hidden="true">$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={startingMoney}
                  onChange={(e) => setStartingMoney(e.target.value)}
                />
              </div>
            </label>
          </fieldset>

          <fieldset>
            <legend>2. Burn rate</legend>
            <label className="field">
              <span>Spent per month ($)</span>
              <div className="pj-money-input">
                <span aria-hidden="true">$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={burnRate}
                  onChange={(e) => setBurnRate(e.target.value)}
                />
              </div>
            </label>
          </fieldset>

          <fieldset>
            <legend>3. Continued income</legend>
            <label className="field">
              <span>Salary ($ per year, before tax)</span>
              <div className="pj-money-input">
                <span aria-hidden="true">$</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={continuedSalary}
                  onChange={(e) => setContinuedSalary(e.target.value)}
                />
              </div>
            </label>
            {data.continued.salary > 0 && <TakeHomeSummary income={data.continued} />}
          </fieldset>

          <fieldset>
            <legend>4. Time range</legend>
            <label className="field">
              <span>
                <b className="pj-range-value">{months} months</b>
                {months >= 12 && ` · ${Number.isInteger(years) ? years : years.toFixed(1)} yrs`}
              </span>
              <input
                type="range"
                className="pj-slider"
                min={MIN_MONTHS}
                max={MAX_MONTHS}
                step={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              />
              <span className="pj-range-ends">
                <span>{MIN_MONTHS}</span>
                <span>{MAX_MONTHS}</span>
              </span>
            </label>
          </fieldset>

          <fieldset>
            <legend>Kevin's Income</legend>
            <label className="field">
              <span>Salary ($ per year, before tax)</span>
              <div className="pj-money-input">
                <span aria-hidden="true">$</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
            </label>
            <TakeHomeSummary income={data.income} />
            <label className="field">
              <span>
                Delay <b className="pj-range-value">{delay} {delay === 1 ? 'month' : 'months'}</b>
                {' · '}starts {monthYear(addMonths(new Date(), delay))}
              </span>
              <input
                type="range"
                className="pj-slider income"
                min={0}
                max={MAX_DELAY}
                step={1}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
              />
              <span className="pj-range-ends">
                <span>0</span>
                <span>{MAX_DELAY}</span>
              </span>
            </label>
          </fieldset>
        </section>

        <section className="results">
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Starting money</span>
              <span className="stat-value">{money(data.start)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Left after {months} months</span>
              <span className="stat-value">{money(data.end)}</span>
            </div>
            <div className="stat hero">
              <span className="stat-label">Runs out by</span>
              <span className="stat-value">
                {data.runOutDate ? monthYear(data.runOutDate) : 'Never'}
              </span>
              <span className="stat-unit">
                {data.runOutMonth != null
                  ? `after ${data.runOutMonth} months`
                  : data.burn === 0
                    ? 'no monthly burn'
                    : data.netBurn <= 0
                      ? 'continued income covers the burn'
                    : 'no starting money'}
              </span>
            </div>
          </div>

          {runsOutInRange && (
            <p className="warn" role="alert">
              ⚠ Money runs out within this range. The red area shows the shortfall.
            </p>
          )}

          <ProjectionChart data={data} />
          <p className="note">Hover the chart (or focus it and use the arrow keys) to see the balance on any month.</p>
        </section>
      </div>
    </main>
  )
}
