import type { WardrobeCategory, WardrobeItemInput, WardrobeSeason } from '~/types/wardrobe'
import { translate } from '~/locales/messages'

type SelectOption<T extends string> = { labelKey: string; value: T }

const WARDROBE_PNG_MAX_BYTES = 5242880

const WARDROBE_DEFAULT_TAGS: string[] = [
  translate('ru', 'wardrobe.defaultTags.theater'),
  translate('ru', 'wardrobe.defaultTags.business'),
  translate('ru', 'wardrobe.defaultTags.favorite'),
  translate('ru', 'wardrobe.defaultTags.donate'),
]

const WARDROBE_CATEGORY_OPTIONS: SelectOption<WardrobeCategory>[] = [
  { labelKey: 'wardrobe.categories.outerwear', value: 'outerwear' },
  { labelKey: 'wardrobe.categories.top', value: 'top' },
  { labelKey: 'wardrobe.categories.bottom', value: 'bottom' },
  { labelKey: 'wardrobe.categories.shoes', value: 'shoes' },
  { labelKey: 'wardrobe.categories.accessories', value: 'accessories' },
]

const WARDROBE_SEASON_OPTIONS: SelectOption<WardrobeSeason>[] = [
  { labelKey: 'wardrobe.seasons.spring', value: 'spring' },
  { labelKey: 'wardrobe.seasons.summer', value: 'summer' },
  { labelKey: 'wardrobe.seasons.autumn', value: 'autumn' },
  { labelKey: 'wardrobe.seasons.winter', value: 'winter' },
  { labelKey: 'wardrobe.seasons.all', value: 'all' },
]

function createEmptyWardrobeItemInput(): WardrobeItemInput {
  return {
    baseLayer: 0,
    category: 'top',
    imageUrl: '',
    name: '',
    season: 'all',
    tags: [],
  }
}

function categoryLabelKey(category: WardrobeCategory): string {
  return WARDROBE_CATEGORY_OPTIONS.find((option) => option.value === category)?.labelKey ?? category
}

function seasonLabelKey(season: WardrobeSeason): string {
  return WARDROBE_SEASON_OPTIONS.find((option) => option.value === season)?.labelKey ?? season
}

function parseTagsFromString(text: string): string[] {
  return text
    .split(/[,;]/u)
    .map((part) => part.trim())
    .filter(Boolean)
}

export {
  categoryLabelKey,
  createEmptyWardrobeItemInput,
  parseTagsFromString,
  seasonLabelKey,
  WARDROBE_CATEGORY_OPTIONS,
  WARDROBE_DEFAULT_TAGS,
  WARDROBE_PNG_MAX_BYTES,
  WARDROBE_SEASON_OPTIONS,
}

export type { SelectOption }
