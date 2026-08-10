import { Pressable, StyleSheet, Text, View } from 'react-native'

import { ReminderItem } from '@/src/models/ReminderItem'
import { formatRemainingDays, getRemainingDays } from '@/src/utils/dateUtils'

const UNIT_LABELS = { WEEK: '週間', MONTH: 'ヶ月', YEAR: '年' } as const

type Props = {
  reminder: ReminderItem
  onPress: () => void
}

export function ReminderListItem({ reminder, onPress }: Props) {
  const remainingText = reminder.nextNotificationDate
    ? formatRemainingDays(getRemainingDays(reminder.nextNotificationDate))
    : '次回通知なし'

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.container}>
      <View style={styles.main}>
        <Text numberOfLines={1} style={styles.title}>{reminder.title}</Text>
        <Text style={styles.interval}>
          {reminder.intervalValue}{UNIT_LABELS[reminder.intervalUnit]}ごと
        </Text>
      </View>
      <Text style={styles.remaining}>{remainingText}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1,
    borderColor: '#e1e1e1', borderRadius: 10, backgroundColor: '#fff',
  },
  main: { flex: 1, gap: 4 },
  title: { fontSize: 17, fontWeight: '600' },
  interval: { color: '#666' },
  remaining: { marginLeft: 12, fontWeight: '600' },
})
