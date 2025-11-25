<template>
  <AdminLayout>
    <div class="card">
      <div class="header">
        <div class="header-left">
          <Button
            icon="pi pi-arrow-left"
            class="p-button-text"
            @click="goBack"
          />
          <h1>{{ categoryType?.name || 'Загрузка...' }}</h1>
        </div>
        <Button
          label="Добавить категорию"
          icon="pi pi-plus"
          @click="openDialog()"
        />
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
        <Column header="Иконка" style="width: 100px">
          <template #body="slotProps">
            <img
              v-if="slotProps.data.icon"
              :src="slotProps.data.icon"
              :alt="slotProps.data.name"
              style="width: 40px; height: 40px; object-fit: contain"
            />
          </template>
        </Column>
        <Column field="name" header="Название" sortable></Column>
        <Column field="priceFrom" header="Цена от" sortable style="width: 120px">
          <template #body="slotProps">
            {{ slotProps.data.priceFrom ? `${slotProps.data.priceFrom} ₸` : '-' }}
          </template>
        </Column>
        <Column field="savingsPercentage" header="Экономия %" sortable style="width: 120px">
          <template #body="slotProps">
            {{ slotProps.data.savingsPercentage ? `${slotProps.data.savingsPercentage}%` : '-' }}
          </template>
        </Column>
        <Column field="description" header="Описание"></Column>
        <Column header="Действия" style="width: 220px">
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
              @click="deleteCategory(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :header="editingCategory?.id ? 'Редактировать категорию' : 'Добавить категорию'"
      :style="{ width: '650px' }"
      modal
      class="category-dialog"
    >
      <div class="dialog-content">
        <div class="form-field">
          <label for="name">
            <i class="pi pi-align-left"></i>
            Название категории *
          </label>
          <InputText
            id="name"
            v-model="editingCategory.name"
            class="w-full"
            placeholder="Например: Activ, Beeline..."
          />
        </div>

        <div class="form-field">
          <label for="icon">
            <i class="pi pi-image"></i>
            Ссылка на логотип
          </label>
          <InputText
            id="icon"
            v-model="editingCategory.icon"
            class="w-full"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="priceFrom">
              <i class="pi pi-money-bill"></i>
              Цена от (₸)
            </label>
            <InputNumber
              id="priceFrom"
              v-model="editingCategory.priceFrom"
              :min="0"
              mode="decimal"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label for="savingsPercentage">
              <i class="pi pi-percentage"></i>
              Процент экономии (%)
            </label>
            <InputNumber
              id="savingsPercentage"
              v-model="editingCategory.savingsPercentage"
              :min="0"
              :max="100"
              class="w-full"
            />
          </div>
        </div>

        <div class="form-field">
          <label for="description">
            <i class="pi pi-file-edit"></i>
            Описание
          </label>
          <Textarea
            id="description"
            v-model="editingCategory.description"
            rows="4"
            class="w-full"
            placeholder="Описание категории..."
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
            @click="saveCategory"
          />
        </div>
      </template>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoriesApi, categoryTypesApi } from '@/services/api'
import type { ServiceCategory, CategoryType } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const typeId = ref<number>(parseInt(route.params.id as string))
const categoryType = ref<CategoryType | null>(null)
const categories = ref<ServiceCategory[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingCategory = ref<ServiceCategory>({
  name: '',
  type: '',
  typeId: typeId.value
})

onMounted(async () => {
  await loadCategoryType()
  await loadCategories()
})

const loadCategoryType = async () => {
  try {
    const response = await categoryTypesApi.getById(typeId.value)
    categoryType.value = response.data
  } catch (error) {
    console.error('Error loading category type:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить тип категории',
      life: 3000
    })
  }
}

const loadCategories = async () => {
  loading.value = true
  try {
    const response = await categoriesApi.getByType(typeId.value)
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
    editingCategory.value = {
      name: '',
      type: categoryType.value?.name || '',
      typeId: typeId.value
    }
  }
  dialogVisible.value = true
}

const saveCategory = async () => {
  try {
    if (!editingCategory.value.name) {
      toast.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Введите название категории',
        life: 3000
      })
      return
    }

    // Set type field if not set
    if (!editingCategory.value.type && categoryType.value) {
      editingCategory.value.type = categoryType.value.name
    }

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
    await loadCategories()
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
  if (!confirm(`Удалить категорию "${category.name}"?`)) {
    return
  }

  try {
    await categoriesApi.delete(category.id!)
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Категория удалена',
      life: 3000
    })
    await loadCategories()
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

const goBack = () => {
  router.push('/admin/category-types')
}

const goToPlans = (category: ServiceCategory) => {
  router.push(`/admin/category-types/${typeId.value}/categories/${category.id}/plans`)
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field label {
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-field label i {
  color: #16a34a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f0fdf4;
}
</style>
