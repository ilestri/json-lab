<script setup lang="ts">
import { computed } from 'vue'

type Tone = 'info' | 'success' | 'danger' | 'warning' | 'muted'

const props = withDefaults(
  defineProps<{
    label: string
    icon?: string
    tone?: Tone
  }>(),
  {
    tone: 'info',
  }
)

const toneStyle = computed(() => {
  const tones: Record<Tone, { classes: string; icon?: string }> = {
    info: {
      classes: 'text-slate-700 bg-slate-50 border-slate-200',
      icon: '⏸️',
    },
    success: {
      classes: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: '✅',
    },
    danger: {
      classes: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: '❌',
    },
    warning: {
      classes: 'text-amber-700 bg-amber-50 border-amber-200',
      icon: '⚠️',
    },
    muted: {
      classes: 'text-slate-600 bg-slate-50 border-slate-200',
      icon: 'ℹ️',
    },
  }
  return tones[props.tone]
})

const resolvedIcon = computed(() => props.icon ?? toneStyle.value.icon)
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium"
    :class="toneStyle.classes"
  >
    <span v-if="resolvedIcon" aria-hidden="true">
      {{ resolvedIcon }}
    </span>
    <span>{{ props.label }}</span>
  </span>
</template>
