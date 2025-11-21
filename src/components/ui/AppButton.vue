<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'neutral' | 'ghost' | 'warning' | 'success'
type Size = 'sm' | 'md'
type Tag = 'button' | 'label'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    block?: boolean
    disabled?: boolean
    tag?: Tag
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'neutral',
    size: 'md',
    block: false,
    disabled: false,
    tag: 'button',
    type: 'button',
  }
)

const toneClass = computed(() => {
  const tones: Record<Variant, string> = {
    primary:
      'border-sky-200 bg-sky-500 text-white hover:shadow focus-visible:ring-sky-200 focus-visible:ring-offset-0',
    neutral:
      'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-heading)] focus-visible:ring-[var(--color-border)]',
    ghost:
      'border-transparent bg-transparent text-[var(--color-heading)] hover:bg-[var(--color-background)] focus-visible:ring-[var(--color-border)]',
    warning:
      'border-amber-200 bg-amber-100 text-amber-800 hover:shadow focus-visible:ring-amber-200 focus-visible:ring-offset-0',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-800 hover:shadow focus-visible:ring-emerald-200 focus-visible:ring-offset-0',
  }
  return tones[props.variant]
})

const sizeClass = computed(() => (props.size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'))
</script>

<template>
  <component
    :is="props.tag"
    :type="props.tag === 'button' ? props.type : undefined"
    class="inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
    :class="[toneClass, sizeClass, { 'w-full': props.block }]"
    :disabled="props.disabled"
  >
    <slot />
  </component>
</template>
