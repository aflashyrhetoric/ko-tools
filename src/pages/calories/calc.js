export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', multiplier: 1.2, hint: 'Desk job, little movement' },
  { id: 'moderate', label: 'Moderate activity', multiplier: 1.55, hint: 'On your feet a fair amount' },
  { id: 'high', label: 'Highly active', multiplier: 1.725, hint: 'Physical job or very active day' },
]

export const LOSS_RATES = [0, 0.5, 1, 1.5, 2]

// ~3,500 kcal per pound of body fat
export const KCAL_PER_LB = 3500

const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function computeDay({ bmr, activityId, strength, cardio, lossPerWeek }) {
  const level = ACTIVITY_LEVELS.find((l) => l.id === activityId) ?? ACTIVITY_LEVELS[0]
  const bmrKcal = num(bmr)
  const activity = bmrKcal * (level.multiplier - 1)
  const strengthKcal = num(strength)
  const cardioKcal = num(cardio)
  const tdee = bmrKcal + activity + strengthKcal + cardioKcal
  const deficit = (num(lossPerWeek) * KCAL_PER_LB) / 7
  const target = tdee - deficit

  return {
    level,
    segments: [
      { key: 'bmr', label: 'BMR', value: bmrKcal },
      { key: 'activity', label: `Activity (×${level.multiplier})`, value: activity },
      { key: 'strength', label: 'Strength training', value: strengthKcal },
      { key: 'cardio', label: 'Cardio', value: cardioKcal },
    ],
    tdee,
    deficit,
    target,
    belowBmr: bmrKcal > 0 && target < bmrKcal,
    deficitExceedsTotal: deficit > tdee,
  }
}

export const fmt = (n) => Math.round(n).toLocaleString()
