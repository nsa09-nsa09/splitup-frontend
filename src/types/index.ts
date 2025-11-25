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
