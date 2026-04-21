<template>
  <main class="page">
    <div class="page__layout">
      <section class="page__content">
        <header class="page__header">
          <h1 class="page__title">{{ t('outfits.title') }}</h1>
        </header>

        <p v-if="weatherFilterTemp !== null" class="page__filter-note">
          {{ t('outfits.filterByWeather', { temp: signedRounded(weatherFilterTemp) }) }}
          <button type="button" class="page__filter-reset" @click="weatherFilterTemp = null">{{ t('outfits.resetFilter') }}</button>
        </p>

        <p class="page__empty" v-if="!isHasOutfits">{{ t('outfits.empty') }}</p>
        <p class="page__empty" v-else-if="!displayedOutfits.length">{{ t('outfits.noMatchByWeather') }}</p>
        <ul class="page__list" v-else>
          <li class="page__item" v-for="outfit in displayedOutfits" :key="outfit.id">
            <div class="page__item-inner">
              <NuxtLink class="page__card" :to="{ path: '/', query: { outfit: outfit.id } }">
                <div class="page__preview-wrap">
                  <img
                    v-if="previewUrlByOutfitId[outfit.id]"
                    :src="previewUrlByOutfitId[outfit.id]!"
                    :alt="t('outfits.previewAlt', { name: outfit.name })"
                    class="page__preview"
                    loading="lazy"
                  />
                  <div v-else class="page__preview-placeholder">{{ t('outfits.previewMissing') }}</div>
                </div>
                <div class="page__info">
                  <strong class="page__item-name">{{ outfit.name }}</strong>
                  <span class="page__item-meta">{{ t('outfits.itemsCount', { count: outfit.placements.length }) }}</span>
                  <span class="page__item-meta">
                    {{ t('outfits.temperatureRange', { min: signedRounded(outfit.minTemperatureC), max: signedRounded(outfit.maxTemperatureC) }) }}
                  </span>
                </div>
              </NuxtLink>

              <button
                type="button"
                class="page__delete-icon"
                :aria-label="t('outfits.deleteAria')"
                :title="t('common.delete')"
                @click.stop.prevent="removeOutfitRow(outfit.id, outfit.name)"
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
          </li>
        </ul>
      </section>

      <aside class="page__sidebar">
        <WeatherWidget class="page__weather" @filter:temperature="onFilterByWeather" />
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import WeatherWidget from '~/components/shared/WeatherWidget.client.vue'

const outfitsStore = useOutfitsStore()
const wardrobeStore = useWardrobeStore()
const { t } = useAppI18n()
const weatherFilterTemp = ref<number | null>(null)

const isHasOutfits = computed(() => outfitsStore.outfits.length > 0)
const displayedOutfits = computed(() => {
  if (weatherFilterTemp.value == null) {
    return outfitsStore.outfits
  }
  return outfitsStore.outfits.filter((outfit) =>
    weatherFilterTemp.value! >= outfit.minTemperatureC
    && weatherFilterTemp.value! <= outfit.maxTemperatureC,
  )
})

const previewUrlByOutfitId = computed(() => {
  const itemUrlById = new Map(
    wardrobeStore.items.map((item) => [item.id, item.imageUrl] as const),
  )

  const result: Record<string, string | null> = {}
  for (const outfit of outfitsStore.outfits) {
    if (outfit.previewImageUrl) {
      result[outfit.id] = outfit.previewImageUrl
      continue
    }

    const fallback = outfit.placements
      .map((placement) => itemUrlById.get(placement.wardrobeItemId) ?? null)
      .find((url) => typeof url === 'string' && url.length > 0) ?? null

    result[outfit.id] = fallback
  }
  return result
})

function removeOutfitRow(id: string, name: string) {
  const isConfirmed = window.confirm(t('outfits.deleteConfirm', { name }))

  if (!isConfirmed) {
    return
  }

  outfitsStore.removeOutfit(id)
}

function onFilterByWeather(temperatureC: number) {
  weatherFilterTemp.value = temperatureC
}

function signedRounded(value: number) {
  const rounded = Math.round(value)
  return rounded > 0 ? `+${rounded}` : String(rounded)
}
</script>

<style scoped lang="scss">
.page {
  padding: 1rem 1.25rem 1.5rem;
}

.page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
  align-items: start;
  gap: 1rem;
}

.page__content {
  min-width: 0;
}

.page__sidebar {
  position: sticky;
  top: 5.4rem;
}

.page__header {
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.45rem;
}

.page__title {
  font-size: 1.2rem;
  margin: 0;
  color: #191919;
}

.page__weather {
  width: 100%;
}

.page__filter-note {
  margin: 0.4rem 0 0;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ecd8e5;
  border-radius: 10px;
  background: #fff7fc;
  font-size: 0.78rem;
  color: #4f4f4d;
}

.page__filter-reset {
  padding: 0.18rem 0.42rem;
  border: 1px solid var(--ui-accent);
  border-radius: 8px;
  background: var(--ui-accent);
  color: #fff;
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;

  &:hover {
    border-color: var(--ui-border-strong);
    background: #f0f0ee;
    color: var(--ui-text);
  }
}

.page__empty {
  margin-top: 2rem;
}

.page__list {
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fill, minmax(144px, 1fr));
}

.page__item {
  border: 1px solid #e9e9e7;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
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

.page__item-inner {
  position: relative;
}

.page__card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.55rem;
  color: inherit;
  text-decoration: none;
}

.page__preview-wrap {
  height: auto;
  aspect-ratio: 1;
  border-radius: 12px;
  border: 1px solid #efefed;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page__preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.page__preview-placeholder {
  color: #666;
  font-size: 0.8rem;
}

.page__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page__item-name {
  font-weight: 600;
  font-size: 0.82rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.page__item-meta {
  color: #777;
  font-size: 0.68rem;
}

.page__delete-icon {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  z-index: 2;
  width: 1.9rem;
  height: 1.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #7a7a78;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 0.16s ease,
    transform 0.16s ease,
    background 0.16s ease,
    color 0.16s ease;

  &:hover {
    border-color: var(--ui-accent);
    background: var(--ui-accent-soft);
    color: var(--ui-accent);
  }
}

.page__delete-icon svg {
  width: 0.95rem;
  height: 0.95rem;
}

.page__item-inner:hover .page__delete-icon,
.page__item-inner:focus-within .page__delete-icon {
  opacity: 1;
  transform: translateY(0);
}

@media (hover: none) {
  .page__delete-icon {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 720px) {
  .page__layout {
    grid-template-columns: 1fr;
  }

  .page__sidebar {
    position: static;
  }
}
</style>
