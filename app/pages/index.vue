<template>
  <main class="home">
    <header class="home__header">
      <h1 class="home__title">Outfit Canvas</h1>
      <nav class="home__nav">
        <NuxtLink class="home__link" to="/">Главная</NuxtLink>
        <NuxtLink class="home__link" to="/outfits">Луки</NuxtLink>
      </nav>
    </header>

    <div class="home__layout">
      <div class="home__col home__col_wardrobe">
        <WardrobeBoard />
      </div>
      <aside class="home__col home__col_canvas">
        <h2 class="home__aside-title">Конструктор</h2>
        <OutfitCanvas />
        <p class="home__meta">Сохранённых луков: {{ outfitsCount }}</p>
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import { normalizeCanvasPlacements } from '~/utils/canvas-placements'
import OutfitCanvas from '../components/canvas/OutfitCanvas.vue'
const route = useRoute()

const outfitsStore = useOutfitsStore()
const canvasDraftStore = useCanvasDraftStore()

const outfitsCount = computed(() => outfitsStore.outfits.length)

function applyOutfitQueryToCanvas() {
  const raw = route.query.outfit
  const id = typeof raw === 'string' ? raw : null

  if (!id) {
    return
  }

  const outfit = outfitsStore.outfitById(id)

  if (!outfit) {
    return
  }

  const placements = normalizeCanvasPlacements(structuredClone(outfit.placements))
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
  min-height: 100vh;
  padding: 1rem 1.25rem 2rem;
}

.home__header {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.home__title {
  font-size: 1.5rem;
  margin: 0;
}

.home__nav {
  display: flex;
  gap: 1rem;
}

.home__link {
  color: inherit;
}

.home__layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 900px) {
  .home__layout {
    grid-template-columns: 3fr 7fr;
    align-items: start;
  }
}

.home__col_wardrobe {
  min-width: 0;
}

.home__col_canvas {
  padding: 1rem;
  border: 1px dashed #ccc;
  border-radius: 8px;
  background: #fafafa;
}

.home__aside-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.home__aside-text {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #444;
}

.home__meta {
  margin: 0;
  font-size: 0.85rem;
  color: #555;
}
</style>
