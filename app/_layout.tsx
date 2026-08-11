import { useEffect, useState } from 'react'
import { router, Stack } from 'expo-router'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native'

import { database } from '@/src/db/database'
import { runMigrations } from '@/src/db/migrations'
import * as reminderRepository from '@/src/db/reminderRepository'
import {
  initializeNotifications,
  areNotificationsAvailable,
  rescheduleAllNotifications,
  scheduleTestSnoozeNotification,
  SNOOZE_ONE_WEEK,
  SNOOZE_THREE_DAYS,
  SNOOZE_TOMORROW,
  TEST_SNOOZE_FIVE_SECONDS,
} from '@/src/services/notificationService'
import { snoozeReminder } from '@/src/services/reminderService'
import { getSnoozedDate } from '@/src/utils/dateUtils'

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    runMigrations(database)
      .then(async () => {
        await initializeNotifications()
        await rescheduleAllNotifications(await reminderRepository.findAll())
      })
      .then(() => setIsReady(true))
      .catch((migrationError: unknown) => {
        setError(migrationError instanceof Error ? migrationError : new Error('DBの初期化に失敗しました'))
      })
  }, [])

  useEffect(() => {
    if (!areNotificationsAvailable()) return

    let isMounted = true
    let removeListener: (() => void) | undefined

    import('expo-notifications').then((Notifications) => {
      if (!isMounted) return

      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        if (response.actionIdentifier === TEST_SNOOZE_FIVE_SECONDS) {
          scheduleTestSnoozeNotification().catch((snoozeError: unknown) => {
            Alert.alert(
              'テストスヌーズできませんでした',
              snoozeError instanceof Error ? snoozeError.message : '時間をおいて再度お試しください',
            )
          })
          return
        }

        const reminderId = response.notification.request.content.data?.reminderId
        if (typeof reminderId !== 'string') return

        const days = response.actionIdentifier === SNOOZE_TOMORROW
          ? 1
          : response.actionIdentifier === SNOOZE_THREE_DAYS
            ? 3
            : response.actionIdentifier === SNOOZE_ONE_WEEK
              ? 7
              : null

        if (days) {
          snoozeReminder(reminderId, getSnoozedDate(days)).catch((snoozeError: unknown) => {
            Alert.alert(
              'スヌーズできませんでした',
              snoozeError instanceof Error ? snoozeError.message : '時間をおいて再度お試しください',
            )
          })
        } else {
          router.push(`/reminders/${reminderId}`)
        }
      })
      removeListener = () => subscription.remove()
    }).catch((notificationError: unknown) => {
      Alert.alert(
        '通知を初期化できませんでした',
        notificationError instanceof Error ? notificationError.message : '時間をおいて再度お試しください',
      )
    })

    return () => {
      isMounted = false
      removeListener?.()
    }
  }, [])

  if (error) {
    throw error
  }

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Roughly',
          headerRight: () => (
            <Pressable
              accessibilityLabel="設定"
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => router.push('/settings')}
              style={styles.settingsButton}
            >
              <Text style={styles.settingsIcon}>⚙</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="reminders/new" options={{ title: '新規登録' }} />
      <Stack.Screen name="reminders/[id]" options={{ title: '詳細' }} />
      <Stack.Screen name="reminders/[id]/edit" options={{ title: '編集' }} />
      <Stack.Screen name="settings/index" options={{ title: '設定' }} />
    </Stack>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  settingsIcon: {
    fontSize: 24,
  },
})
