import { defineStore } from 'pinia'

import type { Outfit, OutfitInput, OutfitPatch } from '~/types/outfit'

import { createId } from '~/utils/id'
import { OUTFITS_PERSIST_KEY } from '~/utils/storage-keys'

function normalizeTemperature(value: unknown, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }
  return Math.max(-20, Math.min(20, Math.round(value)))
}

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
      const minTemperatureC = normalizeTemperature(input.minTemperatureC, 0)
      const maxTemperatureC = normalizeTemperature(input.maxTemperatureC, 15)
      const outfit: Outfit = {
        ...input,
        createdAt: now,
        id: createId(),
        minTemperatureC: Math.min(minTemperatureC, maxTemperatureC),
        maxTemperatureC: Math.max(minTemperatureC, maxTemperatureC),
        previewImageUrl: input.previewImageUrl ?? null,
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
      const normalizedPatch: OutfitPatch = {
        ...patch,
      }
      if (patch.minTemperatureC !== undefined) {
        normalizedPatch.minTemperatureC = normalizeTemperature(patch.minTemperatureC, outfit.minTemperatureC)
      }
      if (patch.maxTemperatureC !== undefined) {
        normalizedPatch.maxTemperatureC = normalizeTemperature(patch.maxTemperatureC, outfit.maxTemperatureC)
      }
      if (
        normalizedPatch.minTemperatureC !== undefined
        && normalizedPatch.maxTemperatureC !== undefined
        && normalizedPatch.minTemperatureC > normalizedPatch.maxTemperatureC
      ) {
        const nextMin = normalizedPatch.maxTemperatureC
        normalizedPatch.maxTemperatureC = normalizedPatch.minTemperatureC
        normalizedPatch.minTemperatureC = nextMin
      }
      if (patch.previewImageUrl === undefined) {
        delete normalizedPatch.previewImageUrl
      }
      Object.assign(outfit, normalizedPatch, { updatedAt: Date.now() })
      return outfit
    },
    removePlacementsForItem(wardrobeItemId: string) {
      for (const outfit of this.outfits) {
        const before = outfit.placements.length
        outfit.placements = outfit.placements.filter(
          (placement) => placement.wardrobeItemId !== wardrobeItemId,
        )
        if (outfit.placements.length !== before) {
          outfit.updatedAt = Date.now()
        }
      }
    },
  },
  persist: {
    key: OUTFITS_PERSIST_KEY,
    afterRestore: (ctx) => {
      if (!Array.isArray(ctx.store.outfits)) {
        ctx.store.outfits = []
      }
      ctx.store.outfits = ctx.store.outfits
        .filter((entry) => typeof entry === 'object' && entry !== null)
        .map((entry) => {
          const { tags: _legacyTags, ...rest } = entry as Record<string, unknown>
          const previewImageUrl =
            typeof entry.previewImageUrl === 'string' && entry.previewImageUrl.length > 0
              ? entry.previewImageUrl
              : null
          const minTemperatureC = normalizeTemperature(entry.minTemperatureC, 0)
          const maxTemperatureC = normalizeTemperature(entry.maxTemperatureC, 15)
          return {
            ...rest,
            minTemperatureC: Math.min(minTemperatureC, maxTemperatureC),
            maxTemperatureC: Math.max(minTemperatureC, maxTemperatureC),
            previewImageUrl,
          }
        }) as Outfit[]
    },
  },
})

export { useOutfitsStore }
