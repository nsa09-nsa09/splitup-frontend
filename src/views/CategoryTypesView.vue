<template>
  <AdminLayout>
    <div class="card">
      <div class="header">
        <h1>Управление типами категорий</h1>
        <Button label="Добавить тип" icon="pi pi-plus" @click="openDialog()" />
      </div>

      <DataTable
        :value="categoryTypes"
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
              title="Категории"
              @click="goToCategories(slotProps.data)"
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
              @click="deleteCategoryType(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :header="editingType?.id ? 'Редактировать тип' : 'Добавить тип'"
      :style="{ width: '550px' }"
      modal
      class="category-type-dialog"
    >
      <div class="dialog-content">
        <div class="form-field">
          <label for="name">
            <i class="pi pi-align-left"></i>
            Название типа *
          </label>
          <InputText
            id="name"
            v-model="editingType.name"
            class="w-full"
            placeholder="Например: Операторы, Видео..."
          />
        </div>

        <div class="form-field">
          <label for="displayOrder">
            <i class="pi pi-sort-numeric-up"></i>
            Порядок отображения *
          </label>
          <InputNumber
            id="displayOrder"
            v-model="editingType.displayOrder"
            :min="0"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Отмена"
            icon="pi pi-times"
            severity="secondary"
            outlined
            @click="dialogVisible = false"
          />
          <Button
            label="Сохранить"
            icon="pi pi-check"
            @click="saveCategoryType"
          />
        </div>
      </template>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryTypesApi } from '@/services/api'
import type { CategoryType } from '@/types'
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
const categoryTypes = ref<CategoryType[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingType = ref<CategoryType>({
  name: '',
  displayOrder: 0
})

const loadCategoryTypes = async () => {
  loading.value = true
  try {
    const response = await categoryTypesApi.getAll()
    categoryTypes.value = response.data
  } catch (error) {
    console.error('Error loading category types:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить типы категорий',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const openDialog = (categoryType?: CategoryType) => {
  if (categoryType) {
    editingType.value = { ...categoryType }
  } else {
    const maxOrder = categoryTypes.value.reduce((max, ct) => Math.max(max, ct.displayOrder || 0), 0)
    editingType.value = { name: '', displayOrder: maxOrder + 1 }
  }
  dialogVisible.value = true
}

const saveCategoryType = async () => {
  try {
    if (editingType.value.id) {
      await categoryTypesApi.update(editingType.value.id, editingType.value)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Тип категории обновлен',
        life: 3000
      })
    } else {
      await categoryTypesApi.create(editingType.value)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Тип категории создан',
        life: 3000
      })
    }
    dialogVisible.value = false
    loadCategoryTypes()
  } catch (error) {
    console.error('Error saving category type:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось сохранить тип категории',
      life: 3000
    })
  }
}

const deleteCategoryType = async (categoryType: CategoryType) => {
  if (!categoryType.id) return
  if (!confirm(`Удалить тип "${categoryType.name}"?`)) return

  try {
    await categoryTypesApi.delete(categoryType.id)
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Тип категории удален',
      life: 3000
    })
    loadCategoryTypes()
  } catch (error) {
    console.error('Error deleting category type:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось удалить тип категории',
      life: 3000
    })
  }
}

const goToCategories = (categoryType: CategoryType) => {
  if (categoryType.id) {
    router.push(`/admin/category-types/${categoryType.id}`)
  }
}

onMounted(() => {
  loadCategoryTypes()
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

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.form-field label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
}

.form-field label i {
  color: #16a34a;
  font-size: 1.125rem;
}

.helper-text {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.625rem;
  padding: 0.625rem;
  background: #f0f9ff;
  border-left: 3px solid #16a34a;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  line-height: 1.5;
}

.helper-text i {
  color: #16a34a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.w-full {
  width: 100%;
}

.text-gray-400 {
  color: #9ca3af;
  font-size: 0.875rem;
  font-style: italic;
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
