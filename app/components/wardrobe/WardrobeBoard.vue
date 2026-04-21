<template>
  <section class="wardrobe-board">
    <header class="wardrobe-board__header">
      <h2 class="wardrobe-board__title">{{ t('wardrobe.title') }}</h2>
      <button type="button" class="wardrobe-board__add" @click="openCreateForm">{{ t('wardrobe.addItem') }}</button>
    </header>

    <WardrobeFilters v-model="filters" />

    <div v-if="expandedCategory" class="wardrobe-board__expanded-bar">
      <button type="button" class="wardrobe-board__back" @click="expandedCategory = null">
        {{ t('wardrobe.backToSections') }}
      </button>
    </div>

    <p v-if="!wardrobeStore.items.length" class="wardrobe-board__empty">
      {{ t('wardrobe.empty') }}
    </p>
    <p v-else-if="!sortedFilteredItems.length" class="wardrobe-board__empty">
      {{ t('wardrobe.noResults') }}
    </p>
    <div v-else class="wardrobe-board__sections">
      <WardrobeCategorySection
        v-for="section in visibleSections"
        :key="section.value"
        :label="t(section.labelKey)"
        :items="itemsByCategory[section.value]"
        :is-navigable="!expandedCategory"
        @expand="expandedCategory = section.value"
        @add:canvas="onAddToCanvas"
        @edit:item="openEditForm"
        @remove:item="onRemoveItem"
      />
    </div>

    <WardrobeItemModal
      :open="isModalOpen"
      :item="editingItem"
      @close="closeModal"
      @save="onSaveItem"
    />
  </section>
</template>

<script setup lang="ts">
import type { WardrobeCategory, WardrobeItem, WardrobeItemInput } from '~/types/wardrobe'

import { createDefaultWardrobeListFilters, useWardrobeFilteredItems } from '~/composables/useWardrobeFilteredItems'
import { WARDROBE_CATEGORY_OPTIONS } from '~/utils/wardrobe-ui'

const canvasDraftStore = useCanvasDraftStore()
const wardrobeStore = useWardrobeStore()
const outfitsStore = useOutfitsStore()
const { t } = useAppI18n()
const wardrobeStoreApi = wardrobeStore as unknown as {
  addItem: (input: WardrobeItemInput) => WardrobeItem
  updateItem: (id: string, patch: WardrobeItemInput) => WardrobeItem | null
  removeItem: (id: string) => boolean
}
const outfitsStoreApi = outfitsStore as unknown as {
  removePlacementsForItem: (wardrobeItemId: string) => void
}

const { items } = storeToRefs(wardrobeStore)

const filters = ref(createDefaultWardrobeListFilters())
const { filteredItems } = useWardrobeFilteredItems(items, filters)

const sortedFilteredItems = computed(() =>
  [...filteredItems.value].sort((a, b) => b.updatedAt - a.updatedAt),
)

const itemsByCategory = computed(() => {
  const map = {
    accessories: [] as WardrobeItem[],
    bottom: [] as WardrobeItem[],
    outerwear: [] as WardrobeItem[],
    shoes: [] as WardrobeItem[],
    top: [] as WardrobeItem[],
  }
  for (const item of sortedFilteredItems.value) {
    map[item.category].push(item)
  }
  return map
})

const expandedCategory = ref<WardrobeCategory | null>(null)

const visibleSections = computed(() => {
  const nonEmpty = WARDROBE_CATEGORY_OPTIONS.filter(
    (section) => itemsByCategory.value[section.value].length > 0,
  )
  if (expandedCategory.value) {
    const one = nonEmpty.find((o) => o.value === expandedCategory.value)
    return one ? [one] : nonEmpty
  }
  return nonEmpty
})

const isModalOpen = ref(false)
const editingItem = ref<WardrobeItem | null>(null)

function openCreateForm() {
  editingItem.value = null
  isModalOpen.value = true
}

function openEditForm(item: WardrobeItem) {
  editingItem.value = item
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingItem.value = null
}

function onSaveItem(input: WardrobeItemInput) {
  if (editingItem.value) {
    wardrobeStoreApi.updateItem(editingItem.value.id, input)
  } else {
    wardrobeStoreApi.addItem(input)
  }
  closeModal()
}

function onRemoveItem(item: WardrobeItem) {
  const isConfirmed = window.confirm(t('wardrobe.removeConfirm', { name: item.name }))

  if (!isConfirmed) {
    return
  }

  wardrobeStoreApi.removeItem(item.id)
  outfitsStoreApi.removePlacementsForItem(item.id)

  if (editingItem.value?.id === item.id) {
    closeModal()
  }
}

function onAddToCanvas(item: WardrobeItem) {
  canvasDraftStore.addPlacementForWardrobeItem(item.id)
}
</script>

<style scoped lang="scss">
.wardrobe-board {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  min-width: 0;
}

.wardrobe-board__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.wardrobe-board__title {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 600;
  color: #191919;
}

.wardrobe-board__add {
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--ui-accent);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-accent);
  color: #fff;
  font: inherit;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &:hover {
    background: #f0f0ee;
    border-color: var(--ui-border-strong);
    color: var(--ui-text);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  }
}

.wardrobe-board__expanded-bar {
  display: flex;
  align-items: center;
}

.wardrobe-board__back {
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--ui-accent);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-accent);
  font: inherit;
  font-size: 0.84rem;
  cursor: pointer;
  color: #fff;

  &:hover {
    background: #f0f0ee;
    border-color: var(--ui-border-strong);
    color: var(--ui-text);
  }
}

.wardrobe-board__empty {
  margin: 0;
  padding: 1.15rem 1rem;
  color: #6b6b6a;
  font-size: 0.9rem;
  border: 1px dashed #e7e7e4;
  border-radius: 14px;
  background: #fcfcfb;
}

.wardrobe-board__sections {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
