import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native'
import { useSelector } from 'react-redux'
import api from '../../utils/api'

const NAVY = '#0A2647'
const NAVY_LIGHT = '#144272'
const GOLD = '#F59E0B'
const TEAL = '#0D9488'

const categories = [
  { id: 'all', label: 'All', icon: '🔍' },
  { id: 'wash', label: 'Car Wash', icon: '🚿' },
  { id: 'oil', label: 'Oil Change', icon: '🛢️' },
  { id: 'tyre', label: 'Tyres', icon: '🔄' },
  { id: 'repair', label: 'Repair', icon: '🔧' },
  { id: 'detail', label: 'Detailing', icon: '✨' },
]

export default function HomeScreen({ navigation }) {
  const { user } = useSelector(state => state.auth)
  const [garages, setGarages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => { fetchGarages() }, [selectedCategory])

  const fetchGarages = async () => {
    setLoading(true)
    try {
      const params = { limit: 20 }
      if (selectedCategory !== 'all') params.service = selectedCategory
      if (search) params.search = search
      const res = await api.get('/garages', { params })
      setGarages(res.data.garages)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.name}>{user?.name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search garages..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchGarages}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat.id)}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}>
              <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
              <Text style={[styles.categoryLabel, selectedCategory === cat.id && { color: NAVY }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Banner */}
        <View style={styles.banner}>
          <View>
            <Text style={styles.bannerTitle}>Book a Service</Text>
            <Text style={styles.bannerSub}>Find the best garage near you</Text>
          </View>
          <Text style={{ fontSize: 48 }}>🏎️</Text>
        </View>

        {/* Garages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Garages</Text>
          {loading ? (
            <ActivityIndicator color={GOLD} style={{ marginTop: 32 }} />
          ) : garages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🏪</Text>
              <Text style={styles.emptyText}>No garages found</Text>
            </View>
          ) : garages.map(garage => (
            <TouchableOpacity key={garage._id} style={styles.garageCard}
              onPress={() => navigation.navigate('GarageDetail', { garage })}>
              <View style={styles.garageTop}>
                <View style={styles.garageIconBox}>
                  <Text style={{ fontSize: 24 }}>🏪</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.garageName}>{garage.name}</Text>
                    {garage.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
                    {garage.isFeatured && <Text style={styles.featuredBadge}>⭐</Text>}
                  </View>
                  <Text style={styles.garageAddress}>📍 {garage.location?.address || garage.location?.city || 'Dar es Salaam'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <Text style={styles.rating}>⭐ {garage.rating || '0'}</Text>
                    <Text style={styles.reviews}>({garage.reviewCount || 0} reviews)</Text>
                  </View>
                </View>
              </View>

              {/* Services preview */}
              {garage.services?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                  {garage.services.slice(0, 4).map(s => (
                    <View key={s._id} style={styles.serviceChip}>
                      <Text style={styles.serviceChipText}>{s.name}</Text>
                      <Text style={styles.serviceChipPrice}>${s.price}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity style={styles.bookBtn}
                onPress={() => navigation.navigate('GarageDetail', { garage })}>
                <Text style={styles.bookBtnText}>View & Book →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 56 },
  greeting: { color: '#94A3B8', fontSize: 14 },
  name: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: NAVY_LIGHT, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: NAVY_LIGHT, borderRadius: 14, marginHorizontal: 24, padding: 12, marginBottom: 16 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  categories: { paddingHorizontal: 20, marginBottom: 20 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: NAVY_LIGHT, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  categoryChipActive: { backgroundColor: GOLD },
  categoryLabel: { color: '#fff', fontSize: 13, fontWeight: '500' },
  banner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: NAVY_LIGHT, borderRadius: 20, marginHorizontal: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  bannerSub: { color: '#94A3B8', fontSize: 13 },
  section: { paddingHorizontal: 24, paddingBottom: 100 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
  garageCard: { backgroundColor: NAVY_LIGHT, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  garageTop: { flexDirection: 'row', alignItems: 'flex-start' },
  garageIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center' },
  garageName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  garageAddress: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  rating: { color: GOLD, fontSize: 13, fontWeight: '600' },
  reviews: { color: '#64748B', fontSize: 12 },
  verifiedBadge: { backgroundColor: 'rgba(13,148,136,0.2)', color: TEAL, fontSize: 11, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  featuredBadge: { fontSize: 14 },
  serviceChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  serviceChipText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  serviceChipPrice: { color: GOLD, fontSize: 11, marginTop: 2, fontWeight: '600' },
  bookBtn: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  bookBtnText: { color: GOLD, fontWeight: '700', fontSize: 14 },
})
