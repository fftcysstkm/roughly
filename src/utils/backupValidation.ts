import { isValid, parseISO } from 'date-fns'

import { INTERVAL_UNITS } from '@/src/models/IntervalUnit'
import { ReminderItem } from '@/src/models/ReminderItem'
import { validateReminder } from '@/src/utils/validation'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value))
}

function isValidTimestamp(value: string): boolean {
  return isValid(parseISO(value))
}

function isValidSnoozedUntil(value: string | null): boolean {
  return value === null || isValidDate(value) || isValidTimestamp(value)
}

function parseReminder(value: unknown, index: number): ReminderItem {
  if (!isRecord(value)) {
    throw new Error(`${index + 1}件目のデータ形式が不正です`)
  }

  const isStructurallyValid =
    typeof value.id === 'string'
    && typeof value.title === 'string'
    && isNullableString(value.memo)
    && typeof value.lastPerformedDate === 'string'
    && typeof value.intervalValue === 'number'
    && typeof value.intervalUnit === 'string'
    && INTERVAL_UNITS.includes(value.intervalUnit as typeof INTERVAL_UNITS[number])
    && typeof value.repeatEnabled === 'boolean'
    && isNullableString(value.nextNotificationDate)
    && isNullableString(value.snoozedUntil)
    && typeof value.createdAt === 'string'
    && typeof value.updatedAt === 'string'

  if (!isStructurallyValid) {
    throw new Error(`${index + 1}件目に不足または不正な項目があります`)
  }

  const reminder = value as ReminderItem
  const errors = validateReminder(reminder)
  const datesAreValid =
    isValidDate(reminder.lastPerformedDate)
    && (reminder.nextNotificationDate === null || isValidDate(reminder.nextNotificationDate))
    && isValidSnoozedUntil(reminder.snoozedUntil)
    && isValidTimestamp(reminder.createdAt)
    && isValidTimestamp(reminder.updatedAt)

  if (reminder.id.trim().length === 0 || Object.keys(errors).length > 0 || !datesAreValid) {
    throw new Error(`${index + 1}件目の値が不正です`)
  }

  return reminder
}

export function validateBackupJson(value: unknown): ReminderItem[] {
  if (!Array.isArray(value)) {
    throw new Error('バックアップはJSON配列である必要があります')
  }

  const reminders = value.map(parseReminder)
  const ids = new Set(reminders.map((reminder) => reminder.id))
  if (ids.size !== reminders.length) {
    throw new Error('バックアップ内に重複したIDがあります')
  }

  return reminders
}
