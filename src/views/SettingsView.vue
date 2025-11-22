<script setup lang="ts">
import { computed } from 'vue'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { useFormatter } from '@/composables/formatterContext'
import { formatJson } from '@/utils/jsonFormatter'

const {
  indentOption,
  sortKeys,
  autoFormat,
  preferredMinify,
  autoFormatUpload,
  autoFormatFetch,
  theme,
  handleIndentChange,
  handleSortChange,
  handleAutoFormatChange,
  handlePreferredMinifyChange,
  handleAutoFormatUploadChange,
  handleAutoFormatFetchChange,
  handleThemeChange,
  resetSettings,
  showToast,
} = useFormatter()

const samplePreview = {
  id: 'settings-preview',
  note: '설정 변경 시 샘플이 갱신됩니다.',
  features: ['format', 'sort', 'theme'],
  meta: { version: 2, autoFormat: true },
}

const sampleFormatted = computed(() =>
  formatJson(samplePreview, {
    indent: indentOption.value,
    sortKeys: sortKeys.value,
    minify: preferredMinify.value,
  })
)
</script>

<template>
  <div class="flex flex-col gap-5">
    <AppCard
      eyebrow="Settings"
      title="설정을 한 번에 관리하세요"
      description="모든 변경 사항은 로컬에 자동 저장됩니다."
    >
      <div class="flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
        <span class="rounded-full bg-[var(--color-background)] px-2 py-1">자동 저장</span>
        <span class="rounded-full bg-[var(--color-background)] px-2 py-1">로컬 스토리지 보관</span>
        <span class="rounded-full bg-[var(--color-background)] px-2 py-1">포맷 단축키: Ctrl/Cmd + Enter</span>
      </div>
    </AppCard>

    <div class="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="space-y-4">
        <AppCard
          eyebrow="포맷 기본값"
          title="들여쓰기 · 정렬 · 출력 모드"
          description="포맷 버튼과 자동 포맷에 적용됩니다."
        >
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-xs font-semibold text-[var(--color-muted)]">들여쓰기</p>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
                  :class="
                    indentOption === 2
                      ? 'border-sky-200 bg-sky-50 text-sky-900'
                      : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-heading)]'
                  "
                  :aria-pressed="indentOption === 2"
                  @click="handleIndentChange(2)"
                >
                  2 spaces
                </button>
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
                  :class="
                    indentOption === 4
                      ? 'border-sky-200 bg-sky-50 text-sky-900'
                      : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-heading)]'
                  "
                  :aria-pressed="indentOption === 4"
                  @click="handleIndentChange(4)"
                >
                  4 spaces
                </button>
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
                  :class="
                    indentOption === 'tab'
                      ? 'border-sky-200 bg-sky-50 text-sky-900'
                      : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-heading)]'
                  "
                  :aria-pressed="indentOption === 'tab'"
                  @click="handleIndentChange('tab')"
                >
                  Tab
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <AppButton
                :variant="sortKeys ? 'success' : 'neutral'"
                size="sm"
                @click="handleSortChange(!sortKeys)"
              >
                키 정렬 {{ sortKeys ? 'ON' : 'OFF' }}
              </AppButton>
              <AppButton
                :variant="autoFormat ? 'primary' : 'neutral'"
                size="sm"
                @click="handleAutoFormatChange(!autoFormat)"
              >
                실시간 포맷 {{ autoFormat ? 'ON' : 'OFF' }}
              </AppButton>
              <AppButton
                :variant="preferredMinify ? 'warning' : 'neutral'"
                size="sm"
                @click="handlePreferredMinifyChange(!preferredMinify)"
              >
                기본 출력: {{ preferredMinify ? 'Minify' : 'Pretty' }}
              </AppButton>
            </div>

            <div class="flex flex-wrap gap-2">
              <AppButton
                :variant="autoFormatUpload ? 'success' : 'neutral'"
                size="sm"
                @click="handleAutoFormatUploadChange(!autoFormatUpload)"
              >
                업로드 자동 포맷 {{ autoFormatUpload ? 'ON' : 'OFF' }}
              </AppButton>
              <AppButton
                :variant="autoFormatFetch ? 'success' : 'neutral'"
                size="sm"
                @click="handleAutoFormatFetchChange(!autoFormatFetch)"
              >
                URL 자동 포맷 {{ autoFormatFetch ? 'ON' : 'OFF' }}
              </AppButton>
            </div>
          </div>
        </AppCard>

        <AppCard eyebrow="테마" title="라이트 / 다크">
          <div class="flex flex-wrap items-center gap-3">
            <p class="text-sm text-[var(--color-muted)]">현재: {{ theme === 'dark' ? '다크' : '라이트' }}</p>
            <AppButton variant="neutral" size="sm" @click="handleThemeChange(theme === 'dark' ? 'light' : 'dark')">
              {{ theme === 'dark' ? '☀️ 라이트로 전환' : '🌙 다크로 전환' }}
            </AppButton>
          </div>
          <p class="mt-2 text-xs text-[var(--color-muted)]">
            시스템 테마와 별도로 저장됩니다. 눈부심이 있다면 다크 모드로 전환하세요.
          </p>
        </AppCard>
      </div>

      <div class="space-y-4">
        <AppCard
          eyebrow="미리보기"
          title="샘플 JSON 표시"
          :description="preferredMinify ? 'Minify 출력으로 표시됩니다.' : '현재 들여쓰기로 표시됩니다.'"
        >
          <div class="rounded-xl border border-[var(--color-border)] bg-slate-950/90">
            <div class="grid grid-cols-[auto,1fr]">
              <div class="border-r border-slate-800 bg-slate-900/60 text-xs text-slate-400">
                <div
                  v-for="(_, index) in sampleFormatted.split('\\n')"
                  :key="index"
                  class="px-3 py-0.5 text-right font-mono tabular-nums"
                >
                  {{ index + 1 }}
                </div>
              </div>
              <pre class="whitespace-pre-wrap break-words bg-slate-950/90 p-4 font-mono text-sm leading-relaxed text-slate-50">
                {{ sampleFormatted }}
              </pre>
            </div>
          </div>
        </AppCard>

        <AppCard eyebrow="단축키" title="빠른 조작">
          <ul class="space-y-2 text-sm text-[var(--color-heading)]">
            <li><span class="font-semibold">포맷</span>: Ctrl/Cmd + Enter</li>
            <li><span class="font-semibold">복사</span>: Ctrl/Cmd + Shift + C</li>
            <li><span class="font-semibold">Minify 포맷</span>: Alt + M</li>
            <li class="text-[var(--color-muted)]">포맷 화면에서 동작하며, 입력 포커스 상태에서도 사용할 수 있습니다.</li>
          </ul>
        </AppCard>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3">
      <p class="text-xs text-[var(--color-muted)]">문제 발생 시 기본값으로 재설정할 수 있습니다.</p>
      <AppButton
        variant="warning"
        size="sm"
        @click="
          resetSettings();
          showToast('기본값으로 되돌렸습니다.', { tone: 'success' });
        "
      >
        모두 초기화
      </AppButton>
    </div>
  </div>
</template>
