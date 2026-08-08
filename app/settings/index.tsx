import { StyleSheet, Text, View } from 'react-native'

export default function SettingsScreen() {
  return <View style={styles.container}><Text>通知時刻 09:00</Text></View>
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: '#fff' } })
