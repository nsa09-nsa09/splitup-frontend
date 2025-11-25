<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const showLanguageMenu = ref(false)
const languageSelectorRef = ref<HTMLElement | null>(null)

const navItems = computed(() => [
  { label: t('nav.home'), route: '/' },
  { label: t('nav.myGroups'), route: '/groups' },
  { label: t('nav.profile'), route: '/profile' }
])

const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
  { code: 'be', name: 'Беларуская', flag: '🇧🇾' },
  { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'ky', name: 'Кыргызча', flag: '🇰🇬' },
  { code: 'tg', name: 'Тоҷикӣ', flag: '🇹🇯' }
]

const currentLanguage = computed(() =>
  languages.find(lang => lang.code === locale.value) || languages[0]
)

const changeLanguage = (langCode: string) => {
  locale.value = langCode
  localStorage.setItem('locale', langCode)
  showLanguageMenu.value = false
}

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

// Close language menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (languageSelectorRef.value && !languageSelectorRef.value.contains(event.target as Node)) {
    showLanguageMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="main-layout">
    <!-- Header -->
    <header class="site-header">
      <div class="header-container">
        <div class="logo" @click="navigateTo('/')">
          <div class="logo-icon">
            <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="15" r="10" fill="currentColor" opacity="0.9"/>
              <circle cx="25" cy="20" r="8" fill="currentColor" opacity="0.7"/>
              <circle cx="75" cy="20" r="8" fill="currentColor" opacity="0.7"/>
              <path d="M 35 35 Q 35 25 50 25 Q 65 25 65 35 L 65 50 L 35 50 Z" fill="currentColor" opacity="0.9"/>
              <path d="M 10 40 Q 10 32 25 32 Q 40 32 40 40 L 40 50 L 10 50 Z" fill="currentColor" opacity="0.7"/>
              <path d="M 60 40 Q 60 32 75 32 Q 90 32 90 40 L 90 50 L 60 50 Z" fill="currentColor" opacity="0.7"/>
            </svg>
          </div>
          <span class="logo-text">BölipTole</span>
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
          <!-- Language Selector -->
          <div ref="languageSelectorRef" class="language-selector">
            <button class="btn-language" @click="showLanguageMenu = !showLanguageMenu">
              <span class="flag">{{ currentLanguage.flag }}</span>
              <span class="lang-code">{{ currentLanguage.code.toUpperCase() }}</span>
              <i class="pi pi-angle-down"></i>
            </button>

            <div v-if="showLanguageMenu" class="language-menu">
              <button
                v-for="lang in languages"
                :key="lang.code"
                class="language-option"
                :class="{ active: locale === lang.code }"
                @click="changeLanguage(lang.code)"
              >
                <span class="flag">{{ lang.flag }}</span>
                <span class="lang-name">{{ lang.name }}</span>
                <i v-if="locale === lang.code" class="pi pi-check"></i>
              </button>
            </div>
          </div>

          <!-- Show Admin button only for ADMIN and MANAGER -->
          <button
            v-if="authStore.canAccessAdmin"
            class="btn-secondary"
            @click="goToAdmin"
          >
            <i class="pi pi-cog"></i>
            <span>{{ t('nav.admin') }}</span>
          </button>

          <!-- Show Login button if not authenticated -->
          <button v-if="!authStore.isAuthenticated" class="btn-primary" @click="goToLogin">
            <i class="pi pi-user"></i>
            <span>{{ t('nav.login') }}</span>
          </button>

          <!-- Show User menu if authenticated -->
          <div v-if="authStore.isAuthenticated" class="user-menu">
            <button class="btn-user">
              <i class="pi pi-user"></i>
              <span>{{ authStore.user?.username }}</span>
            </button>
            <button class="btn-logout" @click="handleLogout">
              <i class="pi pi-sign-out"></i>
              <span>{{ t('nav.logout') }}</span>
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
          <h4>BolipTole</h4>
          <p>{{ t('footer.tagline') }}</p>
        </div>
        <div class="footer-section">
          <h5>{{ t('footer.company') }}</h5>
          <a href="#">{{ t('footer.aboutUs') }}</a>
          <a href="#">{{ t('footer.contacts') }}</a>
          <a href="#">{{ t('footer.help') }}</a>
        </div>
        <div class="footer-section">
          <h5>{{ t('footer.services') }}</h5>
          <a href="#">{{ t('categories.operators') }}</a>
          <a href="#">{{ t('categories.video') }}</a>
          <a href="#">{{ t('categories.music') }}</a>
        </div>
        <div class="footer-section">
          <h5>{{ t('footer.contactUs') }}</h5>
          <a href="#">support@boliptole.kz</a>
          <a href="#">+7 777 123 4567</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 BolipTole. {{ t('footer.allRightsReserved') }}.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a2942 0%, #0f1829 100%);
}

/* Header */
.site-header {
  background: rgba(15, 24, 41, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  gap: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 12px;
}

.logo:hover {
  transform: translateY(-2px);
  background: rgba(96, 165, 250, 0.05);
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #7dd3fc 0%, #60a5fa 50%, #a78bfa 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
  transition: all 0.3s ease;
}

.logo:hover .logo-icon {
  box-shadow: 0 6px 20px rgba(96, 165, 250, 0.5);
  transform: scale(1.05);
}

.logo-icon svg {
  width: 100%;
  height: 100%;
  color: white;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #7dd3fc 0%, #60a5fa 50%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
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
  color: #cbd5e1;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
}

.nav-link.active {
  color: white;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Language Selector */
.language-selector {
  position: relative;
}

.btn-language {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-language:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(96, 165, 250, 0.5);
  color: #60a5fa;
}

.btn-language .flag {
  font-size: 1.25rem;
}

.btn-language .lang-code {
  font-size: 0.875rem;
  font-weight: 700;
}

.language-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 180px;
  z-index: 1000;
  border: 1px solid #e5e7eb;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: white;
  border: none;
  color: #374151;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.language-option:hover {
  background: #f3f4f6;
}

.language-option.active {
  background: #f0fdf4;
  color: #16a34a;
  font-weight: 600;
}

.language-option .flag {
  font-size: 1.25rem;
}

.language-option .lang-name {
  flex: 1;
}

.language-option i {
  color: #16a34a;
  font-size: 0.875rem;
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
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(96, 165, 250, 0.5);
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(96, 165, 250, 0.5);
  color: #60a5fa;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
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
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.btn-logout:hover {
  background: #dcfce7;
  border-color: #86efac;
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
  border-top: 3px solid #16a34a;
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
  background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
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
  color: #86efac;
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
