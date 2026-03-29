import { defineStore } from 'pinia'

import type { WardrobeItem, WardrobeItemInput, WardrobeItemPatch } from '~/types/wardrobe'

import { createId } from '~/utils/id'
import { WARDROBE_PERSIST_KEY } from '~/utils/storage-keys'

const useWardrobeStore = defineStore('wardrobe', {
  state: () => ({
    items: [] as WardrobeItem[],
  }),
  getters: {
    itemById:
      (state) =>
      (id: string): WardrobeItem | null =>
        state.items.find((item) => item.id === id) ?? null,
  },
  actions: {
    addItem(input: WardrobeItemInput) {
      const now = Date.now()
      const item: WardrobeItem = {
        ...input,
        createdAt: now,
        id: createId(),
        updatedAt: now,
      }
      this.items.push(item)
      return item
    },
    removeItem(id: string) {
      const index = this.items.findIndex((item) => item.id === id)
      if (index === -1) {
        return false
      }
      this.items.splice(index, 1)
      return true
    },
    updateItem(id: string, patch: WardrobeItemPatch) {
      const item = this.items.find((entry) => entry.id === id)
      if (!item) {
        return null
      }
      Object.assign(item, patch, { updatedAt: Date.now() })
      return item
    },
  },
  persist: {
    key: WARDROBE_PERSIST_KEY,
  },
})

export { useWardrobeStore }
