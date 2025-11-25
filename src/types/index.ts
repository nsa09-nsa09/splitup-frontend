export interface CategoryType {
  id?: number
  name: string
  displayOrder?: number
}

export interface ServiceCategory {
  id?: number
  name: string
  type: string
  typeId?: number
  icon?: string
  priceFrom?: number
  savingsPercentage?: number
  description?: string
  createdAt?: string
}

export interface Service {
  id?: number
  name: string
  description?: string
  logoUrl?: string
  categoryId?: number
  categoryName?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  category?: ServiceCategory
  icon?: string
  color?: string
  planCount?: number
  plansCount?: number
  priceFrom?: number
  familyPriceFrom?: number
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

export interface CategoryPlan {
  id?: number
  categoryId: number
  categoryName?: string
  name: string
  description?: string
  slots: number
  discountPercentage?: number
  pricePerPerson: number
  commission?: number
  originalPrice?: number
  individualPrice?: number
  totalPrice?: number
  isPopular: boolean
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}
