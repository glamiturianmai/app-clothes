import type { CanvasPlacement } from './canvas'

type Outfit = {
  createdAt: number
  id: string
  maxTemperatureC: number
  minTemperatureC: number
  name: string
  placements: CanvasPlacement[]
  previewImageUrl: string | null
  updatedAt: number
}

type OutfitInput = Omit<Outfit, 'createdAt' | 'id' | 'updatedAt'> & {
  previewImageUrl?: string | null
}

type OutfitPatch = Partial<Omit<Outfit, 'createdAt' | 'id' | 'updatedAt'>>

export type { Outfit, OutfitInput, OutfitPatch }
