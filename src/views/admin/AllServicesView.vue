<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <h1>Все сервисы</h1>
        <p class="subtitle">Управление сервисами системы</p>
      </div>
      <Button label="Добавить сервис" icon="pi pi-plus" @click="openDialog()" />
    </div>

    <div class="card">
      <DataTable
        :value="services"
        :loading="loading"
        stripedRows
        paginator
        :rows="10"
        dataKey="id"
        filterDisplay="row"
        :globalFilterFields="['name', 'type']"
      >
        <Column field="id" header="ID" sortable style="width: 80px"></Column>
        <Column field="name" header="Название" sortable>
          <template #body="slotProps">
            <div class="service-name">
              <div class="service-icon" v-if="slotProps.data.icon">
                <i :class="slotProps.data.icon"></i>
              </div>
              <span>{{ slotProps.data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="type" header="Тип" sortable style="width: 150px">
          <template #body="slotProps">
            <span class="type-badge">{{ slotProps.data.type }}</span>
          </template>
        </Column>
        <Column field="priceFrom" header="Цена от" sortable style="width: 120px">
          <template #body="slotProps">
            <span v-if="slotProps.data.priceFrom">{{ slotProps.data.priceFrom }} ₸</span>
            <span v-else class="text-muted">-</span>
          </template>
        </Column>
        <Column field="savingsPercentage" header="Экономия" sortable style="width: 120px">
          <template #body="slotProps">
            <span v-if="slotProps.data.savingsPercentage" class="savings-badge">
              -{{ slotProps.data.savingsPercentage }}%
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </Column>
        <Column header="Действия" style="width: 180px">
          <template #body="slotProps">
            <Button
              icon="pi pi-list"
              class="p-button-sm p-button-text p-button-info"
              title="Тарифы"
              @click="goToPlans(slotProps.data)"
            />
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
              @click="deleteService(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :header="editingService?.id ? 'Редактировать сервис' : 'Новый сервис'"
      :style="{ width: '550px' }"
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
          <label>Название</label>
          <InputText v-model="editingService.name" placeholder="Netflix, Spotify..." class="w-full" />
        </div>
        <div class="form-group">
          <label>Тип сервиса</label>
          <Dropdown
            v-model="editingService.typeId"
            :options="serviceTypes"
            optionLabel="name"
            optionValue="id"
            placeholder="Выберите тип"
            class="w-full"
          />
        </div>
        <div class="form-group">
          <label>Иконка (класс)</label>
          <InputText v-model="editingService.icon" placeholder="pi pi-play" class="w-full" />
        </div>
        <div class="form-group">
          <label>Цена от (₸)</label>
          <InputNumber v-model="editingService.priceFrom" :min="0" class="w-full" />
        </div>
        <div class="form-group">
          <label>Экономия (%)</label>
          <InputNumber v-model="editingService.savingsPercentage" :min="0" :max="100" class="w-full" />
        </div>
        <div class="form-group full-width">
          <label>Описание</label>
          <Textarea v-model="editingService.description" rows="3" class="w-full" />
        </div>
      </div>

      <template #footer>
        <div class="dialog-actions">
          <Button label="Отмена" severity="secondary" text @click="dialogVisible = false" />
          <Button label="Сохранить" icon="pi pi-check" @click="saveService" />
        </div>
      </template>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { servicesApi, serviceTypesApi } from '@/services/api'
import type { Service, ServiceType } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()
const services = ref<Service[]>([])
const serviceTypes = ref<ServiceType[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingService = ref<Partial<Service>>({})

const loadData = async () => {
  loading.value = true
  try {
    const [servicesRes, typesRes] = await Promise.all([
      servicesApi.getAll(),
      serviceTypesApi.getAll()
    ])
    services.value = servicesRes.data
    serviceTypes.value = typesRes.data
  } catch (error) {
    console.error('Error loading data:', error)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные', life: 3000 })
  } finally {
    loading.value = false
  }
}

const openDialog = (service?: Service) => {
  if (service) {
    editingService.value = { ...service }
  } else {
    editingService.value = { name: '', type: '', icon: '' }
  }
  dialogVisible.value = true
}

const saveService = async () => {
  try {
    if (editingService.value.id) {
      await servicesApi.update(editingService.value.id, editingService.value)
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Сервис обновлен', life: 3000 })
    } else {
      await servicesApi.create(editingService.value)
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Сервис создан', life: 3000 })
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Error saving service:', error)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить сервис', life: 3000 })
  }
}

const deleteService = async (service: Service) => {
  if (!service.id) return
  if (!confirm(`Удалить сервис "${service.name}"?`)) return

  try {
    await servicesApi.delete(service.id)
    toast.add({ severity: 'success', summary: 'Успешно', detail: 'Сервис удален', life: 3000 })
    loadData()
  } catch (error) {
    console.error('Error deleting service:', error)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить сервис', life: 3000 })
  }
}

const goToPlans = (service: Service) => {
  if (service.id) {
    router.push(`/admin/services/${service.id}/plans`)
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

.service-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.service-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-icon i {
  color: white;
  font-size: 1rem;
}

.type-badge {
  padding: 0.375rem 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #374151;
}

.savings-badge {
  padding: 0.375rem 0.75rem;
  background: #dcfce7;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #166534;
  font-weight: 600;
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
