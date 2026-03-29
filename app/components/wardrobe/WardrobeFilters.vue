<template>
  <div class="wardrobe-filters">
    <label class="wardrobe-filters__field">
      <span class="wardrobe-filters__label">Категория</span>
      <select v-model="filters.category" class="wardrobe-filters__select">
        <option value="all">Все</option>
        <option
          v-for="option in WARDROBE_CATEGORY_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="wardrobe-filters__field">
      <span class="wardrobe-filters__label">Сезон</span>
      <select v-model="filters.season" class="wardrobe-filters__select">
        <option value="all">Все</option>
        <option
          v-for="option in WARDROBE_SEASON_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="wardrobe-filters__field wardrobe-filters__field_wide">
      <span class="wardrobe-filters__label">Теги или название</span>
      <input
        v-model="filters.tagQuery"
        type="search"
        class="wardrobe-filters__input"
        placeholder="часть тега или имени"
        autocomplete="off"
      />
    </label>

    <button type="button" class="wardrobe-filters__reset" @click="resetFilters">
      Сбросить
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  createDefaultWardrobeListFilters,
  type WardrobeListFilters,
} from '~/composables/useWardrobeFilteredItems'
import { WARDROBE_CATEGORY_OPTIONS, WARDROBE_SEASON_OPTIONS } from '~/utils/wardrobe-ui'

const filters = defineModel<WardrobeListFilters>({ required: true })

function resetFilters() {
  filters.value = createDefaultWardrobeListFilters()
}
</script>

<style scoped lang="scss">
.wardrobe-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
}

.wardrobe-filters__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 8rem;
}

.wardrobe-filters__field_wide {
  flex: 1 1 12rem;
}

.wardrobe-filters__label {
  font-size: 0.75rem;
  color: #444;
}

.wardrobe-filters__select,
.wardrobe-filters__input {
  padding: 0.4rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font: inherit;
}

.wardrobe-filters__reset {
  padding: 0.45rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f5f5f5;
  font: inherit;
  cursor: pointer;

  &:hover {
    background: #ebebeb;
  }
}
</style>
