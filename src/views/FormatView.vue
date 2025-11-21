<script setup lang="ts">
import AppCard from '@/components/ui/AppCard.vue'
import JsonInputPanel from '@/components/JsonInputPanel.vue'
import JsonOutputPanel from '@/components/JsonOutputPanel.vue'
import SettingsBar from '@/components/SettingsBar.vue'
import { useFormatter } from '@/composables/formatterContext'

const {
  rawInput,
  formattedPreview,
  status,
  statusMessage,
  statusDetails,
  indentOption,
  theme,
  sortKeys,
  autoFormat,
  errorHighlightLine,
  handleFormat,
  handleFileInput,
  handleIndentChange,
  handleThemeChange,
  handleSortChange,
  handleAutoFormatChange,
  handleCopy,
} = useFormatter()
</script>

<template>
  <div class="flex flex-col gap-6">
    <AppCard
      eyebrow="포맷"
      title="JSON 포맷팅에 집중하세요"
      description="입력·설정·결과만 남긴 가벼운 화면입니다. 나머지 도구는 상단 내비게이션에서 확인하세요."
    />

    <SettingsBar
      :indent="indentOption"
      :theme="theme"
      :sort-keys="sortKeys"
      :auto-format="autoFormat"
      @update:indent="handleIndentChange"
      @update:theme="handleThemeChange"
      @update:sort-keys="handleSortChange"
      @update:auto-format="handleAutoFormatChange"
    />

    <section class="grid gap-5 lg:grid-cols-[1.08fr_1fr]">
      <JsonInputPanel
        v-model="rawInput"
        :highlight-line="errorHighlightLine"
        @file-select="handleFileInput"
        @file-drop="handleFileInput"
      />
      <JsonOutputPanel
        :formatted-value="formattedPreview"
        :status="status"
        :message="statusMessage"
        :details="statusDetails"
        @format="handleFormat"
        @minify="() => handleFormat({ minify: true })"
        @copy="handleCopy"
      />
    </section>
  </div>
</template>
