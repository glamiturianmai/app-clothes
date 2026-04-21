<template>
  <article class="wardrobe-card" :class="{ 'wardrobe-card_compact': compact }">
    <div class="wardrobe-card__preview">
      <img
        class="wardrobe-card__image"
        :src="item.imageUrl"
        :alt="item.name"
        loading="lazy"
      />

      <div class="wardrobe-card__actions" :class="{ 'wardrobe-card__actions_compact': compact }">
        <button
          type="button"
          class="wardrobe-card__icon-btn"
          :aria-label="t('wardrobe.card.addToCanvas')"
          :title="t('wardrobe.card.addToCanvas')"
          @click="$emit('add:canvas', item)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>

        <button
          type="button"
          class="wardrobe-card__icon-btn"
          :aria-label="t('wardrobe.card.editItem')"
          :title="t('wardrobe.card.editItem')"
          @click="$emit('edit:item', item)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>

        <button
          type="button"
          class="wardrobe-card__icon-btn wardrobe-card__icon-btn_danger"
          :aria-label="t('wardrobe.card.removeItem')"
          :title="t('wardrobe.card.removeItem')"
          @click="$emit('remove:item', item)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
    </div>

    <div class="wardrobe-card__body">
      <h3 class="wardrobe-card__title">{{ item.name }}</h3>
      <template v-if="!compact">
        <p class="wardrobe-card__meta">
          {{ t(categoryLabelKey(item.category)) }} · {{ t(seasonLabelKey(item.season)) }}
        </p>
        <p class="wardrobe-card__meta">{{ t('wardrobe.layer', { value: item.baseLayer }) }}</p>
        <div v-if="item.tags.length" class="wardrobe-card__tags">
          <span v-for="tag in item.tags" :key="tag" class="wardrobe-card__tag">{{ tag }}</span>
        </div>
      </template>
      <p v-else class="wardrobe-card__meta wardrobe-card__meta_compact">
        {{ t(seasonLabelKey(item.season)) }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { WardrobeItem } from '~/types/wardrobe'

import { categoryLabelKey, seasonLabelKey } from '~/utils/wardrobe-ui'

withDefaults(
  defineProps<{
    item: WardrobeItem
    compact?: boolean
  }>(),
  { compact: false },
)

const { t } = useAppI18n()

defineEmits<{
  'add:canvas': [item: WardrobeItem]
  'edit:item': [item: WardrobeItem]
  'remove:item': [item: WardrobeItem]
}>()
</script>

<style scoped lang="scss">
.wardrobe-card {
  position: relative;
  display: flex;
  gap: 0.85rem;
  padding: 0.85rem;
  border: 1px solid #e9e9e7;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-1px) scale(1.01);
    border-color: #ddddda;
    box-shadow:
      0 12px 24px rgba(15, 23, 42, 0.08),
      0 2px 6px rgba(15, 23, 42, 0.05);
  }
}

.wardrobe-card_compact {
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.55rem;
  height: 100%;
}

.wardrobe-card__preview {
  position: relative;
  flex: 0 0 88px;
  height: 88px;
  border-radius: 12px;
  background: repeating-conic-gradient(#f1f1ef 0% 25%, #fff 0% 50%) 50% / 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #efefed;
}

.wardrobe-card_compact .wardrobe-card__preview {
  flex: 0 0 auto;
  width: 100%;
  aspect-ratio: 1;
  height: auto;
}

.wardrobe-card__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.18s ease;
}

.wardrobe-card:hover .wardrobe-card__image {
  transform: scale(1.03);
}

.wardrobe-card__body {
  flex: 1;
  min-width: 0;
}

.wardrobe-card_compact .wardrobe-card__body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
}

.wardrobe-card__title {
  margin: 0 0 0.2rem;
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.35;
  color: #191919;
}

.wardrobe-card_compact .wardrobe-card__title {
  font-size: 0.8rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.wardrobe-card__meta {
  margin: 0.12rem 0;
  font-size: 0.78rem;
  color: #6b6b6a;
}

.wardrobe-card__meta_compact {
  margin: 0;
  font-size: 0.68rem;
  color: #8a8a88;
}

.wardrobe-card__tags {
  margin-top: 0.45rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.wardrobe-card__tag {
  padding: 0.16rem 0.48rem;
  border: 1px solid #ececea;
  border-radius: 999px;
  background: #f7f7f5;
  font-size: 0.7rem;
  color: #5f5f5d;
}

.wardrobe-card__actions {
  position: absolute;
  inset: auto 0.45rem 0.45rem auto;
  display: flex;
  gap: 0.35rem;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  pointer-events: none;
}

.wardrobe-card:hover .wardrobe-card__actions,
.wardrobe-card:focus-within .wardrobe-card__actions {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.wardrobe-card__actions_compact {
  inset: 0.45rem 0.45rem auto auto;
}

.wardrobe-card__icon-btn {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ui-accent);
  border-radius: 10px;
  background: rgba(255, 0, 140, 0.95);
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  transition:
    background 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;

  &:hover {
    border-color: var(--ui-border-strong);
    background: #f0f0ee;
    color: var(--ui-text);
    transform: translateY(-1px);
  }
}

.wardrobe-card__icon-btn svg {
  width: 0.95rem;
  height: 0.95rem;
}

.wardrobe-card__icon-btn_danger {
  color: #fff;

  &:hover {
    border-color: var(--ui-border-strong);
    color: var(--ui-text);
    background: #f0f0ee;
  }
}

@media (hover: none) {
  .wardrobe-card__actions {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
}
</style>
