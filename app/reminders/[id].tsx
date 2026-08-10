import { useCallback, useState } from 'react'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { DateInput } from '@/src/components/DateInput'
import { ReminderItem } from '@/src/models/ReminderItem'
import { completeReminder, deleteReminder, getReminderById } from '@/src/services/reminderService'
import { getTodayDate } from '@/src/utils/dateUtils'

const UNIT_LABELS = { WEEK: '週間', MONTH: 'ヶ月', YEAR: '年' } as const

export default function ReminderDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [reminder, setReminder] = useState<ReminderItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [isDateModalVisible, setIsDateModalVisible] = useState(false)
  const [performedDate, setPerformedDate] = useState(getTodayDate())

  const loadReminder = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setReminder(await getReminderById(id))
    } catch (error) {
      Alert.alert('読み込めませんでした', error instanceof Error ? error.message : '時間をおいて再度お試しください')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useFocusEffect(useCallback(() => {
    void loadReminder()
  }, [loadReminder]))

  async function perform(date: string) {
    if (!id || isWorking) return

    setIsWorking(true)
    try {
      setReminder(await completeReminder(id, date))
      setIsDateModalVisible(false)
    } catch (error) {
      Alert.alert('更新できませんでした', error instanceof Error ? error.message : '時間をおいて再度お試しください')
    } finally {
      setIsWorking(false)
    }
  }

  function confirmCompleteToday() {
    Alert.alert('今日実施しましたか？', '前回実施日と次回通知日を更新します。', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '実施した', onPress: () => void perform(getTodayDate()) },
    ])
  }

  function confirmDelete() {
    Alert.alert('削除しますか？', 'この操作は取り消せません。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          if (!id) return
          try {
            await deleteReminder(id)
            router.dismissTo('/')
          } catch (error) {
            Alert.alert('削除できませんでした', error instanceof Error ? error.message : '時間をおいて再度お試しください')
          }
        },
      },
    ])
  }

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>
  }

  if (!reminder) {
    return <View style={styles.center}><Text>リマインダーが見つかりません</Text></View>
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{reminder.title}</Text>
      <Detail label="メモ" value={reminder.memo || 'なし'} />
      <Detail label="前回実施日" value={reminder.lastPerformedDate} />
      <Detail label="通知間隔" value={`${reminder.intervalValue}${UNIT_LABELS[reminder.intervalUnit]}`} />
      <Detail label="次回通知日" value={reminder.nextNotificationDate ?? '設定なし'} />
      <Detail label="繰り返し" value={reminder.repeatEnabled ? 'ON' : 'OFF'} />

      <Pressable disabled={isWorking} onPress={confirmCompleteToday} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>今日実施した</Text>
      </Pressable>
      <Pressable onPress={() => setIsDateModalVisible(true)} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>実施日を指定</Text>
      </Pressable>
      <Pressable onPress={() => router.push(`/reminders/${id}/edit`)} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>編集</Text>
      </Pressable>
      <Pressable onPress={confirmDelete} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>削除</Text>
      </Pressable>

      <Modal animationType="fade" transparent visible={isDateModalVisible} onRequestClose={() => setIsDateModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>実施日を指定</Text>
            <DateInput onChange={setPerformedDate} value={performedDate} />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIsDateModalVisible(false)} style={styles.modalButton}>
                <Text>キャンセル</Text>
              </Pressable>
              <Pressable disabled={isWorking} onPress={() => void perform(performedDate)} style={[styles.modalButton, styles.modalSubmit]}>
                <Text style={styles.primaryButtonText}>実施</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12, backgroundColor: '#fff', flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { marginBottom: 8, fontSize: 26, fontWeight: '700' },
  detail: { gap: 4, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
  label: { color: '#666', fontSize: 13 },
  value: { fontSize: 17 },
  primaryButton: { alignItems: 'center', marginTop: 12, padding: 15, borderRadius: 8, backgroundColor: '#fbbc04' },
  primaryButtonText: { fontSize: 16, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', padding: 14, borderWidth: 1, borderColor: '#aaa', borderRadius: 8 },
  secondaryButtonText: { fontSize: 16 },
  deleteButton: { alignItems: 'center', marginTop: 8, padding: 14 },
  deleteButtonText: { color: '#b00020', fontSize: 16 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  modalCard: { gap: 16, padding: 20, borderRadius: 12, backgroundColor: '#fff' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  modalButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  modalSubmit: { backgroundColor: '#fbbc04' },
})
