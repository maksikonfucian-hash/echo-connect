<template>
  <div class="p-4">
    <h1>Contacts</h1>
    <p>Welcome {{ currentUser.first_name }}</p>
    <button @click="onLogout" class="bg-red-500 text-white px-4 py-2">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { TelegramUser } from '@/hooks/useTelegramAuth'
import { User } from '@/types/app'

interface Props {
  currentUser: TelegramUser
  onCall: (contact: User) => void
  onLogout: () => void
}

defineProps<Props>()
</script>