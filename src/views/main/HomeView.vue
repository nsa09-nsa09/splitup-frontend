<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import MainLayout from '@/layouts/MainLayout.vue'
import { servicesApi, serviceTypesApi } from '@/services/api'
import type { Service, ServiceType } from '@/types'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useI18n()
const services = ref<Service[]>([])
const serviceTypes = ref<ServiceType[]>([])
const selectedTypeId = ref<number | null>(null)
const searchQuery = ref('')
const loading = ref(false)
const howItWorksMode = ref<'share' | 'subscribe'>('subscribe')

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const [servicesResponse, serviceTypesResponse] = await Promise.all([
      servicesApi.getAll(),
      serviceTypesApi.getAll()
    ])
    services.value = servicesResponse.data
    serviceTypes.value = serviceTypesResponse.data

    // Автоматически выбираем первый тип сервисов
    if (serviceTypes.value.length > 0 && serviceTypes.value[0]) {
      selectedTypeId.value = serviceTypes.value[0].id ?? 1
    }
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const filteredServices = () => {
  let filtered = services.value

  if (selectedTypeId.value) {
    filtered = filtered.filter((s) => s.typeId === selectedTypeId.value)
  }

  if (searchQuery.value) {
    filtered = filtered.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
}

const selectType = (typeId: number | null) => {
  selectedTypeId.value = typeId
}

const getIconForType = (typeName: string) => {
  const iconMap: Record<string, string> = {
    'Операторы': 'pi pi-mobile',
    'Видео': 'pi pi-play',
    'Музыка': 'pi pi-volume-up',
    'Другое': 'pi pi-cloud'
  }
  return iconMap[typeName] || 'pi pi-tag'
}

const goToService = (serviceId: number) => {
  router.push(`/service/${serviceId}`)
}

const goToJoinFamily = () => {
  router.push('/groups/join')
}
</script>
<template>
  <MainLayout>
    <div class="home-view">
      <section class="hero-section">
        <div class="hero-container">
          <!-- Бегущая строка с логотипами -->
          <div class="logos-marquee">
            <div class="logos-track">
              <div class="logo-item">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png" alt="Netflix">
              </div>
              <div class="logo-item">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png" alt="YouTube">
              </div>
              <div class="logo-item">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png" alt="Spotify">
              </div>
              <div class="logo-item">
                <img src="/logos/amazon-prime.svg" alt="Amazon Prime">
              </div>
              <div class="logo-item">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Apple_Music_logo.svg/2560px-Apple_Music_logo.svg.png" alt="Apple Music">
              </div>
              <div class="logo-item">
                <img src="/logos/ivi.svg" alt="IVI">
              </div>
              <div class="logo-item">
                <img src="/logos/icloud.svg" alt="iCloud+">
              </div>
              <div class="logo-item">
                <img src="/logos/google-one.svg" alt="Google One">
              </div>
              <div class="logo-item">
                <img src="/logos/activ.svg" alt="Activ">
              </div>
              <div class="logo-item">
                <img src="/logos/beeline.svg" alt="Beeline">
              </div>
              <div class="logo-item">
                <img src="/logos/tele2.svg" alt="Tele2">
              </div>
              <div class="logo-item">
                <img src="/logos/altel.svg" alt="Altel">
              </div>
              <!-- Дублируем для бесконечной прокрутки -->
              <div class="logo-item">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png" alt="Netflix">
              </div>
              <div class="logo-item">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png" alt="YouTube">
              </div>
              <div class="logo-item">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png" alt="Spotify">
              </div>
              <div class="logo-item">
                <img src="/logos/amazon-prime.svg" alt="Amazon Prime">
              </div>
              <div class="logo-item">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Apple_Music_logo.svg/2560px-Apple_Music_logo.svg.png" alt="Apple Music">
              </div>
              <div class="logo-item">
                <img src="/logos/ivi.svg" alt="IVI">
              </div>
              <div class="logo-item">
                <img src="/logos/icloud.svg" alt="iCloud+">
              </div>
              <div class="logo-item">
                <img src="/logos/google-one.svg" alt="Google One">
              </div>
              <div class="logo-item">
                <img src="/logos/activ.svg" alt="Activ">
              </div>
              <div class="logo-item">
                <img src="/logos/beeline.svg" alt="Beeline">
              </div>
              <div class="logo-item">
                <img src="/logos/tele2.svg" alt="Tele2">
              </div>
              <div class="logo-item">
                <img src="/logos/altel.svg" alt="Altel">
              </div>
            </div>
          </div>

          <div class="hero-content">
            <h1 class="hero-title">
              {{ t('hero.mainTitle') }}
            </h1>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="content-container">
          <div class="search-filters">
            <div class="search-with-badges">
              <!-- Левый блок со скидкой -->
              <div class="discount-badge discount-1">
                <span class="discount-percent">-67%</span>
                <span class="discount-label">{{ t('plan.savings').toLowerCase() }}</span>
              </div>

              <div class="search-bar">
                <i class="pi pi-search"></i>
                <input v-model="searchQuery" type="text" :placeholder="t('search.placeholder')" />
              </div>

              <!-- Правый блок со скидкой -->
              <div class="discount-badge discount-2">
                <span class="discount-percent">-72%</span>
                <span class="discount-label">{{ t('plan.discount').toLowerCase() }}</span>
              </div>
            </div>

            <div class="category-filters">
              <button
                v-for="type in serviceTypes"
                :key="type.id"
                class="filter-btn"
                :class="{ active: selectedTypeId === type.id }"
                @click="selectType(type.id!)"
              >
                <i :class="getIconForType(type.name)"></i>
                <span>{{ type.name }}</span>
              </button>
            </div>
          </div>

          <div v-if="loading" class="loading">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          </div>

          <!-- Показываем сервисы только если выбрана категория -->
          <div v-else-if="selectedTypeId" class="services-grid">
            <div
              v-for="service in filteredServices()"
              :key="service.id"
              class="service-card"
              @click="goToService(service.id!)"
            >
              <div class="service-icon">
                <img
                  v-if="service.icon"
                  :src="service.icon"
                  :alt="service.name"
                  class="service-logo"
                />
              </div>
              <div class="service-info">
                <h3>{{ service.name }}</h3>
                <p v-if="service.priceFrom">от {{ service.priceFrom }} ₸</p>
              </div>
              <button class="service-arrow">
                <i class="pi pi-arrow-right"></i>
              </button>
            </div>

            <div v-if="filteredServices().length === 0" class="empty-state">
              <i class="pi pi-inbox" style="font-size: 3rem; color: #9ca3af"></i>
              <p>Сервисы не найдены</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section">
        <div class="how-it-works-container">
          <p class="section-subtitle">4 простых шага</p>
          <h2 class="how-it-works-title">Как работает BölipTole?</h2>

          <div class="cta-buttons-top">
            <button
              class="btn-share-top"
              :class="{ active: howItWorksMode === 'share' }"
              @click="howItWorksMode = 'share'"
            >
              <i class="pi pi-share-alt"></i>
              <span>Делиться</span>
            </button>
            <button
              class="btn-subscribe-top"
              :class="{ active: howItWorksMode === 'subscribe' }"
              @click="howItWorksMode = 'subscribe'"
            >
              <span>Подписаться</span>
            </button>
          </div>

          <!-- Share Mode -->
          <div v-if="howItWorksMode === 'share'">
            <h3 class="steps-section-title">Предложить подписку:</h3>

            <div class="steps-list">
              <!-- Step 1 -->
              <div class="step-item">
                <div class="step-icon-left">
                  <i class="pi pi-plus"></i>
                </div>
                <div class="step-content">
                  <h4 class="step-title-left">Создайте свою подписку</h4>
                  <p class="step-description-left">Опишите, что он предлагает, укажите количество слотов и стоимость. После этого вы получите ссылку-приглашение.</p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="step-item collapsed">
                <div class="step-icon-left">
                  <i class="pi pi-send"></i>
                </div>
                <div class="step-content">
                  <h4 class="step-title-left">Поделитесь этим в Интернете или с друзьями</h4>
                </div>
                <button class="expand-btn">
                  <i class="pi pi-plus"></i>
                </button>
              </div>

              <!-- Step 3 -->
              <div class="step-item collapsed">
                <div class="step-icon-left">
                  <i class="pi pi-credit-card"></i>
                </div>
                <div class="step-content">
                  <h4 class="step-title-left">Собирайте свои платежи</h4>
                </div>
                <button class="expand-btn">
                  <i class="pi pi-plus"></i>
                </button>
              </div>

              <!-- Step 4 -->
              <div class="step-item collapsed">
                <div class="step-icon-left">
                  <i class="pi pi-wallet"></i>
                </div>
                <div class="step-content">
                  <h4 class="step-title-left">Получите ваши деньги</h4>
                </div>
                <button class="expand-btn">
                  <i class="pi pi-plus"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Subscribe Mode -->
          <div v-else>
            <h3 class="steps-section-title">Присоединение к подписке:</h3>

            <div class="steps-list">
              <!-- Step 1 -->
              <div class="step-item">
                <div class="step-icon-left">
                  <i class="pi pi-check"></i>
                </div>
                <div class="step-content">
                  <h4 class="step-title-left">Выбирать</h4>
                  <p class="step-description-left">Среди более чем 300 доступных услуг</p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="step-item collapsed">
                <div class="step-icon-left">
                  <i class="pi pi-send"></i>
                </div>
                <div class="step-content">
                  <h4 class="step-title-left">Платить</h4>
                </div>
                <button class="expand-btn">
                  <i class="pi pi-plus"></i>
                </button>
              </div>

              <!-- Step 3 -->
              <div class="step-item collapsed">
                <div class="step-icon-left">
                  <i class="pi pi-credit-card"></i>
                </div>
                <div class="step-content">
                  <h4 class="step-title-left">Доступ к подписке</h4>
                </div>
                <button class="expand-btn">
                  <i class="pi pi-plus"></i>
                </button>
              </div>

              <!-- Step 4 -->
              <div class="step-item collapsed">
                <div class="step-icon-left">
                  <i class="pi pi-star"></i>
                </div>
                <div class="step-content">
                  <h4 class="step-title-left">Наслаждайтесь обслуживанием</h4>
                </div>
                <button class="expand-btn">
                  <i class="pi pi-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="benefits-section">
        <div class="benefits-container">
          <h2 class="benefits-title">Наслаждайтесь эксклюзивными преимуществами</h2>

          <div class="benefits-grid">
            <!-- Benefit 1 -->
            <div class="benefit-card">
              <div class="benefit-icon">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="60" r="8" fill="#3b82f6"/>
                  <path d="M 60 180 L 60 100 L 100 60 L 140 100 L 140 180 Z" fill="none" stroke="#1f2937" stroke-width="4"/>
                  <line x1="60" y1="140" x2="140" y2="140" stroke="#1f2937" stroke-width="4"/>
                  <rect x="75" y="100" width="50" height="40" fill="#3b82f6" opacity="0.3"/>
                  <rect x="75" y="140" width="50" height="40" fill="#3b82f6" opacity="0.3"/>
                </svg>
              </div>
              <h3 class="benefit-title">Юридическая служба</h3>
              <p class="benefit-description">Да, делиться подпиской законно. Поставщики контента или услуг сами разрешают это делать. Sharesub предлагает вам простой и безопасный сервис управления платежами и возвратами.</p>
              <a href="#" class="benefit-link">Читать далее →</a>
            </div>

            <!-- Benefit 2 -->
            <div class="benefit-card">
              <div class="benefit-icon">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 100 40 L 120 100 L 180 100 L 130 140 L 150 190 L 100 155 L 50 190 L 70 140 L 20 100 L 80 100 Z" fill="none" stroke="#1f2937" stroke-width="4"/>
                  <circle cx="100" cy="100" r="30" fill="#10b981"/>
                  <path d="M 85 100 L 95 110 L 115 85" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="benefit-title">Программа защиты покупателей</h3>
              <p class="benefit-description">Все ваши покупки защищены: мы гарантируем работоспособность подписок или вернём вам деньги бесплатно. После оплаты вы получите доступ к общей подписке. Если у вас возникнут проблемы, наша команда проверит и при необходимости вернёт вам деньги бесплатно.</p>
              <a href="#" class="benefit-link">Читать далее →</a>
            </div>

            <!-- Benefit 3 -->
            <div class="benefit-card">
              <div class="benefit-icon">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="70" r="8" fill="#3b82f6"/>
                  <ellipse cx="100" cy="130" rx="60" ry="50" fill="#3b82f6" opacity="0.3"/>
                  <text x="70" y="140" font-size="60" fill="#1f2937" font-weight="bold">$</text>
                </svg>
              </div>
              <h3 class="benefit-title">Никаких сборов при обмене.</h3>
              <p class="benefit-description">Комиссия за получение денег не взимается: переводы на ваш банковский счет бесплатны и обрабатываются автоматически, как только вы достигнете небольшого минимума.</p>
              <a href="#" class="benefit-link">Читать далее →</a>
            </div>

            <!-- Benefit 4 -->
            <div class="benefit-card">
              <div class="benefit-icon">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <rect x="60" y="80" width="80" height="90" rx="10" fill="none" stroke="#1f2937" stroke-width="4"/>
                  <circle cx="100" cy="50" r="15" fill="#10b981"/>
                  <path d="M 90 110 L 90 145 M 110 110 L 110 145" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/>
                  <circle cx="100" cy="125" r="8" fill="#10b981"/>
                </svg>
              </div>
              <h3 class="benefit-title">Безопасные данные</h3>
              <p class="benefit-description">Если вам необходимо поделиться конфиденциальными данными, такими как идентификаторы, пароли, номера лицензий и другая информация, Sharesub — идеальное решение для их защиты. Ваши данные передаются и хранятся с использованием надёжного шифрования (AES 256) для обеспечения</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Operator Coverage Section -->
      <section class="operator-coverage-section">
        <div class="operator-coverage-container">
          <h2 class="coverage-title">Узнай какой оператор сотовой связи лучше в вашем регионе</h2>
          <p class="coverage-subtitle">Узнайте, какой оператор предоставляет лучшее покрытие и скорость в вашем местоположении</p>

          <div class="coverage-content">
            <!-- Speedtest Visualization -->
            <div class="speedtest-container">
              <div class="speedtest-gauge">
                <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
                  <!-- Background arc -->
                  <path d="M 50 200 A 150 150 0 0 1 350 200"
                        fill="none"
                        stroke="#e5e7eb"
                        stroke-width="30"
                        stroke-linecap="round"/>

                  <!-- Colored speed sections -->
                  <path d="M 50 200 A 150 150 0 0 1 125 85"
                        fill="none"
                        stroke="#ef4444"
                        stroke-width="30"
                        stroke-linecap="round"/>
                  <path d="M 125 85 A 150 150 0 0 1 200 50"
                        fill="none"
                        stroke="#f59e0b"
                        stroke-width="30"
                        stroke-linecap="round"/>
                  <path d="M 200 50 A 150 150 0 0 1 275 85"
                        fill="none"
                        stroke="#10b981"
                        stroke-width="30"
                        stroke-linecap="round"/>
                  <path d="M 275 85 A 150 150 0 0 1 350 200"
                        fill="none"
                        stroke="#3b82f6"
                        stroke-width="30"
                        stroke-linecap="round"/>

                  <!-- Center circle -->
                  <circle cx="200" cy="200" r="15" fill="#1f2937"/>

                  <!-- Needle -->
                  <line x1="200" y1="200" x2="280" y2="140"
                        stroke="#1f2937"
                        stroke-width="4"
                        stroke-linecap="round"
                        class="speedtest-needle"/>

                  <!-- Speed value -->
                  <text x="200" y="180"
                        text-anchor="middle"
                        font-size="48"
                        font-weight="bold"
                        fill="#1f2937"
                        class="speed-value">85</text>
                  <text x="200" y="210"
                        text-anchor="middle"
                        font-size="16"
                        fill="#6b7280">Mbps</text>
                </svg>
              </div>

              <div class="operators-comparison">
                <div class="operator-stat activ-stat">
                  <div class="operator-logo-small">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Activ_logo.svg" alt="Activ">
                  </div>
                  <div class="operator-details">
                    <span class="operator-name">Activ</span>
                    <div class="speed-bar">
                      <div class="speed-fill" style="width: 90%;"></div>
                    </div>
                    <span class="speed-text">90 Mbps</span>
                  </div>
                </div>

                <div class="operator-stat beeline-stat">
                  <div class="operator-logo-small">
                    <img src="https://1000logos.net/wp-content/uploads/2021/04/Beeline-logo.png" alt="Beeline">
                  </div>
                  <div class="operator-details">
                    <span class="operator-name">Beeline</span>
                    <div class="speed-bar">
                      <div class="speed-fill" style="width: 85%;"></div>
                    </div>
                    <span class="speed-text">85 Mbps</span>
                  </div>
                </div>

                <div class="operator-stat tele2-stat">
                  <div class="operator-logo-small">
                    <img src="https://1000logos.net/wp-content/uploads/2020/08/Tele2-Logo.png" alt="Tele2">
                  </div>
                  <div class="operator-details">
                    <span class="operator-name">Tele2</span>
                    <div class="speed-bar">
                      <div class="speed-fill" style="width: 75%;"></div>
                    </div>
                    <span class="speed-text">75 Mbps</span>
                  </div>
                </div>

                <div class="operator-stat altel-stat">
                  <div class="operator-logo-small">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Altel_4G_logo.svg" alt="Altel">
                  </div>
                  <div class="operator-details">
                    <span class="operator-name">Altel</span>
                    <div class="speed-bar">
                      <div class="speed-fill" style="width: 70%;"></div>
                    </div>
                    <span class="speed-text">70 Mbps</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Map Container -->
            <div class="map-container">
              <div class="map-placeholder">
                <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                  <!-- Kazakhstan map outline (simplified) -->
                  <path d="M 50 150 L 100 80 L 180 70 L 250 90 L 320 110 L 350 150 L 340 200 L 280 240 L 200 250 L 120 230 L 60 190 Z"
                        fill="#e0f2fe"
                        stroke="#0ea5e9"
                        stroke-width="2"/>

                  <!-- Coverage zones -->
                  <circle cx="150" cy="140" r="40" fill="#10b981" opacity="0.3"/>
                  <circle cx="250" cy="130" r="35" fill="#3b82f6" opacity="0.3"/>
                  <circle cx="200" cy="180" r="30" fill="#f59e0b" opacity="0.3"/>
                  <circle cx="280" cy="170" r="25" fill="#ef4444" opacity="0.3"/>

                  <!-- Location markers -->
                  <g class="location-marker">
                    <circle cx="200" cy="150" r="8" fill="#ef4444"/>
                    <circle cx="200" cy="150" r="15" fill="#ef4444" opacity="0.3"/>
                    <circle cx="200" cy="150" r="22" fill="#ef4444" opacity="0.2"/>
                  </g>

                  <!-- City names -->
                  <text x="150" y="140" text-anchor="middle" font-size="12" font-weight="bold" fill="#1f2937">Астана</text>
                  <text x="250" y="130" text-anchor="middle" font-size="12" font-weight="bold" fill="#1f2937">Алматы</text>
                  <text x="200" y="180" text-anchor="middle" font-size="12" font-weight="bold" fill="#1f2937">Шымкент</text>
                </svg>
              </div>

              <div class="map-legend">
                <div class="legend-item">
                  <div class="legend-color excellent"></div>
                  <span>Отлично (>80 Mbps)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color good"></div>
                  <span>Хорошо (60-80 Mbps)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color average"></div>
                  <span>Средне (40-60 Mbps)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color poor"></div>
                  <span>Слабо (<40 Mbps)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="coverage-cta">
            <button class="check-coverage-btn">
              <i class="pi pi-map-marker"></i>
              <span>Проверить покрытие в моем районе</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Savings Calculator Section -->
      <section class="savings-calculator-section">
        <div class="savings-calculator-container">
          <h2 class="calculator-main-title">Подсчитайте свой ежемесячный расход</h2>
          <p class="calculator-subtitle">Экономьте в среднем от 50% в месяц</p>

          <div class="calculator-content">
            <!-- Left side - Form -->
            <div class="calculator-form">
              <div class="form-group">
                <label class="form-label">Выберите свою подписку</label>
                <select class="form-select">
                  <option value="6590">Activ</option>
                  <option value="19999">Beeline</option>
                  <option value="17490">Tele2</option>
                  <option value="7995">Altel</option>
                  <option value="3990">YouTube Premium Family</option>
                  <option value="4500">Spotify Premium Family</option>
                  <option value="5500">Netflix Premium</option>
                  <option value="3500">Apple Music Family</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Сколько соподписчиков вам нужно?</label>
                <div class="subscribers-count">
                  <span class="count-number">5</span>
                  <span class="count-label">соподписчиков</span>
                </div>
                <input type="range" min="1" max="11" value="5" class="slider">
              </div>
            </div>

            <!-- Right side - Savings Display -->
            <div class="savings-display">
              <div class="savings-icon">
                <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="55" fill="#10b981" opacity="0.2"/>
                  <circle cx="60" cy="60" r="45" fill="#10b981" opacity="0.4"/>
                  <circle cx="60" cy="60" r="35" fill="#3b82f6" opacity="0.6"/>
                  <path d="M 30 60 A 30 30 0 0 1 60 30 L 60 60 Z" fill="#10b981"/>
                  <path d="M 60 30 A 30 30 0 0 1 90 60 L 60 60 Z" fill="#3b82f6"/>
                </svg>
              </div>

              <h3 class="savings-title">Моделирование сбережений</h3>

              <div class="savings-details">
                <div class="detail-row">
                  <span class="detail-label">Стоимость подписки:</span>
                  <span class="detail-value">6 590₸ <span class="period">/ месяц</span></span>
                </div>

                <div class="detail-row highlight">
                  <span class="detail-label">Стоимость за подписчика:</span>
                  <span class="detail-value">1 318₸ <span class="period">/ месяц</span></span>
                </div>

                <div class="savings-badge">
                  <div class="badge-content">
                    <span class="savings-amount">5 272₸</span>
                    <span class="savings-label">/ месяц</span>
                  </div>
                  <span class="savings-text">Экономия:</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Subscription Exchange Section -->
      <section class="exchange-section">
        <div class="exchange-container">
          <p class="exchange-subtitle">Услуга, которая облегчит вам жизнь</p>
          <h2 class="exchange-title">Обмен подписками</h2>

          <div class="exchange-content">
            <!-- Share Card -->
            <div class="exchange-card share-card">
              <div class="card-illustration">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <!-- Phone with dollar -->
                  <rect x="60" y="30" width="80" height="120" rx="8" fill="#ffffff" stroke="#1f2937" stroke-width="3"/>
                  <circle cx="100" cy="160" r="5" fill="#1f2937"/>

                  <!-- Dollar bills -->
                  <g transform="translate(75, 60)">
                    <rect x="0" y="0" width="50" height="30" rx="3" fill="#10b981" transform="rotate(-15 25 15)"/>
                    <text x="25" y="20" text-anchor="middle" font-size="24" fill="white" font-weight="bold" transform="rotate(-15 25 15)">$</text>
                  </g>

                  <!-- Arrow up -->
                  <path d="M 100 100 L 100 60 M 90 70 L 100 60 L 110 70" stroke="#10b981" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

                  <!-- Coins -->
                  <circle cx="130" cy="80" r="12" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
                  <text x="130" y="85" text-anchor="middle" font-size="14" fill="#78350f" font-weight="bold">$</text>
                </svg>
              </div>

              <h3 class="card-title">Делиться</h3>
              <p class="card-description">
                У меня есть подписка, и я хотел бы предложить свои доступные слоты, чтобы сэкономить деньги.
              </p>

              <button class="card-button share-button">
                <span>Делиться</span>
              </button>
            </div>

            <!-- Subscribe Card -->
            <div class="exchange-card subscribe-card">
              <div class="card-illustration">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <!-- Coins stack -->
                  <g transform="translate(80, 60)">
                    <ellipse cx="20" cy="5" rx="20" ry="5" fill="#3b82f6"/>
                    <ellipse cx="20" cy="15" rx="20" ry="5" fill="#60a5fa"/>
                    <ellipse cx="20" cy="25" rx="20" ry="5" fill="#93c5fd"/>
                    <path d="M 0 5 L 0 25 A 20 5 0 0 0 40 25 L 40 5" fill="#2563eb"/>
                  </g>

                  <!-- Arrow pointing to phone -->
                  <path d="M 110 90 L 145 90 M 135 80 L 145 90 L 135 100" stroke="#3b82f6" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

                  <!-- Phone -->
                  <rect x="145" y="60" width="40" height="60" rx="5" fill="#ffffff" stroke="#1f2937" stroke-width="2"/>
                  <circle cx="165" cy="110" r="3" fill="#1f2937"/>
                  <rect x="152" y="70" width="26" height="30" rx="2" fill="#3b82f6" opacity="0.3"/>

                  <!-- Checkmark -->
                  <path d="M 160 85 L 163 88 L 170 80" stroke="#10b981" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>

              <h3 class="card-title">Подписаться</h3>
              <p class="card-description">
                Я хочу присоединиться к группе совместного несения расходов и оплатить только часть счета.
              </p>

              <button class="card-button subscribe-button">
                <span>Присоединиться</span>
              </button>
            </div>

            <!-- Info Card -->
            <div class="exchange-info">
              <h3 class="info-title">
                <span class="brand-name">BölipTole</span> — лучшее решение для совместного использования подписок
              </h3>
              <p class="info-description">
                и сокращения ежемесячных расходов.
              </p>

              <p class="info-text">
                Вы можете с удобством поделиться своими подписками на Netflix, Spotify и многие другие сервисы на BölipTole.com или присоединиться к существующей «группе обмена».
              </p>

              <p class="info-cta">
                Присоединяйтесь к нам сейчас и начните экономить деньги!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </MainLayout>
</template>
<style scoped>
.home-view {
  width: 100%;
  background: linear-gradient(180deg, #1a2942 0%, #0f1829 100%);
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(180deg, #1a2942 0%, #0f1829 100%);
  color: white;
  padding: 4rem 2rem 2rem;
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  text-align: center;
}

/* Бегущая строка с логотипами */
.logos-marquee {
  width: 100%;
  overflow: hidden;
  margin-bottom: 3rem;
  padding: 2rem 0;
  position: relative;
}

.logos-marquee::before,
.logos-marquee::after {
  content: '';
  position: absolute;
  top: 0;
  width: 150px;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.logos-marquee::before {
  left: 0;
  background: linear-gradient(to right, #1a2942, transparent);
}

.logos-marquee::after {
  right: 0;
  background: linear-gradient(to left, #1a2942, transparent);
}

.logos-track {
  display: flex;
  animation: marquee 30s linear infinite;
  gap: 3rem;
}

.logos-track:hover {
  animation-play-state: paused;
}

.logo-item {
  flex-shrink: 0;
  width: 120px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.logo-item:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 24px rgba(96, 165, 250, 0.3);
}

.logo-item img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  opacity: 0.9;
}

.logo-item:hover img {
  opacity: 1;
  transform: scale(1.05);
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.decorative-icon {
  position: absolute;
  color: rgba(125, 211, 252, 0.4);
  animation: float 3s ease-in-out infinite;
}

.dash-left {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.sparkle-right {
  top: 25%;
  right: 15%;
  animation-delay: 1.5s;
}

.circle-bottom-left {
  bottom: 15%;
  left: 8%;
  animation-delay: 0.75s;
}

.dots-top-right {
  top: 15%;
  right: 8%;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.hero-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.3;
  max-width: 800px;
  text-align: center;
}

/* Curved Arrows */
.arrow-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.curved-arrow-up {
  width: 120px;
  height: 150px;
  filter: drop-shadow(0 4px 12px rgba(251, 191, 36, 0.5));
  animation: arrowBounce 2s ease-in-out infinite;
}

.arrow-left .curved-arrow-up {
  animation-delay: 0s;
}

.arrow-right .curved-arrow-up {
  animation-delay: 0.5s;
  filter: drop-shadow(0 4px 12px rgba(167, 139, 250, 0.5));
}

@keyframes arrowBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Изогнутые стрелки со скидками */
.arrow-discount {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

.arrow-left {
  animation-delay: 0s;
}

.arrow-right {
  animation-delay: 1s;
}

.curved-arrow {
  width: 120px;
  height: 120px;
  color: #fbbf24;
  filter: drop-shadow(0 4px 12px rgba(251, 191, 36, 0.5));
}

.discount-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.discount-value {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}

.discount-text {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
  font-weight: 700;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.service-count {
  color: #7dd3fc;
  font-size: 4rem;
}

.available-text {
  color: white;
  font-size: 3.5rem;
}

.sharing-text {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.sharing-text::after {
  content: '✨';
  position: absolute;
  margin-left: 0.5rem;
  font-size: 2rem;
}

.click-emoji {
  display: inline-block;
  font-size: 2.5rem;
  margin-left: 1rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Discount Badges */
.discount-badge {
  position: relative;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  animation: floatRotate 4s ease-in-out infinite;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 2;
  flex-shrink: 0;
}

.discount-percent {
  font-size: 1.5rem;
  line-height: 1;
  font-weight: 900;
}

.discount-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.discount-1 {
  animation-delay: 0s;
}

.discount-2 {
  animation-delay: 1s;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(167, 139, 250, 0.4);
}

.discount-3 {
  animation-delay: 2s;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(96, 165, 250, 0.4);
}

.discount-4 {
  animation-delay: 3s;
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: #064e3b;
  box-shadow: 0 8px 24px rgba(52, 211, 153, 0.4);
}

@keyframes floatRotate {
  0%, 100% {
    transform: translateY(0) rotate(-3deg) scale(1);
  }
  25% {
    transform: translateY(-15px) rotate(3deg) scale(1.05);
  }
  50% {
    transform: translateY(-20px) rotate(-2deg) scale(1.08);
  }
  75% {
    transform: translateY(-10px) rotate(2deg) scale(1.05);
  }
}

/* Content Section */
.content-section {
  padding: 3rem 2rem;
  background: linear-gradient(180deg, #0f1829 0%, #1a2942 100%);
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Search and Filters */
.search-filters {
  margin-bottom: 3rem;
}

.search-with-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-bar {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 650px;
  flex: 1;
  min-width: 400px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-bar:focus-within {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  background: rgba(255, 255, 255, 0.12);
}

.search-bar i {
  color: #94a3b8;
  font-size: 1.25rem;
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.0625rem;
  color: white;
  background: transparent;
}

.search-bar input::placeholder {
  color: #64748b;
}

.category-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto 2rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.filter-btn:hover {
  border-color: rgba(96, 165, 250, 0.5);
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(96, 165, 250, 0.3);
}

.filter-btn i {
  font-size: 1.125rem;
}

/* Subcategories */
.subcategory-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.subcategory-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.subcategory-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.subcategory-btn:hover {
  background: rgba(96, 165, 250, 0.15);
  border-color: rgba(96, 165, 250, 0.5);
  color: #60a5fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(96, 165, 250, 0.2);
}

.category-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  align-items: flex-start;
  flex: 1;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
}

.category-info-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.875rem;
}

.category-price {
  color: #7dd3fc;
  font-weight: 600;
}

.category-savings {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.875rem;
}

.loading-categories {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  color: #16a34a;
  font-size: 0.9375rem;
}

/* Loading */
.loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  color: #16a34a;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  min-height: 220px;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.service-card:nth-child(6n+1) {
  --gradient-start: #7c3aed;
  --gradient-end: #a855f7;
}

.service-card:nth-child(6n+2) {
  --gradient-start: #f97316;
  --gradient-end: #fb923c;
}

.service-card:nth-child(6n+3) {
  --gradient-start: #dc2626;
  --gradient-end: #f87171;
}

.service-card:nth-child(6n+4) {
  --gradient-start: #ea580c;
  --gradient-end: #fb923c;
}

.service-card:nth-child(6n+5) {
  --gradient-start: #0ea5e9;
  --gradient-end: #38bdf8;
}

.service-card:nth-child(6n+6) {
  --gradient-start: #8b5cf6;
  --gradient-end: #c084fc;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.service-icon {
  width: 128px;
  height: 128px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: auto;
  background: #dc143c !important;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.service-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 24px;
  padding: 8px;
}

.service-info {
  margin-top: 1.5rem;
  position: relative;
  z-index: 1;
  width: 100%;
}

.service-info h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.service-info p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.service-arrow {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.service-card:hover .service-arrow {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(4px);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 0;
  color: #64748b;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.25rem;
  color: #94a3b8;
}

/* How It Works Section */
.how-it-works-section {
  background: linear-gradient(180deg, #1a2942 0%, #0f1829 100%);
  padding: 4rem 2rem;
  position: relative;
}

.how-it-works-container {
  max-width: 1000px;
  margin: 0 auto;
}

.section-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
}

.how-it-works-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 2rem;
  position: relative;
}

.how-it-works-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: #60a5fa;
  border-radius: 2px;
}

.cta-buttons-top {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-share-top,
.btn-subscribe-top {
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-share-top {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-share-top.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  border: 1px solid transparent;
}

.btn-subscribe-top {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-subscribe-top.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  border: 1px solid transparent;
}

.btn-share-top:hover,
.btn-subscribe-top:hover {
  transform: translateY(-2px);
}

.steps-section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #60a5fa;
  margin-bottom: 2rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.step-item:not(.collapsed) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.step-item:hover {
  box-shadow: 0 8px 24px rgba(96, 165, 250, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.step-icon-left {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

.step-content {
  flex: 1;
}

.step-title-left {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.step-description-left {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.expand-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.7);
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

/* Benefits Section */
.benefits-section {
  background: linear-gradient(180deg, #0f1829 0%, #1a2942 100%);
  padding: 4rem 2rem;
}

.benefits-container {
  max-width: 1400px;
  margin: 0 auto;
}

.benefits-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 3rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.benefit-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.benefit-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(96, 165, 250, 0.2);
  border-color: rgba(96, 165, 250, 0.3);
  background: rgba(255, 255, 255, 0.12);
}

.benefit-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
}

.benefit-icon svg {
  width: 100%;
  height: 100%;
}

.benefit-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-align: center;
}

.benefit-description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  text-align: left;
}

.benefit-link {
  color: #60a5fa;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9375rem;
  display: inline-block;
  transition: all 0.3s ease;
}

.benefit-link:hover {
  color: #93c5fd;
  transform: translateX(4px);
}

/* Operator Coverage Section */
.operator-coverage-section {
  background: linear-gradient(180deg, #0f1829 0%, #1a2942 100%);
  padding: 4rem 2rem;
  position: relative;
  overflow: hidden;
}

.operator-coverage-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.coverage-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
}

.coverage-subtitle {
  text-align: center;
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
}

.coverage-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

/* Speedtest Container */
.speedtest-container {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.speedtest-gauge {
  margin-bottom: 2rem;
}

.speedtest-needle {
  animation: needleSwing 3s ease-in-out infinite;
  transform-origin: 200px 200px;
}

@keyframes needleSwing {
  0%, 100% {
    transform: rotate(-45deg);
  }
  50% {
    transform: rotate(45deg);
  }
}

.speed-value {
  animation: speedCount 2s ease-in-out infinite;
}

@keyframes speedCount {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.operators-comparison {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.operator-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.operator-stat:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.operator-logo-small {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  flex-shrink: 0;
}

.operator-logo-small img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.operator-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.operator-name {
  font-weight: 700;
  color: #1f2937;
  font-size: 1rem;
}

.speed-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.speed-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
  border-radius: 4px;
  transition: width 1s ease;
  animation: fillAnimation 2s ease-in-out infinite;
}

@keyframes fillAnimation {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.speed-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

/* Map Container */
.map-container {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.map-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.map-placeholder svg {
  width: 100%;
  height: auto;
  max-width: 400px;
}

.location-marker {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.map-legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-color.excellent {
  background: #3b82f6;
}

.legend-color.good {
  background: #10b981;
}

.legend-color.average {
  background: #f59e0b;
}

.legend-color.poor {
  background: #ef4444;
}

/* Coverage CTA */
.coverage-cta {
  display: flex;
  justify-content: center;
}

.check-coverage-btn {
  background: white;
  color: #1e40af;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
}

.check-coverage-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(255, 255, 255, 0.3);
  background: #f0f9ff;
}

.check-coverage-btn i {
  font-size: 1.25rem;
}

/* Savings Calculator Section */
.savings-calculator-section {
  background: linear-gradient(180deg, #1a2942 0%, #0f1829 100%);
  padding: 4rem 2rem;
}

.savings-calculator-container {
  max-width: 1400px;
  margin: 0 auto;
}

.calculator-main-title {
  text-align: center;
  font-size: 2.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.calculator-subtitle {
  text-align: center;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
}

.calculator-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* Calculator Form */
.calculator-form {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.form-group {
  margin-bottom: 2.5rem;
}

.form-label {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.form-select {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-select option {
  background: #1e293b;
  color: white;
}

.form-select:hover {
  border-color: #60a5fa;
  background: rgba(255, 255, 255, 0.15);
}

.form-select:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.subscribers-count {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.count-number {
  font-size: 4rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.count-label {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, #10b981 0%, #10b981 83%, #e5e7eb 83%, #e5e7eb 100%);
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid #10b981;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid #10b981;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Savings Display */
.savings-display {
  background: #1e293b;
  border-radius: 24px;
  padding: 3rem;
  color: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.savings-display::before {
  content: '';
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  opacity: 0.1;
  border-radius: 50%;
}

.savings-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.savings-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 2rem;
}

.savings-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row.highlight {
  background: rgba(59, 130, 246, 0.1);
  padding: 1rem;
  border-radius: 12px;
  border-bottom: none;
}

.detail-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.detail-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.period {
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}

.savings-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
  position: relative;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.badge-content {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.savings-amount {
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.savings-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.savings-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Subscription Exchange Section */
.exchange-section {
  background: linear-gradient(180deg, #1a2942 0%, #0f1829 100%);
  padding: 4rem 2rem;
}

.exchange-container {
  max-width: 1400px;
  margin: 0 auto;
}

.exchange-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.exchange-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 3rem;
  position: relative;
}

.exchange-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: #60a5fa;
  border-radius: 2px;
}

.exchange-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  align-items: start;
}

/* Exchange Cards */
.exchange-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.exchange-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 12px 40px rgba(96, 165, 250, 0.3);
  background: rgba(255, 255, 255, 0.12);
}

.share-card {
  border-color: rgba(16, 185, 129, 0.5);
}

.share-card:hover {
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4);
  border-color: rgba(16, 185, 129, 0.7);
}

.subscribe-card {
  border-color: rgba(59, 130, 246, 0.5);
}

.subscribe-card:hover {
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
  border-color: rgba(59, 130, 246, 0.7);
}

.card-illustration {
  width: 200px;
  height: 200px;
  margin-bottom: 1.5rem;
}

.card-illustration svg {
  width: 100%;
  height: 100%;
}

.card-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
}

.card-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 2rem;
  flex: 1;
}

.card-button {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.share-button:hover {
  background: #10b981;
  border-color: #10b981;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.subscribe-button:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* Info Card */
.exchange-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
}

.info-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.brand-name {
  color: #60a5fa;
  font-weight: 800;
}

.info-description {
  font-size: 1.25rem;
  color: white;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.info-text {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.info-cta {
  color: white;
  font-size: 1.125rem;
  font-weight: 700;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  color: #60a5fa;
}

.loading-categories {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  color: #60a5fa;
  font-size: 0.9375rem;
  justify-content: center;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .service-count {
    font-size: 3rem;
  }

  .available-text {
    font-size: 2.5rem;
  }

  .services-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .arrow-container {
    display: none;
  }

  .service-count {
    font-size: 2.5rem;
  }

  .available-text {
    font-size: 2rem;
  }

  .logos-marquee {
    margin-bottom: 2rem;
    padding: 1rem 0;
  }

  .logo-item {
    width: 80px;
    height: 60px;
    padding: 0.75rem;
  }

  .logos-track {
    gap: 2rem;
    animation: marquee 20s linear infinite;
  }

  .content-section {
    padding: 2rem 1rem;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    max-width: 100%;
  }

  .category-filters {
    justify-content: flex-start;
  }

  /* Adjust discount badges for mobile */
  .discount-badge {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  }

  .discount-percent {
    font-size: 1.125rem;
  }

  .discount-label {
    font-size: 0.625rem;
  }

  /* Hide some discount badges on mobile */
  .discount-3,
  .discount-4 {
    display: none;
  }

  .search-with-badges {
    gap: 1rem;
  }

  .search-bar {
    min-width: 250px;
  }

  .decorative-icon {
    display: none;
  }

  .click-emoji {
    font-size: 1.75rem;
    margin-left: 0.5rem;
  }

  /* Adjust arrows for mobile */
  .hero-content {
    gap: 1.5rem;
  }

  .arrow-discount {
    width: 80px;
  }

  .curved-arrow {
    width: 80px;
    height: 80px;
  }

  .discount-info {
    padding: 0.625rem 1rem;
  }

  .discount-value {
    font-size: 1.25rem;
  }

  .discount-text {
    font-size: 0.75rem;
  }

  /* Operator Coverage Mobile */
  .coverage-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .coverage-title {
    font-size: 1.75rem;
  }

  .coverage-subtitle {
    font-size: 1rem;
  }

  .map-legend {
    grid-template-columns: 1fr;
  }

  .check-coverage-btn {
    font-size: 1rem;
    padding: 0.875rem 2rem;
  }

  /* Savings Calculator Mobile */
  .calculator-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .calculator-main-title {
    font-size: 1.75rem;
  }

  .calculator-subtitle {
    font-size: 1rem;
  }

  .calculator-form {
    padding: 2rem;
  }

  .count-number {
    font-size: 3rem;
  }

  .savings-display {
    padding: 2rem;
  }

  .savings-icon {
    width: 80px;
    height: 80px;
  }

  .savings-title {
    font-size: 1.5rem;
  }

  .detail-value {
    font-size: 1.25rem;
  }

  .savings-amount {
    font-size: 1.5rem;
  }

  /* Exchange Section Mobile */
  .exchange-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .exchange-title {
    font-size: 1.75rem;
  }

  .card-illustration {
    width: 150px;
    height: 150px;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .info-title {
    font-size: 1.25rem;
  }

  .info-description {
    font-size: 1.125rem;
  }
}
</style>
