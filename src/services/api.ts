import axios from 'axios'
import type { ServiceType, Service, SubscriptionPlan } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Service Types API
export const serviceTypesApi = {
  getAll: () => api.get<ServiceType[]>('/service-types'),
  getById: (id: number) => api.get<ServiceType>(`/service-types/${id}`),
  create: (serviceType: ServiceType) => api.post<ServiceType>('/service-types', serviceType),
  update: (id: number, serviceType: ServiceType) =>
    api.put<ServiceType>(`/service-types/${id}`, serviceType),
  delete: (id: number) => api.delete(`/service-types/${id}`)
}

// Services API
export const servicesApi = {
  getAll: () => api.get<Service[]>('/services'),
  getByType: (typeId: number) => api.get<Service[]>(`/services/by-type/${typeId}`),
  getById: (id: number) => api.get<Service>(`/services/${id}`),
  create: (service: Partial<Service>) => api.post<Service>('/services', service),
  update: (id: number, service: Partial<Service>) => api.put<Service>(`/services/${id}`, service),
  delete: (id: number) => api.delete(`/services/${id}`)
}

// Subscription Plans API
export const plansApi = {
  getAll: () => api.get<SubscriptionPlan[]>('/plans'),
  getById: (id: number) => api.get<SubscriptionPlan>(`/plans/${id}`),
  getByService: (serviceId: number) =>
    api.get<SubscriptionPlan[]>(`/plans/service/${serviceId}`),
  getAllByService: (serviceId: number) =>
    api.get<SubscriptionPlan[]>(`/plans/service/${serviceId}/all`),
  create: (plan: Partial<SubscriptionPlan>) => api.post<SubscriptionPlan>('/plans', plan),
  update: (id: number, plan: Partial<SubscriptionPlan>) =>
    api.put<SubscriptionPlan>(`/plans/${id}`, plan),
  delete: (id: number) => api.delete(`/plans/${id}`)
}

export default api
