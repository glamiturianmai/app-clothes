import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useOutfitsStore } from '~/stores/outfits'

describe('useOutfitsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addOutfit и outfitById', () => {
    const store = useOutfitsStore()
    const outfit = store.addOutfit({
      name: 'Лето',
      placements: [],
      tags: ['casual'],
    })

    expect(outfit.name).toBe('Лето')
    expect(store.outfitById(outfit.id)?.tags).toEqual(['casual'])
  })

  it('updateOutfit обновляет поля', () => {
    const store = useOutfitsStore()
    const outfit = store.addOutfit({
      name: 'Один',
      placements: [],
      tags: [],
    })

    store.updateOutfit(outfit.id, { name: 'Два', tags: ['x'] })
    expect(store.outfitById(outfit.id)?.name).toBe('Два')
    expect(store.outfitById(outfit.id)?.tags).toEqual(['x'])
  })

  it('removeOutfit удаляет', () => {
    const store = useOutfitsStore()
    const outfit = store.addOutfit({ name: 'Temp', placements: [], tags: [] })
    const isRemoved = store.removeOutfit(outfit.id)

    expect(isRemoved).toBe(true)
    expect(store.outfitById(outfit.id)).toBe(null)
  })
})
