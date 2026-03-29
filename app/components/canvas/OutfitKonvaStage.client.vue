<template>
  <div ref="containerEl" class="outfit-konva-stage" />
</template>

<script setup lang="ts">
import Konva from 'konva'
import { storeToRefs } from 'pinia'

import type { CanvasPlacement } from '~/types/canvas'

const canvasDraftStore = useCanvasDraftStore()
const wardrobeStore = useWardrobeStore()

const { placements } = storeToRefs(canvasDraftStore)

const selectedPlacementId = defineModel<string | null>('selectedPlacementId', {
  default: null,
})

const containerEl = ref<HTMLDivElement | null>(null)
const imageCache = useKonvaImageCache()

let stage: Konva.Stage | null = null
let layer: Konva.Layer | null = null
let transformer: Konva.Transformer | null = null
let resizeObserver: ResizeObserver | null = null
let syncToken = 0

const konvaImageByPlacementId = new Map<string, Konva.Image>()

const sortedPlacements = computed(() =>
  [...placements.value].sort((a, b) => a.zIndex - b.zIndex),
)

function getMinStageSizePx() {
  return 320
}

function updateStageSize() {
  const el = containerEl.value
  const isElReady = Boolean(el) && Boolean(stage)
  if (!isElReady) {
    return
  }

  const measuredWidth = Math.floor(el!.getBoundingClientRect().width)
  const widthCandidate = Number.isFinite(measuredWidth) && measuredWidth > 0 ? measuredWidth : 0
  const width = Math.max(widthCandidate, getMinStageSizePx())
  const height = width

  stage!.width(width)
  stage!.height(height)
  canvasDraftStore.setCanvasSize(width, height)
  layer?.batchDraw()
}

function persistNodeCenter(placementId: string, node: Konva.Image) {
  const widthScaled = node.width() * node.scaleX()
  const heightScaled = node.height() * node.scaleY()

  canvasDraftStore.updatePlacement(placementId, {
    x: node.x() + widthScaled / 2,
    y: node.y() + heightScaled / 2,
    rotation: node.rotation(),
    scale: node.scaleX(),
  })
}

function attachTransformer() {
  if (!layer || !transformer) {
    return
  }

  const selectedId = selectedPlacementId.value
  if (!selectedId) {
    transformer.nodes([])
    layer.batchDraw()
    return
  }

  const node = konvaImageByPlacementId.get(selectedId) ?? null
  if (!node) {
    transformer.nodes([])
    layer.batchDraw()
    return
  }

  transformer.nodes([node])
  layer.batchDraw()
}

function bindImageNode(placement: CanvasPlacement, node: Konva.Image) {
  node.off('mousedown')
  node.off('touchstart')
  node.off('click')
  node.off('tap')
  node.off('dragend')
  node.off('transformend')

  node.on('mousedown touchstart', (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    event.cancelBubble = true
  })

  node.on('click tap', (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    event.cancelBubble = true
    selectedPlacementId.value = placement.id
    attachTransformer()
  })

  node.on('dragend', () => {
    persistNodeCenter(placement.id, node)
  })

  node.on('transformend', () => {
    persistNodeCenter(placement.id, node)
  })
}

function applyPlacementToNode(placement: CanvasPlacement, node: Konva.Image, htmlImage: HTMLImageElement) {
  const width = htmlImage.naturalWidth || htmlImage.width || 1
  const height = htmlImage.naturalHeight || htmlImage.height || 1
  const scale = placement.scale

  node.image(htmlImage)
  node.width(width)
  node.height(height)
  node.scaleX(scale)
  node.scaleY(scale)
  node.rotation(placement.rotation)
  node.x(placement.x - (width * scale) / 2)
  node.y(placement.y - (height * scale) / 2)
}

async function syncFromStore() {
  console.log(11111);
  const token = ++syncToken
  const isLayerReady = Boolean(layer) && Boolean(stage)
  if (!isLayerReady) {
    return
  }

  const sortedIds = new Set(sortedPlacements.value.map((placement) => placement.id))

  for (const [placementId, node] of konvaImageByPlacementId) {
    const isStillPresent = sortedIds.has(placementId)
    if (!isStillPresent) {
      node.destroy()
      konvaImageByPlacementId.delete(placementId)
    }
  }

  for (const placement of sortedPlacements.value) {
    if (token !== syncToken) {
      return
    }

    const item = wardrobeStore.itemById(placement.wardrobeItemId)
    console.log('item', item);
    const imageUrl = item?.imageUrl ?? ''
    const isImageUrlPresent = Boolean(imageUrl)

    console.log('placements:', placements.value)
    console.log('wardrobe item:', item)
    console.log('imageUrl:', imageUrl)
    if (!isImageUrlPresent) {
      continue
    }

    let htmlImage: HTMLImageElement

    try {
      htmlImage = await imageCache.ensureWardrobeItemImage(placement.wardrobeItemId, imageUrl)
    } catch (e) {
      console.error('IMAGE LOAD ERROR', placement, e)
      continue
    }

    if (token !== syncToken) {
      return
    }

    if (!layer) {
      return
    }

    let node = konvaImageByPlacementId.get(placement.id) ?? null

    if (!node) {
      node = new Konva.Image({ draggable: true })
      layer.add(node)
      konvaImageByPlacementId.set(placement.id, node)
      bindImageNode(placement, node)
    }

    applyPlacementToNode(placement, node, htmlImage)
  }

  transformer?.moveToTop()
  attachTransformer()
  layer?.batchDraw()
}

function initKonva() {
  const el = containerEl.value
  if (!el) {
    return
  }

  stage = new Konva.Stage({
    container: el,
    width: getMinStageSizePx(),
    height: getMinStageSizePx(),
  })

  layer = new Konva.Layer()
  stage.add(layer)

  transformer = new Konva.Transformer({
    rotateEnabled: true,
    resizeEnabled: true,
    keepRatio: true,
    shouldOverdrawWholeArea: true,
  })
  layer.add(transformer)

  stage.on('mousedown touchstart', (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const isBackgroundClick = event.target === stage
    if (!isBackgroundClick) {
      return
    }

    selectedPlacementId.value = null
    attachTransformer()
  })

  updateStageSize()
  void syncFromStore()
}

onMounted(() => {
  nextTick(() => {
    initKonva()

    const el = containerEl.value
    if (!el) {
      return
    }

    resizeObserver = new ResizeObserver(() => {
      updateStageSize()
      void syncFromStore()
    })

    resizeObserver.observe(el)
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  konvaImageByPlacementId.clear()
  stage?.destroy()
  stage = null
  layer = null
  transformer = null
})

watch(
  placements,
  () => {
    void syncFromStore()
  },
  { deep: true },
)

watch(selectedPlacementId, () => {
  attachTransformer()
})
</script>

<style scoped lang="scss">
.outfit-konva-stage {
  width: 100%;
  min-height: 200px;
  background:
    radial-gradient(circle at 1px 1px, #ddd 1px, transparent 0);
  background-size: 16px 16px;
  background-color: #f7f7f7;
  border-radius: 6px;
  overflow: hidden;
}

.outfit-konva-stage :deep(canvas) {
  display: block;
  max-width: 100%;
  height: auto;
  vertical-align: top;
}
</style>
