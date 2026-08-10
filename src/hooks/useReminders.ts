import { useCallback, useEffect, useState } from 'react'

import { ReminderItem } from '@/src/models/ReminderItem'
import { getReminders } from '@/src/services/reminderService'

export function useReminders(query: string) {
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setReminders(await getReminders(query))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error('一覧の取得に失敗しました'))
    } finally {
      setIsLoading(false)
    }
  }, [query])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { reminders, isLoading, error, refresh }
}
