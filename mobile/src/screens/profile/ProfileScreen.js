import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import AsyncStorage from '@react-native-async-storage/async-storage'
const NAVY = '#0A2647'
const GOLD = '#F59E0B'
export default function ProfileScreen() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const handleLogout = async () => {
    await AsyncStorage.removeItem('autocare_token')
    await AsyncStorage.removeItem('autocare_user')
    dispatch(logout())
  }
  return (
    <View style={styles.container}>
      <View style={styles.avatar}><Text style={{ fontSize: 36, fontWeight: '700', color: NAVY }}>{user?.name?.charAt(0).toUpperCase()}</Text></View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <View style={styles.badge}><Text style={{ color: NAVY, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' }}>{user?.role?.replace('_', ' ')}</Text></View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center', padding: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: GOLD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  name: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  email: { color: '#94A3B8', fontSize: 14, marginBottom: 12 },
  badge: { backgroundColor: GOLD, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 40 },
  logoutBtn: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
})
