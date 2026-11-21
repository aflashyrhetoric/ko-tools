// Take-home pay for a single W-2 filer living in Suffolk County, NY (tax year 2026).
// Suffolk County has no local income tax (only NYC and Yonkers do), so this is
// federal income tax + FICA + NY State income tax + NY SDI + NY Paid Family Leave.
//
// Assumptions: single filer, standard deductions, no pre-tax deductions (401k,
// health premiums, etc.), no credits. 2026 rules are applied to every year.
//
// Sources:
//   Federal brackets & standard deduction — IRS Rev. Proc. 2025-32
//   Social Security wage base — SSA, 2026 ($184,500)
//   NY rates — NYS-50-T-NYS (1/26), 2026 rate reductions
//   NY PFL — 0.432% of wages, capped at $411.91 (2026)

export const PAYCHECKS_PER_YEAR = 26 // bi-weekly

const FEDERAL = {
  standardDeduction: 16100,
  brackets: [
    [12400, 0.1],
    [50400, 0.12],
    [105700, 0.22],
    [201775, 0.24],
    [256225, 0.32],
    [640600, 0.35],
    [Infinity, 0.37],
  ],
}

const FICA = {
  ssRate: 0.062,
  ssWageBase: 184500,
  medicareRate: 0.0145,
  addlMedicareRate: 0.009,
  addlMedicareThreshold: 200000, // single
}

const NY = {
  standardDeduction: 8000, // single
  brackets: [
    [8500, 0.039],
    [11700, 0.044],
    [13900, 0.0515],
    [80650, 0.054],
    [215400, 0.059],
    [1077550, 0.0685],
    [5000000, 0.0965],
    [25000000, 0.103],
    [Infinity, 0.109],
  ],
  // Above this AGI, NY "recaptures" the benefit of its lower brackets,
  // phased in over the next $50,000 of income.
  recaptureStart: 107650,
  recapturePhase: 50000,
  sdiAnnualMax: 31.2, // 0.5% of wages, max $0.60/week
  sdiRate: 0.005,
  pflRate: 0.00432,
  pflAnnualMax: 411.91,
}

function progressive(income, brackets) {
  let tax = 0
  let lower = 0
  for (const [upper, rate] of brackets) {
    if (income <= lower) break
    tax += (Math.min(income, upper) - lower) * rate
    lower = upper
  }
  return tax
}

function nyIncomeTax(agi, taxable) {
  const normal = progressive(taxable, NY.brackets)
  if (agi <= NY.recaptureStart) return normal

  const phase = (start) => Math.min(Math.max(agi - start, 0), NY.recapturePhase) / NY.recapturePhase

  // Tier 1: phase toward a flat 5.9% on all income (AGI 107,650 → 157,650)
  if (taxable <= 215400) {
    return normal + (taxable * 0.059 - normal) * phase(NY.recaptureStart)
  }

  // Tier 2 (approximation): lower-bracket benefit fully recaptured, then phase
  // toward a flat 6.85% over the next $50k above $215,400.
  const flatThrough = 215400 * 0.059 + progressive(taxable, NY.brackets) - progressive(215400, NY.brackets)
  const capped = Math.min(taxable, 1077550)
  const flat685 = capped * 0.0685 + (progressive(taxable, NY.brackets) - progressive(capped, NY.brackets))
  return flatThrough + (flat685 - flatThrough) * phase(215400)
}

export function takeHome(salaryInput) {
  const salary = Math.max(parseFloat(salaryInput) || 0, 0)

  const federal = progressive(Math.max(salary - FEDERAL.standardDeduction, 0), FEDERAL.brackets)
  const socialSecurity = Math.min(salary, FICA.ssWageBase) * FICA.ssRate
  const medicare =
    salary * FICA.medicareRate +
    Math.max(salary - FICA.addlMedicareThreshold, 0) * FICA.addlMedicareRate
  const state = nyIncomeTax(salary, Math.max(salary - NY.standardDeduction, 0))
  const sdi = Math.min(salary * NY.sdiRate, NY.sdiAnnualMax)
  const pfl = Math.min(salary * NY.pflRate, NY.pflAnnualMax)

  const totalTax = federal + socialSecurity + medicare + state + sdi + pfl
  const netAnnual = salary - totalTax

  return {
    salary,
    federal,
    socialSecurity,
    medicare,
    state,
    sdi,
    pfl,
    totalTax,
    netAnnual,
    perPaycheck: netAnnual / PAYCHECKS_PER_YEAR,
    // Bi-weekly pay averaged per month (26 paychecks ÷ 12 months)
    perMonth: netAnnual / 12,
    effectiveRate: salary > 0 ? totalTax / salary : 0,
  }
}
