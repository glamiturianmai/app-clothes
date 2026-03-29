import type { WardrobeCategory, WardrobeItemInput, WardrobeSeason } from '~/types/wardrobe'

type SelectOption<T extends string> = { label: string; value: T }

const WARDROBE_PNG_MAX_BYTES = 5242880

const WARDROBE_CATEGORY_OPTIONS: SelectOption<WardrobeCategory>[] = [
  { label: 'Верхняя одежда', value: 'outerwear' },
  { label: 'Верх', value: 'top' },
  { label: 'Низ', value: 'bottom' },
  { label: 'Обувь', value: 'shoes' },
  { label: 'Аксессуары', value: 'accessories' },
]

const WARDROBE_SEASON_OPTIONS: SelectOption<WardrobeSeason>[] = [
  { label: 'Весна', value: 'spring' },
  { label: 'Лето', value: 'summer' },
  { label: 'Осень', value: 'autumn' },
  { label: 'Зима', value: 'winter' },
  { label: 'Всесезонно', value: 'all' },
]

function createEmptyWardrobeItemInput(): WardrobeItemInput {
  return {
    baseLayer: 0,
    category: 'top',
    color: '#1a1a1a',
    imageUrl: '',
    name: '',
    season: 'all',
    tags: [],
  }
}

function categoryLabel(category: WardrobeCategory): string {
  return WARDROBE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category
}

function seasonLabel(season: WardrobeSeason): string {
  return WARDROBE_SEASON_OPTIONS.find((option) => option.value === season)?.label ?? season
}

function parseTagsFromString(text: string): string[] {
  return text
    .split(/[,;]/u)
    .map((part) => part.trim())
    .filter(Boolean)
}

export {
  categoryLabel,
  createEmptyWardrobeItemInput,
  parseTagsFromString,
  seasonLabel,
  WARDROBE_CATEGORY_OPTIONS,
  WARDROBE_PNG_MAX_BYTES,
  WARDROBE_SEASON_OPTIONS,
}

export type { SelectOption }
