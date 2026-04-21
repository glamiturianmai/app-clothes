import { defineStore } from 'pinia'

import { createId } from '~/utils/id'
import { AI_CHAT_PERSIST_KEY } from '~/utils/storage-keys'

type AiChatRole = 'user' | 'assistant'

type AiChatMessage = {
  id: string
  role: AiChatRole
  content: string
  createdAt: number
}

const MAX_STORED_MESSAGES = 40

const useAiChatStore = defineStore('aiChat', {
  state: () => ({
    messages: [] as AiChatMessage[],
    isLoading: false,
    errorText: '' as string,
  }),
  getters: {
    hasMessages: (state): boolean => state.messages.length > 0,
  },
  actions: {
    appendMessage(role: AiChatRole, content: string) {
      const trimmed = content.trim()
      if (!trimmed.length) {
        return null
      }

      const message: AiChatMessage = {
        id: createId(),
        role,
        content: trimmed,
        createdAt: Date.now(),
      }
      this.messages.push(message)

      if (this.messages.length > MAX_STORED_MESSAGES) {
        this.messages.splice(0, this.messages.length - MAX_STORED_MESSAGES)
      }

      return message
    },
    clear() {
      this.messages = []
      this.errorText = ''
      this.isLoading = false
    },
    setLoading(value: boolean) {
      this.isLoading = value
    },
    setError(text: string) {
      this.errorText = text
    },
    outgoingMessages() {
      return this.messages.map((message) => ({
        role: message.role,
        content: message.content,
      }))
    },
  },
  persist: {
    key: AI_CHAT_PERSIST_KEY,
    afterRestore: (ctx) => {
      if (!Array.isArray(ctx.store.messages)) {
        ctx.store.messages = []
      }
      ctx.store.messages = ctx.store.messages.filter(
        (entry: unknown): entry is AiChatMessage => {
          if (!entry || typeof entry !== 'object') {
            return false
          }
          const record = entry as Record<string, unknown>
          return (
            typeof record.id === 'string'
            && typeof record.content === 'string'
            && (record.role === 'user' || record.role === 'assistant')
          )
        },
      )
      ctx.store.isLoading = false
      ctx.store.errorText = ''
    },
  },
})

export { useAiChatStore }
export type { AiChatMessage, AiChatRole }
