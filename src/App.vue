<script setup lang="ts">
import { ref } from 'vue'

import FooterBar from './components/FooterBar.vue'
import HeaderBar from './components/HeaderBar.vue'
import JsonInputPanel from './components/JsonInputPanel.vue'
import JsonOutputPanel from './components/JsonOutputPanel.vue'

type Status = 'idle' | 'valid' | 'invalid'

const rawInput = ref(`{
  "message": "왼쪽 영역에 JSON을 붙여넣어 보세요.",
  "info": "파일 업로드/드래그&드롭도 지원합니다."
}`)

const formattedPreview = ref<string>(
  `{
  "message": "포맷팅 결과가 여기에 표시됩니다.",
  "note": "포맷팅/검증 로직은 TODO 2 이후 단계에서 연결됩니다."
}`
)

const status = ref<Status>('idle')
const statusMessage = ref('포맷팅 버튼을 누르면 결과가 표시됩니다.')

const handleFormat = () => {
  status.value = 'valid'
  statusMessage.value = '포맷팅 로직은 다음 단계에서 연결됩니다.'
}

const handleCopy = () => {
  statusMessage.value = '복사 기능은 결과 영역 구현 시 연결됩니다.'
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-5 pb-12 pt-8">
      <HeaderBar />

      <section
        class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
      >
        <div class="flex flex-col gap-3">
          <p class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Guide</p>
          <h2 class="text-xl font-semibold text-[var(--color-heading)]">
            좌측 입력 · 우측 결과 · 하단 버전 정보
          </h2>
          <p class="text-sm leading-6 text-[var(--color-muted)]">
            TODO 1 단계에서는 화면 틀과 기본 UI만 구성했습니다. 포맷팅/유효성 검사는 TODO 2~3에서
            연결됩니다.
          </p>
          <div class="grid gap-3 sm:grid-cols-3">
            <div
              class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <p class="text-sm font-semibold text-[var(--color-heading)]">입력</p>
              <p class="mt-1 text-sm text-[var(--color-muted)]">textarea, 파일 선택, 드래그&드롭</p>
            </div>
            <div
              class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <p class="text-sm font-semibold text-[var(--color-heading)]">출력</p>
              <p class="mt-1 text-sm text-[var(--color-muted)]">상태바 + 코드 블록 + 버튼</p>
            </div>
            <div
              class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <p class="text-sm font-semibold text-[var(--color-heading)]">반응형</p>
              <p class="mt-1 text-sm text-[var(--color-muted)]">넓은 화면 2열, 좁은 화면 1열</p>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-5 lg:grid-cols-[1.08fr_1fr]">
        <JsonInputPanel v-model="rawInput" />
        <JsonOutputPanel
          :formatted-value="formattedPreview"
          :status="status"
          :message="statusMessage"
          @format="handleFormat"
          @copy="handleCopy"
        />
      </section>

      <FooterBar />
    </div>
  </div>
</template>
