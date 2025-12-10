<template>
  <div v-if="authError && currentScreen === 'auth'" class="flex items-center justify-center min-h-screen px-4">
    <div class="text-center max-w-md">
      <p class="text-red-500 font-semibold mb-2">Ошибка авторизации</p>
      <p class="text-sm text-muted-foreground mb-4">{{ authError }}</p>
      <p class="text-xs text-muted-foreground">Обновите страницу и попробуйте снова.</p>
    </div>
  </div>
  <AuthScreen v-else-if="currentScreen === 'auth'" :on-login="handleLogin" :is-loading="authLoading" />
  <ContactsScreen v-else-if="currentScreen === 'contacts' && user" :current-user="user" :on-call="handleCall" :on-logout="handleLogout" />
  <CallScreen v-else-if="currentScreen === 'call' && activeCallContact" :contact="activeCallContact" :on-end-call="handleEndCall" :on-accept-call="() => currentScreen = 'call'" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AuthScreen from '@/components/screens/AuthScreen.vue'
import { ContactsScreen } from '@/components/screens/ContactsScreen.vue'
import { CallScreen } from '@/components/screens/CallScreen.vue'
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