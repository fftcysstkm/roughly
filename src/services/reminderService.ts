import * as Crypto from 'expo-crypto'

import * as reminderRepository from '@/src/db/reminderRepository'
import { ReminderInput, ReminderItem } from '@/src/models/ReminderItem'
import { calculateNextNotificationDate } from '@/src/utils/dateUtils'
import { validateReminder } from '@/src/utils/validation'
import { cancelReminderNotification, scheduleReminderNotification } from './notificationService'

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
  await scheduleReminderNotification(reminder)
  return reminder
}

export async function getReminders(query = ''): Promise<ReminderItem[]> {
  const normalizedQuery = query.trim()
  return normalizedQuery ? reminderRepository.search(normalizedQuery) : reminderRepository.findAll()
}

export async function getReminderById(id: string): Promise<ReminderItem | null> {
  return reminderRepository.findById(id)
}

export async function updateReminder(id: string, input: ReminderInput): Promise<ReminderItem> {
  const validationErrors = validateReminder(input)
  if (Object.keys(validationErrors).length > 0) {
    throw new Error('入力内容を確認してください')
  }

  const current = await reminderRepository.findById(id)
  if (!current) {
    throw new Error('リマインダーが見つかりません')
  }

  const shouldRecalculateNextDate =
    current.lastPerformedDate !== input.lastPerformedDate
    || current.intervalValue !== input.intervalValue
    || current.intervalUnit !== input.intervalUnit

  const reminder: ReminderItem = {
    ...current,
    title: input.title.trim(),
    memo: input.memo?.trim() || null,
    lastPerformedDate: input.lastPerformedDate,
    intervalValue: input.intervalValue,
    intervalUnit: input.intervalUnit,
    repeatEnabled: input.repeatEnabled,
    nextNotificationDate: shouldRecalculateNextDate
      ? calculateNextNotificationDate(input.lastPerformedDate, input.intervalValue, input.intervalUnit)
      : current.nextNotificationDate,
    updatedAt: new Date().toISOString(),
  }

  await reminderRepository.update(reminder)
  await scheduleReminderNotification(reminder)
  return reminder
}

export async function completeReminder(id: string, performedDate: string): Promise<ReminderItem> {
  const current = await reminderRepository.findById(id)
  if (!current) {
    throw new Error('リマインダーが見つかりません')
  }

  const validationErrors = validateReminder({
    ...current,
    lastPerformedDate: performedDate,
  })
  if (validationErrors.lastPerformedDate) {
    throw new Error(validationErrors.lastPerformedDate)
  }

  const reminder: ReminderItem = {
    ...current,
    lastPerformedDate: performedDate,
    nextNotificationDate: current.repeatEnabled
      ? calculateNextNotificationDate(performedDate, current.intervalValue, current.intervalUnit)
      : null,
    snoozedUntil: null,
    updatedAt: new Date().toISOString(),
  }

  await reminderRepository.update(reminder)
  await scheduleReminderNotification(reminder)
  return reminder
}

export async function snoozeReminder(id: string, snoozedUntil: string): Promise<ReminderItem> {
  const current = await reminderRepository.findById(id)
  if (!current) {
    throw new Error('リマインダーが見つかりません')
  }

  const reminder: ReminderItem = {
    ...current,
    snoozedUntil,
    updatedAt: new Date().toISOString(),
  }
  await reminderRepository.update(reminder)
  await scheduleReminderNotification(reminder)
  return reminder
}

export async function deleteReminder(id: string): Promise<void> {
  const current = await reminderRepository.findById(id)
  if (!current) {
    throw new Error('リマインダーが見つかりません')
  }

  await cancelReminderNotification(id)
  await reminderRepository.deleteById(id)
}
