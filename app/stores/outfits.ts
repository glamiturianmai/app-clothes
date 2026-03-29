import { defineStore } from 'pinia'

import type { Outfit, OutfitInput, OutfitPatch } from '~/types/outfit'

import { createId } from '~/utils/id'
import { OUTFITS_PERSIST_KEY } from '~/utils/storage-keys'

const useOutfitsStore = defineStore('outfits', {
  state: () => ({
    outfits: [] as Outfit[],
  }),
  getters: {
    outfitById:
      (state) =>
      (id: string): Outfit | null =>
        state.outfits.find((outfit) => outfit.id === id) ?? null,
  },
  actions: {
    addOutfit(input: OutfitInput) {
      const now = Date.now()
      const outfit: Outfit = {
        ...input,
        createdAt: now,
        id: createId(),
        updatedAt: now,
      }
      this.outfits.push(outfit)
      return outfit
    },
    removeOutfit(id: string) {
      const index = this.outfits.findIndex((outfit) => outfit.id === id)
      if (index === -1) {
        return false
      }
      this.outfits.splice(index, 1)
      return true
    },
    updateOutfit(id: string, patch: OutfitPatch) {
      const outfit = this.outfits.find((entry) => entry.id === id)
      if (!outfit) {
        return null
      }
      Object.assign(outfit, patch, { updatedAt: Date.now() })
      return outfit
    },
  },
  persist: {
    key: OUTFITS_PERSIST_KEY,
  },
})

export { useOutfitsStore }
