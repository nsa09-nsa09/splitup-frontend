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
        <Column field="type" header="Тип" sortable style="width: 150px"></Column>
        <Column field="name" header="Название" sortable></Column>
        <Column field="icon" header="Иконка">
          <template #body="slotProps">
            <img
              v-if="slotProps.data.icon"
              :src="slotProps.data.icon"
              :alt="slotProps.data.name"
              style="width: 40px; height: 40px; object-fit: contain; border-radius: 8px;"
            />
            <span v-else class="text-gray-400">Нет иконки</span>
          </template>
        </Column>
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
      :style="{ width: '700px' }"
      modal
      class="category-dialog"
    >
      <div class="dialog-content">
        <div class="form-field">
          <label for="type">
            <i class="pi pi-tag"></i>
            Тип категории *
          </label>
          <Dropdown
            id="type"
            v-model="editingCategory.type"
            :options="categoryTypes"
            optionLabel="name"
            optionValue="name"
            placeholder="Выберите тип категории"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="name">
            <i class="pi pi-align-left"></i>
            Название категории *
          </label>
          <InputText
            id="name"
            v-model="editingCategory.name"
            class="w-full"
            placeholder="Например: Netflix, Spotify..."
          />
        </div>

        <div class="form-field">
          <label for="icon">
            <i class="pi pi-image"></i>
            Логотип категории (URL) *
          </label>
          <InputText
            id="icon"
            v-model="editingCategory.icon"
            class="w-full"
            placeholder="https://example.com/logo.png"
          />
          <small class="helper-text">
            <i class="pi pi-info-circle"></i>
            Введите полную ссылку на изображение логотипа
          </small>
        </div>

        <div v-if="editingCategory.icon" class="logo-preview">
          <label>Предварительный просмотр:</label>
          <img :src="editingCategory.icon" alt="Preview" />
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
            @click="saveCategory"
          />
        </div>
      </template>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { categoriesApi, categoryTypesApi } from '@/services/api'
import type { ServiceCategory, CategoryType } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const categories = ref<ServiceCategory[]>([])
const categoryTypes = ref<CategoryType[]>([])
const loading = ref(false)
const dialogVisible = ref(false)

const editingCategory = ref<ServiceCategory>({
  name: '',
  type: '',
  icon: ''
})

const loadCategoryTypes = async () => {
  try {
    const response = await categoryTypesApi.getAll()
    categoryTypes.value = response.data
  } catch (error) {
    console.error('Error loading category types:', error)
  }
}

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
    const defaultType = categoryTypes.value.length > 0 ? categoryTypes.value[0].name : ''
    editingCategory.value = { name: '', type: defaultType, icon: '' }
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

onMounted(async () => {
  await loadCategoryTypes()
  await loadCategories()
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

/* Dialog styles */
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem 0;
}

.dialog-content .form-field {
  position: relative;
}

.dialog-content .form-field label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-weight: 700;
  color: #111827;
  font-size: 1.125rem;
}

.dialog-content .form-field label i {
  color: #16a34a;
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(22, 163, 74, 0.2));
}

.helper-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 1rem 1.25rem;
  background: #f0f9ff;
  border-left: 4px solid #16a34a;
  border-radius: 8px;
  color: #374151;
  font-size: 0.9375rem;
  line-height: 1.6;
}

.helper-text i {
  color: #16a34a;
  font-size: 1.125rem;
}

.logo-preview {
  padding: 1.5rem;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  text-align: center;
}

.logo-preview label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 700;
  color: #6b7280;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.logo-preview img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

:deep(.category-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-bottom: 3px solid #16a34a;
  padding: 2rem 2.5rem;
}

:deep(.category-dialog .p-dialog-title) {
  color: #111827;
  font-weight: 700;
  font-size: 1.75rem;
}

:deep(.category-dialog .p-dialog-content) {
  padding: 2.5rem 2.5rem;
  min-height: 400px;
}

:deep(.category-dialog .p-dialog-footer) {
  padding: 1.75rem 2.5rem;
  background: #f9fafb;
  border-top: 2px solid #e5e7eb;
}

:deep(.category-dialog .p-inputtext),
:deep(.category-dialog .p-dropdown) {
  padding: 1rem 1.25rem;
  font-size: 1.0625rem;
  border-radius: 10px;
  border-width: 2px;
}

:deep(.category-dialog .p-dropdown-label) {
  padding: 0.5rem 0;
  font-size: 1.0625rem;
}

:deep(.category-dialog .p-button) {
  padding: 1rem 2rem;
  font-size: 1.0625rem;
  min-width: 140px;
  font-weight: 700;
  border-radius: 10px;
  transition: all 0.3s ease;
}

:deep(.category-dialog .p-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

:deep(.category-dialog .p-button-outlined) {
  border-width: 2px;
}

:deep(.category-dialog) {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.text-gray-400 {
  color: #9ca3af;
  font-size: 0.875rem;
  font-style: italic;
}

@media (max-width: 768px) {
  :deep(.category-dialog) {
    width: 95% !important;
  }

  :deep(.category-dialog .p-dialog-header),
  :deep(.category-dialog .p-dialog-content),
  :deep(.category-dialog .p-dialog-footer) {
    padding: 1.5rem;
  }

  :deep(.category-dialog .p-dialog-title) {
    font-size: 1.25rem;
  }
}
</style>
