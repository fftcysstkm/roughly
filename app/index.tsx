import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

export default function ReminderListScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput accessibilityLabel="リマインダーを検索" placeholder="検索" style={styles.search} />
        <Link href="/settings" asChild>
          <Pressable accessibilityRole="button" style={styles.settingsButton}>
            <Text>設定</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>リマインダーはまだありません</Text>
        <Text style={styles.emptyText}>右下の＋から最初の項目を登録できます。</Text>
      </View>

      <Link href="/reminders/new" asChild>
        <Pressable accessibilityLabel="リマインダーを追加" accessibilityRole="button" style={styles.addButton}>
          <Text style={styles.addButtonText}>＋</Text>
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', gap: 8 },
  search: { flex: 1, borderWidth: 1, borderColor: '#d6d6d6', borderRadius: 8, padding: 12 },
  settingsButton: { justifyContent: 'center', paddingHorizontal: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyText: { color: '#666' },
  addButton: {
    position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbbc04', elevation: 4,
  },
  addButtonText: { fontSize: 32, lineHeight: 36 },
})
