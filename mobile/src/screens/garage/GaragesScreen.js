import { View, Text, StyleSheet } from 'react-native'
export default function GaragesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏪 Garages</Text>
      <Text style={styles.sub}>Map view coming soon</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2647', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#94A3B8', fontSize: 14 },
})
