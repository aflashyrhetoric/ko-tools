import { useState } from 'react'
import { fmt } from './calc'

const BAR_HEIGHT = 460

function niceStep(max) {
  const raw = max / 5
  const pow = 10 ** Math.floor(Math.log10(raw || 1))
  const steps = [1, 2, 2.5, 5, 10]
  return pow * steps.find((s) => s * pow >= raw)
}

export default function CalorieBar({ data }) {
  const [hover, setHover] = useState(null)
  const { segments, tdee, deficit, target } = data

  const step = niceStep(Math.max(tdee, 1000))
  const scaleMax = Math.ceil((Math.max(tdee, 1000) * 1.05) / step) * step
  const px = (kcal) => (kcal / scaleMax) * BAR_HEIGHT
  const ticks = []
  for (let t = 0; t <= scaleMax; t += step) ticks.push(t)

  // Stack segments from the bottom
  let acc = 0
  const stacked = segments.map((s) => {
    const start = acc
    acc += s.value
    return { ...s, start, end: acc }
  })

  const deficitShown = Math.min(deficit, tdee)
  const targetClamped = Math.max(target, 0)

  const share = (v) => (tdee > 0 ? Math.round((v / tdee) * 100) : 0)

  const ariaLabel =
    stacked.map((s) => `${s.label} ${fmt(s.value)} kcal`).join(', ') +
    `. Total burn ${fmt(tdee)} kcal. Deficit ${fmt(deficit)} kcal. Target intake ${fmt(target)} kcal.`

  return (
    <div className="chart">
      <div className="plot" style={{ height: BAR_HEIGHT }}>
        {/* y-axis + gridlines */}
        {ticks.map((t) => (
          <div key={t} className="tick" style={{ bottom: px(t) }}>
            <span className="tick-label">{fmt(t)}</span>
            <span className="grid" />
          </div>
        ))}

        <div className="bar" role="img" aria-label={ariaLabel}>
          {stacked.map(
            (s) =>
              s.value > 0 && (
                <div
                  key={s.key}
                  className={`seg seg-${s.key} ${hover && hover !== s.key ? 'dim' : ''}`}
                  style={{ bottom: px(s.start), height: px(s.value) }}
                  onMouseEnter={() => setHover(s.key)}
                  onMouseLeave={() => setHover(null)}
                >
                  {px(s.value) >= 22 && <span className="seg-label">{fmt(s.value)} - {s.label}</span>}
                  {hover === s.key && (
                    <div className="tooltip">
                      <strong>{s.label}</strong>
                      <span>
                        {fmt(s.value)} kcal · {share(s.value)}% of burn
                      </span>
                    </div>
                  )}
                </div>
              ),
          )}

          {deficitShown > 0 && (
            <div
              className={`deficit ${hover && hover !== 'deficit' ? 'dim' : ''}`}
              style={{ bottom: px(tdee - deficitShown), height: px(deficitShown) }}
              onMouseEnter={() => setHover('deficit')}
              onMouseLeave={() => setHover(null)}
            >
              {hover === 'deficit' && (
                <div className="tooltip">
                  <strong>Daily deficit</strong>
                  <span>
                    {fmt(deficit)} kcal you don't eat back
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Markers */}
        {tdee > 0 && (
          <div className="marker marker-total" style={{ bottom: px(tdee) }}>
            <span className="marker-line" />
            <span className="marker-text">
              Total burn <b>{fmt(tdee)}</b>
            </span>
          </div>
        )}
        {deficit > 0 && tdee > 0 && (
          <div className="marker marker-target" style={{ bottom: px(targetClamped) }}>
            <span className="marker-line" />
            <span className="marker-text">
              Eat <b>{fmt(target)}</b>
            </span>
          </div>
        )}
      </div>

      <ul className="legend">
        {stacked.map((s) => (
          <li key={s.key}>
            <span className={`swatch seg-${s.key}`} />
            {s.label}
          </li>
        ))}
        <li>
          <span className="swatch deficit" />
          Deficit
        </li>
      </ul>
    </div>
  )
}
