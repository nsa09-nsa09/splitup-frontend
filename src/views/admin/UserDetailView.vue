<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div>
          <h1>Пользователь</h1>
          <p class="subtitle">Детальная информация о пользователе</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      Загрузка...
    </div>

    <div v-else-if="user" class="content">
      <!-- User Info Card -->
      <div class="card user-card">
        <div class="user-header">
          <div class="user-avatar">
            {{ user.username?.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <h2>{{ user.username }}</h2>
            <p class="user-email">{{ user.email }}</p>
          </div>
          <div class="user-badge">
            <span class="role-badge" :class="user.role?.toLowerCase()">
              {{ getRoleLabel(user.role) }}
            </span>
          </div>
        </div>

        <div class="user-details">
          <div class="detail-item">
            <span class="label">ID</span>
            <span class="value">{{ user.id }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Телефон</span>
            <span class="value">{{ user.phone || 'Не указан' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Дата регистрации</span>
            <span class="value">{{ formatDate(user.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Баланс кошелька</span>
            <span class="value wallet-balance">
              {{ formatBalance(user.walletBalance) }} {{ user.walletCurrency || 'KZT' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Subscriptions -->
      <div class="card">
        <h3 class="card-title">
          <i class="pi pi-box"></i>
          Активные подписки
        </h3>
        <div v-if="subscriptions.length === 0" class="empty-state">
          Нет активных подписок
        </div>
        <div v-else class="subscriptions-list">
          <div v-for="sub in subscriptions" :key="sub.id" class="subscription-item">
            <div class="sub-icon">
              <i :class="sub.serviceIcon || 'pi pi-box'"></i>
            </div>
            <div class="sub-info">
              <div class="sub-name">{{ sub.serviceName }}</div>
              <div class="sub-plan">{{ sub.planName }}</div>
            </div>
            <div class="sub-price">
              {{ formatBalance(sub.pricePerMember) }} KZT/мес
            </div>
            <div class="sub-status" :class="sub.status?.toLowerCase()">
              {{ sub.status }}
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="card">
        <h3 class="card-title">
          <i class="pi pi-history"></i>
          История транзакций
        </h3>
        <div v-if="transactions.length === 0" class="empty-state">
          Нет транзакций
        </div>
        <DataTable
          v-else
          :value="transactions"
          stripedRows
          paginator
          :rows="10"
          dataKey="id"
        >
          <Column field="id" header="ID" style="width: 80px"></Column>
          <Column field="type" header="Тип" style="width: 120px">
            <template #body="slotProps">
              <span class="transaction-type" :class="slotProps.data.type?.toLowerCase()">
                {{ getTransactionTypeLabel(slotProps.data.type) }}
              </span>
            </template>
          </Column>
          <Column field="amount" header="Сумма">
            <template #body="slotProps">
              <span :class="getAmountClass(slotProps.data.type)">
                {{ slotProps.data.type === 'WITHDRAW' ? '-' : '+' }}{{ formatBalance(slotProps.data.amount) }} KZT
              </span>
            </template>
          </Column>
          <Column field="description" header="Описание"></Column>
          <Column field="status" header="Статус" style="width: 120px">
            <template #body="slotProps">
              <span class="status-badge" :class="slotProps.data.status?.toLowerCase()">
                {{ slotProps.data.status }}
              </span>
            </template>
          </Column>
          <Column field="createdAt" header="Дата" style="width: 160px">
            <template #body="slotProps">
              {{ formatDateTime(slotProps.data.createdAt) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usersApi } from '@/services/api'
import type { User, Transaction, UserSubscription } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const user = ref<User | null>(null)
const transactions = ref<Transaction[]>([])
const subscriptions = ref<UserSubscription[]>([])
const loading = ref(true)

const userId = Number(route.params.userId)

const loadUserData = async () => {
  loading.value = true
  try {
    const [userRes, transactionsRes, subscriptionsRes] = await Promise.all([
      usersApi.getById(userId),
      usersApi.getTransactions(userId),
      usersApi.getSubscriptions(userId)
    ])
    user.value = userRes.data
    transactions.value = transactionsRes.data
    subscriptions.value = subscriptionsRes.data
  } catch (error) {
    console.error('Error loading user data:', error)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные пользователя', life: 3000 })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/admin/users')
}

const getRoleLabel = (role: string) => {
  const roles: Record<string, string> = {
    'USER': 'Пользователь',
    'ADMIN': 'Админ',
    'MANAGER': 'Менеджер'
  }
  return roles[role] || role
}

const getTransactionTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    'DEPOSIT': 'Пополнение',
    'WITHDRAW': 'Вывод',
    'PAYMENT': 'Оплата',
    'REFUND': 'Возврат'
  }
  return types[type] || type
}

const getAmountClass = (type: string) => {
  return type === 'WITHDRAW' || type === 'PAYMENT' ? 'amount-negative' : 'amount-positive'
}

const formatBalance = (balance: number | null | undefined) => {
  if (balance === null || balance === undefined) return '0'
  return new Intl.NumberFormat('ru-RU').format(balance)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #16a34a;
  color: #16a34a;
}

.header-content h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.9375rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: #6b7280;
  font-size: 1rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.card-title i {
  color: #16a34a;
}

.user-card {
  padding: 2rem;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.user-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.75rem;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.user-email {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
}

.role-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.role-badge.user {
  background: #f3f4f6;
  color: #374151;
}

.role-badge.admin {
  background: #fef3c7;
  color: #b45309;
}

.role-badge.manager {
  background: #dbeafe;
  color: #1e40af;
}

.user-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.detail-item .label {
  font-size: 0.8125rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.wallet-balance {
  color: #16a34a !important;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
}

.subscriptions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subscription-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
}

.sub-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.sub-info {
  flex: 1;
}

.sub-name {
  font-weight: 600;
  color: #111827;
}

.sub-plan {
  font-size: 0.875rem;
  color: #6b7280;
}

.sub-price {
  font-weight: 600;
  color: #16a34a;
}

.sub-status {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.sub-status.active {
  background: #dcfce7;
  color: #166534;
}

.transaction-type {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.transaction-type.deposit {
  background: #dcfce7;
  color: #166534;
}

.transaction-type.withdraw {
  background: #fee2e2;
  color: #991b1b;
}

.transaction-type.payment {
  background: #fef3c7;
  color: #b45309;
}

.transaction-type.refund {
  background: #dbeafe;
  color: #1e40af;
}

.amount-positive {
  font-weight: 600;
  color: #16a34a;
}

.amount-negative {
  font-weight: 600;
  color: #dc2626;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.status-badge.completed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #b45309;
}

.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f9fafb;
}
</style>
