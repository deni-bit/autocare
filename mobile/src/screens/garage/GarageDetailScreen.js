import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert
} from 'react-native'
import { useSelector } from 'react-redux'
import api from '../../utils/api'

const NAVY = '#0A2647'
const NAVY_LIGHT = '#144272'
const GOLD = '#F59E0B'
const TEAL = '#0D9488'
const GREEN = '#10B981'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function GarageDetailScreen({ route, navigation }) {
  const { garage: initialGarage } = route.params
  const { user } = useSelector(state => state.auth)
  const [garage, setGarage] = useState(initialGarage)
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState('services')

  // Booking modal state
  const [showBooking, setShowBooking] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetchGarageDetails()
    fetchReviews()
    fetchVehicles()
  }, [])

  const fetchGarageDetails = async () => {
    try {
      const res = await api.get(`/garages/${initialGarage._id}`)
      setGarage(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/garage/${initialGarage._id}`)
      setReviews(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/auth/me')
      setVehicles(res.data.vehicles || [])
      if (res.data.vehicles?.length > 0) setSelectedVehicle(res.data.vehicles[0])
    } catch (err) { console.error(err) }
  }

  const fetchSlots = async (date) => {
    if (!selectedService || !date) return
    setSlotsLoading(true)
    try {
      const res = await api.get(`/garages/${garage._id}/slots`, {
        params: { date, serviceId: selectedService._id }
      })
      setSlots(res.data.slots || [])
    } catch (err) { console.error(err) }
    finally { setSlotsLoading(false) }
  }

  const openBooking = (service) => {
    setSelectedService(service)
    setSelectedDate('')
    setSelectedSlot(null)
    setSlots([])
    setNotes('')
    setShowBooking(true)
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    fetchSlots(date)
  }

  const handleBook = async () => {
    if (!selectedService) { Alert.alert('Error', 'Please select a service'); return }
    if (!selectedDate) { Alert.alert('Error', 'Please select a date'); return }
    if (!selectedSlot) { Alert.alert('Error', 'Please select a time slot'); return }
    if (!selectedVehicle) { Alert.alert('Error', 'Please add a vehicle first in your profile'); return }

    setBooking(true)
    try {
      await api.post('/bookings', {
        garageId: garage._id,
        serviceId: selectedService._id,
        vehicle: selectedVehicle,
        scheduledAt: selectedSlot.datetime,
        paymentMethod: 'cash',
        customerNotes: notes,
      })
      setShowBooking(false)
      Alert.alert('🎉 Booked!', 'Your booking has been submitted. The garage will confirm shortly.', [
        { text: 'View Bookings', onPress: () => navigation.navigate('Bookings') },
        { text: 'OK' }
      ])
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  // Get today's opening hours
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todayHours = garage.openingHours?.find(h => h.day === today)

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ color: '#fff', fontSize: 16 }}>←</Text>
          </TouchableOpacity>
          <View style={styles.garageIconBig}>
            <Text style={{ fontSize: 36 }}>🏪</Text>
          </View>
          <Text style={styles.garageName}>{garage.name}</Text>
          <Text style={styles.garageAddress}>📍 {garage.location?.address || garage.location?.city || 'Dar es Salaam'}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>⭐ {garage.rating || '0'}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>💬 {garage.reviewCount || 0} reviews</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>🔧 {garage.services?.length || 0} services</Text>
            </View>
            {todayHours && !todayHours.isClosed && (
              <View style={[styles.metaChip, { backgroundColor: 'rgba(16,185,129,0.2)', borderColor: 'rgba(16,185,129,0.4)' }]}>
                <Text style={[styles.metaChipText, { color: GREEN }]}>
                  ● Open {todayHours.open}–{todayHours.close}
                </Text>
              </View>
            )}
          </View>

          {garage.description && (
            <Text style={styles.description}>{garage.description}</Text>
          )}

          {garage.phone && (
            <Text style={styles.phone}>📞 {garage.phone}</Text>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['services', 'reviews', 'hours'].map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'services' ? '🔧 Services' : tab === 'reviews' ? '⭐ Reviews' : '🕐 Hours'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <View>
              {garage.services?.length === 0 ? (
                <Text style={styles.emptyText}>No services available</Text>
              ) : garage.services?.map(service => (
                <View key={service._id} style={styles.serviceCard}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.description && (
                      <Text style={styles.serviceDesc}>{service.description}</Text>
                    )}
                    <View style={styles.serviceMetaRow}>
                      <View style={styles.serviceMetaChip}>
                        <Text style={styles.serviceMetaText}>⏱ {service.duration} mins</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.servicePriceCol}>
                    <Text style={styles.servicePrice}>${service.price}</Text>
                    <TouchableOpacity style={styles.bookServiceBtn} onPress={() => openBooking(service)}>
                      <Text style={styles.bookServiceBtnText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <View>
              {reviews.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>⭐</Text>
                  <Text style={styles.emptyText}>No reviews yet</Text>
                  <Text style={styles.emptySubText}>Be the first to review after booking</Text>
                </View>
              ) : reviews.map(review => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={{ color: NAVY, fontWeight: '700' }}>{review.car_owner?.name?.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.reviewerName}>{review.car_owner?.name}</Text>
                      <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.reviewRating}>
                      <Text style={styles.reviewRatingText}>{'⭐'.repeat(review.rating)}</Text>
                    </View>
                  </View>
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Hours Tab */}
          {activeTab === 'hours' && (
            <View>
              {garage.openingHours?.length === 0 ? (
                <Text style={styles.emptyText}>Opening hours not set</Text>
              ) : DAYS.map(day => {
                const h = garage.openingHours?.find(d => d.day === day)
                const isToday = day === today
                return (
                  <View key={day} style={[styles.hoursRow, isToday && styles.hoursRowToday]}>
                    <Text style={[styles.hoursDay, isToday && { color: GOLD }]}>{day}</Text>
                    {!h || h.isClosed ? (
                      <Text style={styles.hoursClosed}>Closed</Text>
                    ) : (
                      <Text style={[styles.hoursTime, isToday && { color: GOLD }]}>{h.open} – {h.close}</Text>
                    )}
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Now FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => garage.services?.length > 0 && openBooking(garage.services[0])}>
        <Text style={styles.fabText}>📅 Book Now</Text>
      </TouchableOpacity>

      {/* Booking Modal */}
      <Modal visible={showBooking} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Service</Text>
            <TouchableOpacity onPress={() => setShowBooking(false)}>
              <Text style={{ color: '#94A3B8', fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">

            {/* Selected Service */}
            <Text style={styles.modalLabel}>Service</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {garage.services?.map(s => (
                <TouchableOpacity key={s._id} onPress={() => { setSelectedService(s); setSelectedSlot(null); setSlots([]) }}
                  style={[styles.serviceSelectChip, selectedService?._id === s._id && styles.serviceSelectChipActive]}>
                  <Text style={[styles.serviceSelectName, selectedService?._id === s._id && { color: NAVY }]}>{s.name}</Text>
                  <Text style={[styles.serviceSelectPrice, selectedService?._id === s._id && { color: NAVY }]}>${s.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Vehicle */}
            <Text style={styles.modalLabel}>Vehicle</Text>
            {vehicles.length === 0 ? (
              <View style={styles.noVehicle}>
                <Text style={styles.noVehicleText}>No vehicles added. Add one in your Profile.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {vehicles.map(v => (
                  <TouchableOpacity key={v._id} onPress={() => setSelectedVehicle(v)}
                    style={[styles.vehicleChip, selectedVehicle?._id === v._id && styles.vehicleChipActive]}>
                    <Text style={{ fontSize: 20 }}>🚗</Text>
                    <Text style={[styles.vehicleChipText, selectedVehicle?._id === v._id && { color: NAVY }]}>
                      {v.make} {v.model}
                    </Text>
                    <Text style={[{ fontSize: 11, color: '#94A3B8' }, selectedVehicle?._id === v._id && { color: NAVY }]}>
                      {v.plate}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Date */}
            <Text style={styles.modalLabel}>Date</Text>
            <TextInput
              style={styles.modalInput}
              value={selectedDate}
              onChangeText={handleDateChange}
              placeholder="YYYY-MM-DD (e.g. 2026-03-15)"
              placeholderTextColor="#64748B"
            />

            {/* Time Slots */}
            {selectedDate && (
              <>
                <Text style={styles.modalLabel}>Time Slot</Text>
                {slotsLoading ? (
                  <ActivityIndicator color={GOLD} style={{ marginVertical: 16 }} />
                ) : slots.length === 0 ? (
                  <Text style={styles.emptyText}>No slots available for this date</Text>
                ) : (
                  <View style={styles.slotsGrid}>
                    {slots.map((slot, i) => (
                      <TouchableOpacity key={i}
                        disabled={!slot.available}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          !slot.available && styles.slotChipTaken,
                          selectedSlot?.time === slot.time && styles.slotChipSelected,
                        ]}>
                        <Text style={[
                          styles.slotTime,
                          !slot.available && { color: '#475569' },
                          selectedSlot?.time === slot.time && { color: NAVY },
                        ]}>{slot.time}</Text>
                        {!slot.available && <Text style={{ fontSize: 9, color: '#475569' }}>Taken</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Notes */}
            <Text style={styles.modalLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special requests..."
              placeholderTextColor="#64748B"
              multiline
            />

            {/* Summary */}
            {selectedService && selectedSlot && (
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Booking Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Service</Text>
                  <Text style={styles.summaryValue}>{selectedService.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Date & Time</Text>
                  <Text style={styles.summaryValue}>{selectedDate} at {selectedSlot.time}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration</Text>
                  <Text style={styles.summaryValue}>{selectedService.duration} mins</Text>
                </View>
                <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.summaryLabel}>Total</Text>
                  <Text style={[styles.summaryValue, { color: GOLD, fontSize: 18, fontWeight: '700' }]}>${selectedService.price}</Text>
                </View>
              </View>
            )}

            {/* Confirm Button */}
            <TouchableOpacity style={[styles.confirmBtn, booking && { opacity: 0.6 }]}
              onPress={handleBook} disabled={booking}>
              {booking ? (
                <ActivityIndicator color={NAVY} />
              ) : (
                <Text style={styles.confirmBtnText}>✅ Confirm Booking</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: { padding: 24, paddingTop: 56, alignItems: 'center' },
  backBtn: { position: 'absolute', top: 56, left: 24, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  garageIconBig: { width: 80, height: 80, borderRadius: 22, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  garageName: { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  garageAddress: { color: '#94A3B8', fontSize: 14, marginBottom: 14 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 14 },
  metaChip: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  metaChipText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  description: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 10 },
  phone: { color: TEAL, fontSize: 14, fontWeight: '500' },
  tabs: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: GOLD },
  tabText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: NAVY, fontWeight: '700' },
  tabContent: { padding: 24, paddingBottom: 120 },
  serviceCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  serviceInfo: { flex: 1, marginRight: 12 },
  serviceName: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  serviceDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginBottom: 8 },
  serviceMetaRow: { flexDirection: 'row', gap: 8 },
  serviceMetaChip: { backgroundColor: 'rgba(13,148,136,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  serviceMetaText: { color: TEAL, fontSize: 11, fontWeight: '500' },
  servicePriceCol: { alignItems: 'center', justifyContent: 'space-between' },
  servicePrice: { color: GOLD, fontWeight: '700', fontSize: 18, marginBottom: 8 },
  bookServiceBtn: { backgroundColor: GOLD, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  bookServiceBtnText: { color: NAVY, fontWeight: '700', fontSize: 13 },
  reviewCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  reviewerName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  reviewDate: { color: '#64748B', fontSize: 11 },
  reviewRating: { marginLeft: 'auto' },
  reviewRatingText: { fontSize: 12 },
  reviewComment: { color: '#94A3B8', fontSize: 13, lineHeight: 18 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  hoursRowToday: { backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10, paddingHorizontal: 10 },
  hoursDay: { color: '#fff', fontWeight: '500', fontSize: 14 },
  hoursTime: { color: '#94A3B8', fontSize: 14 },
  hoursClosed: { color: '#EF4444', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: '#94A3B8', fontSize: 14, textAlign: 'center' },
  emptySubText: { color: '#475569', fontSize: 12, marginTop: 4 },
  fab: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: GOLD, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: GOLD, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabText: { color: NAVY, fontWeight: '700', fontSize: 16 },
  modal: { flex: 1, backgroundColor: NAVY },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  modalBody: { flex: 1, padding: 24 },
  modalLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '500', marginBottom: 10 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, marginBottom: 20 },
  serviceSelectChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, marginRight: 10, minWidth: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  serviceSelectChipActive: { backgroundColor: GOLD, borderColor: GOLD },
  serviceSelectName: { color: '#fff', fontWeight: '600', fontSize: 13, marginBottom: 4 },
  serviceSelectPrice: { color: GOLD, fontWeight: '700', fontSize: 15 },
  vehicleChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, marginRight: 10, minWidth: 110, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', gap: 4 },
  vehicleChipActive: { backgroundColor: GOLD, borderColor: GOLD },
  vehicleChipText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  noVehicle: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  noVehicleText: { color: '#FCA5A5', fontSize: 13 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  slotChip: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', minWidth: 70 },
  slotChipTaken: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' },
  slotChipSelected: { backgroundColor: GOLD, borderColor: GOLD },
  slotTime: { color: '#fff', fontWeight: '600', fontSize: 14 },
  summary: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  summaryTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  summaryLabel: { color: '#94A3B8', fontSize: 14 },
  summaryValue: { color: '#fff', fontWeight: '600', fontSize: 14 },
  confirmBtn: { backgroundColor: GOLD, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  confirmBtnText: { color: NAVY, fontWeight: '700', fontSize: 16 },
})
