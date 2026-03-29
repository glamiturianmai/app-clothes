import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCanvasDraftStore } from '~/stores/canvasDraft'

describe('useCanvasDraftStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addPlacementForWardrobeItem ставит центр по размеру canvas', () => {
    const store = useCanvasDraftStore()
    store.setCanvasSize(400, 400)
    const placement = store.addPlacementForWardrobeItem('item-1')

    expect(placement.x).toBe(200)
    expect(placement.y).toBe(200)
    expect(placement.scale).toBe(1)
    expect(placement.rotation).toBe(0)
  })

  it('replacePlacements заменяет состояние и сбрасывает lastAddedPlacementId', () => {
    const store = useCanvasDraftStore()
    store.addPlacementForWardrobeItem('a')
    const lastId = store.lastAddedPlacementId

    store.replacePlacements([
      {
        id: 'p1',
        rotation: 0,
        scale: 1,
        wardrobeItemId: 'b',
        x: 10,
        y: 20,
        zIndex: 1,
      },
    ])

    expect(store.placements.length).toBe(1)
    expect(store.placements[0]?.id).toBe('p1')
    expect(store.lastAddedPlacementId).not.toBe(lastId)
    expect(store.lastAddedPlacementId).toBe(null)
  })

  it('snapshotPlacements возвращает клон', () => {
    const store = useCanvasDraftStore()
    store.addPlacementForWardrobeItem('x')
    const snapshot = store.snapshotPlacements()

    snapshot.splice(0, snapshot.length)
    expect(store.placements.length).toBeGreaterThan(0)
  })
})
