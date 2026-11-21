import { useMemo, useState } from 'react'
import CalorieBar from './CalorieBar'
import { ACTIVITY_LEVELS, LOSS_RATES, computeDay, fmt } from './calc'
import './calories.css'

const BMR_PRESETS = [
  { name: 'Kevin', bmr: 1600 },
  { name: 'Heda', bmr: 1300 },
]

export default function CaloriesPage() {
  const [bmr, setBmr] = useState('1800')
  const [activityId, setActivityId] = useState('sedentary')
  const [strength, setStrength] = useState('200')
  const [cardio, setCardio] = useState('250')
  const [lossPreset, setLossPreset] = useState('1')
  const [customLoss, setCustomLoss] = useState('')

  const lossPerWeek = lossPreset === 'custom' ? customLoss : lossPreset

  const data = useMemo(
    () => computeDay({ bmr, activityId, strength, cardio, lossPerWeek }),
    [bmr, activityId, strength, cardio, lossPerWeek],
  )

  return (
    <main className="app">
      <header>
        <h1>Daily calorie visualizer</h1>
        <p className="sub">What you burn in a day, and what to eat to hit your weekly loss target.</p>
      </header>

      <div className="layout">
        <section className="controls">
          <fieldset>
            <legend>1. Basal metabolic rate</legend>
            <label className="field">
              <span>BMR (kcal/day)</span>
              <input
                type="number"
                min="0"
                step="10"
                value={bmr}
                onChange={(e) => setBmr(e.target.value)}
              />
            </label>
            <div className="presets">
              {BMR_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className={`preset ${bmr === String(p.bmr) ? 'on' : ''}`}
                  onClick={() => setBmr(String(p.bmr))}
                >
                  {p.name}: {p.bmr}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>2. Activity level</legend>
            {ACTIVITY_LEVELS.map((l) => (
              <label key={l.id} className="radio">
                <input
                  type="radio"
                  name="activity"
                  value={l.id}
                  checked={activityId === l.id}
                  onChange={() => setActivityId(l.id)}
                />
                <span>
                  {l.label} <em>×{l.multiplier}</em>
                  <small>{l.hint}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>3. Exercise today</legend>
            <label className="field">
              <span>Strength training (kcal)</span>
              <input
                type="number"
                min="0"
                step="10"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Cardio (kcal)</span>
              <input
                type="number"
                min="0"
                step="10"
                value={cardio}
                onChange={(e) => setCardio(e.target.value)}
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>4. Weight-loss target</legend>
            <div className="chips">
              {LOSS_RATES.map((r) => (
                <label key={r} className={`chip ${lossPreset === String(r) ? 'on' : ''}`}>
                  <input
                    type="radio"
                    name="loss"
                    value={r}
                    checked={lossPreset === String(r)}
                    onChange={() => setLossPreset(String(r))}
                  />
                  {r === 0 ? 'Maintain' : `${r} lb/wk`}
                </label>
              ))}
              <label className={`chip ${lossPreset === 'custom' ? 'on' : ''}`}>
                <input
                  type="radio"
                  name="loss"
                  value="custom"
                  checked={lossPreset === 'custom'}
                  onChange={() => setLossPreset('custom')}
                />
                Custom
              </label>
            </div>
            {lossPreset === 'custom' && (
              <label className="field">
                <span>Pounds per week</span>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={customLoss}
                  autoFocus
                  onChange={(e) => setCustomLoss(e.target.value)}
                />
              </label>
            )}
          </fieldset>
        </section>

        <section className="results">
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Total burn</span>
              <span className="stat-value">{fmt(data.tdee)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Daily deficit</span>
              <span className="stat-value">−{fmt(data.deficit)}</span>
            </div>
            <div className="stat hero">
              <span className="stat-label">Target intake</span>
              <span className="stat-value">{fmt(Math.max(data.target, 0))}</span>
              <span className="stat-unit">kcal today</span>
            </div>
          </div>

          {data.deficitExceedsTotal ? (
            <p className="warn" role="alert">
              ⚠ The deficit is larger than everything you burn today, so this target isn't reachable.
            </p>
          ) : data.belowBmr ? (
            <p className="warn" role="alert">
              ⚠ Target intake is below your BMR. Consider a slower rate or more activity.
            </p>
          ) : null}

          <CalorieBar data={data} />

          <table className="breakdown">
            <tbody>
              {data.segments.map((s) => (
                <tr key={s.key}>
                  <td>
                    <span className={`swatch seg-${s.key}`} /> {s.label}
                  </td>
                  <td>+{fmt(s.value)}</td>
                </tr>
              ))}
              <tr className="sum">
                <td>Total burn</td>
                <td>{fmt(data.tdee)}</td>
              </tr>
              <tr>
                <td>
                  <span className="swatch deficit" /> Deficit ({lossPerWeek || 0} lb/wk × 3,500 ÷ 7)
                </td>
                <td>−{fmt(data.deficit)}</td>
              </tr>
              <tr className="sum">
                <td>Target intake</td>
                <td>{fmt(data.target)}</td>
              </tr>
            </tbody>
          </table>
          <p className="note">
            Tip: if your activity level already accounts for your workouts, leave the exercise boxes at 0
            to avoid counting them twice.
          </p>
        </section>
      </div>
    </main>
  )
}
