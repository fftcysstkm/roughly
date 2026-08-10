import { useState } from 'react'
import { router } from 'expo-router'
import { Alert } from 'react-native'

import { ReminderForm } from '@/src/components/ReminderForm'
import { ReminderInput } from '@/src/models/ReminderItem'
import { createReminder } from '@/src/services/reminderService'
import { getTodayDate } from '@/src/utils/dateUtils'

export default function NewReminderScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(input: ReminderInput) {
    setIsSubmitting(true)
    try {
      await createReminder(input)
      router.back()
    } catch (error) {
      Alert.alert('登録できませんでした', error instanceof Error ? error.message : '時間をおいて再度お試しください')
    } finally {
      setIsSubmitting(false)
    }
  }

  return <ReminderForm
    defaultValues={{
      title: '', memo: '', lastPerformedDate: getTodayDate(),
      intervalValue: '1', intervalUnit: 'MONTH', repeatEnabled: true,
    }}
    isSubmitting={isSubmitting}
    onSubmit={handleSubmit}
    submitLabel="登録"
  />
}
