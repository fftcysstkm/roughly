import { database } from './database'

const NOTIFICATION_TIME_KEY = 'notification_time'
const DEFAULT_NOTIFICATION_TIME = '09:00'

export async function getNotificationTime(): Promise<string> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    NOTIFICATION_TIME_KEY,
  )

  return row?.value ?? DEFAULT_NOTIFICATION_TIME
}

export async function setNotificationTime(notificationTime: string): Promise<void> {
  await database.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    NOTIFICATION_TIME_KEY,
    notificationTime,
  )
}
