import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
const NAVY = '#0A2647'
const GOLD = '#F59E0B'
export default function GarageDetailScreen({ route, navigation }) {
  const { garage } = route.params
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={{ color: '#94A3B8', fontSize: 14 }}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.name}>{garage.name}</Text>
      <Text style={styles.address}>📍 {garage.location?.address || 'Dar es Salaam'}</Text>
      <Text style={styles.rating}>⭐ {garage.rating || 0} · {garage.reviewCount || 0} reviews</Text>
      <Text style={styles.sectionTitle}>Services</Text>
      {garage.services?.map(s => (
        <View key={s._id} style={styles.serviceRow}>
          <View>
            <Text style={styles.serviceName}>{s.name}</Text>
            <Text style={styles.serviceDuration}>⏱ {s.duration} mins</Text>
          </View>
          <Text style={styles.servicePrice}>${s.price}</Text>
        </View>
      ))}
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2647', padding: 24, paddingTop: 56 },
  back: { marginBottom: 20 },
  name: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 8 },
  address: { color: '#94A3B8', fontSize: 14, marginBottom: 6 },
  rating: { color: GOLD, fontSize: 14, marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, marginBottom: 10 },
  serviceName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  serviceDuration: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  servicePrice: { color: GOLD, fontWeight: '700', fontSize: 16 },
})
