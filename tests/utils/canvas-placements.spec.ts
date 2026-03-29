import { describe, expect, it } from 'vitest'

import { normalizeCanvasPlacements } from '~/utils/canvas-placements'

describe('normalizeCanvasPlacements', () => {
  it('добавляет id если пустой', () => {
    const normalized = normalizeCanvasPlacements([
      {
        id: '',
        rotation: 0,
        scale: 1,
        wardrobeItemId: 'w1',
        x: 0,
        y: 0,
        zIndex: 0,
      },
    ])

    expect(normalized[0]?.id.length).toBeGreaterThan(0)
  })

  it('сохраняет валидный id', () => {
    const normalized = normalizeCanvasPlacements([
      {
        id: 'keep-me',
        rotation: 0,
        scale: 1,
        wardrobeItemId: 'w1',
        x: 0,
        y: 0,
        zIndex: 0,
      },
    ])

    expect(normalized[0]?.id).toBe('keep-me')
  })
})
