import Constants, { ExecutionEnvironment } from 'expo-constants'
import { Platform } from 'react-native'

import * as settingsRepository from '@/src/db/settingsRepository'
import { ReminderItem } from '@/src/models/ReminderItem'
import { createNotificationDate } from '@/src/utils/dateUtils'

export const SNOOZE_TOMORROW = 'SNOOZE_TOMORROW'
export const SNOOZE_THREE_DAYS = 'SNOOZE_THREE_DAYS'
export const SNOOZE_ONE_WEEK = 'SNOOZE_ONE_WEEK'

const REMINDER_CATEGORY = 'REMINDER_ACTIONS'
const REMINDER_CHANNEL = 'reminders'

type NotificationModule = typeof import('expo-notifications')

export function areNotificationsAvailable(): boolean {
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
}

async function getNotifications(): Promise<NotificationModule> {
  return import('expo-notifications')
}

export async function initializeNotifications(): Promise<void> {
  if (!areNotificationsAvailable()) return

  const Notifications = await getNotifications()
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
      name: 'リマインダー',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }

  await Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY, [
    { identifier: SNOOZE_TOMORROW, buttonTitle: '明日' },
    { identifier: SNOOZE_THREE_DAYS, buttonTitle: '3日後' },
    { identifier: SNOOZE_ONE_WEEK, buttonTitle: '1週間後' },
  ])
}

async function hasNotificationPermission(): Promise<boolean> {
  const Notifications = await getNotifications()
  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true

  const requested = await Notifications.requestPermissionsAsync()
  return requested.granted
}

export async function cancelReminderNotification(reminderId: string): Promise<void> {
  if (!areNotificationsAvailable()) return

  const Notifications = await getNotifications()
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const targets = scheduled.filter((notification) => notification.content.data?.reminderId === reminderId)
  await Promise.all(targets.map((notification) => (
    Notifications.cancelScheduledNotificationAsync(notification.identifier)
  )))
}

export async function scheduleReminderNotification(
  reminder: ReminderItem,
  notificationTime?: string,
): Promise<boolean> {
  if (!areNotificationsAvailable()) return false

  await cancelReminderNotification(reminder.id)

  const targetDate = reminder.snoozedUntil ?? reminder.nextNotificationDate
  if (!targetDate) return false

  const time = notificationTime ?? await settingsRepository.getNotificationTime()
  const triggerDate = createNotificationDate(targetDate, time)
  if (triggerDate.getTime() <= Date.now()) return false
  if (!await hasNotificationPermission()) return false

  const Notifications = await getNotifications()
  await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: '実施予定日です。',
      data: { reminderId: reminder.id },
      categoryIdentifier: REMINDER_CATEGORY,
      sound: true,
    },
    trigger: Platform.OS === 'android'
      ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate, channelId: REMINDER_CHANNEL }
      : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  })
  return true
}

export async function rescheduleAllNotifications(reminders: ReminderItem[]): Promise<void> {
  if (!areNotificationsAvailable()) return

  const Notifications = await getNotifications()
  const notificationTime = await settingsRepository.getNotificationTime()
  await Notifications.cancelAllScheduledNotificationsAsync()

  for (const reminder of reminders) {
    await scheduleReminderNotification(reminder, notificationTime)
  }
}
