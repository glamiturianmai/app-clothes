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
let bgRect: Konva.Rect | null = null
let transformer: Konva.Transformer | null = null
let resizeObserver: ResizeObserver | null = null
let syncToken = 0

const konvaImageByPlacementId = new Map<string, Konva.Image>()

const sortedPlacements = computed(() =>
  [...placements.value].sort((a, b) => a.zIndex - b.zIndex),
)

function getMinStageSizePx() {
  return 180
}

function updateStageSize() {
  const el = containerEl.value
  const isElReady = Boolean(el) && Boolean(stage)
  if (!isElReady) {
    return
  }

  const rect = el!.getBoundingClientRect()
  const measuredWidth = Math.floor(rect.width)
  const viewportHeight = window.innerHeight || 0
  const verticalPadding = 28
  const measuredMaxHeight = Math.floor(viewportHeight - rect.top - verticalPadding)
  const widthCandidate = Number.isFinite(measuredWidth) && measuredWidth > 0 ? measuredWidth : 0
  const heightCap = Number.isFinite(measuredMaxHeight) && measuredMaxHeight > 0
    ? measuredMaxHeight
    : widthCandidate
  const width = Math.max(
    Math.min(widthCandidate, heightCap),
    getMinStageSizePx(),
  )
  const height = width

  stage!.width(width)
  stage!.height(height)
  canvasDraftStore.setCanvasSize(width, height)
  if (bgRect) {
    bgRect.width(width)
    bgRect.height(height)
  }
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

  for (const [index, placement] of sortedPlacements.value.entries()) {
    if (token !== syncToken) {
      return
    }

    const item = wardrobeStore.items.find((entry) => entry.id === placement.wardrobeItemId) ?? null
    const imageUrl = item?.imageUrl ?? ''
    const isImageUrlPresent = Boolean(imageUrl)

    if (!isImageUrlPresent) {
      continue
    }

    let htmlImage: HTMLImageElement | undefined

    try {
      const ensuredImage = await imageCache.ensureWardrobeItemImage(
        placement.wardrobeItemId,
        imageUrl,
      )
      if (!ensuredImage) {
        continue
      }
      htmlImage = ensuredImage
    } catch (e) {
      console.error('IMAGE LOAD ERROR', placement, e)
      continue
    }

    if (!htmlImage) {
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
      node = new Konva.Image({ image: htmlImage, draggable: true })
      layer.add(node)
      konvaImageByPlacementId.set(placement.id, node)
      bindImageNode(placement, node)
    }

    applyPlacementToNode(placement, node, htmlImage)
    node.zIndex(index + 1)
  }

  bgRect?.moveToBottom()
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

  const initialSize = getMinStageSizePx()
  bgRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: initialSize,
    height: initialSize,
    fill: '#ffffff',
    listening: false,
  })
  layer.add(bgRect)

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
  bgRect = null
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

function capturePreviewDataUrl() {
  if (!stage) {
    return null
  }
  if (!placements.value.length) {
    return null
  }
  try {
    return stage.toDataURL({
      mimeType: 'image/webp',
      pixelRatio: 0.22,
      quality: 0.62,
    })
  } catch {
    try {
      return stage.toDataURL({
        mimeType: 'image/jpeg',
        pixelRatio: 0.22,
        quality: 0.62,
      })
    } catch {
      try {
        return stage.toDataURL({ pixelRatio: 0.22 })
      } catch {
        return null
      }
    }
  }
}

defineExpose({
  capturePreviewDataUrl,
})
</script>

<style scoped lang="scss">
.outfit-konva-stage {
  width: 100%;
  min-height: 220px;
  aspect-ratio: 1 / 1;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #dcdcd9;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.7),
    0 4px 12px rgba(15, 23, 42, 0.07);
  overflow: hidden;
}

.outfit-konva-stage :deep(canvas) {
  display: block;
}
</style>
