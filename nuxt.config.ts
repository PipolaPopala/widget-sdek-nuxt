// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Добавляем runtimeConfig
  runtimeConfig: {
    // Всё, что внутри public, будет доступно и на сервере, и на клиенте
    public: {
      yandexMapsApiKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY || ''
    }
  }
})