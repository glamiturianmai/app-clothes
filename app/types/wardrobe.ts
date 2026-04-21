type WardrobeCategory =
  | 'accessories'
  | 'bottom'
  | 'outerwear'
  | 'shoes'
  | 'top'

type WardrobeSeason = 'autumn' | 'all' | 'spring' | 'summer' | 'winter'

type WardrobeItem = {
  baseLayer: number
  category: WardrobeCategory
  createdAt: number
  id: string
  imageUrl: string
  name: string
  season: WardrobeSeason
  tags: string[]
  updatedAt: number
}

type WardrobeItemInput = Omit<WardrobeItem, 'createdAt' | 'id' | 'updatedAt'>

type WardrobeItemPatch = Partial<
  Omit<WardrobeItem, 'createdAt' | 'id' | 'updatedAt'>
>

export type {
  WardrobeCategory,
  WardrobeItem,
  WardrobeItemInput,
  WardrobeItemPatch,
  WardrobeSeason,
}
