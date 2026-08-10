import { addDays, addMonths, addWeeks, addYears, differenceInCalendarDays, format, parseISO } from 'date-fns'

import { IntervalUnit } from '@/src/models/IntervalUnit'

const DATE_FORMAT = 'yyyy-MM-dd'

export function getTodayDate(today = new Date()): string {
  return format(today, DATE_FORMAT)
}

export function createNotificationDate(date: string, notificationTime: string): Date {
  const [hour, minute] = notificationTime.split(':').map(Number)
  const notificationDate = parseISO(date)
  notificationDate.setHours(hour ?? 9, minute ?? 0, 0, 0)
  return notificationDate
}

export function getSnoozedDate(days: number, today = new Date()): string {
  return format(addDays(today, days), DATE_FORMAT)
}

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
