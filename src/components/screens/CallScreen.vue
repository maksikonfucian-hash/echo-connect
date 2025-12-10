<template>
  <div class="p-4">
    <h1>Call with {{ contact.first_name }}</h1>
    <button @click="onEndCall" class="bg-red-500 text-white px-4 py-2">End Call</button>
  </div>
</template>

<script setup lang="ts">
import { User } from '@/types/app'

interface Props {
  contact: User
  onEndCall: () => void
  onAcceptCall: () => void
}

defineProps<Props>()
</script>