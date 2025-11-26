import axios from 'axios'
import type { ServiceType, Service, SubscriptionPlan, Wallet, Transaction, UserSubscription, User } from '@/types'

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

// Wallet API
export const walletApi = {
  getWallet: (userId: number) => api.get<Wallet>('/wallet', { headers: { 'User-Id': userId } }),
  getTransactions: (userId: number) =>
    api.get<Transaction[]>('/wallet/transactions', { headers: { 'User-Id': userId } }),
  getSubscriptions: (userId: number) =>
    api.get<UserSubscription[]>('/wallet/subscriptions', { headers: { 'User-Id': userId } }),
  deposit: (userId: number, amount: number, paymentMethod: string) =>
    api.post<Transaction>('/wallet/deposit', { amount, paymentMethod }, { headers: { 'User-Id': userId } }),
  withdraw: (userId: number, amount: number, paymentMethod: string) =>
    api.post<Transaction>('/wallet/withdraw', { amount, paymentMethod }, { headers: { 'User-Id': userId } })
}

// Users API
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  getTransactions: (id: number) => api.get<Transaction[]>(`/users/${id}/transactions`),
  getSubscriptions: (id: number) => api.get<UserSubscription[]>(`/users/${id}/subscriptions`)
}

// Speed Test API
export interface SpeedTestResult {
  id?: number
  latitude: number
  longitude: number
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  providerType: string
  city?: string
  createdAt?: string
}

export interface SpeedTestStats {
  city: string | null
  providerType: string
  avgDownloadSpeed: number
  avgUploadSpeed: number
  avgPing: number
  count: number
}

export const speedTestApi = {
  save: (data: SpeedTestResult) => api.post<SpeedTestResult>('/speedtest/save', data),
  getAll: () => api.get<SpeedTestResult[]>('/speedtest'),
  getByCity: (city: string) => api.get<SpeedTestResult[]>(`/speedtest/city/${city}`),
  getByProvider: (provider: string) => api.get<SpeedTestResult[]>(`/speedtest/provider/${provider}`),
  getFiltered: (city?: string, provider?: string) =>
    api.get<SpeedTestResult[]>('/speedtest/filter', { params: { city, providerType: provider } }),
  getByBounds: (minLat: number, maxLat: number, minLon: number, maxLon: number) =>
    api.get<SpeedTestResult[]>('/speedtest/bounds', { params: { minLat, maxLat, minLon, maxLon } }),
  getStatsByCity: () => api.get<SpeedTestStats[]>('/speedtest/stats/city'),
  getStatsByProvider: () => api.get<SpeedTestStats[]>('/speedtest/stats/provider')
}

export default api
