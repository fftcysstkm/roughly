import { isAfter, isValid, parseISO, startOfDay } from 'date-fns'

import { INTERVAL_UNITS, IntervalUnit } from '@/src/models/IntervalUnit'
import { ReminderInput } from '@/src/models/ReminderItem'

export type ReminderValidationErrors = Partial<Record<keyof ReminderInput, string>>

export function validateReminder(input: ReminderInput, today = new Date()): ReminderValidationErrors {
  const errors: ReminderValidationErrors = {}
  const title = input.title.trim()

  if (title.length === 0 || title.length > 30) {
    errors.title = '項目名は1〜30文字で入力してください'
  }

  if ((input.memo ?? '').length > 200) {
    errors.memo = 'メモは200文字以内で入力してください'
  }

  const performedDate = parseISO(input.lastPerformedDate)
  if (!isValid(performedDate)) {
    errors.lastPerformedDate = '前回実施日を入力してください'
  } else if (isAfter(startOfDay(performedDate), startOfDay(today))) {
    errors.lastPerformedDate = '未来の日付は指定できません'
  }

  if (!Number.isInteger(input.intervalValue) || input.intervalValue < 1) {
    errors.intervalValue = '通知間隔は1以上の整数で入力してください'
  }

  if (!INTERVAL_UNITS.includes(input.intervalUnit as IntervalUnit)) {
    errors.intervalUnit = '通知間隔の単位が不正です'
  }

  return errors
}
