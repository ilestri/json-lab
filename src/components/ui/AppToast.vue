<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    message: string
    visible: boolean
    tone?: 'info' | 'success' | 'error'
  }>(),
  {
    tone: 'info',
  }
)

const toneClass = {
  info: 'border-slate-700 bg-slate-900 text-white',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
}
</script>

<template>
  <div
    v-if="props.visible"
    class="fixed right-4 top-4 z-50 w-[280px] rounded-xl px-4 py-3 text-sm shadow-lg transition-opacity"
    :class="toneClass[props.tone]"
    role="status"
    aria-live="polite"
  >
    {{ props.message }}
  </div>
</template>
