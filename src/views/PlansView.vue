<template>
  <AdminLayout>
    <div class="card">
      <div class="header">
        <h1>Управление тарифами</h1>
        <Button label="Добавить тариф" icon="pi pi-plus" @click="openDialog()" />
      </div>

      <DataTable
        :value="plans"
        :loading="loading"
        stripedRows
        paginator
        :rows="10"
        dataKey="id"
      >
        <Column field="id" header="ID" sortable style="width: 70px"></Column>
        <Column field="service.name" header="Сервис" sortable></Column>
        <Column field="name" header="Название" sortable></Column>
        <Column field="maxMembers" header="Макс. участников" sortable></Column>
        <Column field="pricePerMonth" header="Цена/месяц" sortable>
          <template #body="slotProps">
            {{ slotProps.data.pricePerMonth.toLocaleString() }} ₸
          </template>
        </Column>
        <Column field="isPopular" header="Популярный">
          <template #body="slotProps">
            <i
              :class="slotProps.data.isPopular ? 'pi pi-check text-green-500' : 'pi pi-times text-gray-400'"
            ></i>
          </template>
        </Column>
        <Column field="isActive" header="Активен">
          <template #body="slotProps">
            <i
              :class="slotProps.data.isActive ? 'pi pi-check text-green-500' : 'pi pi-times text-gray-400'"
            ></i>
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
              @click="deletePlan(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :header="editingPlan?.id ? 'Редактировать тариф' : 'Добавить тариф'"
      :style="{ width: '600px' }"
      modal
    >
      <div class="form-grid">
        <div class="form-field">
          <label for="serviceId">Сервис *</label>
          <Dropdown
            id="serviceId"
            v-model="editingPlan.serviceId"
            :options="services"
            optionLabel="name"
            optionValue="id"
            placeholder="Выберите сервис"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="name">Название *</label>
          <InputText id="name" v-model="editingPlan.name" class="w-full" />
        </div>

        <div class="form-field full-width">
          <label for="description">Описание</label>
          <Textarea id="description" v-model="editingPlan.description" class="w-full" rows="3" />
        </div>

        <div class="form-field">
          <label for="maxMembers">Макс. участников *</label>
          <InputNumber
            id="maxMembers"
            v-model="editingPlan.maxMembers"
            :min="1"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="maxDevices">Макс. устройств</label>
          <InputNumber id="maxDevices" v-model="editingPlan.maxDevices" :min="0" class="w-full" />
        </div>

        <div class="form-field">
          <label for="pricePerMonth">Цена в месяц *</label>
          <InputNumber
            id="pricePerMonth"
            v-model="editingPlan.pricePerMonth"
            :min="0"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="originalPrice">Оригинальная цена</label>
          <InputNumber
            id="originalPrice"
            v-model="editingPlan.originalPrice"
            :min="0"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="discountPercentage">Скидка (%)</label>
          <InputNumber
            id="discountPercentage"
            v-model="editingPlan.discountPercentage"
            :min="0"
            :max="100"
            class="w-full"
          />
        </div>

        <div class="form-field checkbox-field">
          <Checkbox v-model="editingPlan.isPopular" inputId="isPopular" :binary="true" />
          <label for="isPopular">Популярный</label>
        </div>

        <div class="form-field checkbox-field">
          <Checkbox v-model="editingPlan.isActive" inputId="isActive" :binary="true" />
          <label for="isActive">Активен</label>
        </div>

        <div class="form-field full-width">
          <label for="features">Особенности (по одной на строку)</label>
          <Textarea
            id="features"
            v-model="featuresText"
            class="w-full"
            rows="5"
            placeholder="Введите особенности тарифа, каждая с новой строки"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button label="Сохранить" icon="pi pi-check" @click="savePlan" />
      </template>
    </Dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { plansApi, servicesApi } from '@/services/api'
import type { SubscriptionPlan, Service } from '@/types'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const plans = ref<SubscriptionPlan[]>([])
const services = ref<Service[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingPlan = ref<SubscriptionPlan>({
  serviceId: 0,
  name: '',
  description: '',
  maxMembers: 1,
  maxDevices: 0,
  pricePerMonth: 0,
  originalPrice: 0,
  discountPercentage: 0,
  isPopular: false,
  features: [],
  isActive: true
})

const featuresText = ref('')

const loadPlans = async () => {
  loading.value = true
  try {
    const response = await plansApi.getAll()
    plans.value = response.data
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

const loadServices = async () => {
  try {
    const response = await servicesApi.getAll()
    services.value = response.data
  } catch (error) {
    console.error('Error loading services:', error)
  }
}

const openDialog = (plan?: SubscriptionPlan) => {
  if (plan) {
    editingPlan.value = { ...plan }
    featuresText.value = plan.features?.join('\n') || ''
  } else {
    editingPlan.value = {
      serviceId: 0,
      name: '',
      description: '',
      maxMembers: 1,
      maxDevices: 0,
      pricePerMonth: 0,
      originalPrice: 0,
      discountPercentage: 0,
      isPopular: false,
      features: [],
      isActive: true
    }
    featuresText.value = ''
  }
  dialogVisible.value = true
}

const savePlan = async () => {
  try {
    // Parse features from text
    const features = featuresText.value
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)

    const planToSave = {
      ...editingPlan.value,
      features
    }

    if (editingPlan.value.id) {
      await plansApi.update(editingPlan.value.id, planToSave)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Тариф обновлен',
        life: 3000
      })
    } else {
      await plansApi.create(planToSave)
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Тариф создан',
        life: 3000
      })
    }
    dialogVisible.value = false
    loadPlans()
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

const deletePlan = async (plan: SubscriptionPlan) => {
  if (!plan.id) return
  if (!confirm(`Удалить тариф "${plan.name}"?`)) return

  try {
    await plansApi.delete(plan.id)
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Тариф удален',
      life: 3000
    })
    loadPlans()
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

onMounted(() => {
  loadPlans()
  loadServices()
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  margin-bottom: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-field.checkbox-field label {
  margin: 0;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.w-full {
  width: 100%;
}

.text-green-500 {
  color: #22c55e;
}

.text-gray-400 {
  color: #9ca3af;
}
</style>
