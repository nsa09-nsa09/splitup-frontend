<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { servicesApi, categoryTypesApi } from '@/services/api'
import type { Service, CategoryType } from '@/types'

const router = useRouter()
const services = ref<Service[]>([])
const categoryTypes = ref<CategoryType[]>([])
const loading = ref(false)
const selectedType = ref<string>('')
const searchQuery = ref('')

const loadCategoryTypes = async () => {
  try {
    const response = await categoryTypesApi.getAll()
    categoryTypes.value = response.data
    if (categoryTypes.value.length > 0) {
      selectedType.value = categoryTypes.value[0].name
    }
  } catch (error) {
    console.error('Error loading category types:', error)
  }
}

const loadServices = async () => {
  loading.value = true
  try {
    const response = await servicesApi.getAll()
    services.value = response.data
  } catch (error) {
    console.error('Error loading services:', error)
  } finally {
    loading.value = false
  }
}

const filteredServices = computed(() => {
  let result = services.value

  // Filter by category type
  result = result.filter((service) => service.category?.type === selectedType.value)

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((service) => service.name.toLowerCase().includes(query))
  }

  return result
})

const goToService = (serviceId: number) => {
  router.push(`/services/${serviceId}`)
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

onMounted(async () => {
  await loadCategoryTypes()
  await loadServices()
})
</script>

<template>
  <MainLayout>
    <div class="home-view">
      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-wrapper">
          <i class="pi pi-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск сервиса..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Category Type Filters -->
      <div class="filter-section">
        <button
          v-for="type in categoryTypes"
          :key="type.id"
          :class="['filter-btn', { active: selectedType === type.name }]"
          @click="selectedType = type.name"
        >
          <i :class="getIconForType(type.name)"></i>
          {{ type.name }}
        </button>
      </div>

      <!-- Services List -->
      <div class="services-section">
        <div v-if="loading" class="loading">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Загрузка сервисов...</p>
        </div>

        <div v-else-if="filteredServices.length === 0" class="empty-state">
          <i class="pi pi-inbox" style="font-size: 3rem; color: #9ca3af"></i>
          <p>Сервисы не найдены</p>
        </div>

        <div v-else class="services-grid">
          <div
            v-for="service in filteredServices"
            :key="service.id"
            class="service-card"
            @click="goToService(service.id!)"
          >
            <div class="service-logo">
              <img
                v-if="service.logoUrl || service.category?.icon"
                :src="service.logoUrl || service.category?.icon"
                :alt="service.name"
              />
              <div v-else class="logo-placeholder">
                <i class="pi pi-image"></i>
              </div>
            </div>

            <div class="service-info">
              <h3 class="service-name">{{ service.name }}</h3>
              <p class="service-description">
                {{ service.description || 'Семейные тарифы' }}
              </p>
              <p class="service-plans">
                {{ service.plansCount || service.planCount || 0 }} тарифа
              </p>
            </div>

            <div class="service-arrow">
              <i class="pi pi-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.home-view {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.search-section {
  margin-bottom: 2rem;
}

.search-wrapper {
  position: relative;
  max-width: 100%;
}

.search-wrapper i {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.125rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 1rem;
  color: #111827;
  background: white;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.filter-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn i {
  font-size: 1.125rem;
}

.filter-btn:hover {
  border-color: #16a34a;
  color: #16a34a;
  background: #f0fdf4;
}

.filter-btn.active {
  background: #16a34a;
  color: white;
  border-color: #16a34a;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.filter-btn.active i {
  color: white;
}

.services-section {
  margin-top: 2rem;
}

.loading,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading p,
.empty-state p {
  margin-top: 1rem;
  font-size: 1.125rem;
}

.services-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.service-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-card:hover {
  border-color: #16a34a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.service-logo {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
}

.service-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
  color: #9ca3af;
  font-size: 1.5rem;
}

.service-info {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.service-description {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.service-plans {
  font-size: 0.9375rem;
  color: #16a34a;
  font-weight: 600;
  margin: 0;
}

.service-arrow {
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.service-card:hover .service-arrow {
  color: #16a34a;
  transform: translateX(4px);
}

@media (max-width: 640px) {
  .home-view {
    padding: 1rem 0;
  }

  .filter-section {
    gap: 0.75rem;
  }

  .filter-btn {
    padding: 0.75rem 1.25rem;
    font-size: 0.9375rem;
  }

  .service-card {
    padding: 1.25rem;
    gap: 1rem;
  }

  .service-logo {
    width: 56px;
    height: 56px;
  }

  .service-name {
    font-size: 1.125rem;
  }
}
</style>
