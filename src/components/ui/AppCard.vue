<script setup lang="ts">
import { computed, useSlots } from 'vue'

const slots = useSlots()

const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    description?: string
    role?: string
  }>(),
  {
    role: 'region',
  }
)

const hasIntro = computed(
  () => !!(props.eyebrow || props.title || props.description || slots.actions)
)
</script>

<template>
  <section
    :role="props.role"
    class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
  >
    <div v-if="hasIntro" class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p
          v-if="props.eyebrow"
          class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]"
        >
          {{ props.eyebrow }}
        </p>
        <h2 v-if="props.title" class="text-lg font-semibold text-[var(--color-heading)]">
          {{ props.title }}
        </h2>
        <p v-if="props.description" class="text-sm text-[var(--color-muted)]">
          {{ props.description }}
        </p>
      </div>
      <div v-if="slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="slots.header" class="mt-2">
      <slot name="header" />
    </div>

    <div :class="{ 'mt-4': hasIntro || slots.header }">
      <slot />
    </div>
  </section>
</template>
