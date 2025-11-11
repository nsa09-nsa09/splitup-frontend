<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { label: 'Главная', route: '/' },
  { label: 'Сервисы', route: '/' },
  { label: 'Мои группы', route: '/groups' },
  { label: 'Профиль', route: '/profile' }
]

const isActiveRoute = (routePath: string) => {
  if (routePath === '/' && route.path === '/') return true
  if (routePath !== '/' && route.path.startsWith(routePath)) return true
  return false
}

const navigateTo = (path: string) => {
  router.push(path)
}

const goToAdmin = () => {
  router.push('/admin')
}

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="main-layout">
    <!-- Header -->
    <header class="site-header">
      <div class="header-container">
        <div class="logo" @click="navigateTo('/')">
          <i class="pi pi-th-large"></i>
          <span>fairpay</span>
        </div>

        <nav class="main-nav">
          <button
            v-for="item in navItems"
            :key="item.route"
            class="nav-link"
            :class="{ active: isActiveRoute(item.route) }"
            @click="navigateTo(item.route)"
          >
            {{ item.label }}
          </button>
        </nav>

        <div class="header-actions">
          <!-- Show Admin button only for ADMIN and MANAGER -->
          <button
            v-if="authStore.canAccessAdmin"
            class="btn-secondary"
            @click="goToAdmin"
          >
            <i class="pi pi-cog"></i>
            <span>Админ</span>
          </button>

          <!-- Show Login button if not authenticated -->
          <button v-if="!authStore.isAuthenticated" class="btn-primary" @click="goToLogin">
            <i class="pi pi-user"></i>
            <span>Войти</span>
          </button>

          <!-- Show User menu if authenticated -->
          <div v-if="authStore.isAuthenticated" class="user-menu">
            <button class="btn-user">
              <i class="pi pi-user"></i>
              <span>{{ authStore.user?.username }}</span>
            </button>
            <button class="btn-logout" @click="handleLogout">
              <i class="pi pi-sign-out"></i>
              <span>Выход</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="site-content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-section">
          <h4>fairpay</h4>
          <p>Экономьте на подписках вместе с друзьями</p>
        </div>
        <div class="footer-section">
          <h5>Компания</h5>
          <a href="#">О нас</a>
          <a href="#">Контакты</a>
          <a href="#">Помощь</a>
        </div>
        <div class="footer-section">
          <h5>Сервисы</h5>
          <a href="#">Операторы</a>
          <a href="#">Видео</a>
          <a href="#">Музыка</a>
        </div>
        <div class="footer-section">
          <h5>Связаться</h5>
          <a href="#">support@fairpay.kz</a>
          <a href="#">+7 777 123 4567</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 fairpay. Все права защищены.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

/* Header */
.site-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo i {
  font-size: 1.75rem;
  color: #dc2626;
  filter: drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3));
}

.main-nav {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  background: #fef2f2;
  color: #dc2626;
}

.nav-link.active {
  color: #dc2626;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #dc2626;
  color: white;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
  background: #b91c1c;
}

.btn-secondary {
  background: #ffffff;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #dc2626;
}

.user-menu {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
  color: #374151;
}

.btn-user:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-logout:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* Content */
.site-content {
  flex: 1;
  width: 100%;
}

/* Footer */
.site-footer {
  background: #1f2937;
  color: white;
  padding: 3rem 0 1rem;
  margin-top: 4rem;
  border-top: 3px solid #dc2626;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.footer-section h5 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #ffffff;
  font-weight: 600;
}

.footer-section p {
  color: #d1d5db;
  line-height: 1.6;
}

.footer-section a {
  display: block;
  color: #d1d5db;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #fca5a5;
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  border-top: 1px solid #374151;
  text-align: center;
  color: #d1d5db;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
  }

  .main-nav {
    display: none;
  }

  .btn-secondary span,
  .btn-primary span {
    display: none;
  }

  .btn-secondary,
  .btn-primary {
    padding: 0.75rem;
  }

  .footer-container {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
}
</style>
