export interface ServiceCategory {
  id?: number
  name: string
  icon?: string
  createdAt?: string
}

export interface Service {
  id?: number
  name: string
  description?: string
  logoUrl?: string
  categoryId: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  category?: ServiceCategory
  icon?: string
  color?: string
  planCount?: number
}

export interface SubscriptionPlan {
  id?: number
  serviceId: number
  name: string
  description?: string
  maxMembers: number
  maxDevices?: number
  pricePerMonth: number
  originalPrice?: number
  discountPercentage?: number
  isPopular: boolean
  features?: string[]
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  service?: Service
}
