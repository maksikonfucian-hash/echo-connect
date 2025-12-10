<template>
  <div class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Header -->
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="w-32 h-32 mx-auto mb-8 bg-gray-700 rounded-full flex items-center justify-center">
          <img
            :src="contact.avatar || 'https://via.placeholder.com/128'"
            :alt="contact.name"
            class="w-28 h-28 rounded-full"
          />
        </div>
        <h1 class="text-2xl font-semibold text-white mb-2">{{ contact.name }}</h1>
        <p class="text-gray-400">{{ callStatus }}</p>
        <p v-if="duration" class="text-white text-lg mt-2">{{ formatDuration(duration) }}</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="pb-8 px-6">
      <div class="flex justify-center space-x-6">
        <!-- Mute button -->
        <button
          @click="toggleMute"
          class="w-16 h-16 rounded-full flex items-center justify-center"
          :class="isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="isMuted" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
        </button>

        <!-- Speaker button -->
        <button
          @click="toggleSpeaker"
          class="w-16 h-16 rounded-full flex items-center justify-center bg-gray-600 hover:bg-gray-500"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9l-3-3m3 3l3-3"></path>
          </svg>
        </button>

        <!-- End call button -->
        <button
          @click="onEndCall"
          class="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2 2m-2-2v4m0 8l-2 2m0 0l2-2m0 2H8m8-4l-2-2m0 0l2 2m0-2h4"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { User } from '@/types/app'

interface Props {
  contact: User
  onEndCall: () => void
  onAcceptCall: () => void
}

const props = defineProps<Props>()

const callStatus = ref('Вызов...')
const duration = ref(0)
const isMuted = ref(false)
const isSpeakerOn = ref(true)

let durationInterval: number | null = null

onMounted(() => {
  callStatus.value = 'В разговоре'
  // Start duration timer
  durationInterval = setInterval(() => {
    duration.value++
  }, 1000)
})

onUnmounted(() => {
  if (durationInterval) {
    clearInterval(durationInterval)
  }
})

const toggleMute = () => {
  isMuted.value = !isMuted.value
  // TODO: Implement actual mute functionality
}

const toggleSpeaker = () => {
  isSpeakerOn.value = !isSpeakerOn.value
  // TODO: Implement actual speaker functionality
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>