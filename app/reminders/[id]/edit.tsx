import { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'

import { ReminderForm } from '@/src/components/ReminderForm'
import { ReminderInput, ReminderItem } from '@/src/models/ReminderItem'
import { getReminderById, updateReminder } from '@/src/services/reminderService'

export default function EditReminderScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [reminder, setReminder] = useState<ReminderItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    getReminderById(id)
      .then(setReminder)
      .catch((error: unknown) => {
        Alert.alert('読み込めませんでした', error instanceof Error ? error.message : '時間をおいて再度お試しください')
      })
      .finally(() => setIsLoading(false))
  }, [id])

  async function handleSubmit(input: ReminderInput) {
    if (!id) return

    setIsSubmitting(true)
    try {
      await updateReminder(id, input)
      router.back()
    } catch (error) {
      Alert.alert('更新できませんでした', error instanceof Error ? error.message : '時間をおいて再度お試しください')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>
  }

  if (!reminder) {
    return <View style={styles.center}><Text>リマインダーが見つかりません</Text></View>
  }

  return <ReminderForm
    defaultValues={{
      title: reminder.title,
      memo: reminder.memo ?? '',
      lastPerformedDate: reminder.lastPerformedDate,
      intervalValue: String(reminder.intervalValue),
      intervalUnit: reminder.intervalUnit,
      repeatEnabled: reminder.repeatEnabled,
    }}
    isSubmitting={isSubmitting}
    onSubmit={handleSubmit}
    submitLabel="更新"
  />
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
})
