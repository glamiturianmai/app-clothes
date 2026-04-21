<template>
  <section class="ai-chat" aria-live="polite">
    <header class="ai-chat__header">
      <div class="ai-chat__heading">
        <p class="ai-chat__title">{{ t('aiChat.title') }}</p>
        <p class="ai-chat__subtitle">{{ t('aiChat.subtitle') }}</p>
      </div>
      <button
        v-if="chatStore.hasMessages"
        type="button"
        class="ai-chat__clear"
        :title="t('aiChat.clear')"
        :aria-label="t('aiChat.clear')"
        @click="onClear"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </header>

    <div class="ai-chat__body" ref="bodyRef">
      <p v-if="!chatStore.hasMessages" class="ai-chat__empty">{{ t('aiChat.empty') }}</p>

      <ul v-else class="ai-chat__messages">
        <li
          v-for="message in chatStore.messages"
          :key="message.id"
          class="ai-chat__message"
          :class="{
            'ai-chat__message_user': message.role === 'user',
            'ai-chat__message_assistant': message.role === 'assistant',
          }"
        >
          <span class="ai-chat__author">
            {{ message.role === 'user' ? t('aiChat.roleUser') : t('aiChat.roleAssistant') }}
          </span>
          <p class="ai-chat__content">{{ message.content }}</p>
        </li>
      </ul>

      <p v-if="chatStore.isLoading" class="ai-chat__loading">{{ t('aiChat.loading') }}</p>
      <p v-if="chatStore.errorText" class="ai-chat__error">{{ chatStore.errorText }}</p>
    </div>

    <div v-if="!chatStore.hasMessages" class="ai-chat__suggestions">
      <p class="ai-chat__suggestions-title">{{ t('aiChat.suggestionsTitle') }}</p>
      <div class="ai-chat__suggestions-list">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion.key"
          type="button"
          class="ai-chat__suggestion"
          :disabled="chatStore.isLoading"
          @click="sendMessage(suggestion.text)"
        >
          {{ suggestion.text }}
        </button>
      </div>
    </div>

    <form class="ai-chat__form" @submit.prevent="onSubmit">
      <textarea
        v-model="draft"
        class="ai-chat__input"
        :placeholder="t('aiChat.placeholder')"
        rows="2"
        :disabled="chatStore.isLoading"
        @keydown="onKeydown"
      />
      <button
        type="submit"
        class="ai-chat__send"
        :disabled="chatStore.isLoading || !draft.trim().length"
        :aria-label="t('aiChat.sendAria')"
        :title="t('aiChat.send')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 12l16-8-6 16-3-7-7-1z" />
        </svg>
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import { useAiChatStore } from '~/stores/aiChat'
import { useOutfitsStore } from '~/stores/outfits'
import { useWardrobeStore } from '~/stores/wardrobe'

type SuggestionKey = 'theater' | 'travelWeek' | 'work' | 'date'

const chatStore = useAiChatStore()
const wardrobeStore = useWardrobeStore()
const outfitsStore = useOutfitsStore()
const { t } = useAppI18n()

const draft = ref('')
const bodyRef = ref<HTMLElement | null>(null)

const suggestions = computed<{ key: SuggestionKey; text: string }[]>(() => [
  { key: 'theater', text: t('aiChat.suggestions.theater') },
  { key: 'travelWeek', text: t('aiChat.suggestions.travelWeek') },
  { key: 'work', text: t('aiChat.suggestions.work') },
  { key: 'date', text: t('aiChat.suggestions.date') },
])

const categoryLabelByKey: Record<string, string> = {
  outerwear: t('wardrobe.categories.outerwear'),
  top: t('wardrobe.categories.top'),
  bottom: t('wardrobe.categories.bottom'),
  shoes: t('wardrobe.categories.shoes'),
  accessories: t('wardrobe.categories.accessories'),
}

const seasonLabelByKey: Record<string, string> = {
  spring: t('wardrobe.seasons.spring'),
  summer: t('wardrobe.seasons.summer'),
  autumn: t('wardrobe.seasons.autumn'),
  winter: t('wardrobe.seasons.winter'),
  all: t('wardrobe.seasons.all'),
}

function buildContext(): string {
  const parts: string[] = []

  if (!wardrobeStore.items.length) {
    parts.push(t('aiChat.contextNoItems'))
  }
  else {
    const rows = wardrobeStore.items.slice(0, 60).map((item) => {
      const category = categoryLabelByKey[item.category] ?? item.category
      const season = seasonLabelByKey[item.season] ?? item.season
      const tags = item.tags.length ? `, теги: ${item.tags.join(', ')}` : ''
      return `- ${item.name} (категория: ${category}, сезон: ${season}${tags})`
    })
    parts.push(`Гардероб (${wardrobeStore.items.length} вещей):\n${rows.join('\n')}`)
  }

  if (!outfitsStore.outfits.length) {
    parts.push(t('aiChat.contextNoOutfits'))
  }
  else {
    const rows = outfitsStore.outfits.slice(0, 20).map((outfit) => {
      return `- «${outfit.name}» (предметов: ${outfit.placements.length}, температура: ${outfit.minTemperatureC}°..${outfit.maxTemperatureC}°)`
    })
    parts.push(`Сохранённые образы (${outfitsStore.outfits.length}):\n${rows.join('\n')}`)
  }

  return parts.join('\n\n')
}

async function sendMessage(text: string) {
  const trimmed = text.trim()
  if (!trimmed.length) {
    chatStore.setError(t('aiChat.errorEmpty'))
    return
  }
  if (chatStore.isLoading) {
    return
  }

  chatStore.setError('')
  chatStore.appendMessage('user', trimmed)
  draft.value = ''
  chatStore.setLoading(true)

  try {
    const response = await $fetch<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: {
        messages: chatStore.outgoingMessages(),
        userContext: buildContext(),
      },
    })

    const reply = (response?.reply ?? '').trim()
    if (!reply.length) {
      chatStore.setError(t('aiChat.errorGeneric'))
      return
    }

    chatStore.appendMessage('assistant', reply)
  }
  catch (error) {
    const message = extractErrorMessage(error)
    chatStore.setError(message || t('aiChat.errorGeneric'))
  }
  finally {
    chatStore.setLoading(false)
  }
}

function extractErrorMessage(error: unknown): string {
  if (!error) {
    return ''
  }
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    const data = record.data as Record<string, unknown> | undefined
    const fromData = typeof data?.statusMessage === 'string' ? data.statusMessage : ''
    if (fromData) {
      return fromData
    }
    if (typeof record.statusMessage === 'string') {
      return record.statusMessage
    }
    if (typeof record.message === 'string') {
      return record.message
    }
  }
  return ''
}

function onSubmit() {
  void sendMessage(draft.value)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    void sendMessage(draft.value)
  }
}

function onClear() {
  chatStore.clear()
  draft.value = ''
}

function scrollToBottom() {
  const body = bodyRef.value
  if (!body) {
    return
  }
  body.scrollTop = body.scrollHeight
}

watch(
  () => chatStore.messages.length,
  () => {
    void nextTick(scrollToBottom)
  },
  { immediate: true },
)

watch(
  () => chatStore.isLoading,
  (value) => {
    if (value) {
      void nextTick(scrollToBottom)
    }
  },
)
</script>

<style scoped lang="scss">
.ai-chat {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.1rem 1.05rem;
  border: 1px solid #ececea;
  border-radius: 14px;
  background: #fcfcfb;
  width: 100%;
  min-width: 0;
  gap: 0.65rem;
  max-height: 620px;
}

.ai-chat__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
}

.ai-chat__heading {
  min-width: 0;
}

.ai-chat__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #191919;
}

.ai-chat__subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
  color: #7a7a78;
}

.ai-chat__clear {
  flex: 0 0 auto;
  width: 1.9rem;
  height: 1.9rem;
  border: 1px solid #e6e6e4;
  border-radius: 9px;
  background: #fff;
  color: #7a7a78;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.16s ease,
    color 0.16s ease,
    background 0.16s ease;

  svg {
    width: 0.95rem;
    height: 0.95rem;
  }

  &:hover {
    border-color: var(--ui-accent);
    color: var(--ui-accent);
    background: var(--ui-accent-soft);
  }
}

.ai-chat__body {
  flex: 1 1 auto;
  min-height: 120px;
  max-height: 380px;
  overflow-y: auto;
  padding: 0.2rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  scrollbar-width: thin;
}

.ai-chat__empty {
  margin: 0;
  font-size: 0.82rem;
  color: #6c6c6a;
  padding: 0.8rem 0.1rem;
}

.ai-chat__messages {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.ai-chat__message {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.55rem 0.7rem;
  border-radius: 12px;
  font-size: 0.83rem;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
  max-width: 94%;
}

.ai-chat__message_user {
  align-self: flex-end;
  background: var(--ui-accent);
  color: #fff;
  border: 1px solid var(--ui-accent);
}

.ai-chat__message_assistant {
  align-self: flex-start;
  background: #fff;
  color: #191919;
  border: 1px solid #ececea;
}

.ai-chat__author {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.75;
}

.ai-chat__content {
  margin: 0;
}

.ai-chat__loading {
  margin: 0.1rem 0 0;
  font-size: 0.8rem;
  color: #6c6c6a;
  font-style: italic;
}

.ai-chat__error {
  margin: 0.1rem 0 0;
  font-size: 0.8rem;
  color: #8c3247;
}

.ai-chat__suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 0.1rem;
}

.ai-chat__suggestions-title {
  margin: 0;
  font-size: 0.75rem;
  color: #7a7a78;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.ai-chat__suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ai-chat__suggestion {
  padding: 0.35rem 0.6rem;
  border: 1px solid #e6e6e4;
  border-radius: 999px;
  background: #fff;
  color: #1f1f1f;
  font: inherit;
  font-size: 0.76rem;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease;

  &:hover:not(:disabled) {
    border-color: var(--ui-accent);
    background: var(--ui-accent-soft);
    color: var(--ui-accent);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.ai-chat__form {
  display: flex;
  gap: 0.45rem;
  align-items: flex-end;
}

.ai-chat__input {
  flex: 1 1 auto;
  min-width: 0;
  resize: none;
  font: inherit;
  font-size: 0.85rem;
  line-height: 1.35;
  padding: 0.55rem 0.7rem;
  border: 1px solid #e6e6e4;
  border-radius: 12px;
  background: #fff;
  color: #1f1f1f;
  outline: none;
  transition: border-color 0.16s ease;

  &:focus {
    border-color: var(--ui-accent);
  }

  &:disabled {
    opacity: 0.6;
  }
}

.ai-chat__send {
  flex: 0 0 auto;
  width: 2.3rem;
  height: 2.3rem;
  border: 1px solid var(--ui-accent);
  border-radius: 12px;
  background: var(--ui-accent);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease;

  svg {
    width: 1rem;
    height: 1rem;
  }

  &:hover:not(:disabled) {
    border-color: var(--ui-border-strong);
    background: #f0f0ee;
    color: var(--ui-text);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}
</style>
