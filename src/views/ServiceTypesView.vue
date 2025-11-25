<template>
  <AdminLayout>
    <div class="card">
      <div class="header">
        <h1>Управление типами сервисов</h1>
        <Button label="Добавить тип" icon="pi pi-plus" @click="openDialog()" />
      </div>

      <DataTable
        :value="serviceTypes"
        :loading="loading"
        stripedRows
        paginator
        :rows="10"
        dataKey="id"
      >
        <Column field="id" header="ID" sortable style="width: 80px"></Column>
        <Column field="name" header="Название" sortable></Column>
        <Column field="displayOrder" header="Порядок" sortable style="width: 120px"></Column>
        <Column header="Действия" style="width: 220px">
          <template #body="slotProps">
            <Button
              icon="pi pi-list"
              class="p-button-sm p-button-text p-button-info"
              title="Сервисы"
              @click="goToServices(slotProps.data)"
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
              @click="deleteServiceType(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :header="editingType?.id ? 'Редактировать тип сервиса' : 'Новый тип сервиса'"
      :style="{ width: '520px' }"
      :pt="{
        root: { style: 'border-radius: 20px; overflow: hidden;' },
        header: { style: 'padding: 28px 32px 20px 32px; background: white; border-bottom: none;' },
        content: { style: 'padding: 12px 32px 32px 32px;' },
        footer: { style: 'padding: 24px 32px 28px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;' }
      }"
      modal
      :draggable="false"
    >
      <div style="display: flex; flex-direction: column; gap: 28px;">
        <div style="padding: 18px 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 14px; color: #166534; font-size: 15px; line-height: 1.6;">
          Типы сервисов используются для группировки: Операторы, Видео, Музыка и т.д.
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <label for="name" style="font-weight: 600; color: #374151; font-size: 16px;">Название</label>
          <InputText
            id="name"
            v-model="editingType.name"
            style="width: 100%; padding: 16px 18px; font-size: 16px; border-radius: 12px; border: 2px solid #e5e7eb;"
            placeholder="Введите название типа"
          />
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <label for="displayOrder" style="font-weight: 600; color: #374151; font-size: 16px;">Порядок сортировки</label>
          <InputNumber
            id="displayOrder"
            v-model="editingType.displayOrder"
            :min="0"
            :inputStyle="{ width: '100%', padding: '16px 18px', fontSize: '16px', borderRadius: '12px', border: '2px solid #e5e7eb' }"
            style="width: 100%;"
            placeholder="0"
          />
          <small style="color: #9ca3af; font-size: 14px; margin-top: 4px;">Чем меньше число, тем выше в списке</small>
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 14px;">
          <Button
            label="Отмена"
            severity="secondary"
            text
            style="padding: 14px 24px; font-size: 16px; font-weight: 600; border-radius: 12px;"
            @click="dialogVisible = false"
          />
          <Button
            label="Сохранить"
            icon="pi pi-check"
            style="padding: 14px 28px; font-size: 16px; font-weight: 600; border-radius: 12px; background: #16a34a; border-color: #16a34a;"
            @click="saveServiceType"
          />
        </div>
      </template>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { serviceTypesApi } from '@/services/api'
import type { ServiceType } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()
const serviceTypes = ref<ServiceType[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingType = ref<ServiceType>({
  name: '',
  displayOrder: 0
})

const loadServiceTypes = async () => {
  loading.value = true
  try {
    const response = await serviceTypesApi.getAll()
    serviceTypes.value = response.data
  } catch (error) {
    console.error('Error loading service types:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить типы сервисов',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const openDialog = (serviceType?: ServiceType) => {
  if (serviceType) {
    editingType.value = { ...serviceType }
  } else {
    const maxOrder = serviceTypes.value.reduce((max, st) => Math.max(max, st.displayOrder || 0), 0)
    editingType.value = { name: '', displayOrder: maxOrder + 1 }
  }
  dialogVisible.value = true
}

const saveServiceType = async () => {
  try {
    if (editingType.value.id) {
      await serviceTypesApi.update(editingType.value.id, editingType.value)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Тип сервиса обновлен',
        life: 3000
      })
    } else {
      await serviceTypesApi.create(editingType.value)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Тип сервиса создан',
        life: 3000
      })
    }
    dialogVisible.value = false
    loadServiceTypes()
  } catch (error) {
    console.error('Error saving service type:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось сохранить тип сервиса',
      life: 3000
    })
  }
}

const deleteServiceType = async (serviceType: ServiceType) => {
  if (!serviceType.id) return
  if (!confirm(`Удалить тип "${serviceType.name}"?`)) return

  try {
    await serviceTypesApi.delete(serviceType.id)
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Тип сервиса удален',
      life: 3000
    })
    loadServiceTypes()
  } catch (error) {
    console.error('Error deleting service type:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось удалить тип сервиса',
      life: 3000
    })
  }
}

const goToServices = (serviceType: ServiceType) => {
  if (serviceType.id) {
    router.push(`/admin/service-types/${serviceType.id}/services`)
  }
}

onMounted(() => {
  loadServiceTypes()
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Dialog styling using PrimeVue passthrough */
:deep(.p-dialog) {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

:deep(.p-dialog-title) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

:deep(.p-dialog-header-close) {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.2s;
}

:deep(.p-dialog-header-close:hover) {
  background: #e5e7eb;
  color: #111827;
}

:deep(.p-datatable) {
  font-size: 1rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  padding: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
  color: #111827;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f9fafb;
}

:deep(.p-button) {
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

:deep(.p-button-sm) {
  padding: 0.625rem 1rem;
  font-size: 0.9375rem;
}

:deep(.p-button:not(.p-button-text)) {
  background: #16a34a;
  border-color: #16a34a;
}

:deep(.p-button:not(.p-button-text):hover) {
  background: #15803d;
  border-color: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

:deep(.p-inputtext),
:deep(.p-inputnumber-input) {
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus) {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}
</style>
