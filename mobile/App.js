import { useEffect } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { View, Text, ActivityIndicator } from 'react-native'
import { store } from './src/store/store'
import { loadUser } from './src/store/authSlice'

// Screens
import LoginScreen from './src/screens/auth/LoginScreen'
import RegisterScreen from './src/screens/auth/RegisterScreen'
import HomeScreen from './src/screens/home/HomeScreen'
import GaragesScreen from './src/screens/garage/GaragesScreen'
import GarageDetailScreen from './src/screens/garage/GarageDetailScreen'
import BookingsScreen from './src/screens/booking/BookingsScreen'
import BookingDetailScreen from './src/screens/booking/BookingDetailScreen'
import ProfileScreen from './src/screens/profile/ProfileScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const NAVY = '#0A2647'
const GOLD = '#F59E0B'
const TEAL = '#0D9488'

function TabIcon({ name, focused }) {
  const icons = { Home: '🏠', Garages: '🏪', Bookings: '📋', Profile: '👤' }
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[name]}</Text>
      <Text style={{ fontSize: 10, color: focused ? GOLD : '#94A3B8', fontWeight: focused ? '600' : '400', marginTop: 2 }}>{name}</Text>
    </View>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: NAVY, borderTopColor: 'rgba(255,255,255,0.1)', height: 65, paddingBottom: 8 },
      tabBarShowLabel: false,
    }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }} />
      <Tab.Screen name="Garages" component={GaragesScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Garages" focused={focused} /> }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Bookings" focused={focused} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }} />
    </Tab.Navigator>
  )
}

function AppNavigator() {
  const dispatch = useDispatch()
  const { token, initialized } = useSelector(state => state.auth)

  useEffect(() => { dispatch(loadUser()) }, [])

  if (!initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 32, marginBottom: 16 }}>🚗</Text>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 24 }}>Auto<Text style={{ color: GOLD }}>Care</Text></Text>
        <ActivityIndicator color={GOLD} style={{ marginTop: 24 }} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="GarageDetail" component={GarageDetailScreen} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  )
}
