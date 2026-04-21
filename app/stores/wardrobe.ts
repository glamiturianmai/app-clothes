import { defineStore } from 'pinia'

import type {
  WardrobeCategory,
  WardrobeItem,
  WardrobeItemInput,
  WardrobeItemPatch,
  WardrobeSeason,
} from '~/types/wardrobe'

import { createId } from '~/utils/id'
import { WARDROBE_PERSIST_KEY } from '~/utils/storage-keys'
import { WARDROBE_DEFAULT_TAGS } from '~/utils/wardrobe-ui'
import { translate } from '~/locales/messages'

function normalizeTag(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null
  }
  const normalized = raw.trim()
  return normalized.length ? normalized : null
}

function dedupeTags(entries: unknown[]): string[] {
  const result: string[] = []
  for (const entry of entries) {
    const tag = normalizeTag(entry)
    if (!tag || result.includes(tag)) {
      continue
    }
    result.push(tag)
  }
  return result
}

const CATEGORY_VALUES: WardrobeCategory[] = ['outerwear', 'top', 'bottom', 'shoes', 'accessories']
const SEASON_VALUES: WardrobeSeason[] = ['spring', 'summer', 'autumn', 'winter', 'all']
const LEGACY_CATEGORY_MAP: Record<string, WardrobeCategory> = {
  [translate('ru', 'wardrobe.categories.top').toLowerCase()]: 'top',
  [translate('ru', 'wardrobe.categories.bottom').toLowerCase()]: 'bottom',
  [translate('ru', 'wardrobe.categories.shoes').toLowerCase()]: 'shoes',
  [translate('ru', 'wardrobe.categories.accessories').toLowerCase()]: 'accessories',
  [translate('ru', 'wardrobe.categories.outerwear').toLowerCase()]: 'outerwear',
}
const LEGACY_SEASON_MAP: Record<string, WardrobeSeason> = {
  [translate('ru', 'wardrobe.seasons.spring').toLowerCase()]: 'spring',
  [translate('ru', 'wardrobe.seasons.summer').toLowerCase()]: 'summer',
  [translate('ru', 'wardrobe.seasons.autumn').toLowerCase()]: 'autumn',
  [translate('ru', 'wardrobe.seasons.winter').toLowerCase()]: 'winter',
  [translate('ru', 'wardrobe.seasons.all').toLowerCase()]: 'all',
}

function normalizeCategory(raw: unknown): WardrobeCategory {
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase()
    if (CATEGORY_VALUES.includes(normalized as WardrobeCategory)) {
      return normalized as WardrobeCategory
    }
    const mapped = LEGACY_CATEGORY_MAP[normalized]
    if (mapped) {
      return mapped
    }
  }
  return 'top'
}

function normalizeSeason(raw: unknown): WardrobeSeason {
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase()
    if (SEASON_VALUES.includes(normalized as WardrobeSeason)) {
      return normalized as WardrobeSeason
    }
    const mapped = LEGACY_SEASON_MAP[normalized]
    if (mapped) {
      return mapped
    }
  }
  return 'all'
}

function normalizeItemInput(input: WardrobeItemInput): WardrobeItemInput {
  return {
    ...input,
    name: input.name.trim(),
    imageUrl: input.imageUrl.trim(),
    category: normalizeCategory(input.category),
    season: normalizeSeason(input.season),
    tags: dedupeTags(input.tags),
    baseLayer: Number.isFinite(input.baseLayer) ? input.baseLayer : 0,
  }
}

const useWardrobeStore = defineStore('wardrobe', {
  state: () => ({
    items: [] as WardrobeItem[],
    knownTags: [] as string[],
  }),
  getters: {
    itemById:
      (state) =>
      (id: string): WardrobeItem | null =>
        state.items.find((item) => item.id === id) ?? null,
    availableTags: (state): string[] => {
      const fromItems = state.items.flatMap((item) => item.tags)
      return dedupeTags([...WARDROBE_DEFAULT_TAGS, ...state.knownTags, ...fromItems]).sort((a, b) =>
        a.localeCompare(b, 'ru'),
      )
    },
  },
  actions: {
    registerTags(tags: string[]) {
      this.knownTags = dedupeTags([...this.knownTags, ...tags])
    },
    addItem(input: WardrobeItemInput) {
      const now = Date.now()
      const normalized = normalizeItemInput(input)
      const item: WardrobeItem = {
        ...normalized,
        createdAt: now,
        id: createId(),
        updatedAt: now,
      }
      this.registerTags(normalized.tags)
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
      const normalizedPatch: WardrobeItemPatch = { ...patch }
      if (patch.category !== undefined) {
        normalizedPatch.category = normalizeCategory(patch.category)
      }
      if (patch.season !== undefined) {
        normalizedPatch.season = normalizeSeason(patch.season)
      }
      if (patch.name !== undefined) {
        normalizedPatch.name = patch.name.trim()
      }
      if (patch.imageUrl !== undefined) {
        normalizedPatch.imageUrl = patch.imageUrl.trim()
      }
      if (patch.tags) {
        normalizedPatch.tags = dedupeTags(patch.tags)
        this.registerTags(normalizedPatch.tags)
      }
      Object.assign(item, normalizedPatch, { updatedAt: Date.now() })
      return item
    },
  },
  persist: {
    key: WARDROBE_PERSIST_KEY,
    afterRestore: (ctx) => {
      if (!Array.isArray(ctx.store.items)) {
        ctx.store.items = []
      }
      if (!Array.isArray(ctx.store.knownTags)) {
        ctx.store.knownTags = []
      }
      ctx.store.knownTags = dedupeTags(ctx.store.knownTags)
      ctx.store.items = ctx.store.items
        .filter((entry) => typeof entry === 'object' && entry !== null)
        .map((entry) => {
          const raw = entry as Record<string, unknown> & { tags?: unknown }
          const { color: _removed, ...rest } = raw
          const normalized = {
            ...rest,
            category: normalizeCategory(raw.category),
            season: normalizeSeason(raw.season),
            tags: Array.isArray(raw.tags) ? dedupeTags(raw.tags) : [],
          }
          return {
            ...normalized,
          } as WardrobeItem
        })
      ctx.store.registerTags(ctx.store.items.flatMap((item) => item.tags))
    },
  },
})

export { useWardrobeStore }
