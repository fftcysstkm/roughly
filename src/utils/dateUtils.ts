import { addMonths, addWeeks, addYears, differenceInCalendarDays, format, parseISO } from 'date-fns'

import { IntervalUnit } from '@/src/models/IntervalUnit'

const DATE_FORMAT = 'yyyy-MM-dd'

export function calculateNextNotificationDate(
  performedDate: string,
  intervalValue: number,
  intervalUnit: IntervalUnit,
): string {
  const date = parseISO(performedDate)

  if (intervalUnit === 'WEEK') {
    return format(addWeeks(date, intervalValue), DATE_FORMAT)
  }

  if (intervalUnit === 'MONTH') {
    return format(addMonths(date, intervalValue), DATE_FORMAT)
  }

  return format(addYears(date, intervalValue), DATE_FORMAT)
}

export function getRemainingDays(nextNotificationDate: string, today = new Date()): number {
  return differenceInCalendarDays(parseISO(nextNotificationDate), today)
}

export function formatRemainingDays(remainingDays: number): string {
  if (remainingDays === 0) {
    return '今日'
  }

  if (remainingDays < 0) {
    return `${Math.abs(remainingDays)}日超過`
  }

  return `あと${remainingDays}日`
}
