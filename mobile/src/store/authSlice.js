import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../utils/api'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', credentials)
    await AsyncStorage.setItem('autocare_token', res.data.token)
    await AsyncStorage.setItem('autocare_user', JSON.stringify(res.data.user))
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    await AsyncStorage.setItem('autocare_token', res.data.token)
    await AsyncStorage.setItem('autocare_user', JSON.stringify(res.data.user))
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const loadUser = createAsyncThunk('auth/load', async () => {
  const token = await AsyncStorage.getItem('autocare_token')
  const user = await AsyncStorage.getItem('autocare_user')
  if (token && user) return { token, user: JSON.parse(user) }
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null, initialized: false },
  reducers: {
    logout: async (state) => {
      state.user = null
      state.token = null
      await AsyncStorage.removeItem('autocare_token')
      await AsyncStorage.removeItem('autocare_user')
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        state.initialized = true
        if (action.payload) { state.token = action.payload.token; state.user = action.payload.user }
      })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.token = action.payload.token; state.user = action.payload.user
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.token = action.payload.token; state.user = action.payload.user
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
