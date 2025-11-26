<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { speedTestApi, type SpeedTestResult, type SpeedTestStats } from '@/services/api'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const toast = useToast()

// Geolocation
const userLocation = ref<{ lat: number; lon: number } | null>(null)
const locationError = ref<string | null>(null)
const isGettingLocation = ref(false)

// Speed test state
const isTesting = ref(false)
const testPhase = ref<'idle' | 'ping' | 'download' | 'complete'>('idle')
const downloadSpeed = ref(0)
const uploadSpeed = ref(0)
const pingValue = ref(0)
const testProgress = ref(0)

// Provider selection
const selectedProvider = ref('wifi')
const providers = [
  { label: 'WiFi', value: 'wifi', color: '#6366f1' },
  { label: 'Altel', value: 'altel', color: '#ef4444' },
  { label: 'Activ', value: 'activ', color: '#22c55e' },
  { label: 'Beeline', value: 'beeline', color: '#fbbf24' },
  { label: 'Kcell', value: 'kcell', color: '#3b82f6' },
  { label: 'Tele2', value: 'tele2', color: '#ec4899' }
]

// Map
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let userMarker: L.Marker | null = null
const speedTestResults = ref<SpeedTestResult[]>([])
const providerStats = ref<SpeedTestStats[]>([])

// Kazakhstan cities for nearest city calculation
const kazakhstanCities = [
  { name: 'Астана', lat: 51.1694, lon: 71.4491 },
  { name: 'Алматы', lat: 43.2220, lon: 76.8512 },
  { name: 'Шымкент', lat: 42.3417, lon: 69.5967 },
  { name: 'Караганда', lat: 49.8047, lon: 73.1094 },
  { name: 'Актобе', lat: 50.2839, lon: 57.1670 },
  { name: 'Атырау', lat: 46.8066, lon: 51.8780 },
  { name: 'Павлодар', lat: 52.2873, lon: 76.9674 },
  { name: 'Усть-Каменогорск', lat: 49.9480, lon: 82.6093 }
]

// Get color based on download speed (red -> yellow -> green)
const getSpeedColor = (speed: number): string => {
  // Speed ranges: 0-25 Mbps = red, 25-50 = orange, 50-75 = yellow, 75-100 = light green, 100+ = green
  if (speed < 25) return '#ef4444' // red
  if (speed < 50) return '#f97316' // orange
  if (speed < 75) return '#eab308' // yellow
  if (speed < 100) return '#84cc16' // lime
  return '#22c55e' // green
}

// Get user geolocation
const getUserLocation = (centerMap = false) => {
  isGettingLocation.value = true
  locationError.value = null

  if (!navigator.geolocation) {
    locationError.value = 'Геолокация не поддерживается вашим браузером'
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: locationError.value,
      life: 5000
    })
    isGettingLocation.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      }
      isGettingLocation.value = false
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Местоположение определено',
        life: 3000
      })

      // Update user marker on map
      updateUserMarker()

      // Center map on user location if requested
      if (centerMap && map && userLocation.value) {
        map.setView([userLocation.value.lat, userLocation.value.lon], 14)
      }
    },
    (error) => {
      isGettingLocation.value = false
      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationError.value = 'Доступ к геолокации запрещён'
          break
        case error.POSITION_UNAVAILABLE:
          locationError.value = 'Местоположение недоступно'
          break
        case error.TIMEOUT:
          locationError.value = 'Время ожидания истекло'
          break
        default:
          locationError.value = 'Неизвестная ошибка'
      }
      toast.add({
        severity: 'error',
        summary: 'Ошибка геолокации',
        detail: locationError.value,
        life: 5000
      })
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  )
}

// Update user location marker on map
const updateUserMarker = () => {
  if (!map || !userLocation.value) return

  // Remove existing user marker
  if (userMarker) {
    userMarker.remove()
  }

  // Create blue pulsing marker for user location
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<div class="user-marker-pulse"></div><div class="user-marker-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  userMarker = L.marker([userLocation.value.lat, userLocation.value.lon], { icon: userIcon })
    .addTo(map)
    .bindPopup('<b>Вы здесь</b>')
}

// Go to user location on map
const goToMyLocation = () => {
  if (userLocation.value && map) {
    map.setView([userLocation.value.lat, userLocation.value.lon], 14)
    updateUserMarker()
  } else {
    getUserLocation(true)
  }
}

// Speed test functions - using real network requests
// Large test files from Cloudflare's speed test infrastructure
const downloadTestUrls = [
  'https://speed.cloudflare.com/__down?bytes=10000000', // 10 MB
  'https://speed.cloudflare.com/__down?bytes=25000000', // 25 MB
  'https://speed.cloudflare.com/__down?bytes=100000000', // 100 MB
]

const measurePing = async (): Promise<number> => {
  const iterations = 20
  const pings: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    try {
      // Use Cloudflare's speed test endpoint for accurate ping
      await fetch('https://speed.cloudflare.com/__down?bytes=0', {
        cache: 'no-store'
      })
    } catch {
      // Fallback
      try {
        await fetch('https://www.google.com/generate_204', {
          mode: 'no-cors',
          cache: 'no-store'
        })
      } catch {
        // Continue
      }
    }
    const end = performance.now()
    const pingTime = end - start
    if (pingTime > 0 && pingTime < 3000) {
      pings.push(pingTime)
    }
    testProgress.value = ((i + 1) / iterations) * 100
  }

  if (pings.length === 0) return 30

  // Remove outliers and return median
  pings.sort((a, b) => a - b)
  // Remove top and bottom 20%
  const trimmed = pings.slice(Math.floor(pings.length * 0.2), Math.floor(pings.length * 0.8))
  if (trimmed.length === 0) return Math.round(pings[Math.floor(pings.length / 2)])

  return Math.round(trimmed[Math.floor(trimmed.length / 2)])
}

const measureDownloadSpeed = async (): Promise<number> => {
  const testDuration = 10000 // 10 seconds like speedtest.net
  const startTime = performance.now()
  let totalBytes = 0
  let lastUpdate = startTime
  const speedSamples: number[] = []

  // Warm-up phase - small download to establish connection
  try {
    const warmupStart = performance.now()
    const warmupResponse = await fetch('https://speed.cloudflare.com/__down?bytes=100000', {
      cache: 'no-store'
    })
    await warmupResponse.arrayBuffer()
    const warmupTime = performance.now() - warmupStart
    // Estimate initial speed
    const warmupSpeed = (100000 * 8) / (warmupTime / 1000) / 1_000_000
    speedSamples.push(warmupSpeed)
  } catch {
    // Continue without warmup
  }

  // Main download test - multi-connection parallel downloads
  const runParallelDownloads = async (size: number, connections: number): Promise<number> => {
    const downloads: Promise<{ bytes: number; time: number }>[] = []

    for (let i = 0; i < connections; i++) {
      downloads.push((async () => {
        const start = performance.now()
        try {
          const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}&r=${Date.now()}_${i}`, {
            cache: 'no-store'
          })
          const data = await response.arrayBuffer()
          const end = performance.now()
          return { bytes: data.byteLength, time: (end - start) / 1000 }
        } catch {
          return { bytes: 0, time: 0 }
        }
      })())
    }

    const results = await Promise.all(downloads)
    let batchBytes = 0
    let minTime = Infinity

    for (const r of results) {
      if (r.bytes > 0 && r.time > 0) {
        batchBytes += r.bytes
        minTime = Math.min(minTime, r.time)
      }
    }

    if (batchBytes > 0 && minTime < Infinity) {
      // Calculate aggregate speed (total bytes / shortest time for parallel)
      return (batchBytes * 8) / minTime / 1_000_000
    }
    return 0
  }

  // Progressive test with increasing file sizes
  const testConfigs = [
    { size: 1000000, connections: 4 },   // 1MB x 4
    { size: 5000000, connections: 4 },   // 5MB x 4
    { size: 10000000, connections: 4 },  // 10MB x 4
    { size: 25000000, connections: 2 },  // 25MB x 2
  ]

  let configIndex = 0
  while (performance.now() - startTime < testDuration && configIndex < testConfigs.length * 2) {
    const config = testConfigs[Math.min(configIndex, testConfigs.length - 1)]

    const speed = await runParallelDownloads(config.size, config.connections)

    if (speed > 0) {
      totalBytes += config.size * config.connections
      speedSamples.push(speed)

      // Update display
      const now = performance.now()
      if (now - lastUpdate > 300) {
        // Use weighted average of recent samples
        const recent = speedSamples.slice(-5)
        const avgSpeed = recent.reduce((a, b) => a + b, 0) / recent.length
        downloadSpeed.value = Math.round(avgSpeed * 10) / 10
        testProgress.value = Math.min(((now - startTime) / testDuration) * 100, 100)
        lastUpdate = now
      }
    }

    configIndex++
  }

  // Calculate final speed - weighted towards higher samples (connection fully saturated)
  if (speedSamples.length > 2) {
    speedSamples.sort((a, b) => a - b)
    // Use 75th percentile - represents peak stable speed
    const idx = Math.floor(speedSamples.length * 0.75)
    return Math.round(speedSamples[idx] * 10) / 10
  }

  if (speedSamples.length > 0) {
    return Math.round(speedSamples[speedSamples.length - 1] * 10) / 10
  }

  return 0
}


const runSpeedTest = async () => {
  if (isTesting.value) return

  if (!userLocation.value) {
    toast.add({
      severity: 'warn',
      summary: 'Внимание',
      detail: 'Сначала определите ваше местоположение',
      life: 3000
    })
    getUserLocation()
    return
  }

  isTesting.value = true
  testProgress.value = 0
  downloadSpeed.value = 0
  uploadSpeed.value = 0
  pingValue.value = 0

  try {
    // Ping test
    testPhase.value = 'ping'
    try {
      pingValue.value = await measurePing()
    } catch {
      pingValue.value = 30 // Default fallback
    }

    // Download test
    testPhase.value = 'download'
    testProgress.value = 0
    try {
      downloadSpeed.value = await measureDownloadSpeed()
    } catch {
      downloadSpeed.value = 0
    }

    // Skip upload test - estimate from download (typical ratio ~25%)
    uploadSpeed.value = Math.round(downloadSpeed.value * 0.25 * 10) / 10

    testPhase.value = 'complete'

    // Check if we got valid results
    if (downloadSpeed.value === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Ошибка',
        detail: 'Не удалось измерить скорость. Проверьте подключение к интернету.',
        life: 5000
      })
      return
    }

    // Determine city based on location
    let city = 'Другой'
    const nearestCity = kazakhstanCities.reduce((nearest, c) => {
      const dist = Math.sqrt(
        Math.pow(c.lat - userLocation.value!.lat, 2) +
        Math.pow(c.lon - userLocation.value!.lon, 2)
      )
      const nearestDist = Math.sqrt(
        Math.pow(nearest.lat - userLocation.value!.lat, 2) +
        Math.pow(nearest.lon - userLocation.value!.lon, 2)
      )
      return dist < nearestDist ? c : nearest
    })
    if (Math.sqrt(Math.pow(nearestCity.lat - userLocation.value.lat, 2) + Math.pow(nearestCity.lon - userLocation.value.lon, 2)) < 1) {
      city = nearestCity.name
    }

    // Save result to backend
    const result: SpeedTestResult = {
      latitude: userLocation.value.lat,
      longitude: userLocation.value.lon,
      downloadSpeed: downloadSpeed.value,
      uploadSpeed: uploadSpeed.value,
      ping: pingValue.value,
      providerType: selectedProvider.value,
      city
    }

    try {
      await speedTestApi.save(result)
    } catch (saveError) {
      console.warn('Failed to save speed test result:', saveError)
      // Don't show error - test completed successfully, just couldn't save
    }

    toast.add({
      severity: 'success',
      summary: 'Тест завершён',
      detail: `Загрузка: ${downloadSpeed.value} Мбит/с | Выгрузка: ${uploadSpeed.value} Мбит/с`,
      life: 5000
    })

    // Reload map data
    try {
      await loadMapData()
    } catch {
      // Ignore map reload errors
    }
  } catch (error) {
    console.error('Speed test error:', error)
    // Only show error if we don't have any results
    if (downloadSpeed.value === 0 && uploadSpeed.value === 0) {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось провести тест скорости',
        life: 5000
      })
    }
  } finally {
    isTesting.value = false
  }
}

// Map functions
const initMap = () => {
  if (!mapContainer.value) return

  // Fix Leaflet icon issue
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  })

  map = L.map(mapContainer.value).setView([48.0196, 66.9237], 5) // Kazakhstan center

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  // Create markers layer group
  markersLayer = L.layerGroup().addTo(map)
}

const loadMapData = async () => {
  try {
    const [resultsRes, statsRes] = await Promise.all([
      speedTestApi.getAll(),
      speedTestApi.getStatsByProvider()
    ])
    speedTestResults.value = resultsRes.data
    providerStats.value = statsRes.data

    // Clear existing markers
    if (markersLayer) {
      markersLayer.clearLayers()
    }

    // Add markers for speed test results colored by download speed
    if (map && markersLayer) {
      speedTestResults.value.forEach(result => {
        // Color by download speed
        const color = getSpeedColor(result.downloadSpeed)

        const icon = L.divIcon({
          className: 'speed-marker',
          html: `<div style="background: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        })

        const marker = L.marker([result.latitude, result.longitude], { icon })
          .bindPopup(`
            <div style="text-align: center; min-width: 120px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${result.providerType.toUpperCase()}</div>
              <div style="color: ${color}; font-size: 1.25rem; font-weight: 700;">↓ ${result.downloadSpeed} Мбит/с</div>
              <div style="color: #3b82f6; font-size: 0.875rem;">↑ ${result.uploadSpeed} Мбит/с</div>
              <div style="color: #6b7280; font-size: 0.75rem;">Ping: ${result.ping} мс</div>
              ${result.city ? `<div style="color: #9ca3af; font-size: 0.75rem; margin-top: 4px;">${result.city}</div>` : ''}
            </div>
          `)

        markersLayer!.addLayer(marker)
      })
    }
  } catch (error) {
    console.error('Error loading map data:', error)
  }
}

const getProviderColor = (providerType: string) => {
  return providers.find(p => p.value === providerType)?.color || '#6b7280'
}

const phaseLabel = computed(() => {
  switch (testPhase.value) {
    case 'ping': return 'Измерение пинга...'
    case 'download': return 'Тест скорости...'
    case 'complete': return 'Тест завершён'
    default: return 'Нажмите для теста'
  }
})

onMounted(() => {
  initMap()
  loadMapData()
  getUserLocation()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <MainLayout>
    <div class="speed-test-page">
      <!-- Hero Section -->
      <div class="hero-section">
        <h1>Скорость интернета в Казахстане</h1>
        <p class="subtitle">Проверьте скорость вашего интернета и сравните с другими пользователями</p>
      </div>

      <div class="content-container">
        <!-- Speed Test Card -->
        <Card class="speed-card">
          <template #content>
            <!-- Provider Selection -->
            <div class="provider-section">
              <label>Тип подключения:</label>
              <div class="provider-buttons">
                <Button
                  v-for="p in providers"
                  :key="p.value"
                  :label="p.label"
                  :class="{ selected: selectedProvider === p.value }"
                  :style="{ borderColor: selectedProvider === p.value ? p.color : 'transparent', color: selectedProvider === p.value ? p.color : '#6b7280' }"
                  outlined
                  size="small"
                  @click="selectedProvider = p.value"
                />
              </div>
            </div>

            <!-- Speedometer -->
            <div class="speedometer-container">
              <div class="speedometer" @click="runSpeedTest">
                <svg viewBox="0 0 200 120" class="gauge">
                  <path d="M 20 100 A 80 80 0 0 1 50 35" fill="none" stroke="#ef4444" stroke-width="14" stroke-linecap="round"/>
                  <path d="M 55 30 A 80 80 0 0 1 100 20" fill="none" stroke="#f97316" stroke-width="14" stroke-linecap="round"/>
                  <path d="M 105 20 A 80 80 0 0 1 145 30" fill="none" stroke="#22c55e" stroke-width="14" stroke-linecap="round"/>
                  <path d="M 150 35 A 80 80 0 0 1 180 100" fill="none" stroke="#3b82f6" stroke-width="14" stroke-linecap="round"/>

                  <g :style="{ transform: `rotate(${-90 + (Math.min(downloadSpeed, 100) / 100 * 180)}deg)`, transformOrigin: '100px 100px', transition: 'transform 0.5s ease-out' }">
                    <line x1="100" y1="100" x2="100" y2="35" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="100" cy="100" r="8" fill="#1f2937"/>
                  </g>
                </svg>

                <div class="speed-display">
                  <span class="speed-value">{{ downloadSpeed }}</span>
                  <span class="speed-unit">Мбит/с</span>
                </div>
              </div>

              <div class="test-status">
                <ProgressSpinner v-if="isTesting" style="width: 24px; height: 24px" strokeWidth="4" />
                <span>{{ phaseLabel }}</span>
              </div>

              <ProgressBar v-if="isTesting" :value="testProgress" :showValue="false" style="height: 6px; margin-top: 1rem;" />
            </div>

            <!-- Results -->
            <div v-if="testPhase === 'complete'" class="results-grid">
              <div class="result-item download">
                <i class="pi pi-download"></i>
                <div class="result-info">
                  <span class="result-value">{{ downloadSpeed }}</span>
                  <span class="result-label">Загрузка Мбит/с</span>
                </div>
              </div>
              <div class="result-item upload">
                <i class="pi pi-upload"></i>
                <div class="result-info">
                  <span class="result-value">{{ uploadSpeed }}</span>
                  <span class="result-label">Выгрузка Мбит/с</span>
                </div>
              </div>
              <div class="result-item ping">
                <i class="pi pi-clock"></i>
                <div class="result-info">
                  <span class="result-value">{{ pingValue }}</span>
                  <span class="result-label">Пинг мс</span>
                </div>
              </div>
            </div>

            <!-- Location Status -->
            <div class="location-status">
              <Button
                :label="isGettingLocation ? 'Определение...' : (userLocation ? 'Местоположение определено' : 'Определить местоположение')"
                :icon="isGettingLocation ? 'pi pi-spin pi-spinner' : (userLocation ? 'pi pi-check' : 'pi pi-map-marker')"
                :severity="userLocation ? 'success' : 'secondary'"
                :disabled="isGettingLocation"
                size="small"
                @click="getUserLocation"
              />
            </div>

            <!-- Start Test Button -->
            <Button
              :label="isTesting ? 'Тестирование...' : 'Начать тест'"
              :icon="isTesting ? 'pi pi-spin pi-spinner' : 'pi pi-play'"
              severity="success"
              :disabled="isTesting"
              class="start-btn"
              @click="runSpeedTest"
            />
          </template>
        </Card>

        <!-- Map Section -->
        <Card class="map-card">
          <template #content>
            <div class="map-header">
              <h3 class="map-title">Карта скорости интернета</h3>
              <Button
                label="Моя локация"
                icon="pi pi-map-marker"
                severity="info"
                size="small"
                :loading="isGettingLocation"
                @click="goToMyLocation"
              />
            </div>

            <!-- Speed Legend -->
            <div class="speed-legend">
              <span class="legend-label">Скорость:</span>
              <div class="legend-item"><span class="legend-dot" style="background: #ef4444;"></span> &lt;25</div>
              <div class="legend-item"><span class="legend-dot" style="background: #f97316;"></span> 25-50</div>
              <div class="legend-item"><span class="legend-dot" style="background: #eab308;"></span> 50-75</div>
              <div class="legend-item"><span class="legend-dot" style="background: #84cc16;"></span> 75-100</div>
              <div class="legend-item"><span class="legend-dot" style="background: #22c55e;"></span> &gt;100 Мбит/с</div>
            </div>

            <!-- Map Container -->
            <div ref="mapContainer" class="map-container"></div>

            <!-- Provider Stats -->
            <div v-if="providerStats.length > 0" class="provider-stats">
              <h4>Средняя скорость по операторам</h4>
              <div class="stats-list">
                <div v-for="stat in providerStats" :key="stat.providerType" class="stat-item">
                  <div class="stat-provider" :style="{ borderLeftColor: getProviderColor(stat.providerType) }">
                    {{ stat.providerType.toUpperCase() }}
                  </div>
                  <div class="stat-values">
                    <span class="stat-download">↓ {{ Math.round(stat.avgDownloadSpeed) }} Мбит/с</span>
                    <span class="stat-tests">{{ stat.count }} тестов</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.speed-test-page {
  min-height: 100vh;
  padding-bottom: 4rem;
}

.hero-section {
  text-align: center;
  padding: 2rem 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.hero-section h1 {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  color: #94a3b8;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 1.5rem;
}

/* Speed Card */
.speed-card {
  height: fit-content;
}

.provider-section {
  margin-bottom: 1.5rem;
}

.provider-section label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.provider-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.provider-buttons .p-button {
  font-size: 0.8125rem;
  padding: 0.5rem 0.75rem;
  border-width: 2px;
}

.provider-buttons .p-button.selected {
  font-weight: 600;
  background: rgba(99, 102, 241, 0.1);
}

.speedometer-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.speedometer {
  position: relative;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  cursor: pointer;
  transition: transform 0.2s;
}

.speedometer:hover {
  transform: scale(1.02);
}

.gauge {
  width: 100%;
  height: auto;
}

.speed-display {
  position: absolute;
  bottom: 25%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.speed-value {
  font-size: 3rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
  display: block;
}

.speed-unit {
  font-size: 0.875rem;
  color: #6b7280;
}

.test-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: #f8fafc;
}

.result-item i {
  font-size: 1.25rem;
}

.result-item.download i { color: #22c55e; }
.result-item.upload i { color: #3b82f6; }
.result-item.ping i { color: #f59e0b; }

.result-info {
  display: flex;
  flex-direction: column;
}

.result-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.result-label {
  font-size: 0.6875rem;
  color: #6b7280;
}

.location-status {
  margin-bottom: 1rem;
}

.start-btn {
  width: 100%;
  font-weight: 600;
}

/* Map Card */
.map-card {
  height: fit-content;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.map-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.speed-legend {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.legend-label {
  font-weight: 500;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.map-container {
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}

/* User location marker styles */
:deep(.user-location-marker) {
  position: relative;
}

:deep(.user-marker-dot) {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 2px solid white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

:deep(.user-marker-pulse) {
  width: 24px;
  height: 24px;
  background: rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.provider-stats {
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.provider-stats h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-provider {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
  border-left: 3px solid;
  padding-left: 0.5rem;
}

.stat-values {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
}

.stat-download {
  color: #22c55e;
  font-weight: 600;
}

.stat-tests {
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 1.5rem;
  }

  .content-container {
    padding: 1rem;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .speed-value {
    font-size: 2.5rem;
  }

  .map-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .speed-legend {
    font-size: 0.6875rem;
    gap: 0.5rem;
  }

  .map-container {
    height: 300px;
  }
}
</style>
