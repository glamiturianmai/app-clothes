<template>
  <div class="wardrobe-filters">
    <div class="wardrobe-filters__row">
      <label class="wardrobe-filters__field">
        <span class="wardrobe-filters__label">{{ t('wardrobe.filters.season') }}</span>
        <select v-model="filters.season" class="wardrobe-filters__select">
          <option value="all">{{ t('wardrobe.filters.all') }}</option>
          <option
            v-for="option in WARDROBE_SEASON_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ t(option.labelKey) }}
          </option>
        </select>
      </label>

      <div class="wardrobe-filters__field wardrobe-filters__field_tags">
        <span class="wardrobe-filters__label">{{ t('wardrobe.filters.tags') }}</span>
        <TagSelector
          v-model="matchTagsModel"
          :options="wardrobeStoreApi.availableTags"
          :allow-custom="true"
          :placeholder="t('wardrobe.filters.tagsPlaceholder')"
          @create:option="onCreateFilterTag"
        />
      </div>
      <button
        type="button"
        class="wardrobe-filters__reset"
        :title="t('wardrobe.filters.resetTitle')"
        @click="resetFilters"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8.27" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import TagSelector from '~/components/shared/TagSelector.vue'
import {
  createDefaultWardrobeListFilters,
  type WardrobeListFilters,
} from '~/composables/useWardrobeFilteredItems'
import { WARDROBE_SEASON_OPTIONS } from '~/utils/wardrobe-ui'

const wardrobeStore = useWardrobeStore()
const { t } = useAppI18n()
const wardrobeStoreApi = wardrobeStore as unknown as {
  availableTags: string[]
  registerTags: (tags: string[]) => void
}

const filters = defineModel<WardrobeListFilters>({ required: true })

const matchTagsModel = computed({
  get: () => filters.value.matchTags,
  set: (next) => {
    filters.value = { ...filters.value, matchTags: next }
  },
})

function resetFilters() {
  filters.value = createDefaultWardrobeListFilters()
}

function onCreateFilterTag(tag: string) {
  wardrobeStoreApi.registerTags([tag])
}
</script>

<style scoped lang="scss">
.wardrobe-filters {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  align-items: flex-end;
  padding: 0.9rem;
  border: 1px solid #ececea;
  border-radius: 14px;
  background: #fcfcfb;
}

.wardrobe-filters__row {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  align-items: flex-end;
}

.wardrobe-filters__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 9rem;
}

.wardrobe-filters__field_tags {
  flex: 1 1 18rem;
  min-width: min(100%, 17rem);
}

.wardrobe-filters__label {
  font-size: 0.84rem;
  color: #575756;
  font-weight: 600;
}

.wardrobe-filters__select {
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--ui-border-strong);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  font: inherit;
  color: var(--ui-text);
  font-size: 0.82rem;
}

.wardrobe-filters__reset {
  width: 2.15rem;
  height: 2.15rem;
  padding: 0;
  border: 1px solid var(--ui-accent);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    border-color: var(--ui-border-strong);
    background: #f0f0ee;
    color: var(--ui-text);
  }
}

.wardrobe-filters__reset svg {
  width: 0.9rem;
  height: 0.9rem;
}
</style>
