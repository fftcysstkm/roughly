import { useCallback, useState } from 'react'
import { Link, router, useFocusEffect } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { ReminderListItem } from '@/src/components/ReminderListItem'
import { useReminders } from '@/src/hooks/useReminders'

export default function ReminderListScreen() {
  const [query, setQuery] = useState('')
  const { reminders, isLoading, error, refresh } = useReminders(query)

  useFocusEffect(useCallback(() => {
    void refresh()
  }, [refresh]))

  return (
    <View style={styles.container}>
      <TextInput accessibilityLabel="リマインダーを検索" onChangeText={setQuery} placeholder="検索" style={styles.search} value={query} />

      {isLoading ? <ActivityIndicator style={styles.loading} /> : (
        <FlatList
          contentContainerStyle={reminders.length === 0 ? styles.empty : styles.list}
          data={reminders}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>{query ? '一致する項目がありません' : 'リマインダーはまだありません'}</Text>
              {!query && <Text style={styles.emptyText}>右下の＋から最初の項目を登録できます。</Text>}
            </View>
          }
          renderItem={({ item }) => <ReminderListItem reminder={item} onPress={() => router.push(`/reminders/${item.id}`)} />}
        />
      )}
      {error && <Text style={styles.error}>{error.message}</Text>}

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
  search: { borderWidth: 1, borderColor: '#d6d6d6', borderRadius: 8, padding: 12 },
  loading: { flex: 1 },
  list: { paddingVertical: 16, gap: 10 },
  empty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContent: { alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyText: { color: '#666' },
  error: { color: '#b00020', padding: 8 },
  addButton: {
    position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbbc04', elevation: 4,
  },
  addButtonText: { fontSize: 32, lineHeight: 36 },
})
