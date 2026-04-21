<template>
  <main class="home">
    <div class="home__layout">
      <div class="home__col home__col_wardrobe">
        <WardrobeBoard />
      </div>
      <aside class="home__col home__col_canvas">
        <h2 class="home__aside-title">{{ t('home.constructor') }}</h2>
        <OutfitCanvas />
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import { cloneCanvasPlacements, normalizeCanvasPlacements } from '~/utils/canvas-placements'
import OutfitCanvas from '../components/canvas/OutfitCanvas.vue'
const route = useRoute()
const { t } = useAppI18n()

const outfitsStore = useOutfitsStore()
const canvasDraftStore = useCanvasDraftStore()

const outfitsCount = computed(() => outfitsStore.outfits.length)

function applyOutfitQueryToCanvas() {
  const raw = route.query.outfit
  const id = typeof raw === 'string' ? raw : null

  if (!id) {
    return
  }

  const outfit = outfitsStore.outfits.find((entry) => entry.id === id) ?? null

  if (!outfit) {
    return
  }

  const placements = normalizeCanvasPlacements(cloneCanvasPlacements(outfit.placements))
  canvasDraftStore.replacePlacements(placements)
}

watch(
  () => route.query.outfit,
  () => {
    applyOutfitQueryToCanvas()
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.home {
  min-height: calc(100vh - 4.25rem);
  padding: 0.9rem 1.25rem 1.35rem;
}

.home__header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: flex-start;
  margin-bottom: 0.9rem;
}

.home__title {
  font-size: 1.2rem;
  margin: 0;
  color: #191919;
}

.home__layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 900px) {
  .home__layout {
    grid-template-columns: minmax(240px, 25vw) minmax(0, 1fr);
    align-items: start;
    justify-content: stretch;
  }
}

.home__col_wardrobe {
  min-width: 0;
  max-height: calc(100vh - 6.4rem);
  overflow: auto;
  padding-right: 0.3rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.home__col_wardrobe::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.home__col_canvas {
  padding: 0.85rem;
  border: 1px solid #ececea;
  border-radius: 12px;
  background: #fcfcfb;
  min-width: 0;
}

.home__aside-title {
  margin: 0 0 0.45rem;
  font-size: 0.95rem;
}

.home__aside-text {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #444;
}

.home__meta {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}
</style>
