import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError } from '../../store/authSlice'

const NAVY = '#0A2647'
const GOLD = '#F59E0B'

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch()
  const { loading, error } = useSelector(state => state.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'car_owner' })
  const [showPw, setShowPw] = useState(false)

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.logoSection}>
          <View style={styles.logoIcon}><Text style={{ fontSize: 36 }}>🚗</Text></View>
          <Text style={styles.logoText}>Auto<Text style={{ color: GOLD }}>Care</Text></Text>
          <Text style={styles.logoSub}>Join thousands of drivers</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Sign up to book car services</Text>

          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

          {[
            { label: 'Full Name', field: 'name', placeholder: 'Denis Steven', type: 'default' },
            { label: 'Email', field: 'email', placeholder: 'you@example.com', type: 'email-address' },
            { label: 'Phone', field: 'phone', placeholder: '+255700000000', type: 'phone-pad' },
          ].map(({ label, field, placeholder, type }) => (
            <View key={field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput style={styles.input} value={form[field]} onChangeText={v => setForm({ ...form, [field]: v })}
                placeholder={placeholder} placeholderTextColor="#64748B" keyboardType={type} autoCapitalize={field === 'email' ? 'none' : 'words'} />
            </View>
          ))}

          <Text style={styles.label}>Password</Text>
          <View style={styles.pwContainer}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]} value={form.password}
              onChangeText={v => setForm({ ...form, password: v })} placeholder="Min. 8 characters"
              placeholderTextColor="#64748B" secureTextEntry={!showPw} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 8 }}>
              <Text style={{ fontSize: 18 }}>{showPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={() => dispatch(registerUser(form))} disabled={loading}>
            {loading ? <ActivityIndicator color={NAVY} /> : <Text style={styles.btnText}>Create Account →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <Text style={[styles.switchText, { color: GOLD, fontWeight: '600' }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  logoSub: { color: '#94A3B8', marginTop: 4, fontSize: 13 },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { color: '#94A3B8', fontSize: 13, marginBottom: 20 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 13, color: '#fff', fontSize: 14, marginBottom: 14 },
  pwContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, marginBottom: 22, paddingRight: 10 },
  btn: { backgroundColor: GOLD, borderRadius: 14, padding: 15, alignItems: 'center', shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: NAVY, fontWeight: '700', fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  switchText: { color: '#94A3B8', fontSize: 13 },
})
