export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/main.scss'],
  build: {
    transpile: ['konva'],
  },
  vite: {
    optimizeDeps: {
      include: ['konva'],
    },
  },
})
