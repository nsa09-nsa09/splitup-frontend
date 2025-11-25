<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { servicesApi, serviceTypesApi } from '@/services/api'
import type { Service, ServiceType } from '@/types'

const route = useRoute()
const router = useRouter()

const typeId = computed(() => Number(route.params.typeId))
const serviceType = ref<ServiceType | null>(null)
const services = ref<Service[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingService = ref<Service | null>(null)

const form = ref<Partial<Service>>({
  name: '',
  type: '',
  typeId: 0,
  icon: '',
  priceFrom: undefined,
  savingsPercentage: undefined,
  description: ''
})

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const [typeResponse, servicesResponse] = await Promise.all([
      serviceTypesApi.getById(typeId.value),
      servicesApi.getByType(typeId.value)
    ])
    serviceType.value = typeResponse.data
    services.value = servicesResponse.data
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingService.value = null
  form.value = {
    name: '',
    type: serviceType.value?.name || '',
    typeId: typeId.value,
    icon: '',
    priceFrom: undefined,
    savingsPercentage: undefined,
    description: ''
  }
  showModal.value = true
}

const openEditModal = (service: Service) => {
  editingService.value = service
  form.value = { ...service }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingService.value = null
}

const saveService = async () => {
  try {
    if (editingService.value) {
      await servicesApi.update(editingService.value.id!, form.value)
    } else {
      await servicesApi.create(form.value)
    }
    closeModal()
    await loadData()
  } catch (error) {
    console.error('Error saving service:', error)
  }
}

const deleteService = async (id: number) => {
  if (confirm('Вы уверены?')) {
    try {
      await servicesApi.delete(id)
      await loadData()
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }
}

const goToPlans = (serviceId: number) => {
  router.push(`/admin/services/${serviceId}/plans`)
}

const goBack = () => {
  router.push('/admin/service-types')
}
</script>

<template>
  <div class="admin-view">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <i class="pi pi-arrow-left"></i> Назад
      </button>
      <h1>Сервисы: {{ serviceType?.name }}</h1>
      <button class="add-btn" @click="openCreateModal">
        <i class="pi pi-plus"></i> Добавить сервис
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner"></i>
    </div>

    <div v-else class="items-grid">
      <div v-for="service in services" :key="service.id" class="item-card">
        <div class="item-icon" v-if="service.icon">
          <img :src="service.icon" :alt="service.name" />
        </div>
        <div class="item-info">
          <h3>{{ service.name }}</h3>
          <p v-if="service.priceFrom">от {{ service.priceFrom }} ₸</p>
          <p v-if="service.savingsPercentage">экономия {{ service.savingsPercentage }}%</p>
        </div>
        <div class="item-actions">
          <button class="btn-plans" @click="goToPlans(service.id!)">
            <i class="pi pi-list"></i> Тарифы
          </button>
          <button class="btn-edit" @click="openEditModal(service)">
            <i class="pi pi-pencil"></i>
          </button>
          <button class="btn-delete" @click="deleteService(service.id!)">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>

      <div v-if="services.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>Сервисы не найдены</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ editingService ? 'Редактировать' : 'Создать' }} сервис</h2>

        <div class="form-group">
          <label>Название</label>
          <input v-model="form.name" type="text" placeholder="Netflix" />
        </div>

        <div class="form-group">
          <label>Иконка (URL)</label>
          <input v-model="form.icon" type="text" placeholder="https://..." />
        </div>

        <div class="form-group">
          <label>Цена от</label>
          <input v-model.number="form.priceFrom" type="number" placeholder="2000" />
        </div>

        <div class="form-group">
          <label>Процент экономии</label>
          <input v-model.number="form.savingsPercentage" type="number" placeholder="10" />
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="form.description" placeholder="Описание сервиса"></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">Отмена</button>
          <button class="btn-save" @click="saveService">Сохранить</button>
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

.back-btn:hover {
  background: #e5e7eb;
}

.add-btn {
  background: #667eea;
  border: none;
  color: white;
}

.add-btn:hover {
  background: #5a67d8;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-icon img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 8px;
}

.item-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.item-info p {
  font-size: 0.875rem;
  color: #6b7280;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-plans {
  flex: 1;
  background: #e0e7ff;
  color: #667eea;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-plans:hover {
  background: #c7d2fe;
}

.btn-edit, .btn-delete {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-edit {
  background: #fef3c7;
  color: #d97706;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
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
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
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
