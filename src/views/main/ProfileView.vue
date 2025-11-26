<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import MainLayout from '@/layouts/MainLayout.vue'
import { walletApi } from '@/services/api'
import type { Wallet, Transaction, UserSubscription } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// Loading state
const loading = ref(false)

// Wallet data from backend
const wallet = ref<Wallet | null>(null)
const transactions = ref<Transaction[]>([])
const activeSubscriptions = ref<UserSubscription[]>([])

const formattedBalance = computed(() => {
  if (!wallet.value) return '0 ₸'
  return wallet.value.balance.toLocaleString('ru-RU') + ' ₸'
})

const formatAmount = (amount: number, type: string) => {
  const formatted = Math.abs(amount).toLocaleString('ru-RU')
  const isDeposit = type === 'DEPOSIT'
  return isDeposit ? '+' + formatted + ' ₸' : '-' + formatted + ' ₸'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const getTransactionType = (type: string) => {
  return type === 'DEPOSIT' ? 'deposit' : 'payment'
}

const getServiceIcon = (icon: string | undefined) => {
  if (!icon) return 'pi pi-tag'
  if (icon.startsWith('pi ')) return icon
  return 'pi pi-tag'
}

const loadProfileData = async () => {
  const userId = authStore.user?.id
  if (!userId) {
    console.warn('User not authenticated')
    return
  }

  loading.value = true
  try {
    const [walletResponse, transactionsResponse, subscriptionsResponse] = await Promise.all([
      walletApi.getWallet(userId),
      walletApi.getTransactions(userId),
      walletApi.getSubscriptions(userId)
    ])

    wallet.value = walletResponse.data
    transactions.value = transactionsResponse.data
    activeSubscriptions.value = subscriptionsResponse.data
  } catch (error) {
    console.error('Error loading profile data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfileData()
})

const goToTopUp = () => {
  // TODO: Navigate to top-up page
  alert('Функция пополнения в разработке')
}

const goToWithdraw = () => {
  // TODO: Navigate to withdraw page
  alert('Функция вывода в разработке')
}
</script>

<template>
  <MainLayout>
    <div class="profile-view">
      <div class="profile-container">
        <!-- Profile Header -->
        <section class="profile-header">
          <div class="avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="user-info">
            <h1>{{ authStore.user?.username || 'Пользователь' }}</h1>
            <p class="user-email">{{ authStore.user?.email || 'email@example.com' }}</p>
          </div>
        </section>

        <!-- Wallet Section -->
        <section class="wallet-section">
          <div class="wallet-card">
            <div class="wallet-header">
              <div class="wallet-icon">
                <i class="pi pi-wallet"></i>
              </div>
              <span class="wallet-label">Мой кошелёк</span>
            </div>
            <div class="wallet-balance">
              {{ formattedBalance }}
            </div>
            <div class="wallet-actions">
              <button class="btn-topup" @click="goToTopUp">
                <i class="pi pi-plus"></i>
                Пополнить
              </button>
              <button class="btn-withdraw" @click="goToWithdraw">
                <i class="pi pi-arrow-up-right"></i>
                Вывести
              </button>
            </div>
          </div>
        </section>

        <!-- Active Subscriptions -->
        <section class="subscriptions-section">
          <h2>
            <i class="pi pi-check-circle"></i>
            Активные подписки
          </h2>
          <div v-if="loading" class="loading-state">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Загрузка...</p>
          </div>
          <div v-else class="subscriptions-list">
            <div v-for="sub in activeSubscriptions" :key="sub.id" class="subscription-card">
              <div class="sub-icon">
                <i :class="getServiceIcon(sub.serviceIcon)"></i>
              </div>
              <div class="sub-info">
                <h4>{{ sub.serviceName }} - {{ sub.planName }}</h4>
                <p v-if="sub.nextPaymentDate">Следующий платёж: {{ formatDate(sub.nextPaymentDate) }}</p>
              </div>
              <div class="sub-price">
                {{ sub.pricePerMember?.toLocaleString('ru-RU') }} ₸/мес
              </div>
            </div>
            <div v-if="activeSubscriptions.length === 0" class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>У вас пока нет активных подписок</p>
            </div>
          </div>
        </section>

        <!-- Transaction History -->
        <section class="transactions-section">
          <h2>
            <i class="pi pi-history"></i>
            История транзакций
          </h2>
          <div v-if="loading" class="loading-state">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Загрузка...</p>
          </div>
          <div v-else class="transactions-list">
            <div v-for="tx in transactions" :key="tx.id" class="transaction-item">
              <div class="tx-icon" :class="getTransactionType(tx.type)">
                <i :class="tx.type === 'DEPOSIT' ? 'pi pi-arrow-down' : 'pi pi-arrow-up'"></i>
              </div>
              <div class="tx-info">
                <h4>{{ tx.description }}</h4>
                <p>{{ formatDate(tx.createdAt) }}</p>
              </div>
              <div class="tx-amount" :class="getTransactionType(tx.type)">
                {{ formatAmount(tx.amount, tx.type) }}
              </div>
            </div>
            <div v-if="transactions.length === 0" class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>История транзакций пуста</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.profile-view {
  min-height: 100vh;
  padding: 2rem;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar i {
  font-size: 2.5rem;
  color: white;
}

.user-info h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
}

.user-email {
  margin: 0.25rem 0 0 0;
  color: #94a3b8;
  font-size: 1rem;
}

/* Wallet Section */
.wallet-section {
  display: flex;
  justify-content: center;
}

.wallet-card {
  width: 100%;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(96, 165, 250, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.wallet-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.wallet-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wallet-icon i {
  font-size: 1.5rem;
  color: white;
}

.wallet-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: #94a3b8;
}

.wallet-balance {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.wallet-actions {
  display: flex;
  gap: 1rem;
}

.btn-topup,
.btn-withdraw {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-topup {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.btn-topup:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
}

.btn-withdraw {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-withdraw:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Subscriptions Section */
.subscriptions-section,
.transactions-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.subscriptions-section h2,
.transactions-section h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.subscriptions-section h2 i,
.transactions-section h2 i {
  color: #60a5fa;
}

.subscriptions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subscription-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.subscription-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(96, 165, 250, 0.3);
}

.sub-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-icon i {
  font-size: 1.25rem;
  color: white;
}

.sub-info {
  flex: 1;
}

.sub-info h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.sub-info p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #94a3b8;
}

.sub-price {
  font-size: 1rem;
  font-weight: 700;
  color: #22c55e;
}

/* Transactions List */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.tx-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tx-icon.deposit {
  background: rgba(34, 197, 94, 0.15);
}

.tx-icon.deposit i {
  color: #22c55e;
}

.tx-icon.payment {
  background: rgba(239, 68, 68, 0.15);
}

.tx-icon.payment i {
  color: #ef4444;
}

.tx-info {
  flex: 1;
}

.tx-info h4 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #e2e8f0;
}

.tx-info p {
  margin: 0.125rem 0 0 0;
  font-size: 0.8125rem;
  color: #64748b;
}

.tx-amount {
  font-size: 1rem;
  font-weight: 700;
}

.tx-amount.deposit {
  color: #22c55e;
}

.tx-amount.payment {
  color: #ef4444;
}

/* Empty State & Loading State */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
  text-align: center;
}

.empty-state i,
.loading-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.loading-state i {
  color: #60a5fa;
  opacity: 1;
}

.empty-state p,
.loading-state p {
  margin: 0;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 640px) {
  .profile-view {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .wallet-balance {
    font-size: 2.25rem;
  }

  .wallet-actions {
    flex-direction: column;
  }

  .subscription-card {
    flex-wrap: wrap;
  }

  .sub-price {
    width: 100%;
    text-align: right;
    margin-top: 0.5rem;
  }
}
</style>
