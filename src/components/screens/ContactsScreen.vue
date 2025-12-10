<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-md mx-auto bg-white min-h-screen">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h1 class="text-xl font-semibold text-gray-900">Контакты</h1>
        <button @click="onLogout" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>

      <!-- Welcome message -->
      <div class="p-4 bg-blue-50">
        <p class="text-blue-800">Добро пожаловать, {{ currentUser.first_name }}!</p>
      </div>

      <!-- Contacts list -->
      <div class="divide-y divide-gray-200">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          @click="onCall(contact)"
          class="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
        >
          <div class="flex-shrink-0">
            <img
              :src="contact.avatar || 'https://via.placeholder.com/48'"
              :alt="contact.name"
              class="w-12 h-12 rounded-full"
            />
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">{{ contact.name }}</p>
            <p class="text-sm text-gray-500">{{ contact.username }}</p>
          </div>
          <div class="flex-shrink-0">
            <div
              class="w-3 h-3 rounded-full"
              :class="contact.status === 'online' ? 'bg-green-400' : 'bg-gray-400'"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TelegramUser } from '@/hooks/useTelegramAuth'
import { User } from '@/types/app'
import { mockContacts } from '@/data/mockContacts'

interface Props {
  currentUser: TelegramUser
  onCall: (contact: User) => void
  onLogout: () => void
}

defineProps<Props>()

const contacts = mockContacts
</script>