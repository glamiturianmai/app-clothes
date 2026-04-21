import { defineStore } from 'pinia'

import type {
  CanvasPlacement,
  CanvasPlacementInput,
  CanvasPlacementPatch,
} from '~/types/canvas'

import { cloneCanvasPlacements } from '~/utils/canvas-placements'
import { createId } from '~/utils/id'

const DEFAULT_CANVAS_WIDTH = 500
const DEFAULT_CANVAS_HEIGHT = 500

function normalizePlacementOrder(placements: CanvasPlacement[]) {
  const sorted = [...placements].sort((a, b) => a.zIndex - b.zIndex)
  sorted.forEach((placement, index) => {
    placement.zIndex = index + 1
  })
  return sorted
}

const useCanvasDraftStore = defineStore('canvasDraft', {
  state: () => ({
    placements: [] as CanvasPlacement[],
    lastAddedPlacementId: null as string | null,
    canvasWidth: DEFAULT_CANVAS_WIDTH,
    canvasHeight: DEFAULT_CANVAS_HEIGHT,
  }),
  getters: {
    placementById:
      (state) =>
      (id: string): CanvasPlacement | null =>
        state.placements.find((placement) => placement.id === id) ?? null,
  },
  actions: {
    addPlacement(input: CanvasPlacementInput) {
      const placement: CanvasPlacement = {
        ...input,
        id: createId(),
      }

      this.placements.push(placement)
      this.lastAddedPlacementId = placement.id

      return placement
    },
    addPlacementForWardrobeItem(wardrobeItemId: string) {
      const currentZIndexes = this.placements.map((placement) => placement.zIndex)
      const currentMaxZIndex = currentZIndexes.length
        ? Math.max(...currentZIndexes)
        : 0

      return this.addPlacement({
        rotation: 0,
        scale: 1,
        wardrobeItemId,
        x: this.canvasWidth / 2,
        y: this.canvasHeight / 2,
        zIndex: currentMaxZIndex + 1,
      })
    },
    updatePlacement(id: string, patch: CanvasPlacementPatch) {
      const placement = this.placements.find((entry) => entry.id === id)
      if (!placement) {
        return null
      }

      Object.assign(placement, patch)
      return placement
    },
    removePlacement(id: string) {
      const index = this.placements.findIndex((placement) => placement.id === id)
      if (index === -1) {
        return false
      }
      this.placements.splice(index, 1)
      return true
    },
    clearPlacements() {
      this.placements.splice(0, this.placements.length)
      this.lastAddedPlacementId = null
    },
    replacePlacements(nextPlacements: CanvasPlacement[]) {
      const normalized = [...nextPlacements]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((placement, index) => ({ ...placement, zIndex: index + 1 }))
      this.placements.splice(0, this.placements.length, ...normalized)
      this.lastAddedPlacementId = null
    },
    snapshotPlacements(): CanvasPlacement[] {
      return cloneCanvasPlacements(this.placements)
    },
    setCanvasSize(width: number, height: number) {
      const isWidthValid = Number.isFinite(width) && width > 0
      const isHeightValid = Number.isFinite(height) && height > 0
      if (!isWidthValid || !isHeightValid) {
        return false
      }

      this.canvasWidth = width
      this.canvasHeight = height
      return true
    },
    movePlacementForward(id: string) {
      const sorted = normalizePlacementOrder(this.placements)
      const currentIndex = sorted.findIndex((placement) => placement.id === id)
      if (currentIndex === -1 || currentIndex >= sorted.length - 1) {
        return false
      }

      const current = sorted[currentIndex]
      const next = sorted[currentIndex + 1]
      if (!current || !next) {
        return false
      }

      ;[current.zIndex, next.zIndex] = [next.zIndex, current.zIndex]
      normalizePlacementOrder(this.placements)
      return true
    },
    movePlacementBackward(id: string) {
      const sorted = normalizePlacementOrder(this.placements)
      const currentIndex = sorted.findIndex((placement) => placement.id === id)
      if (currentIndex <= 0) {
        return false
      }

      const current = sorted[currentIndex]
      const prev = sorted[currentIndex - 1]
      if (!current || !prev) {
        return false
      }

      ;[current.zIndex, prev.zIndex] = [prev.zIndex, current.zIndex]
      normalizePlacementOrder(this.placements)
      return true
    },
    bringPlacementToFront(id: string) {
      const sorted = normalizePlacementOrder(this.placements)
      const currentIndex = sorted.findIndex((placement) => placement.id === id)
      if (currentIndex === -1 || currentIndex === sorted.length - 1) {
        return false
      }

      const [current] = sorted.splice(currentIndex, 1)
      if (!current) {
        return false
      }

      sorted.push(current)
      sorted.forEach((placement, index) => {
        placement.zIndex = index + 1
      })
      return true
    },
    sendPlacementToBack(id: string) {
      const sorted = normalizePlacementOrder(this.placements)
      const currentIndex = sorted.findIndex((placement) => placement.id === id)
      if (currentIndex <= 0) {
        return false
      }

      const [current] = sorted.splice(currentIndex, 1)
      if (!current) {
        return false
      }

      sorted.unshift(current)
      sorted.forEach((placement, index) => {
        placement.zIndex = index + 1
      })
      return true
    },
  },
})

export { useCanvasDraftStore }

