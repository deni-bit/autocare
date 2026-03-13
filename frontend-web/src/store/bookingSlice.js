import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/api'

export const fetchBookings = createAsyncThunk('bookings/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings', { params })
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/bookings/${id}/status`, { status })
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    list: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    updateBookingInList: (state, action) => {
      const idx = state.list.findIndex(b => b._id === action.payload._id)
      if (idx > -1) state.list[idx] = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => { state.loading = true })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.bookings
        state.total = action.payload.total
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex(b => b._id === action.payload._id)
        if (idx > -1) state.list[idx] = action.payload
      })
  }
})

export const { updateBookingInList } = bookingSlice.actions
export default bookingSlice.reducer
