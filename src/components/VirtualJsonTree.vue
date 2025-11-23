<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

type FlatNode = {
  path: string
  label?: string | number
  value: unknown
  depth: number
  isExpandable: boolean
}

const props = defineProps<{
  data: unknown | null
}>()

const itemHeight = 28
const buffer = 8

const scrollTop = ref(0)
const viewportHeight = ref(360)
const containerRef = ref<HTMLElement | null>(null)
const openPaths = reactive<Set<string>>(new Set(['root']))

const formatValue = (value: unknown, expandable: boolean) => {
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return value.toString()
  if (expandable) {
    if (Array.isArray(value)) return `Array (${value.length})`
    if (typeof value === 'object') return `Object (${Object.keys(value ?? {}).length})`
  }
  return String(value)
}

const buildFlatNodes = (value: unknown, path: string, depth: number, label?: string | number) => {
  const list: FlatNode[] = []
  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value)
  const isArray = Array.isArray(value)
  const isExpandable = isObject || isArray

  list.push({ path, label, value, depth, isExpandable })

  if (isExpandable && openPaths.has(path)) {
    const entries = isObject
      ? Object.entries(value as Record<string, unknown>)
      : (value as unknown[]).map((item, index) => [index, item] as const)
    for (const [childKey, childValue] of entries) {
      list.push(...buildFlatNodes(childValue, `${path}.${String(childKey)}`, depth + 1, childKey))
    }
  }

  return list
}

const flatNodes = computed(() => {
  if (!props.data) return []
  return buildFlatNodes(props.data, 'root', 0)
})

const togglePath = (path: string) => {
  if (openPaths.has(path)) {
    openPaths.delete(path)
  } else {
    openPaths.add(path)
  }
}

const visibleRange = computed(() => {
  const start = Math.max(Math.floor(scrollTop.value / itemHeight) - buffer, 0)
  const visibleCount = Math.ceil(viewportHeight.value / itemHeight) + buffer * 2
  const end = start + visibleCount
  return { start, end }
})

const visibleNodes = computed(() => {
  const { start, end } = visibleRange.value
  return flatNodes.value.slice(start, end)
})

const paddingTop = computed(() => visibleRange.value.start * itemHeight)
const paddingBottom = computed(() => {
  const { end } = visibleRange.value
  const remaining = Math.max(flatNodes.value.length - end, 0)
  return remaining * itemHeight
})

const handleScroll = () => {
  if (!containerRef.value) return
  scrollTop.value = containerRef.value.scrollTop
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const el = containerRef.value
  if (!el) return
  viewportHeight.value = el.clientHeight
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      viewportHeight.value = el.clientHeight
    })
    resizeObserver.observe(el)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(
  () => props.data,
  () => {
    openPaths.clear()
    openPaths.add('root')
    if (containerRef.value) containerRef.value.scrollTop = 0
    scrollTop.value = 0
  }
)
</script>

<template>
  <div
    ref="containerRef"
    class="relative h-full overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]"
    @scroll="handleScroll"
  >
    <p v-if="!props.data" class="p-4 text-sm text-[var(--color-muted)]">포맷된 JSON이 없습니다.</p>
    <div v-else class="relative">
      <div :style="{ height: `${paddingTop}px` }" />
      <div>
        <div
          v-for="node in visibleNodes"
          :key="node.path"
          class="flex items-start gap-2 px-3"
          :style="{ paddingLeft: `${node.depth * 16 + 8}px`, height: `${itemHeight}px` }"
        >
          <div class="mt-[4px] h-5 w-5 shrink-0">
            <button
              v-if="node.isExpandable"
              type="button"
              class="flex h-5 w-5 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-background)] text-xs font-semibold text-[var(--color-heading)]"
              :aria-expanded="openPaths.has(node.path)"
              @click="togglePath(node.path)"
            >
              {{ openPaths.has(node.path) ? '-' : '+' }}
            </button>
          </div>
          <div class="flex-1 text-sm font-mono text-[var(--color-heading)]">
            <span class="text-[var(--color-muted)]">{{ node.label }}</span>
            <span v-if="node.label !== undefined">: </span>
            <span :class="node.isExpandable ? 'text-[var(--color-muted)]' : ''">
              {{ formatValue(node.value, node.isExpandable) }}
            </span>
          </div>
        </div>
      </div>
      <div :style="{ height: `${paddingBottom}px` }" />
    </div>
  </div>
</template>
