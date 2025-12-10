<template>
  <div class="w-full">
    <div ref="containerRef" class="flex justify-center min-h-[40px]">
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Props {
  botName: string
  buttonSize?: 'large' | 'medium' | 'small'
  usePic?: boolean
  requestAccess?: 'write'
}

const props = withDefaults(defineProps<Props>(), {
  buttonSize: 'large',
  usePic: true,
  requestAccess: 'write'
})

const emit = defineEmits<{
  auth: [user: TelegramAuthData]
}>()

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    TelegramLoginWidget: {
      onAuth: (user: TelegramAuthData) => void
    }
  }
}

const containerRef = ref<HTMLDivElement>()

onMounted(() => {
  if (!containerRef.value) return

  window.TelegramLoginWidget = {
    onAuth: (user: TelegramAuthData) => {
      console.log('Telegram auth callback received:', user.id)
      emit('auth', user)
    }
  }

  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', props.botName)
  script.setAttribute('data-size', props.buttonSize)
  script.setAttribute('data-onauth', 'TelegramLoginWidget.onAuth(user)')
  script.setAttribute('data-request-access', props.requestAccess)
  script.setAttribute('data-auth-url', window.location.origin)
  if (props.usePic) {
    script.setAttribute('data-userpic', 'true')
  }
  script.async = true

  containerRef.value.appendChild(script)
})
</script>