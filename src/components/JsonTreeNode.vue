<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string | number
    node: unknown
    depth?: number
  }>(),
  {
    depth: 0,
  }
)

const isObject = computed(
  () => props.node !== null && typeof props.node === 'object' && !Array.isArray(props.node)
)
const isArray = computed(() => Array.isArray(props.node))
const expandable = computed(() => isObject.value || isArray.value)
const open = ref(props.depth === 0 ? true : false)

type Entry = [string | number, unknown]

const entries = computed<Entry[]>(() => {
  if (isObject.value) {
    return Object.entries(props.node as Record<string, unknown>)
  }
  if (isArray.value) {
    return (props.node as unknown[]).map((value, index) => [index, value])
  }
  return []
})

const prettyValue = computed(() => {
  if (props.node === null) return 'null'
  if (typeof props.node === 'string') return `"${props.node}"`
  if (typeof props.node === 'boolean') return props.node ? 'true' : 'false'
  if (typeof props.node === 'number') return props.node.toString()
  if (expandable.value) return isArray.value ? '[]' : '{}'
  return String(props.node)
})

const arrayLength = computed(() => (isArray.value ? (props.node as unknown[]).length : 0))
const objectKeyCount = computed(() =>
  isObject.value ? Object.keys(props.node as Record<string, unknown>).length : 0
)
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-start gap-2">
      <div class="mt-[2px] h-5 w-5">
        <button
          v-if="expandable"
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-background)] text-xs font-semibold text-[var(--color-heading)]"
          @click="open = !open"
        >
          {{ open ? '-' : '+' }}
        </button>
      </div>
      <div class="flex-1 text-sm font-mono text-[var(--color-heading)]">
        <span class="text-[var(--color-muted)]">{{ label }}</span>
        <span v-if="label !== undefined">: </span>
        <span :class="expandable ? 'text-[var(--color-muted)]' : ''">{{ prettyValue }}</span>
        <span v-if="isArray" class="text-xs text-[var(--color-muted)]"> ({{ arrayLength }}) </span>
        <span v-if="isObject" class="text-xs text-[var(--color-muted)]">
          ({{ objectKeyCount }})
        </span>
      </div>
    </div>
    <div v-if="expandable && open" class="pl-6">
      <div
        v-for="[key, value] in entries"
        :key="key"
        class="border-l border-dashed border-[var(--color-border)] pl-3"
      >
        <JsonTreeNode :label="key" :node="value" :depth="props.depth + 1" />
      </div>
    </div>
  </div>
</template>
