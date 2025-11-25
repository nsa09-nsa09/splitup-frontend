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
          <div>
            <h1>Тарифы: {{ category?.name || 'Загрузка...' }}</h1>
            <p class="category-subtitle">{{ categoryType?.name }}</p>
          </div>
        </div>
        <Button
          label="Добавить тариф"
          icon="pi pi-plus"
          @click="openDialog()"
        />
      </div>

      <DataTable
        :value="plans"
        :loading="loading"
        stripedRows
        paginator
        :rows="10"
        dataKey="id"
      >
        <Column field="id" header="ID" sortable style="width: 80px"></Column>
        <Column field="name" header="Название" sortable></Column>
        <Column field="description" header="Описание"></Column>
        <Column field="slots" header="Слоты" sortable style="width: 100px"></Column>
        <Column field="discountPercentage" header="Скидка %" sortable style="width: 120px">
          <template #body="slotProps">
            <span v-if="slotProps.data.discountPercentage" class="discount-badge">
              -{{ slotProps.data.discountPercentage }}%
            </span>
            <span v-else>-</span>
          </template>
        </Column>
        <Column field="pricePerPerson" header="Цена на сайте" sortable style="width: 140px">
          <template #body="slotProps">
            {{ Math.round(slotProps.data.pricePerPerson) }} ₸/чел
          </template>
        </Column>
        <Column field="individualPrice" header="Индивид. цена" sortable style="width: 140px">
          <template #body="slotProps">
            {{ slotProps.data.individualPrice ? `${Math.round(slotProps.data.individualPrice)} ₸` : '-' }}
          </template>
        </Column>
        <Column field="originalPrice" header="Семейная цена" sortable style="width: 140px">
          <template #body="slotProps">
            {{ slotProps.data.originalPrice ? `${Math.round(slotProps.data.originalPrice)} ₸` : '-' }}
          </template>
        </Column>
        <Column field="isPopular" header="Популярное" style="width: 120px">
          <template #body="slotProps">
            <i
              :class="slotProps.data.isPopular ? 'pi pi-check' : 'pi pi-times'"
              :style="{ color: slotProps.data.isPopular ? '#16a34a' : '#9ca3af', fontSize: '1.25rem' }"
            ></i>
          </template>
        </Column>
        <Column header="Действия" style="width: 150px">
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

    <!-- Plan Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingPlan?.id ? 'Редактировать тариф' : 'Добавить тариф'"
      :style="{ width: '700px' }"
      modal
      class="plan-dialog"
    >
      <div class="dialog-content">
        <div class="form-field">
          <label for="planName">
            <i class="pi pi-align-left"></i>
            Название тарифа *
          </label>
          <InputText
            id="planName"
            v-model="editingPlan.name"
            class="w-full"
            placeholder="Например: Семейный 3, Семейный 5+..."
          />
        </div>

        <div class="form-field">
          <label for="planDescription">
            <i class="pi pi-file-edit"></i>
            Описание
          </label>
          <InputText
            id="planDescription"
            v-model="editingPlan.description"
            class="w-full"
            placeholder="Например: 3 пользователя + 1 устройство"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="slots">
              <i class="pi pi-users"></i>
              Количество слотов *
            </label>
            <InputNumber
              id="slots"
              v-model="editingPlan.slots"
              :min="1"
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label for="commission">
              <i class="pi pi-dollar"></i>
              Комиссия (₸) *
            </label>
            <InputNumber
              id="commission"
              v-model="editingPlan.commission"
              :min="0"
              mode="decimal"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              class="w-full"
              placeholder="Например: 250"
            />
          </div>
        </div>

        <div class="form-field">
          <label for="discountPercentage">
            <i class="pi pi-percentage"></i>
            Процент скидки (%) *авто
          </label>
          <InputNumber
            id="discountPercentage"
            v-model="editingPlan.discountPercentage"
            :min="0"
            :max="100"
            class="w-full"
            disabled
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="originalPrice">
              <i class="pi pi-tag"></i>
              Цена семейной подписки (₸) *
            </label>
            <InputNumber
              id="originalPrice"
              v-model="editingPlan.originalPrice"
              :min="0"
              mode="decimal"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              class="w-full"
              placeholder="Например: 20000"
            />
          </div>

          <div class="form-field">
            <label for="individualPrice">
              <i class="pi pi-dollar"></i>
              Цена индивидуальной подписки (₸) *
            </label>
            <InputNumber
              id="individualPrice"
              v-model="editingPlan.individualPrice"
              :min="0"
              mode="decimal"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              class="w-full"
              placeholder="Например: 3000"
            />
          </div>
        </div>

        <div class="form-field">
          <label for="pricePerPerson">
            <i class="pi pi-money-bill"></i>
            Цена на нашем сайте (₸/чел) *авто
          </label>
          <InputNumber
            id="pricePerPerson"
            v-model="editingPlan.pricePerPerson"
            :min="0"
            mode="decimal"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            class="w-full"
            disabled
          />
        </div>

        <div class="form-field">
          <label>
            <i class="pi pi-star"></i>
            Популярный тариф
          </label>
          <div class="checkbox-field">
            <Checkbox v-model="editingPlan.isPopular" :binary="true" inputId="isPopular" />
            <label for="isPopular">Отметить как популярный</label>
          </div>
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
            @click="savePlan"
          />
        </div>
      </template>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryPlansApi, categoriesApi, categoryTypesApi } from '@/services/api'
import type { CategoryPlan, ServiceCategory, CategoryType } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const categoryId = ref<number>(parseInt(route.params.categoryId as string))
const typeId = ref<number>(parseInt(route.params.typeId as string))
const category = ref<ServiceCategory | null>(null)
const categoryType = ref<CategoryType | null>(null)
const plans = ref<CategoryPlan[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingPlan = ref<CategoryPlan>({
  categoryId: categoryId.value,
  name: '',
  slots: 1,
  pricePerPerson: 0,
  isPopular: false
})

// Auto-calculate price per person and discount percentage
watch([() => editingPlan.value.originalPrice, () => editingPlan.value.slots, () => editingPlan.value.individualPrice, () => editingPlan.value.commission], ([familyPrice, slots, individualPrice, commission]) => {
  if (familyPrice && slots && slots > 0 && commission !== undefined) {
    // Calculate price per person on our site: (familyPrice / slots) + commission
    const pricePerPerson = (familyPrice / slots) + commission
    editingPlan.value.pricePerPerson = Math.round(pricePerPerson * 100) / 100

    // Calculate discount percentage: ((individualPrice - pricePerPerson) / individualPrice) * 100
    if (individualPrice && individualPrice > 0) {
      const discountPercentage = ((individualPrice - pricePerPerson) / individualPrice) * 100
      editingPlan.value.discountPercentage = Math.round(discountPercentage)
    } else {
      editingPlan.value.discountPercentage = undefined
    }
  }
})

onMounted(async () => {
  await loadCategory()
  await loadCategoryType()
  await loadPlans()
})

const loadCategory = async () => {
  try {
    const response = await categoriesApi.getById(categoryId.value)
    category.value = response.data
  } catch (error) {
    console.error('Error loading category:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить категорию',
      life: 3000
    })
  }
}

const loadCategoryType = async () => {
  try {
    const response = await categoryTypesApi.getById(typeId.value)
    categoryType.value = response.data
  } catch (error) {
    console.error('Error loading category type:', error)
  }
}

const loadPlans = async () => {
  loading.value = true
  try {
    const response = await categoryPlansApi.getByCategory(categoryId.value)
    // Показываем только активные тарифы в админке
    plans.value = response.data.filter(plan => plan.isActive !== false)
  } catch (error) {
    console.error('Error loading plans:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить тарифы',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const openDialog = (plan?: CategoryPlan) => {
  if (plan) {
    editingPlan.value = { ...plan }
  } else {
    editingPlan.value = {
      categoryId: categoryId.value,
      name: '',
      slots: 1,
      pricePerPerson: 0,
      commission: 250,
      originalPrice: undefined,
      individualPrice: undefined,
      isPopular: false
    }
  }
  dialogVisible.value = true
}

const savePlan = async () => {
  try {
    if (!editingPlan.value.name || !editingPlan.value.slots || editingPlan.value.commission === undefined || !editingPlan.value.originalPrice || !editingPlan.value.individualPrice) {
      toast.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Заполните обязательные поля (название, слоты, комиссия, цены)',
        life: 3000
      })
      return
    }

    if (editingPlan.value.id) {
      await categoryPlansApi.update(editingPlan.value.id, editingPlan.value)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Тариф обновлен',
        life: 3000
      })
    } else {
      await categoryPlansApi.create(editingPlan.value)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Тариф создан',
        life: 3000
      })
    }

    dialogVisible.value = false
    await loadPlans()
  } catch (error) {
    console.error('Error saving plan:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось сохранить тариф',
      life: 3000
    })
  }
}

const deletePlan = async (plan: CategoryPlan) => {
  if (!confirm(`Удалить тариф "${plan.name}"?`)) {
    return
  }

  try {
    await categoryPlansApi.delete(plan.id!)
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Тариф удален',
      life: 3000
    })
    await loadPlans()
  } catch (error) {
    console.error('Error deleting plan:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось удалить тариф',
      life: 3000
    })
  }
}

const goBack = () => {
  router.push(`/admin/category-types/${typeId.value}`)
}
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

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.category-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.discount-badge {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.875rem;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
}

.form-field label i {
  color: #16a34a;
  font-size: 1.125rem;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.checkbox-field label {
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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
  background: #f0fdf4;
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
