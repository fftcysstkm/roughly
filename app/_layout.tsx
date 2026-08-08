import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { database } from '@/src/db/database'
import { runMigrations } from '@/src/db/migrations'

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    runMigrations(database)
      .then(() => setIsReady(true))
      .catch((migrationError: unknown) => {
        setError(migrationError instanceof Error ? migrationError : new Error('DBの初期化に失敗しました'))
      })
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
      <Stack.Screen name="index" options={{ title: 'リマインダー' }} />
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
})
