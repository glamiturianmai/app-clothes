import type { WardrobeCategory, WardrobeItem, WardrobeSeason } from '~/types/wardrobe'

type WardrobeFilterCategory = WardrobeCategory | 'all'

type WardrobeFilterSeason = WardrobeSeason | 'all'

type WardrobeListFilters = {
  category: WardrobeFilterCategory
  season: WardrobeFilterSeason
  tagQuery: string
}

function createDefaultWardrobeListFilters(): WardrobeListFilters {
  return {
    category: 'all',
    season: 'all',
    tagQuery: '',
  }
}

function useWardrobeFilteredItems(
  items: Ref<WardrobeItem[]>,
  filters: Ref<WardrobeListFilters>,
) {
  const filteredItems = computed(() => {
    const tagNeedle = filters.value.tagQuery.trim().toLowerCase()

    return items.value.filter((item) => {
      if (filters.value.category !== 'all' && item.category !== filters.value.category) {
        return false
      }

      if (filters.value.season !== 'all' && item.season !== filters.value.season) {
        return false
      }

      if (!tagNeedle) {
        return true
      }

      const isNameMatch = item.name.toLowerCase().includes(tagNeedle)
      const isTagMatch = item.tags.some((tag) => tag.toLowerCase().includes(tagNeedle))

      return isNameMatch || isTagMatch
    })
  })

  return { filteredItems }
}

export {
  createDefaultWardrobeListFilters,
  useWardrobeFilteredItems,
}

export type { WardrobeListFilters }
