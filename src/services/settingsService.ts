import * as reminderRepository from '@/src/db/reminderRepository'
import * as settingsRepository from '@/src/db/settingsRepository'
import { rescheduleAllNotifications } from '@/src/services/notificationService'

const NOTIFICATION_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export async function getNotificationTime(): Promise<string> {
  return settingsRepository.getNotificationTime()
}

export async function updateNotificationTime(notificationTime: string): Promise<void> {
  if (!NOTIFICATION_TIME_PATTERN.test(notificationTime)) {
    throw new Error('通知時刻はHH:mm形式で入力してください')
  }

  await settingsRepository.setNotificationTime(notificationTime)
  await rescheduleAllNotifications(await reminderRepository.findAll())
}
