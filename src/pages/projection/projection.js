import { takeHome } from './taxes'

export const MIN_MONTHS = 12
export const MAX_MONTHS = 180
export const MAX_DELAY = 36

const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

/** Same day-of-month, `months` from `from`, clamped to the month's last day. */
export function addMonths(from, months) {
  const d = new Date(from.getFullYear(), from.getMonth() + months, 1)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(from.getDate(), lastDay))
  return d
}

export function project({
  startingMoney,
  burnRate,
  continuedSalary,
  months,
  salary,
  delay = 0,
  today = new Date(),
}) {
  const start = num(startingMoney)
  const burn = Math.max(num(burnRate), 0)
  // Continued income: take-home pay added to the balance every month, no delay
  const continued = takeHome(continuedSalary)
  const netBurn = burn - continued.perMonth
  const income = takeHome(salary)
  const incomeStart = Math.min(Math.max(delay, 0), MAX_DELAY)
  const points = []
  for (let m = 0; m <= months; m++) {
    points.push({
      month: m,
      balance: start - netBurn * m,
      // Cumulative take-home pay, accruing monthly once the delay has passed
      income: Math.max(m - incomeStart, 0) * income.perMonth,
      date: addMonths(today, m),
    })
  }
  // First whole month where the balance hits zero or below
  const runOutMonth = netBurn > 0 && start > 0 ? Math.ceil(start / netBurn) : null
  return {
    start,
    burn,
    continued,
    netBurn,
    income,
    incomeStart,
    points,
    end: points[points.length - 1].balance,
    runOutMonth,
    runOutDate: runOutMonth != null ? addMonths(today, runOutMonth) : null,
  }
}

export const money = (n) =>
  (n < 0 ? '−$' : '$') + Math.round(Math.abs(n)).toLocaleString()

export const moneyCompact = (n) =>
  (n < 0 ? '−$' : '$') +
  Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.abs(n))

export const longDate = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const monthYear = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

export function niceTicks(min, max, count = 5) {
  const span = max - min || 1
  const raw = span / count
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = pow * [1, 2, 2.5, 5, 10].find((s) => s * pow >= raw)
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const ticks = []
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Math.round(t * 100) / 100)
  return ticks
}
