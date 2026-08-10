import { useState } from 'react'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import { formatDisplayDate, formatStorageDate, parseStorageDate } from '@/src/utils/dateUtils'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function DateInput({ value, onChange }: Props) {
  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const selectedDate = parseStorageDate(value)

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setIsPickerVisible(false)
    }
    if (event.type === 'set' && date) {
      onChange(formatStorageDate(date))
    }
  }

  function selectToday() {
    onChange(formatStorageDate(new Date()))
    setIsPickerVisible(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel="日付を選択"
          accessibilityRole="button"
          onPress={() => setIsPickerVisible(true)}
          style={styles.dateButton}
        >
          <Text style={styles.dateText}>{formatDisplayDate(value)}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={selectToday} style={styles.todayButton}>
          <Text style={styles.todayText}>今日</Text>
        </Pressable>
      </View>

      {isPickerVisible && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            maximumDate={new Date()}
            mode="date"
            onChange={handleChange}
            value={selectedDate}
          />
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setIsPickerVisible(false)} style={styles.doneButton}>
              <Text style={styles.doneText}>完了</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  dateButton: { flex: 1, justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  dateText: { fontSize: 16 },
  todayButton: { justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1, borderColor: '#aaa', borderRadius: 8 },
  todayText: { fontSize: 15 },
  pickerContainer: { gap: 4 },
  doneButton: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 10 },
  doneText: { color: '#246bfd', fontSize: 16, fontWeight: '600' },
})
