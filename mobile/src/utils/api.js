import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5001/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('autocare_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('autocare_token')
      await AsyncStorage.removeItem('autocare_user')
    }
    return Promise.reject(error)
  }
)

export default api
