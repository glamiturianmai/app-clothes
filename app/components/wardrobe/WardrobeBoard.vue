<template>
  <section class="wardrobe-board">
    <header class="wardrobe-board__header">
      <h2 class="wardrobe-board__title">Гардероб</h2>
      <button v-if="!isFormOpen" type="button" class="wardrobe-board__add" @click="openCreateForm">
        + Добавить вещь
      </button>
    </header>

    <WardrobeFilters v-model="filters" />

    <WardrobeItemForm
      v-if="isFormOpen"
      :key="editingItem?.id ?? 'new'"
      class="wardrobe-board__form"
      :item="editingItem"
      @cancel="closeForm"
      @save="onSaveItem"
    />

    <p v-if="!wardrobeStore.items.length" class="wardrobe-board__empty">
      В гардеробе пока нет вещей. Добавьте первую — с PNG на прозрачном фоне.
    </p>
    <p v-else-if="!sortedFilteredItems.length" class="wardrobe-board__empty">
      Ничего не найдено. Поменяйте фильтры.
    </p>
    <ul v-else class="wardrobe-board__list">
      <li v-for="entry in sortedFilteredItems" :key="entry.id" class="wardrobe-board__item">
        <WardrobeItemCard
          :item="entry"
          @add:canvas="onAddToCanvas"
          @edit:item="openEditForm"
          @remove:item="onRemoveItem"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { WardrobeItem, WardrobeItemInput } from '~/types/wardrobe'

import { createDefaultWardrobeListFilters, useWardrobeFilteredItems } from '~/composables/useWardrobeFilteredItems'

const canvasDraftStore = useCanvasDraftStore()
const wardrobeStore = useWardrobeStore()

const { items } = storeToRefs(wardrobeStore)

const filters = ref(createDefaultWardrobeListFilters())
const { filteredItems } = useWardrobeFilteredItems(items, filters)

const sortedFilteredItems = computed(() =>
  [...filteredItems.value].sort((a, b) => b.updatedAt - a.updatedAt),
)

const isFormOpen = ref(false)
const editingItem = ref<WardrobeItem | null>(null)

function openCreateForm() {
  editingItem.value = null
  isFormOpen.value = true
}

function openEditForm(item: WardrobeItem) {
  editingItem.value = item
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editingItem.value = null
}

function onSaveItem(input: WardrobeItemInput) {
  if (editingItem.value) {
    wardrobeStore.updateItem(editingItem.value.id, input)
  } else {
    wardrobeStore.addItem(input)
  }
  closeForm()
}

function onRemoveItem(item: WardrobeItem) {
  const isConfirmed = window.confirm(`Удалить «${item.name}» из гардероба?`)

  if (!isConfirmed) {
    return
  }

  wardrobeStore.removeItem(item.id)

  if (editingItem.value?.id === item.id) {
    closeForm()
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
  gap: 1rem;
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
  font-size: 1.15rem;
}

.wardrobe-board__add {
  padding: 0.45rem 0.75rem;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  background: #1a1a1a;
  color: #fff;
  font: inherit;
  cursor: pointer;

  &:hover {
    background: #333;
  }
}

.wardrobe-board__form {
  margin-top: 0.25rem;
}

.wardrobe-board__empty {
  margin: 0;
  padding: 1rem 0;
  color: #555;
  font-size: 0.9rem;
}

.wardrobe-board__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wardrobe-board__item {
  margin: 0;
}
</style>
