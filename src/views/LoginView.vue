<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const formData = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  if (!formData.value.email || !formData.value.password) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: t('errors.fillAllFields'),
      life: 3000
    })
    return
  }

  loading.value = true
  try {
    await authStore.login(formData.value.email, formData.value.password)

    toast.add({
      severity: 'success',
      summary: t('success.success'),
      detail: t('success.loggedIn'),
      life: 3000
    })

    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: error.response?.data?.message || t('errors.invalidEmailOrPassword'),
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push({ name: 'register' })
}
</script>

<template>
  <MainLayout>
    <div class="login-view">
      <div class="login-container">
        <div class="login-card">
          <div class="card-header">
            <h1>{{ t('auth.login') }}</h1>
            <p>{{ t('auth.loginSubtitle') }}</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email">{{ t('auth.email') }}</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                placeholder="example@mail.com"
              />
            </div>

            <div class="form-group">
              <label for="password">{{ t('auth.password') }}</label>
              <div class="password-input-wrapper">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :placeholder="t('auth.enterPassword')"
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-login" :disabled="loading">
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ t('auth.loginLink') }}</span>
            </button>

            <div class="form-footer">
              <p>
                {{ t('auth.noAccount') }}
                <a @click="goToRegister" class="link">{{ t('auth.registerLink') }}</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.login-view {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f9fafb;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  padding: 3rem;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.card-header p {
  color: #6b7280;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  color: #111827;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.form-group input::placeholder {
  color: #9ca3af;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  flex: 1;
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #16a34a;
}

.toggle-password i {
  font-size: 1.125rem;
}

.btn-login {
  background: #16a34a;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  background: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer p {
  color: #6b7280;
  font-size: 0.875rem;
}

.form-footer .link {
  color: #16a34a;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease;
}

.form-footer .link:hover {
  color: #15803d;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .card-header h1 {
    font-size: 1.5rem;
  }
}
</style>
