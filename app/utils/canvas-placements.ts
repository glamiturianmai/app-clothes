import type { CanvasPlacement } from '~/types/canvas'

import { createId } from '~/utils/id'

function cloneCanvasPlacements(entries: CanvasPlacement[]): CanvasPlacement[] {
  return entries.map((entry) => ({
    id: entry.id,
    rotation: entry.rotation,
    scale: entry.scale,
    wardrobeItemId: entry.wardrobeItemId,
    x: entry.x,
    y: entry.y,
    zIndex: entry.zIndex,
  }))
}

function normalizeCanvasPlacements(entries: CanvasPlacement[]): CanvasPlacement[] {
  return entries.map((entry) => {
    const isIdValid = typeof entry.id === 'string' && entry.id.length > 0
    const id = isIdValid ? entry.id : createId()

    return {
      ...entry,
      id,
    }
  })
}

export { cloneCanvasPlacements, normalizeCanvasPlacements }
