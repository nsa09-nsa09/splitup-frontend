<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { plansApi, servicesApi } from '@/services/api'
import type { SubscriptionPlan, Service } from '@/types'

const route = useRoute()
const router = useRouter()

const serviceId = computed(() => Number(route.params.serviceId))
const service = ref<Service | null>(null)
const plans = ref<SubscriptionPlan[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingPlan = ref<SubscriptionPlan | null>(null)

const form = ref<Partial<SubscriptionPlan>>({
  serviceId: 0,
  name: '',
  description: '',
  maxMembers: 1,
  maxDevices: 1,
  pricePerMonth: 0,
  originalPrice: undefined,
  discountPercentage: undefined,
  isPopular: false,
  features: []
})

const featuresText = ref('')

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const [serviceResponse, plansResponse] = await Promise.all([
      servicesApi.getById(serviceId.value),
      plansApi.getAllByService(serviceId.value)
    ])
    service.value = serviceResponse.data
    plans.value = plansResponse.data
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingPlan.value = null
  form.value = {
    serviceId: serviceId.value,
    name: '',
    description: '',
    maxMembers: 1,
    maxDevices: 1,
    pricePerMonth: 0,
    originalPrice: undefined,
    discountPercentage: undefined,
    isPopular: false,
    features: []
  }
  featuresText.value = ''
  showModal.value = true
}

const openEditModal = (plan: SubscriptionPlan) => {
  editingPlan.value = plan
  form.value = { ...plan, serviceId: serviceId.value }
  featuresText.value = plan.features?.join('\n') || ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingPlan.value = null
}

const savePlan = async () => {
  try {
    const planData = {
      ...form.value,
      features: featuresText.value.split('\n').filter(f => f.trim())
    }

    if (editingPlan.value) {
      await plansApi.update(editingPlan.value.id!, planData)
    } else {
      await plansApi.create(planData)
    }
    closeModal()
    await loadData()
  } catch (error) {
    console.error('Error saving plan:', error)
  }
}

const deletePlan = async (id: number) => {
  if (confirm('Вы уверены?')) {
    try {
      await plansApi.delete(id)
      await loadData()
    } catch (error) {
      console.error('Error deleting plan:', error)
    }
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="admin-view">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <i class="pi pi-arrow-left"></i> Назад
      </button>
      <h1>Тарифы: {{ service?.name }}</h1>
      <button class="add-btn" @click="openCreateModal">
        <i class="pi pi-plus"></i> Добавить тариф
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner"></i>
    </div>

    <div v-else class="items-grid">
      <div v-for="plan in plans" :key="plan.id" class="item-card" :class="{ popular: plan.isPopular }">
        <div v-if="plan.isPopular" class="popular-badge">Популярный</div>
        <div class="item-info">
          <h3>{{ plan.name }}</h3>
          <p>{{ plan.maxMembers }} участников, {{ plan.maxDevices || 1 }} устройств</p>
          <div class="price-info">
            <span class="price">{{ plan.pricePerMonth }} ₸/мес</span>
            <span v-if="plan.originalPrice" class="original-price">{{ plan.originalPrice }} ₸</span>
            <span v-if="plan.discountPercentage" class="discount">-{{ plan.discountPercentage }}%</span>
          </div>
          <p v-if="plan.description" class="description">{{ plan.description }}</p>
        </div>
        <div class="item-actions">
          <button class="btn-edit" @click="openEditModal(plan)">
            <i class="pi pi-pencil"></i> Редактировать
          </button>
          <button class="btn-delete" @click="deletePlan(plan.id!)">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>

      <div v-if="plans.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>Тарифы не найдены</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ editingPlan ? 'Редактировать' : 'Создать' }} тариф</h2>

        <div class="form-row">
          <div class="form-group">
            <label>Название</label>
            <input v-model="form.name" type="text" placeholder="Premium" />
          </div>
          <div class="form-group checkbox">
            <label>
              <input v-model="form.isPopular" type="checkbox" />
              Популярный
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Макс. участников</label>
            <input v-model.number="form.maxMembers" type="number" min="1" />
          </div>
          <div class="form-group">
            <label>Макс. устройств</label>
            <input v-model.number="form.maxDevices" type="number" min="1" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Цена в месяц (₸)</label>
            <input v-model.number="form.pricePerMonth" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>Оригинальная цена (₸)</label>
            <input v-model.number="form.originalPrice" type="number" min="0" />
          </div>
        </div>

        <div class="form-group">
          <label>Процент скидки</label>
          <input v-model.number="form.discountPercentage" type="number" min="0" max="100" />
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="form.description" placeholder="Описание тарифа"></textarea>
        </div>

        <div class="form-group">
          <label>Особенности (каждая с новой строки)</label>
          <textarea v-model="featuresText" placeholder="HD качество&#10;Без рекламы&#10;Офлайн просмотр"></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">Отмена</button>
          <button class="btn-save" @click="savePlan">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header h1 {
  flex: 1;
  font-size: 1.5rem;
  color: #1f2937;
}

.back-btn, .add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
}

.add-btn {
  background: #667eea;
  border: none;
  color: white;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
  font-size: 2rem;
  color: #667eea;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.item-card.popular {
  border: 2px solid #f59e0b;
}

.popular-badge {
  position: absolute;
  top: -10px;
  right: 16px;
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.item-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.item-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.original-price {
  font-size: 1rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.discount {
  background: #d1fae5;
  color: #059669;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.description {
  color: #6b7280;
  font-size: 0.875rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-edit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #fef3c7;
  color: #d97706;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
}

.form-group.checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel, .btn-save {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
}

.btn-save {
  background: #667eea;
  border: none;
  color: white;
}
</style>
