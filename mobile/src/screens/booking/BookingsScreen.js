import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import api from '../../utils/api'
const NAVY = '#0A2647'
const GOLD = '#F59E0B'
const statusColors = { pending: '#F59E0B', confirmed: '#3B82F6', in_progress: '#8B5CF6', completed: '#10B981', cancelled: '#EF4444' }
export default function BookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/bookings').then(r => setBookings(r.data.bookings)).finally(() => setLoading(false))
  }, [])
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      {loading ? <ActivityIndicator color={GOLD} style={{ marginTop: 40 }} /> :
      bookings.length === 0 ? (
        <View style={styles.empty}><Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text><Text style={{ color: '#94A3B8' }}>No bookings yet</Text></View>
      ) : (
        <FlatList data={bookings} keyExtractor={b => b._id}
          renderItem={({ item: b }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookingDetail', { bookingId: b._id })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={styles.serviceName}>{b.service?.name}</Text>
                  <Text style={styles.garageText}>{b.garage?.name}</Text>
                  <Text style={styles.dateText}>🕐 {new Date(b.scheduledAt).toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ backgroundColor: `${statusColors[b.status]}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                    <Text style={{ color: statusColors[b.status], fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>{b.status.replace('_', ' ')}</Text>
                  </View>
                  <Text style={styles.price}>${b.service?.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )} />
      )}
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2647', padding: 24, paddingTop: 56 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  serviceName: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  garageText: { color: '#94A3B8', fontSize: 13 },
  dateText: { color: '#64748B', fontSize: 12, marginTop: 4 },
  price: { color: GOLD, fontWeight: '700', fontSize: 16, marginTop: 8 },
})
