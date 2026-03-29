<template>
  <main class="page">
    <header class="page__header">
      <h1 class="page__title">Луки</h1>
      <NuxtLink class="page__link" to="/">На главную</NuxtLink>
    </header>
    <p class="page__empty" v-if="isEmpty">Пока нет сохранённых образов.</p>
    <ul class="page__list" v-else>
      <li class="page__item" v-for="outfit in outfitsStore.outfits" :key="outfit.id">
        <span class="page__item-name">{{ outfit.name }}</span>
        <span class="page__item-meta">{{ outfit.placements.length }} предметов</span>
        <div class="page__item-actions">
          <NuxtLink class="page__open" :to="{ path: '/', query: { outfit: outfit.id } }">
            Открыть
          </NuxtLink>
          <button type="button" class="page__delete" @click="removeOutfitRow(outfit.id, outfit.name)">
            Удалить
          </button>
        </div>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const outfitsStore = useOutfitsStore()

const isEmpty = computed(() => outfitsStore.outfits.length === 0)

function removeOutfitRow(id: string, name: string) {
  const isConfirmed = window.confirm(`Удалить лук «${name}»?`)

  if (!isConfirmed) {
    return
  }

  outfitsStore.removeOutfit(id)
}
</script>

<style scoped lang="scss">
.page {
  padding: 1.5rem;
}

.page__header {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
}

.page__title {
  font-size: 1.5rem;
  margin: 0;
}

.page__link {
  color: inherit;
}

.page__empty {
  margin-top: 2rem;
}

.page__list {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
}

.page__item {
  border-top: 1px solid #e5e5e5;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem 1rem;
  align-items: center;
  padding: 0.75rem 0;
}

.page__item-name {
  font-weight: 600;
}

.page__item-meta {
  color: #555;
  font-size: 0.875rem;
  grid-column: 1;
}

.page__item-actions {
  grid-column: 2;
  grid-row: 1 / span 2;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: flex-end;
}

@media (min-width: 640px) {
  .page__item {
    grid-template-columns: 1fr auto auto;
  }

  .page__item-meta {
    grid-column: 2;
  }

  .page__item-actions {
    grid-column: 3;
    grid-row: 1 / span 2;
    flex-direction: row;
    align-items: center;
  }
}

.page__open {
  color: inherit;
  font-size: 0.875rem;
  text-decoration: underline;
}

.page__delete {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e0a4a4;
  border-radius: 4px;
  background: #fff;
  color: #8b2b2b;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}
</style>
