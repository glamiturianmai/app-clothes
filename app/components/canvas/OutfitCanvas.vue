<template>
  <section class="outfit-canvas">
    <CanvasToolbar
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

    <OutfitDraftToolbar class="outfit-canvas__outfits" @loaded:outfit="onOutfitLoaded" />

    <OutfitKonvaStage v-model:selected-placement-id="selectedPlacementId" class="outfit-canvas__stage-root" />
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import OutfitDraftToolbar from './OutfitDraftToolbar.vue';
import OutfitKonvaStage from './OutfitKonvaStage.client.vue';


const canvasDraftStore = useCanvasDraftStore()
const wardrobeStore = useWardrobeStore()

const { placements } = storeToRefs(canvasDraftStore)

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

  const item = wardrobeStore.itemById(placement.wardrobeItemId)
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
</script>

<style scoped lang="scss">
.outfit-canvas {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.outfit-canvas__outfits {
  display: block;
}

.outfit-canvas__stage-root {
  display: block;
}
</style>
