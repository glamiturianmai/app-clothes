import type { WardrobeItem, WardrobeSeason } from '~/types/wardrobe'

type WardrobeFilterSeason = WardrobeSeason | 'all'

type WardrobeListFilters = {
  season: WardrobeFilterSeason
  matchTags: string[]
}

function createDefaultWardrobeListFilters(): WardrobeListFilters {
  return {
    season: 'all',
    matchTags: [],
  }
}

function useWardrobeFilteredItems(
  items: Ref<WardrobeItem[]>,
  filters: Ref<WardrobeListFilters>,
) {
  const filteredItems = computed(() => {
    const matchTags = filters.value.matchTags.filter((tag) => tag.trim().length > 0)

    return items.value.filter((item) => {
      if (filters.value.season !== 'all' && item.season !== filters.value.season) {
        return false
      }

      if (!matchTags.length) {
        return true
      }

      return matchTags.some((tag) => item.tags.includes(tag))
    })
  })

  return { filteredItems }
}

export {
  createDefaultWardrobeListFilters,
  useWardrobeFilteredItems,
}

export type { WardrobeListFilters }
