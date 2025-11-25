<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MainLayout from '@/layouts/MainLayout.vue'
import { categoriesApi, categoryPlansApi } from '@/services/api'
import type { ServiceCategory, CategoryPlan } from '@/types'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const categoryId = ref<number>(parseInt(route.params.id as string))
const category = ref<ServiceCategory | null>(null)
const plans = ref<CategoryPlan[]>([])
const loading = ref(false)

onMounted(async () => {
  await loadCategory()
  await loadPlans()
})

const loadCategory = async () => {
  loading.value = true
  try {
    const response = await categoriesApi.getById(categoryId.value)
    category.value = response.data
  } catch (error) {
    console.error('Error loading category:', error)
  } finally {
    loading.value = false
  }
}

const loadPlans = async () => {
  try {
    const response = await categoryPlansApi.getByCategory(categoryId.value)
    // Показываем только активные тарифы пользователям
    plans.value = response.data.filter(plan => plan.isActive !== false)
  } catch (error) {
    console.error('Error loading plans:', error)
  }
}

const goBack = () => {
  router.push('/')
}

const savingsText = computed(() => {
  if (category.value?.savingsPercentage) {
    return `${t('category.savingsUpTo')} ${category.value.savingsPercentage}%`
  }
  return ''
})
</script>

<template>
  <MainLayout>
    <div class="category-detail-view">
      <!-- Hero Section -->
      <section class="category-hero">
        <div class="hero-container">
          <button class="back-btn" @click="goBack">
            <i class="pi pi-arrow-left"></i>
            <span>{{ t('nav.back') }}</span>
          </button>

          <div class="category-header">
            <div class="category-info">
              <h1>{{ category?.name }}</h1>
              <p class="category-type">{{ category?.type }}</p>
            </div>
          </div>

          <div v-if="category?.description" class="category-description">
            <p>{{ category.description }}</p>
          </div>
        </div>
      </section>

      <!-- Plans Section -->
      <section class="services-section">
        <div class="services-container">
          <h2>{{ t('category.availablePlans') }}</h2>

          <div v-if="loading" class="loading">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          </div>

          <div v-else-if="plans.length === 0" class="empty-state">
            <i class="pi pi-inbox" style="font-size: 3rem; color: #9ca3af"></i>
            <p>{{ t('category.noPlans') }}</p>
          </div>

          <div v-else class="plans-grid">
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="plan-card"
              :class="{ 'popular': plan.isPopular }"
            >
              <div v-if="plan.isPopular" class="popular-badge">
                <i class="pi pi-star-fill"></i>
                <span>{{ t('plan.popular') }}</span>
              </div>

              <div class="plan-header">
                <h3>{{ plan.name }}</h3>
                <p v-if="plan.description" class="plan-description">{{ plan.description }}</p>
              </div>

              <div class="plan-details">
                <div class="detail-item">
                  <i class="pi pi-users"></i>
                  <span>{{ plan.slots }} {{ t('plan.slots') }}</span>
                </div>
                <div v-if="plan.discountPercentage" class="detail-item discount">
                  <i class="pi pi-percentage"></i>
                  <span>{{ t('plan.discount') }} {{ plan.discountPercentage }}%</span>
                </div>
              </div>

              <div class="plan-pricing">
                <div class="price-main">
                  <span class="price-value">{{ Math.round(plan.pricePerPerson) }} ₸</span>
                  <span class="price-label">{{ t('plan.perPerson') }}</span>
                </div>
                <div v-if="plan.individualPrice" class="price-original">
                  <span>{{ t('plan.originalPrice') }}: {{ Math.round(plan.individualPrice) }} ₸</span>
                </div>
              </div>

              <button class="plan-button">
                {{ t('plan.connect') }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </MainLayout>
</template>

<style scoped>
.category-detail-view {
  width: 100%;
}

/* Hero Section */
.category-hero {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  padding: 3rem 2rem;
  position: relative;
  overflow: hidden;
}

.category-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-4px);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.category-icon-large {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.category-icon-large img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.category-info h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.category-type {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0 0 1rem 0;
}

.category-badges {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
}

.price-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.savings-badge {
  background: #fbbf24;
  color: #78350f;
}

.category-description {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
}

.category-description p {
  font-size: 1.125rem;
  line-height: 1.7;
  margin: 0;
}

/* Services Section */
.services-section {
  padding: 3rem 2rem;
  background: #f9fafb;
}

.services-container {
  max-width: 1400px;
  margin: 0 auto;
}

.services-container h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2rem;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  color: #16a34a;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: #9ca3af;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.25rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.plan-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid #e5e7eb;
  position: relative;
  display: flex;
  flex-direction: column;
}

.plan-card.popular {
  border-color: #fbbf24;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.2);
}

.plan-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(22, 163, 74, 0.15);
  border-color: #16a34a;
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.plan-header {
  margin-bottom: 1.5rem;
}

.plan-header h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.plan-description {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.plan-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
}

.detail-item.discount {
  background: #fef3c7;
  color: #78350f;
}

.detail-item i {
  font-size: 1rem;
}

.plan-pricing {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 16px;
  text-align: center;
}

.price-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.75rem;
}

.price-value {
  font-size: 3rem;
  font-weight: 800;
  color: #16a34a;
  line-height: 1;
}

.price-label {
  font-size: 1rem;
  color: #15803d;
  font-weight: 600;
  margin-top: 0.25rem;
}

.price-original {
  font-size: 0.875rem;
  color: #6b7280;
  text-decoration: line-through;
}

.plan-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.plan-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
  background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
}

/* Responsive */
@media (max-width: 768px) {
  .category-hero {
    padding: 2rem 1rem;
  }

  .category-header {
    flex-direction: column;
    text-align: center;
  }

  .category-info h1 {
    font-size: 2rem;
  }

  .services-section {
    padding: 2rem 1rem;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .price-value {
    font-size: 2.5rem;
  }
}
</style>
