<template>
  <section class="weather-widget" aria-live="polite">
    <p class="weather-widget__title">{{ t('weather.title') }}</p>
    <p v-if="isLoading" class="weather-widget__text">{{ t('common.loading') }}</p>
    <p v-else-if="errorText" class="weather-widget__text weather-widget__text_error">{{ errorText }}</p>
    <template v-else-if="weather">
      <p class="weather-widget__temp">{{ signedRounded(weather.currentTemp) }}°C {{ weather.icon }}</p>
      <p class="weather-widget__text">{{ weather.description }}</p>
      <p class="weather-widget__text">
        {{ t('weather.todayRange', { min: signedRounded(weather.minTemp), max: signedRounded(weather.maxTemp) }) }}
      </p>
      <button type="button" class="weather-widget__action" @click="emit('filter:temperature', weather.currentTemp)">
        {{ t('weather.action') }}
      </button>
    </template>
  </section>
</template>

<script setup lang="ts">
type WeatherData = {
  currentTemp: number
  description: string
  icon: string
  minTemp: number
  maxTemp: number
}

const FALLBACK_COORDS = { latitude: 59.9386, longitude: 30.3141 } // Saint Petersburg
const { t } = useAppI18n()
const emit = defineEmits<{
  'filter:temperature': [temperatureC: number]
}>()

const weather = ref<WeatherData | null>(null)
const isLoading = ref(true)
const errorText = ref('')

const codeMetaByWeatherCode: Record<number, { descriptionKey: string; icon: string }> = {
  0: { descriptionKey: 'weather.codes.0', icon: '☀️' },
  1: { descriptionKey: 'weather.codes.1', icon: '🌤️' },
  2: { descriptionKey: 'weather.codes.2', icon: '⛅' },
  3: { descriptionKey: 'weather.codes.3', icon: '☁️' },
  45: { descriptionKey: 'weather.codes.45', icon: '🌫️' },
  48: { descriptionKey: 'weather.codes.48', icon: '🌫️' },
  51: { descriptionKey: 'weather.codes.51', icon: '🌦️' },
  53: { descriptionKey: 'weather.codes.53', icon: '🌦️' },
  55: { descriptionKey: 'weather.codes.55', icon: '🌧️' },
  56: { descriptionKey: 'weather.codes.56', icon: '🌧️' },
  57: { descriptionKey: 'weather.codes.57', icon: '🌧️' },
  61: { descriptionKey: 'weather.codes.61', icon: '🌧️' },
  63: { descriptionKey: 'weather.codes.63', icon: '🌧️' },
  65: { descriptionKey: 'weather.codes.65', icon: '🌧️' },
  66: { descriptionKey: 'weather.codes.66', icon: '🌧️' },
  67: { descriptionKey: 'weather.codes.67', icon: '🌧️' },
  71: { descriptionKey: 'weather.codes.71', icon: '🌨️' },
  73: { descriptionKey: 'weather.codes.73', icon: '🌨️' },
  75: { descriptionKey: 'weather.codes.75', icon: '❄️' },
  77: { descriptionKey: 'weather.codes.77', icon: '❄️' },
  80: { descriptionKey: 'weather.codes.80', icon: '🌧️' },
  81: { descriptionKey: 'weather.codes.81', icon: '🌧️' },
  82: { descriptionKey: 'weather.codes.82', icon: '⛈️' },
  85: { descriptionKey: 'weather.codes.85', icon: '🌨️' },
  86: { descriptionKey: 'weather.codes.86', icon: '❄️' },
  95: { descriptionKey: 'weather.codes.95', icon: '⛈️' },
  96: { descriptionKey: 'weather.codes.96', icon: '⛈️' },
  99: { descriptionKey: 'weather.codes.99', icon: '⛈️' },
}

function signedRounded(value: number) {
  const rounded = Math.round(value)
  return rounded > 0 ? `+${rounded}` : String(rounded)
}

function getCoordsFromBrowser() {
  return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
    if (!import.meta.client || !navigator.geolocation) {
      reject(new Error(t('weather.errorGeolocationUnavailable')))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => reject(new Error(t('weather.errorGeolocationDenied'))),
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 },
    )
  })
}

async function loadWeather() {
  isLoading.value = true
  errorText.value = ''

  let coords = FALLBACK_COORDS
  try {
    coords = await getCoordsFromBrowser()
  } catch {
    // fallback to fixed coords
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(coords.latitude))
  url.searchParams.set('longitude', String(coords.longitude))
  url.searchParams.set('current', 'temperature_2m,weather_code')
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min')
  url.searchParams.set('forecast_days', '1')
  url.searchParams.set('timezone', 'auto')

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(t('weather.errorLoad'))
    }

    const payload = await response.json() as {
      current?: { temperature_2m?: number; weather_code?: number; weathercode?: number }
      daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] }
    }

    const currentTemp = payload.current?.temperature_2m
    const weatherCode = payload.current?.weather_code ?? payload.current?.weathercode ?? 0
    const maxTemp = payload.daily?.temperature_2m_max?.[0]
    const minTemp = payload.daily?.temperature_2m_min?.[0]

    if (
      typeof currentTemp !== 'number'
      || typeof maxTemp !== 'number'
      || typeof minTemp !== 'number'
    ) {
      throw new Error(t('weather.errorIncomplete'))
    }

    const meta = codeMetaByWeatherCode[weatherCode] ?? { descriptionKey: 'weather.unknown', icon: '🌡️' }
    weather.value = {
      currentTemp,
      maxTemp,
      minTemp,
      description: t(meta.descriptionKey),
      icon: meta.icon,
    }
  } catch (error) {
    weather.value = null
    errorText.value = error instanceof Error ? error.message : t('weather.errorLoad')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadWeather()
})
</script>

<style scoped lang="scss">
.weather-widget {
  padding: 1.15rem 1.2rem;
  border: 1px solid #ececea;
  border-radius: 14px;
  background: #fcfcfb;
  width: 100%;
  min-width: 0;
}

.weather-widget__title {
  margin: 0 0 0.3rem;
  font-size: 0.86rem;
  font-weight: 600;
  color: #6b6b6a;
}

.weather-widget__temp {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 700;
  color: #191919;
}

.weather-widget__text {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  color: #5b5b59;
}

.weather-widget__text_error {
  color: #8c3247;
}

.weather-widget__action {
  margin-top: 0.7rem;
  width: 100%;
  padding: 0.62rem 0.8rem;
  border: 1px solid var(--ui-accent);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-accent);
  color: #fff;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    border-color: var(--ui-border-strong);
    background: #f0f0ee;
    color: var(--ui-text);
  }
}
</style>
