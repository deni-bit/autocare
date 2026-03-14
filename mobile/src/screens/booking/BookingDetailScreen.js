import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import api from '../../utils/api'
const NAVY = '#0A2647'
const GOLD = '#F59E0B'
export default function BookingDetailScreen({ route, navigation }) {
  const { bookingId } = route.params
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get(`/bookings/${bookingId}`).then(r => setBooking(r.data)).finally(() => setLoading(false))
  }, [])
  if (loading) return <View style={styles.container}><ActivityIndicator color={GOLD} /></View>
  if (!booking) return <View style={styles.container}><Text style={{ color: '#fff' }}>Booking not found</Text></View>
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
        <Text style={{ color: '#94A3B8' }}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{booking.service?.name}</Text>
      <Text style={styles.sub}>{booking.garage?.name}</Text>
      {[
        ['Vehicle', `${booking.vehicle?.make} ${booking.vehicle?.model}`],
        ['Scheduled', new Date(booking.scheduledAt).toLocaleString()],
        ['Status', booking.status.replace('_', ' ')],
        ['Price', `$${booking.service?.price}`],
      ].map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowValue}>{value}</Text>
        </View>
      ))}
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2647', padding: 24, paddingTop: 56 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 6 },
  sub: { color: '#94A3B8', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  rowLabel: { color: '#94A3B8', fontSize: 14 },
  rowValue: { color: '#fff', fontWeight: '600', fontSize: 14, textTransform: 'capitalize' },
})
