import { defineStore } from 'pinia'

import type {
  CanvasPlacement,
  CanvasPlacementInput,
  CanvasPlacementPatch,
} from '~/types/canvas'

import { createId } from '~/utils/id'

const DEFAULT_CANVAS_WIDTH = 500
const DEFAULT_CANVAS_HEIGHT = 500

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
      this.placements.splice(0, this.placements.length, ...nextPlacements)
      this.lastAddedPlacementId = null
    },
    snapshotPlacements(): CanvasPlacement[] {
      return structuredClone(this.placements)
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
    bringPlacementToFront(id: string) {
      const isPlacementExist = this.placements.some((placement) => placement.id === id)
      if (!isPlacementExist) {
        return false
      }

      const currentZIndexes = this.placements.map((placement) => placement.zIndex)
      const currentMaxZIndex = currentZIndexes.length
        ? Math.max(...currentZIndexes)
        : 0

      const placement = this.placements.find((entry) => entry.id === id)
      if (!placement) {
        return false
      }

      placement.zIndex = currentMaxZIndex + 1
      return true
    },
    sendPlacementToBack(id: string) {
      const isPlacementExist = this.placements.some((placement) => placement.id === id)
      if (!isPlacementExist) {
        return false
      }

      const currentZIndexes = this.placements.map((placement) => placement.zIndex)
      const currentMinZIndex = currentZIndexes.length
        ? Math.min(...currentZIndexes)
        : 0

      const placement = this.placements.find((entry) => entry.id === id)
      if (!placement) {
        return false
      }

      placement.zIndex = currentMinZIndex - 1
      return true
    },
  },
})

export { useCanvasDraftStore }

