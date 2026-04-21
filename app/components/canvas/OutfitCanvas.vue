<template>
  <section class="outfit-canvas">
    <div class="outfit-canvas__layout">
      <div class="outfit-canvas__left">
        <div class="outfit-canvas__workspace">
          <CanvasToolbar
            class="outfit-canvas__sidebar"
            :selected-placement-id="selectedPlacementId"
            :is-selection-present="isSelectionPresent"
            :selected-wardrobe-item-name="selectedWardrobeItemName"
            :is-has-placements="isHasPlacements"
            :placements-count="placements.length"
            @bring:front="onBringToFront"
            @send:back="onSendToBack"
            @delete:selected="onDeleteSelected"
            @clear:all="onClearAll"
          />

          <OutfitKonvaStage
            ref="stageRef"
            v-model:selected-placement-id="selectedPlacementId"
            class="outfit-canvas__stage-root"
          />
        </div>
      </div>
      <aside class="outfit-canvas__right">
        <OutfitDraftToolbar
          class="outfit-canvas__outfits"
          :capture-preview="captureOutfitPreview"
          @loaded:outfit="onOutfitLoaded"
        />
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import OutfitDraftToolbar from './OutfitDraftToolbar.vue'
import OutfitKonvaStage from './OutfitKonvaStage.client.vue'

type OutfitKonvaStagePublicApi = {
  capturePreviewDataUrl: () => string | null
}

const canvasDraftStore = useCanvasDraftStore()
const wardrobeStore = useWardrobeStore()

const { placements } = storeToRefs(canvasDraftStore)

const stageRef = ref<OutfitKonvaStagePublicApi | null>(null)
const selectedPlacementId = ref<string | null>(null)

const isHasPlacements = computed(() => placements.value.length > 0)
const isSelectionPresent = computed(() => selectedPlacementId.value != null)

const selectedWardrobeItemName = computed(() => {
  const id = selectedPlacementId.value
  if (!id) {
    return null
  }

  const placement = canvasDraftStore.placementById(id)
  if (!placement) {
    return null
  }

  const item = wardrobeStore.items.find((entry) => entry.id === placement.wardrobeItemId) ?? null
  return item?.name ?? null
})

watch(
  () => canvasDraftStore.lastAddedPlacementId,
  (id) => {
    if (!id) {
      return
    }
    selectedPlacementId.value = id
  },
)

function onBringToFront(id: string | null) {
  if (!id) {
    return
  }
  canvasDraftStore.bringPlacementToFront(id)
}

function onSendToBack(id: string | null) {
  if (!id) {
    return
  }
  canvasDraftStore.sendPlacementToBack(id)
}

function onDeleteSelected(id: string | null) {
  if (!id) {
    return
  }

  const isRemoved = canvasDraftStore.removePlacement(id)
  if (isRemoved) {
    selectedPlacementId.value = null
  }
}

function onClearAll() {
  canvasDraftStore.clearPlacements()
  selectedPlacementId.value = null
}

function onOutfitLoaded() {
  selectedPlacementId.value = null
}

function captureOutfitPreview() {
  try {
    return stageRef.value?.capturePreviewDataUrl() ?? null
  } catch {
    return null
  }
}
</script>

<style scoped lang="scss">
.outfit-canvas {
  width: 100%;
}

.outfit-canvas__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(250px, 300px);
  gap: 0.75rem;
  align-items: start;
  width: 100%;
}

.outfit-canvas__left {
  min-width: 0;
}

.outfit-canvas__workspace {
  display: grid;
  grid-template-columns: auto minmax(220px, 650px);
  justify-content: start;
  align-items: start;
  gap: 0.5rem;
  width: 100%;
}

.outfit-canvas__right {
  min-width: 0;
}

.outfit-canvas__outfits {
  width: 100%;
}

.outfit-canvas__stage-root {
  display: block;
  width: min(100%, 700px);
  min-width: 0;
}

@media (max-width: 900px) {
  .outfit-canvas__layout {
    grid-template-columns: 1fr;
  }

  .outfit-canvas__workspace {
    grid-template-columns: 1fr;
    justify-content: stretch;
  }

  .outfit-canvas__sidebar {
    width: 100%;
    flex: 0 0 auto;
  }
}
</style>
