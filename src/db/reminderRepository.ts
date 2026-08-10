import { database } from './database'

import { IntervalUnit } from '@/src/models/IntervalUnit'
import { ReminderItem } from '@/src/models/ReminderItem'

type ReminderRow = {
  id: string
  title: string
  memo: string | null
  last_performed_date: string
  interval_value: number
  interval_unit: IntervalUnit
  repeat_enabled: number
  next_notification_date: string | null
  snoozed_until: string | null
  created_at: string
  updated_at: string
}

function toReminderItem(row: ReminderRow): ReminderItem {
  return {
    id: row.id,
    title: row.title,
    memo: row.memo,
    lastPerformedDate: row.last_performed_date,
    intervalValue: row.interval_value,
    intervalUnit: row.interval_unit,
    repeatEnabled: row.repeat_enabled === 1,
    nextNotificationDate: row.next_notification_date,
    snoozedUntil: row.snoozed_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function findAll(): Promise<ReminderItem[]> {
  const rows = await database.getAllAsync<ReminderRow>(`
    SELECT * FROM reminder_items
    ORDER BY next_notification_date IS NULL, next_notification_date ASC, created_at ASC
  `)

  return rows.map(toReminderItem)
}

export async function findById(id: string): Promise<ReminderItem | null> {
  const row = await database.getFirstAsync<ReminderRow>(
    'SELECT * FROM reminder_items WHERE id = ?',
    id,
  )

  return row ? toReminderItem(row) : null
}

export async function search(query: string): Promise<ReminderItem[]> {
  const pattern = `%${query}%`
  const rows = await database.getAllAsync<ReminderRow>(
    `SELECT * FROM reminder_items
     WHERE title LIKE ? OR memo LIKE ?
     ORDER BY next_notification_date IS NULL, next_notification_date ASC, created_at ASC`,
    pattern,
    pattern,
  )

  return rows.map(toReminderItem)
}

export async function insert(reminder: ReminderItem): Promise<void> {
  await database.runAsync(
    `INSERT INTO reminder_items (
      id, title, memo, last_performed_date, interval_value, interval_unit,
      repeat_enabled, next_notification_date, snoozed_until, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    reminder.id,
    reminder.title,
    reminder.memo,
    reminder.lastPerformedDate,
    reminder.intervalValue,
    reminder.intervalUnit,
    reminder.repeatEnabled ? 1 : 0,
    reminder.nextNotificationDate,
    reminder.snoozedUntil,
    reminder.createdAt,
    reminder.updatedAt,
  )
}

export async function update(reminder: ReminderItem): Promise<void> {
  await database.runAsync(
    `UPDATE reminder_items SET
      title = ?, memo = ?, last_performed_date = ?, interval_value = ?, interval_unit = ?,
      repeat_enabled = ?, next_notification_date = ?, snoozed_until = ?, updated_at = ?
     WHERE id = ?`,
    reminder.title,
    reminder.memo,
    reminder.lastPerformedDate,
    reminder.intervalValue,
    reminder.intervalUnit,
    reminder.repeatEnabled ? 1 : 0,
    reminder.nextNotificationDate,
    reminder.snoozedUntil,
    reminder.updatedAt,
    reminder.id,
  )
}

export async function deleteById(id: string): Promise<void> {
  await database.runAsync('DELETE FROM reminder_items WHERE id = ?', id)
}

export async function deleteAll(): Promise<void> {
  await database.runAsync('DELETE FROM reminder_items')
}
