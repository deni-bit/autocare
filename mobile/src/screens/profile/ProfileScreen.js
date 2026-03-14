import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../utils/api'

const NAVY = '#0A2647'
const NAVY_LIGHT = '#144272'
const GOLD = '#F59E0B'
const TEAL = '#0D9488'

export default function ProfileScreen() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [vehicles, setVehicles] = useState([])
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: '', plate: '', color: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchVehicles() }, [])

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/auth/me')
      setVehicles(res.data.vehicles || [])
    } catch (err) { console.error(err) }
  }

  const handleAddVehicle = async () => {
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.plate) {
      Alert.alert('Error', 'Make, model and plate are required')
      return
    }
    setSaving(true)
    try {
      await api.post('/auth/vehicles', vehicleForm)
      setShowVehicleModal(false)
      setVehicleForm({ make: '', model: '', year: '', plate: '', color: '' })
      fetchVehicles()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add vehicle')
    } finally { setSaving(false) }
  }

  const handleDeleteVehicle = async (vehicleId, name) => {
    Alert.alert('Delete Vehicle', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/auth/vehicles/${vehicleId}`)
          fetchVehicles()
        } catch (err) { Alert.alert('Error', 'Failed to delete') }
      }}
    ])
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem('autocare_token')
    await AsyncStorage.removeItem('autocare_user')
    dispatch(logout())
  }

  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 13, color: '#fff', fontSize: 14, marginBottom: 14 }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36, fontWeight: '700', color: NAVY }}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phone && <Text style={styles.phone}>📞 {user.phone}</Text>}
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      {/* Wallet */}
      <View style={styles.walletCard}>
        <View>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletAmount}>${user?.walletBalance?.toFixed(2) || '0.00'}</Text>
        </View>
        <Text style={{ fontSize: 36 }}>💰</Text>
      </View>

      {/* My Vehicles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Vehicles</Text>
          <TouchableOpacity onPress={() => setShowVehicleModal(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {vehicles.length === 0 ? (
          <View style={styles.emptyVehicles}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🚗</Text>
            <Text style={{ color: '#94A3B8', fontSize: 14 }}>No vehicles added yet</Text>
            <TouchableOpacity onPress={() => setShowVehicleModal(true)} style={[styles.addBtn, { marginTop: 12 }]}>
              <Text style={styles.addBtnText}>+ Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : vehicles.map(v => (
          <View key={v._id} style={styles.vehicleCard}>
            <View style={styles.vehicleIcon}>
              <Text style={{ fontSize: 24 }}>🚗</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.vehicleName}>{v.make} {v.model} {v.year && `(${v.year})`}</Text>
              <Text style={styles.vehiclePlate}>{v.plate}</Text>
              {v.color && <Text style={styles.vehicleColor}>{v.color}</Text>}
            </View>
            <TouchableOpacity onPress={() => handleDeleteVehicle(v._id, `${v.make} ${v.model}`)}>
              <Text style={{ color: '#EF4444', fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {[
          { icon: '🔔', label: 'Notifications', onPress: () => {} },
          { icon: '🔒', label: 'Change Password', onPress: () => {} },
          { icon: '📞', label: 'Support', onPress: () => {} },
          { icon: '📄', label: 'Terms & Privacy', onPress: () => {} },
        ].map(item => (
          <TouchableOpacity key={item.label} style={styles.settingRow} onPress={item.onPress}>
            <Text style={{ fontSize: 20, marginRight: 14 }}>{item.icon}</Text>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={{ color: '#475569', marginLeft: 'auto' }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />

      {/* Add Vehicle Modal */}
      <Modal visible={showVehicleModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: NAVY, padding: 24, paddingTop: 48 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Add Vehicle</Text>
            <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
              <Text style={{ color: '#94A3B8', fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {[
            { label: 'Make *', field: 'make', placeholder: 'Toyota' },
            { label: 'Model *', field: 'model', placeholder: 'Camry' },
            { label: 'Year', field: 'year', placeholder: '2020' },
            { label: 'Plate Number *', field: 'plate', placeholder: 'T 123 ABC' },
            { label: 'Color', field: 'color', placeholder: 'White' },
          ].map(({ label, field, placeholder }) => (
            <View key={field}>
              <Text style={{ color: '#94A3B8', fontSize: 13, marginBottom: 6 }}>{label}</Text>
              <TextInput style={inputStyle} value={vehicleForm[field]}
                onChangeText={v => setVehicleForm({ ...vehicleForm, [field]: v })}
                placeholder={placeholder} placeholderTextColor="#64748B" />
            </View>
          ))}

          <TouchableOpacity onPress={handleAddVehicle} disabled={saving}
            style={{ backgroundColor: GOLD, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 }}>
            {saving ? <ActivityIndicator color={NAVY} /> : <Text style={{ color: NAVY, fontWeight: '700', fontSize: 16 }}>Add Vehicle</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: GOLD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  name: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  email: { color: '#94A3B8', fontSize: 14, marginBottom: 4 },
  phone: { color: TEAL, fontSize: 14, marginBottom: 10 },
  roleBadge: { backgroundColor: GOLD, paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20 },
  roleText: { color: NAVY, fontWeight: '700', fontSize: 12 },
  walletCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: NAVY_LIGHT, borderRadius: 20, marginHorizontal: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  walletLabel: { color: '#94A3B8', fontSize: 13, marginBottom: 4 },
  walletAmount: { color: GOLD, fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  addBtn: { backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  addBtnText: { color: GOLD, fontWeight: '600', fontSize: 13 },
  emptyVehicles: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  vehicleIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center' },
  vehicleName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  vehiclePlate: { color: GOLD, fontSize: 13, fontWeight: '500', marginTop: 2 },
  vehicleColor: { color: '#64748B', fontSize: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  settingLabel: { color: '#fff', fontSize: 15, fontWeight: '500' },
  logoutBtn: { marginHorizontal: 24, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 16, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
})
