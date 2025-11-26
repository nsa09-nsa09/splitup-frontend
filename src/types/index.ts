export interface ServiceType {
  id?: number
  name: string
  displayOrder?: number
}

export interface Service {
  id?: number
  name: string
  type?: string
  typeId?: number
  icon?: string
  priceFrom?: number
  savingsPercentage?: number
  description?: string
}

export interface SubscriptionPlan {
  id?: number
  serviceId?: number
  serviceName?: string
  name: string
  description?: string
  maxMembers: number
  maxDevices?: number
  pricePerMonth: number
  originalPrice?: number
  discountPercentage?: number
  isPopular: boolean
  features?: string[]
  isActive?: boolean
}

export interface Wallet {
  id: number
  balance: number
  currency: string
  isVerified: boolean
}

export interface Transaction {
  id: number
  type: string
  amount: number
  description: string
  status: string
  paymentMethod?: string
  createdAt: string
  completedAt?: string
}

export interface UserSubscription {
  id: number
  serviceName: string
  serviceIcon?: string
  planName: string
  pricePerMember: number
  nextPaymentDate?: string
  status: string
}

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  fullName?: string
  role: string
  isVerified: boolean
  createdAt: string
  walletBalance?: number
  walletCurrency?: string
}
