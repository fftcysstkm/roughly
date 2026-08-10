import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

import { exportBackup, importBackup, ImportMode, selectBackupFile } from '@/src/services/backupService'
import { areNotificationsAvailable } from '@/src/services/notificationService'
import { getNotificationTime, updateNotificationTime } from '@/src/services/settingsService'

export default function SettingsScreen() {
  const [notificationTime, setNotificationTime] = useState('09:00')
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)

  useEffect(() => {
    getNotificationTime()
      .then(setNotificationTime)
      .catch((error: unknown) => {
        Alert.alert('設定を読み込めませんでした', getErrorMessage(error))
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function saveNotificationTime() {
    setIsWorking(true)
    try {
      await updateNotificationTime(notificationTime)
      Alert.alert('保存しました', '通知時刻を更新しました。')
    } catch (error) {
      Alert.alert('保存できませんでした', getErrorMessage(error))
    } finally {
      setIsWorking(false)
    }
  }

  async function handleExport() {
    setIsWorking(true)
    try {
      await exportBackup()
    } catch (error) {
      Alert.alert('エクスポートできませんでした', getErrorMessage(error))
    } finally {
      setIsWorking(false)
    }
  }

  async function handleSelectImportFile() {
    setIsWorking(true)
    try {
      const reminders = await selectBackupFile()
      if (!reminders) return

      Alert.alert('復元方法を選択', `${reminders.length}件のデータを読み込みます。`, [
        { text: 'キャンセル', style: 'cancel' },
        { text: '追加', onPress: () => void runImport(reminders, 'ADD') },
        {
          text: '全置換',
          style: 'destructive',
          onPress: () => confirmReplace(reminders),
        },
      ])
    } catch (error) {
      Alert.alert('ファイルを読み込めませんでした', getErrorMessage(error))
    } finally {
      setIsWorking(false)
    }
  }

  function confirmReplace(reminders: Awaited<ReturnType<typeof selectBackupFile>>) {
    if (!reminders) return

    Alert.alert('すべて置き換えますか？', '現在のリマインダーは削除されます。この操作は取り消せません。', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '置き換える', style: 'destructive', onPress: () => void runImport(reminders, 'REPLACE') },
    ])
  }

  async function runImport(reminders: NonNullable<Awaited<ReturnType<typeof selectBackupFile>>>, mode: ImportMode) {
    setIsWorking(true)
    try {
      const count = await importBackup(reminders, mode)
      const message = mode === 'ADD'
        ? `${count}件を追加しました。既存IDのデータは変更していません。`
        : `${count}件に置き換えました。`
      Alert.alert('復元しました', message)
    } catch (error) {
      Alert.alert('復元できませんでした', getErrorMessage(error))
    } finally {
      setIsWorking(false)
    }
  }

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>通知時刻</Text>
      <Text style={styles.description}>すべてのリマインダーに共通で使用します。</Text>
      {!areNotificationsAvailable() && (
        <Text style={styles.notice}>Expo Goでは通知を利用できません。Development Buildで有効になります。</Text>
      )}
      <TextInput
        accessibilityLabel="通知時刻"
        autoCapitalize="none"
        maxLength={5}
        onChangeText={setNotificationTime}
        placeholder="09:00"
        style={styles.input}
        value={notificationTime}
      />
      <Pressable disabled={isWorking} onPress={() => void saveNotificationTime()} style={[styles.button, isWorking && styles.disabled]}>
        <Text style={styles.buttonText}>保存</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.heading}>バックアップ</Text>
        <Text style={styles.description}>すべてのリマインダーをJSONファイルとして共有します。</Text>
        <Pressable disabled={isWorking} onPress={() => void handleExport()} style={[styles.button, isWorking && styles.disabled]}>
          <Text style={styles.buttonText}>エクスポート</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>復元</Text>
        <Text style={styles.description}>JSONバックアップを追加、または現在のデータと置き換えます。</Text>
        <Pressable disabled={isWorking} onPress={() => void handleSelectImportFile()} style={[styles.secondaryButton, isWorking && styles.disabled]}>
          <Text style={styles.secondaryButtonText}>インポート</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '時間をおいて再度お試しください'
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, gap: 10, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  section: { gap: 10, marginTop: 28, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ccc' },
  heading: { fontSize: 18, fontWeight: '700' },
  description: { color: '#666' },
  notice: { padding: 12, borderRadius: 8, color: '#7a5200', backgroundColor: '#fff3cd' },
  input: { width: 120, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 18 },
  button: { alignItems: 'center', marginTop: 8, padding: 14, borderRadius: 8, backgroundColor: '#fbbc04' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', padding: 14, borderWidth: 1, borderColor: '#aaa', borderRadius: 8 },
  secondaryButtonText: { fontSize: 16 },
  disabled: { opacity: 0.5 },
})
