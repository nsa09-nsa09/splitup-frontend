<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { servicesApi, plansApi } from '@/services/api'
import type { Service, SubscriptionPlan } from '@/types'
import MainLayout from '@/layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const service = ref<Service | null>(null)
const plans = ref<SubscriptionPlan[]>([])
const loading = ref(false)
const showPlanModal = ref(false)
const selectedPlan = ref<SubscriptionPlan | null>(null)

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

const openPlanModal = (plan: SubscriptionPlan) => {
  selectedPlan.value = plan
  showPlanModal.value = true
}

const closePlanModal = () => {
  showPlanModal.value = false
  selectedPlan.value = null
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
            <span>{{ t('nav.back') }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </div>

      <div v-else class="content-container">
        <!-- Plans Grid -->
        <div class="plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="plan-card"
          :class="{ popular: plan.isPopular }"
          @click="openPlanModal(plan)"
        >
          <!-- Popular Badge -->
          <div v-if="plan.isPopular" class="popular-badge">
            <i class="pi pi-bolt"></i>
            <span>{{ t('plan.popular') }}</span>
          </div>

          <!-- Plan Header -->
          <div class="plan-header">
            <div class="plan-icon">
              <i class="pi pi-phone"></i>
            </div>
            <div class="plan-title">
              <h3>{{ plan.name }}</h3>
              <p>{{ plan.maxMembers }} {{ t('serviceDetail.users') }} + {{ plan.maxDevices || 1 }} {{ t('serviceDetail.device') }}</p>
            </div>
            <button class="plan-arrow">
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>

          <!-- Plan Info -->
          <div class="plan-info">
            <div class="info-item">
              <span class="label">{{ plan.maxMembers }} {{ t('serviceDetail.numbers') }}</span>
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
              <span class="price-label">{{ t('serviceDetail.perPersonPerMonth') }}</span>
            </div>
            <div class="price-total">
              <span v-if="plan.originalPrice" class="original-price"
                >{{ Math.round(plan.originalPrice).toLocaleString() }} ₸</span
              >
              <span class="total-price">{{ Math.round(plan.pricePerMonth).toLocaleString() }} ₸</span>
              <span class="total-label">{{ t('serviceDetail.total') }}</span>
            </div>
          </div>

          <!-- Savings -->
          <div v-if="plan.originalPrice" class="plan-savings">
            <i class="pi pi-users"></i>
            <span>{{ t('serviceDetail.savingsUpTo') }} {{ calculateSavings(plan) }}% {{ t('serviceDetail.perPerson') }}</span>
          </div>

          <!-- Gift Badge -->
          <div v-if="plan.isPopular" class="gift-badge">
            <i class="pi pi-gift"></i>
            <span>{{ t('serviceDetail.giftRouter') }}</span>
          </div>
        </div>

          <div v-if="plans.length === 0" class="empty-state">
            <i class="pi pi-inbox" style="font-size: 3rem; color: #9ca3af"></i>
            <p>{{ t('serviceDetail.plansNotFound') }}</p>
          </div>
        </div>
      </div>

      <!-- Plan Detail Modal -->
      <div v-if="showPlanModal && selectedPlan" class="modal-overlay" @click="closePlanModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closePlanModal">
            <i class="pi pi-times"></i>
          </button>

          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-icon">
              <i class="pi pi-phone"></i>
            </div>
            <h2>{{ selectedPlan.name }}</h2>
            <p>{{ selectedPlan.maxMembers }} номеров + {{ selectedPlan.maxDevices || 1 }} устройство</p>
          </div>

          <!-- Pricing Section -->
          <div class="modal-pricing">
            <div class="modal-price-main">
              <div class="price-row">
                <span class="price-current">{{ Math.round(selectedPlan.pricePerMonth).toLocaleString() }} ₸</span>
                <span v-if="selectedPlan.originalPrice" class="price-old">{{ Math.round(selectedPlan.originalPrice).toLocaleString() }} ₸</span>
              </div>
              <span class="price-period">в месяц</span>
            </div>

            <div v-if="selectedPlan.discountPercentage" class="discount-badge">
              -{{ selectedPlan.discountPercentage }}%
            </div>
          </div>

          <!-- Price Per Person -->
          <div class="modal-per-person">
            <div class="per-person-box">
              <span class="per-person-value">{{ calculatePricePerPerson(selectedPlan).toLocaleString() }} ₸</span>
              <span class="per-person-label">за человека в месяц</span>
            </div>
            <div v-if="selectedPlan.originalPrice" class="savings-info">
              <i class="pi pi-check-circle"></i>
              <span>Экономия до {{ calculateSavings(selectedPlan) }}% с человека</span>
            </div>
          </div>

          <!-- Features -->
          <div class="modal-features">
            <h3>Условия тарифа</h3>
            <div class="feature-list">
              <div class="feature-item">
                <i class="pi pi-users"></i>
                <span>До {{ selectedPlan.maxMembers }} номеров в одном тарифе</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-mobile"></i>
                <span>До {{ selectedPlan.maxDevices || 1 }} устройств на номер</span>
              </div>
              <div v-if="selectedPlan.description" class="feature-item">
                <i class="pi pi-info-circle"></i>
                <span>{{ selectedPlan.description }}</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-shield"></i>
                <span>Безопасное совместное использование</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-clock"></i>
                <span>Ежемесячная подписка</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="modal-actions">
            <button class="modal-action-btn primary" @click="selectPlan(selectedPlan.id!)">
              <i class="pi pi-users"></i>
              <span>Создать семью</span>
            </button>
            <button class="modal-action-btn secondary" @click="selectPlan(selectedPlan.id!)">
              <i class="pi pi-user-plus"></i>
              <span>Вступить в семью</span>
            </button>
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 1.25rem;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.modal-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.modal-header h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.modal-header p {
  font-size: 1rem;
  color: #6b7280;
}

.modal-pricing {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-price-main {
  flex: 1;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.price-current {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.price-old {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: line-through;
}

.price-period {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.discount-badge {
  background: #fbbf24;
  color: #1f2937;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  font-size: 1.25rem;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.modal-per-person {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.per-person-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.per-person-value {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.per-person-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.savings-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #059669;
  font-weight: 600;
  font-size: 0.9375rem;
}

.savings-info i {
  font-size: 1.125rem;
}

.modal-features {
  margin-bottom: 2rem;
}

.modal-features h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.feature-item i {
  color: #667eea;
  font-size: 1.25rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.feature-item span {
  flex: 1;
  color: #4b5563;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-action-btn {
  border: none;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  flex-direction: column;
}

.modal-action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.modal-action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.modal-action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.modal-action-btn.secondary:hover {
  transform: translateY(-2px);
  background: #f8f9ff;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
}

.modal-action-btn i {
  font-size: 1.5rem;
}

.modal-action-btn span {
  font-size: 0.9375rem;
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

  .modal-content {
    padding: 1.5rem;
    max-height: 95vh;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .price-current {
    font-size: 2rem;
  }

  .modal-icon {
    width: 64px;
    height: 64px;
    font-size: 2rem;
  }

  .modal-actions {
    grid-template-columns: 1fr;
  }

  .modal-action-btn {
    padding: 1rem 1.5rem;
  }
}
</style>
