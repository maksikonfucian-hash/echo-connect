<template>
  <div>
    <h1>Echo Connect Debug</h1>
    <p>Current screen: {{ currentScreen }}</p>
    <p>User: {{ user ? user.first_name : 'None' }}</p>
    <p>Loading: {{ authLoading }}</p>
    <p>Error: {{ authError }}</p>
    <button @click="handleLogout" v-if="user">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AuthScreen from '@/components/screens/AuthScreen.vue'
import ContactsScreen from '@/components/screens/ContactsScreen.vue'
import CallScreen from '@/components/screens/CallScreen.vue'
import { useTelegramAuth, TelegramUser } from '@/hooks/useTelegramAuth'
import { User } from '@/types/app'

type Screen = 'auth' | 'contacts' | 'call'

const { user, loading: authLoading, error: authError, logout } = useTelegramAuth()
const currentScreen = ref<Screen>('auth')
const activeCallContact = ref<User | null>(null)

watch(user, (newUser) => {
  currentScreen.value = newUser ? 'contacts' : 'auth'
})

const handleLogin = async (authData: TelegramUser) => {
  console.log('Login successful:', authData)
}

const handleLogout = async () => {
  await logout()
  currentScreen.value = 'auth'
}

const handleCall = (contact: User) => {
  activeCallContact.value = contact
  currentScreen.value = 'call'
}

const handleEndCall = () => {
  activeCallContact.value = null
  currentScreen.value = 'contacts'
}
</script>