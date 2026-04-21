<template>
  <section class="wardrobe-section">
    <button
      v-if="isNavigable"
      type="button"
      class="wardrobe-section__head"
      @click="emit('expand')"
    >
      <span class="wardrobe-section__title">{{ label }}</span>
      <span class="wardrobe-section__meta">{{ items.length }}</span>
      <span class="wardrobe-section__chevron" aria-hidden="true">›</span>
    </button>
    <div v-else class="wardrobe-section__head wardrobe-section__head_static">
      <span class="wardrobe-section__title">{{ label }}</span>
      <span class="wardrobe-section__meta">{{ items.length }}</span>
    </div>

    <div class="wardrobe-section__scroll">
      <div v-if="!items.length" class="wardrobe-section__empty">{{ t('wardrobe.sectionEmpty') }}</div>
      <ul v-else class="wardrobe-section__track">
        <li v-for="entry in items" :key="entry.id" class="wardrobe-section__cell">
          <WardrobeItemCard
            compact
            :item="entry"
            @add:canvas="$emit('add:canvas', $event)"
            @edit:item="$emit('edit:item', $event)"
            @remove:item="$emit('remove:item', $event)"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WardrobeItem } from '~/types/wardrobe'

defineProps<{
  label: string
  items: WardrobeItem[]
  isNavigable: boolean
}>()

const emit = defineEmits<{
  expand: []
  'add:canvas': [item: WardrobeItem]
  'edit:item': [item: WardrobeItem]
  'remove:item': [item: WardrobeItem]
}>()

const { t } = useAppI18n()
</script>

<style scoped lang="scss">
.wardrobe-section {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-width: 0;
}

.wardrobe-section__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid #ececea;
  border-radius: 12px;
  background: #fff;
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &:hover:not(.wardrobe-section__head_static) {
    background: #fcfcfb;
    border-color: #ddddda;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05);
  }
}

.wardrobe-section__head_static {
  cursor: default;
}

.wardrobe-section__title {
  font-weight: 600;
  font-size: 0.94rem;
  flex: 1 1 auto;
  color: #191919;
}

.wardrobe-section__meta {
  min-width: 1.8rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: #f5f5f4;
  font-size: 0.72rem;
  color: #6b6b6a;
  text-align: center;
}

.wardrobe-section__chevron {
  font-size: 1.15rem;
  color: #8a8a88;
  line-height: 1;
}

.wardrobe-section__scroll {
  margin: 0 -0.2rem;
  padding: 0 0.2rem 0.25rem;
}

.wardrobe-section__track {
  list-style: none;
  margin: 0;
  padding: 0.2rem 0 0.5rem;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 0.85rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wardrobe-section__track::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.wardrobe-section__cell {
  flex: 0 0 auto;
  scroll-snap-align: start;
  width: 144px;
}

.wardrobe-section__empty {
  font-size: 0.85rem;
  color: #777;
  padding: 0.4rem 0.25rem 0.85rem;
}
</style>
