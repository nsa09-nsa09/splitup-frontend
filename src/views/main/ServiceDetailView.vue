<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { servicesApi, plansApi } from '@/services/api'
import type { Service, SubscriptionPlan } from '@/types'
import MainLayout from '@/layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()

const service = ref<Service | null>(null)
const plans = ref<SubscriptionPlan[]>([])
const loading = ref(false)

const serviceId = computed(() => Number(route.params.id))

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const [serviceResponse, plansResponse] = await Promise.all([
      servicesApi.getById(serviceId.value),
      plansApi.getByService(serviceId.value)
    ])
    service.value = serviceResponse.data
    plans.value = plansResponse.data
  } catch (error) {
    console.error('Error loading service details:', error)
  } finally {
    loading.value = false
  }
}

const calculatePricePerPerson = (plan: SubscriptionPlan) => {
  return Math.round(plan.pricePerMonth / plan.maxMembers)
}

const calculateSavings = (plan: SubscriptionPlan) => {
  if (!plan.originalPrice) return 0
  const pricePerPerson = calculatePricePerPerson(plan)
  const originalPerPerson = Math.round(plan.originalPrice / plan.maxMembers)
  const savings = ((originalPerPerson - pricePerPerson) / originalPerPerson) * 100
  return Math.round(savings)
}

const selectPlan = (planId: number) => {
  router.push(`/plan/${planId}/join`)
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <MainLayout>
    <div class="service-detail-view">

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-container">
          <button class="back-btn" @click="goBack">
            <i class="pi pi-arrow-left"></i>
            <span>Назад</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </div>

      <div v-else class="content-container">
        <!-- Service Hero -->
        <div v-if="service" class="service-hero">
          <div class="hero-icon">
            <img
              v-if="service.icon"
              :src="service.icon"
              :alt="service.name"
              class="hero-logo"
            />
          </div>
          <h1>{{ service.name }}</h1>
          <p>Выберите подходящий тариф для вашей семьи или группы</p>
        </div>

        <!-- Plans Grid -->
        <div class="plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="plan-card"
          :class="{ popular: plan.isPopular }"
          @click="selectPlan(plan.id!)"
        >
          <!-- Popular Badge -->
          <div v-if="plan.isPopular" class="popular-badge">
            <i class="pi pi-bolt"></i>
            <span>Популярное</span>
          </div>

          <!-- Plan Header -->
          <div class="plan-header">
            <div class="plan-icon">
              <i class="pi pi-phone"></i>
            </div>
            <div class="plan-title">
              <h3>{{ plan.name }}</h3>
              <p>{{ plan.maxMembers }} пользователя + {{ plan.maxDevices || 1 }} устройство</p>
            </div>
            <button class="plan-arrow">
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>

          <!-- Plan Info -->
          <div class="plan-info">
            <div class="info-item">
              <span class="label">{{ plan.maxMembers }} номеров</span>
              <span
                v-if="plan.discountPercentage"
                class="discount"
                >-{{ plan.discountPercentage }}%</span
              >
            </div>
          </div>

          <!-- Pricing -->
          <div class="plan-pricing">
            <div class="price-main">
              <span class="price-value">{{ calculatePricePerPerson(plan).toLocaleString() }} ₸</span>
              <span class="price-label">на человека в месяц</span>
            </div>
            <div class="price-total">
              <span v-if="plan.originalPrice" class="original-price"
                >{{ Math.round(plan.originalPrice).toLocaleString() }} ₸</span
              >
              <span class="total-price">{{ Math.round(plan.pricePerMonth).toLocaleString() }} ₸</span>
              <span class="total-label">всего</span>
            </div>
          </div>

          <!-- Savings -->
          <div v-if="plan.originalPrice" class="plan-savings">
            <i class="pi pi-users"></i>
            <span>Экономия до {{ calculateSavings(plan) }}% на человека</span>
          </div>

          <!-- Gift Badge -->
          <div v-if="plan.isPopular" class="gift-badge">
            <i class="pi pi-gift"></i>
            <span>Роутер в подарок!</span>
          </div>
        </div>

          <div v-if="plans.length === 0" class="empty-state">
            <i class="pi pi-inbox" style="font-size: 3rem; color: #9ca3af"></i>
            <p>Тарифы не найдены</p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.service-detail-view {
  width: 100%;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 0;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e5e7eb;
  color: #667eea;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  color: #667eea;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.service-hero {
  text-align: center;
  margin-bottom: 4rem;
}

.hero-icon {
  width: 140px;
  height: 140px;
  border-radius: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  margin-bottom: 1.5rem;
  background: white;
  overflow: hidden;
}

.hero-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

.service-hero h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.service-hero p {
  font-size: 1.125rem;
  color: #6b7280;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.plan-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.plan-card.popular {
  border-color: #f59e0b;
  background: linear-gradient(to bottom, #fffbeb 0%, white 30%);
}

.popular-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.plan-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.plan-title {
  flex: 1;
}

.plan-title h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.plan-title p {
  font-size: 0.875rem;
  color: #6b7280;
}

.plan-arrow {
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.plan-arrow:hover {
  background: #667eea;
  color: white;
}

.plan-info {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.label {
  background: #e0e7ff;
  color: #667eea;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
}

.discount {
  background: #d1fae5;
  color: #059669;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
}

.plan-pricing {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.price-main {
  display: flex;
  flex-direction: column;
}

.price-value {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.price-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.price-total {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.original-price {
  font-size: 0.875rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.total-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.total-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.plan-savings {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
}

.gift-badge {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  margin-top: 0.75rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 0;
  color: #9ca3af;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content-container {
    padding: 2rem 1rem;
  }

  .service-hero h1 {
    font-size: 2rem;
  }

  .hero-icon {
    width: 100px;
    height: 100px;
  }
}
</style>
