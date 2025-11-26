<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { plansApi, servicesApi, serviceTypesApi } from '@/services/api'

const router = useRouter()
const route = useRoute()

// Stats from backend
const stats = ref({
  plans: 0,
  services: 0,
  serviceTypes: 0
})

const loadStats = async () => {
  try {
    const [plansRes, servicesRes, typesRes] = await Promise.all([
      plansApi.getAll(),
      servicesApi.getAll(),
      serviceTypesApi.getAll()
    ])
    stats.value = {
      plans: plansRes.data.length,
      services: servicesRes.data.length,
      serviceTypes: typesRes.data.length
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

onMounted(() => {
  loadStats()
})

const menuItems = [
  {
    label: 'Типы сервисов',
    icon: 'pi pi-th-large',
    route: '/admin/service-types',
    description: 'Группировка сервисов'
  },
  {
    label: 'Сервисы',
    icon: 'pi pi-box',
    route: '/admin/services',
    description: 'Все сервисы'
  },
  {
    label: 'Тарифы',
    icon: 'pi pi-tags',
    route: '/admin/plans',
    description: 'Планы подписок'
  },
  {
    label: 'Пользователи',
    icon: 'pi pi-users',
    route: '/admin/users',
    description: 'Управление пользователями'
  }
]

const isActiveRoute = (itemRoute: string) => {
  return route.path.startsWith(itemRoute)
}

const navigateTo = (path: string) => {
  router.push(path)
}

const goToMainApp = () => {
  router.push('/')
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo" @click="navigateTo('/admin')">
          <div class="logo-icon">
            <i class="pi pi-crown"></i>
          </div>
          <div class="logo-text">
            <span class="brand">BolipTole</span>
            <span class="label">Admin Panel</span>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon plans">
            <i class="pi pi-tags"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.plans }}</span>
            <span class="stat-label">Тарифов</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon services">
            <i class="pi pi-box"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.services }}</span>
            <span class="stat-label">Сервисов</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon types">
            <i class="pi pi-th-large"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.serviceTypes }}</span>
            <span class="stat-label">Типов сервисов</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <span class="nav-section-title">Управление</span>
        <button
          v-for="item in menuItems"
          :key="item.route"
          class="nav-item"
          :class="{ active: isActiveRoute(item.route) }"
          @click="navigateTo(item.route)"
        >
          <i :class="item.icon"></i>
          <div class="nav-item-text">
            <span class="nav-item-label">{{ item.label }}</span>
            <span class="nav-item-desc">{{ item.description }}</span>
          </div>
          <i class="pi pi-chevron-right nav-arrow"></i>
        </button>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="main-app-btn" @click="goToMainApp">
          <i class="pi pi-arrow-left"></i>
          <span>Вернуться на сайт</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  background: #f8fafc;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.9;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.logo-icon i {
  font-size: 1.25rem;
  color: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text .brand {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
}

.logo-text .label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Stats Section */
.stats-section {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.2s;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 1rem;
  color: white;
}

.stat-icon.plans {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-icon.services {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon.types {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
}

.nav-section-title {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  text-align: left;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.nav-item > i:first-child {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #94a3b8;
  transition: all 0.2s;
}

.nav-item.active > i:first-child {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.nav-item-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-item-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #e2e8f0;
}

.nav-item.active .nav-item-label {
  color: #22c55e;
}

.nav-item-desc {
  font-size: 0.75rem;
  color: #64748b;
}

.nav-arrow {
  font-size: 0.75rem;
  color: #475569;
  opacity: 0;
  transition: all 0.2s;
}

.nav-item:hover .nav-arrow,
.nav-item.active .nav-arrow {
  opacity: 1;
}

.nav-item.active .nav-arrow {
  color: #22c55e;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.main-app-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.main-app-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  min-height: 100vh;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .main-content {
    margin-left: 240px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .main-content {
    margin-left: 0;
  }

  .stats-section {
    flex-direction: row;
    overflow-x: auto;
  }

  .stat-card {
    min-width: 140px;
  }
}
</style>
