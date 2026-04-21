
<template>
  <div class="app-layout">
    <NuxtRouteAnnouncer />

    <header class="app-layout__header">
      <nav class="app-layout__nav">
        <NuxtLink class="app-layout__brand" to="/">{{ t('app.brand') }}</NuxtLink>
        <NuxtLink class="app-layout__link" to="/">{{ t('app.nav.wardrobe') }}</NuxtLink>
        <NuxtLink class="app-layout__link" to="/outfits">{{ t('app.nav.outfits') }}</NuxtLink>
      </nav>
    </header>

    <NuxtPage class="app-layout__page" />
  </div>
</template>

<script setup lang="ts">
const { t } = useAppI18n()
</script>

<style scoped lang="scss">
.app-layout {
  min-height: 100vh;
  background: #f8f8f7;
}

.app-layout__header {
  position: sticky;
  top: 0;
  z-index: 60;
  padding: 0.9rem 1.2rem;
  border-bottom: 1px solid #ffd1eb;
  backdrop-filter: blur(10px);
}

.app-layout__nav {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.app-layout__brand {
  margin-right: 0.65rem;
  text-decoration: none;
  color: var(--ui-accent);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.01em;
  text-transform: lowercase;
}

.app-layout__link {
  text-decoration: none;
  color: #4d4d4b;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 0.42rem 0.72rem;
  background: #f0f0ee;
  color: var(--ui-text);
  
  &:hover,
  &.router-link-active {
    border-color: var(--ui-border-strong);
    background: var(--ui-accent);
    border: 1px solid var(--ui-accent);
    border-radius: var(--ui-radius-sm);
    color: #fff;
    transition:
      border-color 0.16s ease,
      background 0.16s ease,
      color 0.16s ease;
  }
}

.app-layout__page {
  padding-top: 0.3rem;
}
</style>
