<template>
  <div class="canvas-toolbar">
    <div class="canvas-toolbar__row">
      <div class="canvas-toolbar__meta">
        <span class="canvas-toolbar__label">Холст</span>
        <span class="canvas-toolbar__value">{{ placementsCountText }}</span>
      </div>

      <div class="canvas-toolbar__meta" v-if="isSelectionPresent">
        <span class="canvas-toolbar__label">Выбрано</span>
        <span class="canvas-toolbar__value">{{ selectedWardrobeItemName }}</span>
      </div>
    </div>

    <div class="canvas-toolbar__row canvas-toolbar__actions">
      <button
        type="button"
        class="canvas-toolbar__btn"
        :disabled="!isSelectionPresent"
        @click="$emit('bring:front', selectedPlacementId)"
      >
        На передний план
      </button>

      <button
        type="button"
        class="canvas-toolbar__btn"
        :disabled="!isSelectionPresent"
        @click="$emit('send:back', selectedPlacementId)"
      >
        На задний план
      </button>

      <button
        type="button"
        class="canvas-toolbar__btn canvas-toolbar__btn_danger"
        :disabled="!isSelectionPresent"
        @click="$emit('delete:selected', selectedPlacementId)"
      >
        Удалить
      </button>

      <button
        type="button"
        class="canvas-toolbar__btn canvas-toolbar__btn_danger"
        :disabled="!isHasPlacements"
        @click="$emit('clear:all')"
      >
        Очистить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedPlacementId: string | null
  isSelectionPresent: boolean
  selectedWardrobeItemName: string | null
  isHasPlacements: boolean
  placementsCount: number
}>()

defineEmits<{
  'bring:front': [id: string | null]
  'send:back': [id: string | null]
  'delete:selected': [id: string | null]
  'clear:all': []
}>()

const placementsCountText = computed(
  () => `${props.placementsCount} предмет(а/ов)`,
)
</script>

<style scoped lang="scss">
.canvas-toolbar {
  padding: 0.75rem;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.canvas-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.canvas-toolbar__meta {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.canvas-toolbar__label {
  font-size: 0.75rem;
  color: #444;
}

.canvas-toolbar__value {
  font-weight: 600;
}

.canvas-toolbar__actions {
  gap: 0.5rem;
}

.canvas-toolbar__btn {
  padding: 0.45rem 0.65rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #f6f6f6;
  }
}

.canvas-toolbar__btn_danger {
  border-color: #e0a4a4;
  color: #8b2b2b;

  &:hover:not(:disabled) {
    background: #fdecec;
  }
}
</style>

