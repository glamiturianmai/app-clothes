import type { CanvasPlacement } from '~/types/canvas'

import { createId } from '~/utils/id'

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

export { normalizeCanvasPlacements }
