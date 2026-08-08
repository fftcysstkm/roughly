export const INTERVAL_UNITS = ['WEEK', 'MONTH', 'YEAR'] as const

export type IntervalUnit = (typeof INTERVAL_UNITS)[number]
