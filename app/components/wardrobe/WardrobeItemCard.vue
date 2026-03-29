<template>
  <article class="wardrobe-card">
    <div class="wardrobe-card__preview">
      <img
        class="wardrobe-card__image"
        :src="item.imageUrl"
        :alt="item.name"
        loading="lazy"
      />
    </div>
    <div class="wardrobe-card__body">
      <h3 class="wardrobe-card__title">{{ item.name }}</h3>
      <p class="wardrobe-card__meta">
        {{ categoryLabel(item.category) }} · {{ seasonLabel(item.season) }}
      </p>
      <p class="wardrobe-card__meta">Слой: {{ item.baseLayer }} · {{ item.color }}</p>
      <p v-if="item.tags.length" class="wardrobe-card__tags">
        {{ item.tags.join(', ') }}
      </p>
      <div class="wardrobe-card__actions">
        <button type="button" class="wardrobe-card__btn" @click="$emit('add:canvas', item)">
          На холст
        </button>
        <button type="button" class="wardrobe-card__btn" @click="$emit('edit:item', item)">
          Изменить
        </button>
        <button type="button" class="wardrobe-card__btn wardrobe-card__btn_danger" @click="$emit('remove:item', item)">
          Удалить
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { WardrobeItem } from '~/types/wardrobe'

import { categoryLabel, seasonLabel } from '~/utils/wardrobe-ui'

defineProps<{
  item: WardrobeItem
}>()

defineEmits<{
  'add:canvas': [item: WardrobeItem]
  'edit:item': [item: WardrobeItem]
  'remove:item': [item: WardrobeItem]
}>()
</script>

<style scoped lang="scss">
.wardrobe-card {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.wardrobe-card__preview {
  flex: 0 0 88px;
  height: 88px;
  border-radius: 6px;
  background: repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.wardrobe-card__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.wardrobe-card__body {
  flex: 1;
  min-width: 0;
}

.wardrobe-card__title {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
}

.wardrobe-card__meta {
  margin: 0.15rem 0;
  font-size: 0.8rem;
  color: #555;
}

.wardrobe-card__tags {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: #666;
}

.wardrobe-card__actions {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.wardrobe-card__btn {
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fafafa;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }
}

.wardrobe-card__btn_danger {
  border-color: #e0a4a4;
  color: #8b2b2b;

  &:hover {
    background: #fdecec;
  }
}
</style>
