<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <h1>Все тарифы</h1>
        <p class="subtitle">Управление тарифными планами</p>
      </div>
      <Button label="Добавить тариф" icon="pi pi-plus" @click="openDialog()" />
    </div>

    <div class="card">
      <DataTable
        :value="plans"
        :loading="loading"
        stripedRows
        paginator
        :rows="10"
        dataKey="id"
      >
        <Column field="id" header="ID" sortable style="width: 80px"></Column>
        <Column field="serviceName" header="Сервис" sortable style="width: 150px">
          <template #body="slotProps">
            <span class="service-badge">{{ slotProps.data.serviceName || '-' }}</span>
          </template>
        </Column>
        <Column field="name" header="Название" sortable></Column>
        <Column field="pricePerMonth" header="Цена/мес" sortable style="width: 120px">
          <template #body="slotProps">
            <span class="price">{{ slotProps.data.pricePerMonth?.toLocaleString() }} ₸</span>
          </template>
        </Column>
        <Column field="originalPrice" header="Полная цена" sortable style="width: 130px">
          <template #body="slotProps">
            <span v-if="slotProps.data.originalPrice" class="original-price">
              {{ slotProps.data.originalPrice?.toLocaleString() }} ₸
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </Column>
        <Column field="maxMembers" header="Участников" sortable style="width: 120px">
          <template #body="slotProps">
            <span class="members-badge">
              <i class="pi pi-users"></i>
              {{ slotProps.data.maxMembers }}
            </span>
          </template>
        </Column>
        <Column field="isPopular" header="Популярный" sortable style="width: 120px">
          <template #body="slotProps">
            <span v-if="slotProps.data.isPopular" class="popular-badge">
              <i class="pi pi-star-fill"></i> Да
            </span>
            <span v-else class="text-muted">Нет</span>
          </template>
        </Column>
        <Column header="Действия" style="width: 140px">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              class="p-button-sm p-button-text"
              title="Редактировать"
              @click="openDialog(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-sm p-button-text p-button-danger"
              title="Удалить"
              @click="deletePlan(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :header="editingPlan?.id ? 'Редактировать тариф' : 'Новый тариф'"
      :style="{ width: '600px' }"
      :pt="{
        root: { style: 'border-radius: 20px; overflow: hidden;' },
        header: { style: 'padding: 28px 32px 20px 32px; background: white; border-bottom: none;' },
        content: { style: 'padding: 12px 32px 32px 32px;' },
        footer: { style: 'padding: 24px 32px 28px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;' }
      }"
      modal
      :draggable="false"
    >
      <div class="form-grid">
        <div class="form-group">
          <label>Сервис</label>
          <Dropdown
            v-model="editingPlan.serviceId"
            :options="services"
            optionLabel="name"
            optionValue="id"
            placeholder="Выберите сервис"
            class="w-full"
          />
        </div>
        <div class="form-group">
          <label>Название тарифа</label>
          <InputText v-model="editingPlan.name" placeholder="Premium, Family..." class="w-full" />
        </div>
        <div class="form-group">
          <label>Цена за месяц (₸)</label>
          <InputNumber v-model="editingPlan.pricePerMonth" :min="0" class="w-full" />
        </div>
        <div class="form-group">
          <label>Полная цена (₸)</label>
          <InputNumber v-model="editingPlan.originalPrice" :min="0" class="w-full" />
        </div>
        <div class="form-group">
          <label>Макс. участников</label>
          <InputNumber v-model="editingPlan.maxMembers" :min="1" :max="20" class="w-full" />
        </div>
        <div class="form-group">
          <label>Макс. устройств</label>
          <InputNumber v-model="editingPlan.maxDevices" :min="1" :max="20" class="w-full" />
        </div>
        <div class="form-group full-width">
          <label>Описание</label>
          <Textarea v-model="editingPlan.description" rows="3" class="w-full" />
        </div>
        <div class="form-group">
          <div class="checkbox-group">
            <Checkbox v-model="editingPlan.isPopular" :binary="true" inputId="isPopular" />
            <label for="isPopular">Популярный тариф</label>
          </div>
        </div>
        <div class="form-group">
          <div class="checkbox-group">
            <Checkbox v-model="editingPlan.isActive" :binary="true" inputId="isActive" />
            <label for="isActive">Активен</label>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-actions">
          <Button label="Отмена" severity="secondary" text @click="dialogVisible = false" />
          <Button label="Сохранить" icon="pi pi-check" @click="savePlan" />
        </div>
      </template>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { plansApi, servicesApi } from '@/services/api'
import type { SubscriptionPlan, Service } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const plans = ref<SubscriptionPlan[]>([])
const services = ref<Service[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingPlan = ref<Partial<SubscriptionPlan>>({})

const loadData = async () => {
  loading.value = true
  try {
    const [plansRes, servicesRes] = await Promise.all([
      plansApi.getAll(),
      servicesApi.getAll()
    ])
    plans.value = plansRes.data
    services.value = servicesRes.data
  } catch (error) {
    console.error('Error loading data:', error)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные', life: 3000 })
  } finally {
    loading.value = false
  }
}

const openDialog = (plan?: SubscriptionPlan) => {
  if (plan) {
    editingPlan.value = { ...plan }
  } else {
    editingPlan.value = {
      name: '',
      maxMembers: 4,
      pricePerMonth: 0,
      isPopular: false,
      isActive: true
    }
  }
  dialogVisible.value = true
}

const savePlan = async () => {
  try {
    if (editingPlan.value.id) {
      await plansApi.update(editingPlan.value.id, editingPlan.value)
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Тариф обновлен', life: 3000 })
    } else {
      await plansApi.create(editingPlan.value)
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Тариф создан', life: 3000 })
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Error saving plan:', error)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить тариф', life: 3000 })
  }
}

const deletePlan = async (plan: SubscriptionPlan) => {
  if (!plan.id) return
  if (!confirm(`Удалить тариф "${plan.name}"?`)) return

  try {
    await plansApi.delete(plan.id)
    toast.add({ severity: 'success', summary: 'Успешно', detail: 'Тариф удален', life: 3000 })
    loadData()
  } catch (error) {
    console.error('Error deleting plan:', error)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить тариф', life: 3000 })
  }
}

onMounted(() => {
  loadData()
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

.service-badge {
  padding: 0.375rem 0.75rem;
  background: #dbeafe;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #1e40af;
  font-weight: 500;
}

.price {
  font-weight: 700;
  color: #16a34a;
}

.original-price {
  color: #6b7280;
  text-decoration: line-through;
}

.members-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #374151;
}

.members-badge i {
  font-size: 0.75rem;
}

.popular-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #fef3c7;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #b45309;
  font-weight: 600;
}

.popular-badge i {
  font-size: 0.75rem;
  color: #f59e0b;
}

.text-muted {
  color: #9ca3af;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9375rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 1.5rem;
}

.checkbox-group label {
  font-weight: 500;
  cursor: pointer;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.w-full {
  width: 100%;
}

:deep(.p-button:not(.p-button-text)) {
  background: #16a34a;
  border-color: #16a34a;
}

:deep(.p-button:not(.p-button-text):hover) {
  background: #15803d;
  border-color: #15803d;
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
