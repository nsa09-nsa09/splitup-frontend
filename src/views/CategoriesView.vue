<template>
  <AdminLayout>
    <div class="card">
      <div class="header">
        <h1>Управление категориями</h1>
        <Button label="Добавить категорию" icon="pi pi-plus" @click="openDialog()" />
      </div>

      <DataTable
        :value="categories"
        :loading="loading"
        stripedRows
        paginator
        :rows="10"
        dataKey="id"
      >
        <Column field="id" header="ID" sortable style="width: 80px"></Column>
        <Column field="name" header="Название" sortable></Column>
        <Column field="icon" header="Иконка"></Column>
        <Column field="createdAt" header="Дата создания" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column header="Действия" style="width: 150px">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              class="p-button-sm p-button-text"
              @click="openDialog(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-sm p-button-text p-button-danger"
              @click="deleteCategory(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :header="editingCategory?.id ? 'Редактировать категорию' : 'Добавить категорию'"
      :style="{ width: '450px' }"
      modal
    >
      <div class="form-field">
        <label for="name">Название *</label>
        <InputText id="name" v-model="editingCategory.name" class="w-full" />
      </div>

      <div class="form-field">
        <label for="icon">Иконка (URL изображения) *</label>
        <InputText id="icon" v-model="editingCategory.icon" class="w-full" placeholder="https://example.com/logo.png" />
        <small class="helper-text">Введите полную ссылку на изображение логотипа (например, https://...)</small>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button label="Сохранить" icon="pi pi-check" @click="saveCategory" />
      </template>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { categoriesApi } from '@/services/api'
import type { ServiceCategory } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const categories = ref<ServiceCategory[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingCategory = ref<ServiceCategory>({
  name: '',
  icon: ''
})

const loadCategories = async () => {
  loading.value = true
  try {
    const response = await categoriesApi.getAll()
    categories.value = response.data
  } catch (error) {
    console.error('Error loading categories:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить категории',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const openDialog = (category?: ServiceCategory) => {
  if (category) {
    editingCategory.value = { ...category }
  } else {
    editingCategory.value = { name: '', icon: '' }
  }
  dialogVisible.value = true
}

const saveCategory = async () => {
  try {
    if (editingCategory.value.id) {
      await categoriesApi.update(editingCategory.value.id, editingCategory.value)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Категория обновлена',
        life: 3000
      })
    } else {
      await categoriesApi.create(editingCategory.value)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Категория создана',
        life: 3000
      })
    }
    dialogVisible.value = false
    loadCategories()
  } catch (error) {
    console.error('Error saving category:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось сохранить категорию',
      life: 3000
    })
  }
}

const deleteCategory = async (category: ServiceCategory) => {
  if (!category.id) return
  if (!confirm(`Удалить категорию "${category.name}"?`)) return

  try {
    await categoriesApi.delete(category.id)
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Категория удалена',
      life: 3000
    })
    loadCategories()
  } catch (error) {
    console.error('Error deleting category:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось удалить категорию',
      life: 3000
    })
  }
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ru-RU')
}

onMounted(() => {
  loadCategories()
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

.form-field {
  margin-bottom: 1.25rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.625rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9375rem;
}

.helper-text {
  display: block;
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.w-full {
  width: 100%;
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

:deep(.p-paginator) {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-dropdown),
:deep(.p-textarea) {
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus),
:deep(.p-dropdown:focus),
:deep(.p-textarea:focus) {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}
</style>
