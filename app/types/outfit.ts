import type { CanvasPlacement } from './canvas'

type Outfit = {
  createdAt: number
  id: string
  name: string
  placements: CanvasPlacement[]
  tags: string[]
  updatedAt: number
}

type OutfitInput = Omit<Outfit, 'createdAt' | 'id' | 'updatedAt'>

type OutfitPatch = Partial<Omit<Outfit, 'createdAt' | 'id' | 'updatedAt'>>

export type { Outfit, OutfitInput, OutfitPatch }
