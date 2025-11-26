<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import MainLayout from '@/layouts/MainLayout.vue'
import { walletApi } from '@/services/api'
import type { UserSubscription } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const loading = ref(false)
const subscriptions = ref<UserSubscription[]>([])

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return 'Не указано'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getServiceIcon = (icon: string | undefined) => {
  if (!icon) return 'pi pi-tag'
  if (icon.startsWith('pi ')) return icon
  return 'pi pi-tag'
}

const loadSubscriptions = async () => {
  const userId = authStore.user?.id
  if (!userId) {
    console.warn('User not authenticated')
    return
  }

  loading.value = true
  try {
    const response = await walletApi.getSubscriptions(userId)
    subscriptions.value = response.data
  } catch (error) {
    console.error('Error loading subscriptions:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSubscriptions()
})

const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <MainLayout>
    <div class="groups-view">
      <div class="groups-container">
        <!-- Header -->
        <section class="page-header">
          <h1>
            <i class="pi pi-users"></i>
            Мои подписки
          </h1>
          <p class="subtitle">Управляйте своими семейными подписками</p>
        </section>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Загрузка подписок...</p>
        </div>

        <!-- Subscriptions List -->
        <div v-else-if="subscriptions.length > 0" class="subscriptions-grid">
          <div v-for="sub in subscriptions" :key="sub.id" class="subscription-card">
            <div class="card-header">
              <div class="service-icon">
                <i :class="getServiceIcon(sub.serviceIcon)"></i>
              </div>
              <div class="service-info">
                <h3>{{ sub.serviceName }}</h3>
                <span class="plan-name">{{ sub.planName }}</span>
              </div>
              <div class="status-badge" :class="sub.status.toLowerCase()">
                {{ sub.status === 'ACTIVE' ? 'Активна' : sub.status }}
              </div>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Ваша доля:</span>
                <span class="value price">{{ sub.pricePerMember?.toLocaleString('ru-RU') }} ₸/мес</span>
              </div>
              <div class="info-row" v-if="sub.nextPaymentDate">
                <span class="label">Следующий платёж:</span>
                <span class="value">{{ formatDate(sub.nextPaymentDate) }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button class="btn-details">
                <i class="pi pi-info-circle"></i>
                Подробнее
              </button>
              <button class="btn-leave">
                <i class="pi pi-sign-out"></i>
                Покинуть
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-inbox"></i>
          </div>
          <h2>У вас пока нет подписок</h2>
          <p>Присоединяйтесь к семейным подпискам и экономьте до 70% на сервисах</p>
          <button class="btn-explore" @click="goToHome">
            <i class="pi pi-search"></i>
            Найти подписки
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.groups-view {
  min-height: 100vh;
  padding: 2rem;
}

.groups-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 2.5rem;
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.page-header h1 i {
  color: #60a5fa;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  color: #94a3b8;
  font-size: 1.125rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: #94a3b8;
}

.loading-state i {
  font-size: 3rem;
  color: #60a5fa;
  margin-bottom: 1rem;
}

/* Subscriptions Grid */
.subscriptions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Subscription Card */
.subscription-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.subscription-card:hover {
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.service-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-icon i {
  font-size: 1.5rem;
  color: white;
}

.service-info {
  flex: 1;
  min-width: 0;
}

.service-info h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-name {
  font-size: 0.875rem;
  color: #94a3b8;
}

.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-badge.pending {
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
}

.card-body {
  padding: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  color: #94a3b8;
  font-size: 0.9375rem;
}

.info-row .value {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.9375rem;
}

.info-row .value.price {
  color: #22c55e;
  font-size: 1.125rem;
  font-weight: 700;
}

.card-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
}

.card-footer button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-details {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.btn-details:hover {
  background: rgba(96, 165, 250, 0.25);
}

.btn-leave {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-leave:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.empty-icon i {
  font-size: 3.5rem;
  color: #64748b;
}

.empty-state h2 {
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: #94a3b8;
  font-size: 1rem;
  max-width: 400px;
}

.btn-explore {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-explore:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(96, 165, 250, 0.4);
}

/* Responsive */
@media (max-width: 640px) {
  .groups-view {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .subscriptions-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
  }
}
</style>
