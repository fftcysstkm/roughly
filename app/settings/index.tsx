import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { getNotificationTime, updateNotificationTime } from '@/src/services/settingsService'

export default function SettingsScreen() {
  const [notificationTime, setNotificationTime] = useState('09:00')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getNotificationTime()
      .then(setNotificationTime)
      .catch((error: unknown) => {
        Alert.alert('設定を読み込めませんでした', error instanceof Error ? error.message : '時間をおいて再度お試しください')
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function save() {
    setIsSaving(true)
    try {
      await updateNotificationTime(notificationTime)
      Alert.alert('保存しました', '通知時刻を更新しました。')
    } catch (error) {
      Alert.alert('保存できませんでした', error instanceof Error ? error.message : '時間をおいて再度お試しください')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>通知時刻</Text>
      <Text style={styles.description}>すべてのリマインダーに共通で使用します。</Text>
      <TextInput
        accessibilityLabel="通知時刻"
        autoCapitalize="none"
        maxLength={5}
        onChangeText={setNotificationTime}
        placeholder="09:00"
        style={styles.input}
        value={notificationTime}
      />
      <Pressable disabled={isSaving} onPress={() => void save()} style={[styles.button, isSaving && styles.disabled]}>
        <Text style={styles.buttonText}>{isSaving ? '保存中…' : '保存'}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  heading: { fontSize: 18, fontWeight: '700' },
  description: { color: '#666' },
  input: { width: 120, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 18 },
  button: { alignItems: 'center', marginTop: 8, padding: 14, borderRadius: 8, backgroundColor: '#fbbc04' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 },
})
