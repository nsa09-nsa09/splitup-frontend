<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import Menubar from 'primevue/menubar'

const router = useRouter()
const route = useRoute()

const menuItems = [
  {
    label: 'Категории',
    icon: 'pi pi-list',
    to: '/admin/categories',
    command: () => router.push('/admin/categories')
  },
  {
    label: 'Тарифы',
    icon: 'pi pi-tags',
    to: '/admin/plans',
    command: () => router.push('/admin/plans')
  }
]

const goToMainApp = () => {
  router.push('/')
}
</script>

<template>
  <div class="admin-layout">
    <Menubar :model="menuItems" class="admin-menu">
      <template #start>
        <div class="admin-title">
          <i class="pi pi-crown" style="font-size: 1.5rem; color: #dc2626; filter: drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3))"></i>
          <span style="margin-left: 0.5rem; font-weight: 700; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">fairpay Admin</span>
        </div>
      </template>
      <template #end>
        <button class="main-app-btn" @click="goToMainApp">
          <i class="pi pi-home"></i>
          <span>Главное приложение</span>
        </button>
      </template>
    </Menubar>

    <main class="admin-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.admin-menu {
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.main-app-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
}

.main-app-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
  background: #b91c1c;
}

@media (max-width: 768px) {
  .admin-content {
    padding: 1rem;
  }

  .main-app-btn span {
    display: none;
  }

  .main-app-btn {
    padding: 0.625rem;
    width: 40px;
    height: 40px;
    justify-content: center;
  }
}
</style>
