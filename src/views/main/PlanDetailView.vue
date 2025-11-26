<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { plansApi, servicesApi } from '@/services/api'
import type { SubscriptionPlan, Service } from '@/types'
import MainLayout from '@/layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const plan = ref<SubscriptionPlan | null>(null)
const service = ref<Service | null>(null)
const loading = ref(false)

const planId = computed(() => Number(route.params.id))

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const planResponse = await plansApi.getById(planId.value)
    plan.value = planResponse.data

    if (plan.value?.serviceId) {
      const serviceResponse = await servicesApi.getById(plan.value.serviceId)
      service.value = serviceResponse.data
    }
  } catch (error) {
    console.error('Error loading plan details:', error)
  } finally {
    loading.value = false
  }
}

const calculatePricePerPerson = (p: SubscriptionPlan) => {
  return Math.round(p.pricePerMonth / p.maxMembers)
}

const calculateSavings = (p: SubscriptionPlan) => {
  if (!p.originalPrice) return 0
  const pricePerPerson = calculatePricePerPerson(p)
  const originalPerPerson = Math.round(p.originalPrice / p.maxMembers)
  const savings = ((originalPerPerson - pricePerPerson) / originalPerPerson) * 100
  return Math.round(savings)
}

const goBack = () => {
  router.back()
}

const createFamily = () => {
  router.push(`/plan/${planId.value}/create`)
}

const joinFamily = () => {
  router.push(`/plan/${planId.value}/join`)
}
</script>

<template>
  <MainLayout>
    <div class="plan-detail-view">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-container">
          <button class="back-btn" @click="goBack">
            <i class="pi pi-arrow-left"></i>
          </button>
          <div class="header-title" v-if="service">{{ service.name }}</div>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <i class="pi pi-spin pi-spinner"></i>
      </div>

      <div v-else-if="plan" class="content-container">
        <!-- Compact Plan Info -->
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-icon">
              <img v-if="service?.icon" :src="service.icon" :alt="service.name" />
              <i v-else class="pi pi-box"></i>
            </div>
            <div class="plan-info">
              <h1>{{ plan.name }}</h1>
              <div class="plan-meta">
                <span><i class="pi pi-users"></i> {{ plan.maxMembers }} чел.</span>
                <span><i class="pi pi-mobile"></i> {{ plan.maxDevices || 1 }} устр.</span>
              </div>
            </div>
            <div class="plan-badges" v-if="plan.isPopular || plan.discountPercentage">
              <span v-if="plan.discountPercentage" class="discount-badge">-{{ plan.discountPercentage }}%</span>
            </div>
          </div>

          <!-- Price Section -->
          <div class="price-section">
            <div class="price-per-person">
              <span class="price-amount">{{ calculatePricePerPerson(plan).toLocaleString() }} ₸</span>
              <span class="price-label">/ чел. в месяц</span>
            </div>
            <div class="price-total">
              <span v-if="plan.originalPrice" class="price-old">{{ Math.round(plan.originalPrice).toLocaleString() }} ₸</span>
              <span class="price-full">{{ Math.round(plan.pricePerMonth).toLocaleString() }} ₸ всего</span>
            </div>
          </div>

          <!-- Savings Badge -->
          <div v-if="plan.originalPrice" class="savings-badge">
            <i class="pi pi-wallet"></i>
            Экономия {{ calculateSavings(plan) }}% с человека
          </div>
        </div>

        <!-- Action Buttons - Main Focus -->
        <div class="actions-section">
          <button class="action-btn primary" @click="createFamily">
            <i class="pi pi-plus-circle"></i>
            <span>Создать группу</span>
          </button>

          <button class="action-btn secondary" @click="joinFamily">
            <i class="pi pi-sign-in"></i>
            <span>Присоединиться</span>
          </button>
        </div>

        <!-- Compact Features -->
        <div class="features-list">
          <div class="feature-item">
            <i class="pi pi-check"></i>
            <span>До {{ plan.maxMembers }} участников в группе</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-check"></i>
            <span>{{ plan.maxDevices || 1 }} устройство на участника</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-check"></i>
            <span>Безопасное разделение подписки</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-check"></i>
            <span>Ежемесячная оплата</span>
          </div>
          <div v-if="plan.description" class="feature-item description">
            <i class="pi pi-info-circle"></i>
            <span>{{ plan.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.plan-detail-view {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #e5e7eb;
  color: #667eea;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
  color: #667eea;
  font-size: 1.5rem;
}

.content-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* Plan Card */
.plan-card {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.plan-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.plan-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.5rem;
}

.plan-icon i {
  font-size: 1.5rem;
  color: #667eea;
}

.plan-info {
  flex: 1;
  min-width: 0;
}

.plan-info h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.plan-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.plan-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.plan-meta i {
  font-size: 0.75rem;
}

.discount-badge {
  background: #dcfce7;
  color: #16a34a;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
}

/* Price Section */
.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 14px;
  margin-bottom: 0.75rem;
}

.price-per-person {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
}

.price-amount {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
}

.price-label {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.8);
}

.price-total {
  text-align: right;
}

.price-old {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: line-through;
  display: block;
}

.price-full {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.savings-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #dcfce7;
  color: #16a34a;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
}

/* Action Buttons */
.actions-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
  font-weight: 600;
}

.action-btn i {
  font-size: 1.125rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.action-btn.secondary:hover {
  background: #f8f9ff;
  transform: translateY(-2px);
}

/* Features List */
.features-list {
  background: white;
  border-radius: 16px;
  padding: 1rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-item i {
  color: #16a34a;
  font-size: 0.875rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.feature-item.description i {
  color: #667eea;
}

.feature-item span {
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 480px) {
  .actions-section {
    grid-template-columns: 1fr;
  }

  .price-amount {
    font-size: 1.5rem;
  }
}
</style>
