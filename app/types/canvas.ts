type CanvasPlacementId = string

type CanvasPlacement = {
  id: CanvasPlacementId
  rotation: number
  scale: number
  wardrobeItemId: string
  x: number
  y: number
  zIndex: number
}

type CanvasPlacementInput = Omit<CanvasPlacement, 'id'>

type CanvasPlacementPatch = Partial<Omit<CanvasPlacement, 'id'>>

export type { CanvasPlacement, CanvasPlacementInput, CanvasPlacementPatch }
