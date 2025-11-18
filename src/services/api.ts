import axios from 'axios'
import type { CategoryType, ServiceCategory, Service, SubscriptionPlan } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Category Types API
export const categoryTypesApi = {
  getAll: () => api.get<CategoryType[]>('/category-types'),
  getById: (id: number) => api.get<CategoryType>(`/category-types/${id}`),
  create: (categoryType: CategoryType) => api.post<CategoryType>('/category-types', categoryType),
  update: (id: number, categoryType: CategoryType) =>
    api.put<CategoryType>(`/category-types/${id}`, categoryType),
  delete: (id: number) => api.delete(`/category-types/${id}`)
}

// Service Categories API
export const categoriesApi = {
  getAll: () => api.get<ServiceCategory[]>('/services/categories'),
  getByType: (typeId: number) => api.get<ServiceCategory[]>(`/services/categories/by-type/${typeId}`),
  getById: (id: number) => api.get<ServiceCategory>(`/services/categories/${id}`),
  create: (category: ServiceCategory) => api.post<ServiceCategory>('/services/categories', category),
  update: (id: number, category: ServiceCategory) =>
    api.put<ServiceCategory>(`/services/categories/${id}`, category),
  delete: (id: number) => api.delete(`/services/categories/${id}`)
}

// Services API
export const servicesApi = {
  getAll: () => api.get<Service[]>('/services'),
  getById: (id: number) => api.get<Service>(`/services/${id}`),
  create: (service: Service) => api.post<Service>('/services', service),
  update: (id: number, service: Service) => api.put<Service>(`/services/${id}`, service),
  delete: (id: number) => api.delete(`/services/${id}`)
}

// Subscription Plans API
export const plansApi = {
  getAll: () => api.get<SubscriptionPlan[]>('/plans'),
  getById: (id: number) => api.get<SubscriptionPlan>(`/plans/${id}`),
  getByService: (serviceId: number) =>
    api.get<SubscriptionPlan[]>(`/services/${serviceId}/plans`),
  create: (plan: SubscriptionPlan) => api.post<SubscriptionPlan>('/plans', plan),
  update: (id: number, plan: SubscriptionPlan) =>
    api.put<SubscriptionPlan>(`/plans/${id}`, plan),
  delete: (id: number) => api.delete(`/plans/${id}`)
}

export default api
