import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../../store/authSlice'

const NAVY = '#0A2647'
const NAVY_LIGHT = '#144272'
const GOLD = '#F59E0B'
const GOLD_DARK = '#D97706'

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch()
  const { loading, error } = useSelector(state => state.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  const handleLogin = () => {
    dispatch(clearError())
    dispatch(loginUser(form))
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}><Text style={{ fontSize: 36 }}>🚗</Text></View>
          <Text style={styles.logoText}>Auto<Text style={{ color: GOLD }}>Care</Text></Text>
          <Text style={styles.logoSub}>Book car services near you</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={v => setForm({ ...form, email: v })}
            placeholder="you@example.com"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.pwContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
              value={form.password}
              onChangeText={v => setForm({ ...form, password: v })}
              placeholder="Your password"
              placeholderTextColor="#64748B"
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
              <Text style={{ fontSize: 18 }}>{showPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={NAVY} /> : <Text style={styles.btnText}>Sign In →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <Text style={[styles.switchText, { color: GOLD, fontWeight: '600' }]}>Sign up free</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: GOLD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  logoText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  logoSub: { color: '#94A3B8', marginTop: 4, fontSize: 14 },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { color: '#94A3B8', fontSize: 14, marginBottom: 24 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, marginBottom: 16 },
  pwContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, marginBottom: 24, paddingRight: 12 },
  eyeBtn: { padding: 8 },
  btn: { backgroundColor: GOLD, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: NAVY, fontWeight: '700', fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchText: { color: '#94A3B8', fontSize: 14 },
})
