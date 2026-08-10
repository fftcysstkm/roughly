import * as Crypto from 'expo-crypto'

import * as reminderRepository from '@/src/db/reminderRepository'
import { ReminderInput, ReminderItem } from '@/src/models/ReminderItem'
import { calculateNextNotificationDate } from '@/src/utils/dateUtils'
import { validateReminder } from '@/src/utils/validation'

export async function createReminder(input: ReminderInput): Promise<ReminderItem> {
  const validationErrors = validateReminder(input)
  if (Object.keys(validationErrors).length > 0) {
    throw new Error('入力内容を確認してください')
  }

  const now = new Date().toISOString()
  const reminder: ReminderItem = {
    id: Crypto.randomUUID(),
    title: input.title.trim(),
    memo: input.memo?.trim() || null,
    lastPerformedDate: input.lastPerformedDate,
    intervalValue: input.intervalValue,
    intervalUnit: input.intervalUnit,
    repeatEnabled: input.repeatEnabled,
    nextNotificationDate: calculateNextNotificationDate(
      input.lastPerformedDate,
      input.intervalValue,
      input.intervalUnit,
    ),
    snoozedUntil: null,
    createdAt: now,
    updatedAt: now,
  }

  await reminderRepository.insert(reminder)
  return reminder
}

export async function getReminders(query = ''): Promise<ReminderItem[]> {
  const normalizedQuery = query.trim()
  return normalizedQuery ? reminderRepository.search(normalizedQuery) : reminderRepository.findAll()
}
