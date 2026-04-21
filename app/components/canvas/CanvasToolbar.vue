<template>
  <aside class="canvas-toolbar">
    <div class="canvas-toolbar__meta">
      <span class="canvas-toolbar__selected" v-if="isSelectionPresent">{{ selectedWardrobeItemName }}</span>
    </div>

    <div class="canvas-toolbar__actions">
      <button
        type="button"
        class="canvas-toolbar__btn"
        :disabled="!isSelectionPresent"
        :title="t('canvasToolbar.toFront')"
        @click="$emit('bring:front', selectedPlacementId)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3v12" />
          <path d="m8 7 4-4 4 4" />
          <rect x="5" y="15" width="14" height="6" rx="1.5" />
        </svg>
      </button>

      <button
        type="button"
        class="canvas-toolbar__btn"
        :disabled="!isSelectionPresent"
        :title="t('canvasToolbar.toBack')"
        @click="$emit('send:back', selectedPlacementId)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 21V9" />
          <path d="m8 17 4 4 4-4" />
          <rect x="5" y="3" width="14" height="6" rx="1.5" />
        </svg>
      </button>

      <button
        type="button"
        class="canvas-toolbar__btn canvas-toolbar__btn_danger"
        :disabled="!isSelectionPresent"
        :title="t('canvasToolbar.deleteSelected')"
        @click="$emit('delete:selected', selectedPlacementId)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>

      <button
        type="button"
        class="canvas-toolbar__btn canvas-toolbar__btn_danger"
        :disabled="!isHasPlacements"
        :title="t('canvasToolbar.clearCanvas')"
        @click="$emit('clear:all')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M5 6l1 14h12l1-14" />
          <path d="M9 10v6" />
          <path d="M15 10v6" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedPlacementId: string | null
  isSelectionPresent: boolean
  selectedWardrobeItemName: string | null
  isHasPlacements: boolean
  placementsCount: number
}>()

const { t } = useAppI18n()

defineEmits<{
  'bring:front': [id: string | null]
  'send:back': [id: string | null]
  'delete:selected': [id: string | null]
  'clear:all': []
}>()
</script>

<style scoped lang="scss">
.canvas-toolbar {
  padding: 0.55rem;
  border: 1px solid #e6e6e3;
  border-radius: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: 52px;
  flex: 0 0 52px;
}

.canvas-toolbar__meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.canvas-toolbar__label {
  font-size: 0.62rem;
  color: #666;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
}

.canvas-toolbar__selected {
  display: none;
}

.canvas-toolbar__actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.canvas-toolbar__btn {
  width: 100%;
  height: 2rem;
  border: 1px solid var(--ui-accent);
  border-radius: 8px;
  background: var(--ui-accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    border-color: var(--ui-border-strong);
    background: #f0f0ee;
    color: var(--ui-text);
  }
}

.canvas-toolbar__btn svg {
  width: 0.95rem;
  height: 0.95rem;
}

.canvas-toolbar__btn_danger {
  border-color: var(--ui-accent);
  color: #fff;

  &:hover:not(:disabled) {
    border-color: var(--ui-border-strong);
    background: #f0f0ee;
    color: var(--ui-text);
  }
}
</style>

