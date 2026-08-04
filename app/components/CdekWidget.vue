<template>
  <div class="cdek-wrapper">
    <div v-if="!isReady" class="loader">
      ⏳ Загрузка карты СДЭК...
    </div>

    <div 
      id="cdek-map" 
      class="cdek-container" 
      :class="{ 'is-loading': !isReady }"
    ></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()

const isReady = ref(false)

const initWidget = () => {
  if (window.CDEKWidget) {
    try {
      new window.CDEKWidget({
        root: 'cdek-map', 
        apiKey: config.public.yandexMapsApiKey,
        servicePath: '/api/cdek', 
        
        defaultLocation: 'Москва',
        debug: true,
        
        hideDeliveryOptions: {
          door: true,
          office: false
        },
        hideFilters: {
          have_cashless: false,
          have_cash: false,
          is_dressing_room: false,
          type: false
        },
        
        onReady: () => {
          console.log('✅ Виджет СДЭК успешно загружен!')
          isReady.value = true
        },
        
        onChoose: (type, tariff, address) => {
          console.log('📦 Выбрана доставка:', type)
          console.log('📍 Адрес:', address)
        }
      })
    } catch (e) {
      console.error('❌ Ошибка инициализации СДЭК:', e)
    }
  }
}

onMounted(() => {
  if (document.getElementById('cdek-script')) {
    initWidget()
    return
  }

  const script = document.createElement('script')
  script.id = 'cdek-script'
  script.src = 'https://cdn.jsdelivr.net/npm/@cdek-it/widget@3'
  script.async = true
  
  script.onload = () => {
    initWidget()
  }

  document.head.appendChild(script)
})
</script>

<style scoped>
.cdek-wrapper {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: #666;
  font-family: sans-serif;
}

.cdek-container {
  width: 100%;
  height: 600px;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.4s ease-in-out;
}

.cdek-container.is-loading {
  opacity: 0;
}
</style>