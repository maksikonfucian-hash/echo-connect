<template>
  <div v-if="!botUsername" class="flex items-center justify-center min-h-screen px-4">
    <div class="w-full max-w-md">
      <h1 class="text-xl font-bold">Ошибка конфигурации</h1>
      <p>Не указан username Telegram-бота в переменных окружения.</p>
    </div>
  </div>
  <div v-else class="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Echo Connect</h1>
        <p class="text-gray-600">Войдите через Telegram для доступа к звонкам</p>
      </div>
      <div class="space-y-4">
        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
        <TelegramLoginButton v-else :bot-name="botUsername" @auth="handleAuth" button-size="large" :use-pic="true" />
        <p class="text-sm text-gray-600 text-center">Авторизуйтесь, чтобы начать общение</p>
        <p class="text-xs text-gray-500 text-center mt-2">Примечание: Убедитесь, что в настройках Telegram-бота установлен домен веб-приложения через /setdomain в BotFather. Для локальной разработки используйте ngrok и установите HTTPS URL.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TelegramLoginButton from '@/components/TelegramLoginButton.vue'

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface Props {
  onLogin: (authData: TelegramAuthData) => void
  isLoading: boolean
}

const props = defineProps<Props>()

const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME

const handleAuth = (user: TelegramAuthData) => {
  const event = new CustomEvent('telegram-auth', { detail: user })
  window.dispatchEvent(event)
  props.onLogin(user)
}
</script>