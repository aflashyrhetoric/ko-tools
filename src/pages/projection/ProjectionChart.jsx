import { useEffect, useId, useRef, useState } from 'react'
import { longDate, money, moneyCompact, niceTicks } from './projection'

const HEIGHT = 380
const M = { top: 16, right: 20, bottom: 40, left: 64 }

function useWidth(ref) {
  const [width, setWidth] = useState(640)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return width
}

export default function ProjectionChart({ data }) {
  const wrapRef = useRef(null)
  const width = useWidth(wrapRef)
  const [hover, setHover] = useState(null) // month index
  const clipId = useId().replace(/:/g, '')

  const { points, incomeStart } = data
  const months = points.length - 1
  const innerW = Math.max(width - M.left - M.right, 10)
  const innerH = HEIGHT - M.top - M.bottom

  const values = points.flatMap((p) => [p.balance, p.income])
  let yMin = Math.min(0, ...values)
  let yMax = Math.max(0, ...values)
  if (yMin === yMax) yMax = 1000
  const yTicks = niceTicks(yMin, yMax, 5)
  yMin = yTicks[0]
  yMax = yTicks[yTicks.length - 1]

  const x = (m) => M.left + (m / months) * innerW
  const y = (v) => M.top + ((yMax - v) / (yMax - yMin)) * innerH
  const y0 = y(0)

  // X ticks: pick a step that keeps labels ~70px apart
  const xStep = [1, 3, 6, 12, 24, 36, 60].find((s) => (innerW / months) * s >= 70) ?? 60
  const xTicks = []
  for (let m = 0; m <= months; m += xStep) xTicks.push(m)

  const toLine = (pts, key) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.month)},${y(p[key])}`).join('')
  const toArea = (pts, key) =>
    `${toLine(pts, key)}L${x(pts[pts.length - 1].month)},${y0}L${x(pts[0].month)},${y0}Z`

  const balanceLine = toLine(points, 'balance')
  const balanceArea = toArea(points, 'balance')

  // Income only exists from the delay month onward
  const incomePts = points.filter((p) => p.month >= incomeStart)
  const showIncome = incomePts.length > 1 && data.income.perMonth > 0
  const incomeLine = showIncome ? toLine(incomePts, 'income') : null
  const incomeArea = showIncome ? toArea(incomePts, 'income') : null

  const pickMonth = (clientX) => {
    const rect = wrapRef.current.getBoundingClientRect()
    const m = Math.round(((clientX - rect.left - M.left) / innerW) * months)
    return Math.min(Math.max(m, 0), months)
  }

  const onKeyDown = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    setHover((h) => {
      const cur = h ?? 0
      if (e.key === 'Home') return 0
      if (e.key === 'End') return months
      return Math.min(Math.max(cur + (e.key === 'ArrowRight' ? 1 : -1), 0), months)
    })
  }

  const hp = hover != null && hover <= months ? points[hover] : null
  const hpHasIncome = hp && showIncome && hp.month >= incomeStart
  const tipLeft = hp ? x(hp.month) : 0
  const tipTop = hp ? Math.min(y(hp.balance), hpHasIncome ? y(hp.income) : Infinity) : 0
  const flip = tipLeft > width - 240

  return (
    <>
      <ul className="pj-legend">
        <li>
          <span className="pj-swatch balance" /> Money remaining
        </li>
        <li>
          <span className="pj-swatch income" /> Kevin's income (cumulative, after tax)
        </li>
      </ul>
      <div className="pj-chart" ref={wrapRef}>

      <svg
        width={width}
        height={HEIGHT}
        role="img"
        tabIndex={0}
        aria-label={`Money remaining over ${months} months, from ${money(data.start)} to ${money(data.end)}. Kevin's take-home income starts at month ${incomeStart}. Use arrow keys to inspect months.`}
        onMouseMove={(e) => setHover(pickMonth(e.clientX))}
        onMouseLeave={() => setHover(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setHover(null)}
      >
        <defs>
          <clipPath id={`${clipId}-pos`}>
            <rect x={0} y={0} width={width} height={Math.max(y0, 0)} />
          </clipPath>
          <clipPath id={`${clipId}-neg`}>
            <rect x={0} y={y0} width={width} height={Math.max(HEIGHT - y0, 0)} />
          </clipPath>
        </defs>

        {/* Grid + y axis */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={M.left}
              x2={width - M.right}
              y1={y(t)}
              y2={y(t)}
              className={t === 0 ? 'pj-zero' : 'pj-grid'}
            />
            <text x={M.left - 8} y={y(t)} className="pj-tick" textAnchor="end" dominantBaseline="middle">
              {moneyCompact(t)}
            </text>
          </g>
        ))}

        {/* X axis */}
        {xTicks.map((m) => (
          <text key={m} x={x(m)} y={HEIGHT - M.bottom + 18} className="pj-tick" textAnchor="middle">
            {m}
          </text>
        ))}
        <text x={M.left + innerW / 2} y={HEIGHT - 4} className="pj-axis-title" textAnchor="middle">
          Months from today
        </text>

        {/* Kevin's income (green), drawn under the balance */}
        {showIncome && (
          <>
            <path d={incomeArea} className="pj-area income" />
            <path d={incomeLine} className="pj-line income" />
          </>
        )}

        {/* Balance: positive in accent, negative (overdrawn) in red */}
        <path d={balanceArea} className="pj-area" clipPath={`url(#${clipId}-pos)`} />
        <path d={balanceArea} className="pj-area neg" clipPath={`url(#${clipId}-neg)`} />
        <path d={balanceLine} className="pj-line" clipPath={`url(#${clipId}-pos)`} />
        <path d={balanceLine} className="pj-line neg" clipPath={`url(#${clipId}-neg)`} />

        {/* Hover crosshair */}
        {hp && (
          <g pointerEvents="none">
            <line x1={x(hp.month)} x2={x(hp.month)} y1={M.top} y2={HEIGHT - M.bottom} className="pj-cross" />
            {hpHasIncome && <circle cx={x(hp.month)} cy={y(hp.income)} r={5} className="pj-dot income" />}
            <circle
              cx={x(hp.month)}
              cy={y(hp.balance)}
              r={5}
              className={`pj-dot ${hp.balance < 0 ? 'neg' : ''}`}
            />
          </g>
        )}
      </svg>

      {hp && (
        <div
          className="pj-tooltip"
          style={{
            left: tipLeft,
            top: tipTop,
            transform: flip ? 'translate(calc(-100% - 12px), -50%)' : 'translate(12px, -50%)',
          }}
        >
          <span>
            <strong>{money(hp.balance)}</strong>
            {hp.balance >= 0 ? ' left by ' : ' overdrawn by '}
            {longDate(hp.date)}
          </span>
          {hpHasIncome && (
            <span>
              <span className="pj-swatch income" /> <strong>{money(hp.income)}</strong> earned by Kevin
            </span>
          )}
          <span className="pj-tooltip-sub">Month {hp.month}</span>
        </div>
      )}
      </div>
    </>
  )
}
