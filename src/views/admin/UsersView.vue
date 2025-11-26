<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <h1>Пользователи</h1>
        <p class="subtitle">Список зарегистрированных пользователей</p>
      </div>
    </div>

    <div class="card">
      <DataTable
        :value="users"
        :loading="loading"
        stripedRows
        paginator
        :rows="10"
        dataKey="id"
        :globalFilterFields="['username', 'email', 'fullName']"
        v-model:filters="filters"
        filterDisplay="row"
        @row-click="onRowClick"
        class="clickable-rows"
      >
        <template #header>
          <div class="table-header">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Поиск..." />
            </span>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="width: 80px"></Column>
        <Column field="username" header="Имя пользователя" sortable>
          <template #body="slotProps">
            <div class="user-cell">
              <div class="user-avatar">
                {{ slotProps.data.username?.charAt(0).toUpperCase() }}
              </div>
              <span>{{ slotProps.data.username }}</span>
            </div>
          </template>
        </Column>
        <Column field="email" header="Email" sortable>
          <template #body="slotProps">
            <a :href="'mailto:' + slotProps.data.email" class="email-link">
              {{ slotProps.data.email }}
            </a>
          </template>
        </Column>
        <Column field="role" header="Роль" sortable style="width: 120px">
          <template #body="slotProps">
            <span class="role-badge" :class="slotProps.data.role?.toLowerCase()">
              {{ getRoleLabel(slotProps.data.role) }}
            </span>
          </template>
        </Column>
        <Column field="walletBalance" header="Баланс" sortable style="width: 140px">
          <template #body="slotProps">
            <span v-if="slotProps.data.walletBalance !== null" class="wallet-balance">
              {{ formatBalance(slotProps.data.walletBalance) }} {{ slotProps.data.walletCurrency || 'KZT' }}
            </span>
            <span v-else class="text-muted">Нет кошелька</span>
          </template>
        </Column>
        <Column field="createdAt" header="Дата регистрации" sortable style="width: 160px">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usersApi } from '@/services/api'
import type { User } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()
const users = ref<User[]>([])
const loading = ref(false)

const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await usersApi.getAll()
    users.value = response.data
  } catch (error) {
    console.error('Error loading users:', error)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить пользователей', life: 3000 })
  } finally {
    loading.value = false
  }
}

const getRoleLabel = (role: string) => {
  const roles: Record<string, string> = {
    'USER': 'Пользователь',
    'ADMIN': 'Админ',
    'MANAGER': 'Менеджер'
  }
  return roles[role] || role
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatBalance = (balance: number) => {
  return new Intl.NumberFormat('ru-RU').format(balance)
}

const onRowClick = (event: any) => {
  router.push(`/admin/users/${event.data.id}`)
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
}

.email-link {
  color: #3b82f6;
  text-decoration: none;
}

.email-link:hover {
  text-decoration: underline;
}

.text-muted {
  color: #9ca3af;
}

.wallet-balance {
  font-weight: 600;
  color: #16a34a;
}

.role-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
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

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.status-badge.verified {
  background: #dcfce7;
  color: #166534;
}

.status-badge.unverified {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge i {
  font-size: 0.75rem;
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

:deep(.clickable-rows .p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(.p-inputtext) {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
}

:deep(.p-inputtext:focus) {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

:deep(.p-input-icon-left > i) {
  left: 1rem;
  color: #9ca3af;
}
</style>
