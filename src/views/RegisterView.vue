<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const validateForm = () => {
  if (!formData.value.username || !formData.value.email || !formData.value.password) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Заполните все обязательные поля',
      life: 3000
    })
    return false
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Пароли не совпадают',
      life: 3000
    })
    return false
  }

  if (formData.value.password.length < 6) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Пароль должен содержать минимум 6 символов',
      life: 3000
    })
    return false
  }

  return true
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    await authStore.register({
      username: formData.value.username,
      email: formData.value.email,
      password: formData.value.password
    })

    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Код подтверждения отправлен на вашу почту',
      life: 3000
    })

    router.push({ name: 'verify', query: { email: formData.value.email } })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.response?.data?.message || 'Ошибка регистрации',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<template>
  <MainLayout>
    <div class="register-view">
      <div class="register-container">
        <div class="register-card">
          <div class="card-header">
            <h1>Регистрация</h1>
            <p>Создайте аккаунт BolipTole</p>
          </div>

          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-group">
              <label for="username">Имя пользователя *</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                required
                placeholder="Введите имя пользователя"
              />
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                placeholder="example@mail.com"
              />
            </div>

            <div class="form-group">
              <label for="password">Пароль *</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                required
                placeholder="Минимум 6 символов"
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Подтвердите пароль *</label>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                type="password"
                required
                placeholder="Повторите пароль"
              />
            </div>

            <button type="submit" class="btn-register" :disabled="loading">
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <span v-else>Зарегистрироваться</span>
            </button>

            <div class="form-footer">
              <p>
                Уже есть аккаунт?
                <a @click="goToLogin" class="link">Войти</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.register-view {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f9fafb;
}

.register-container {
  width: 100%;
  max-width: 500px;
}

.register-card {
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

.register-form {
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

.btn-register {
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

.btn-register:hover:not(:disabled) {
  background: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.btn-register:disabled {
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
  .register-card {
    padding: 2rem 1.5rem;
  }

  .card-header h1 {
    font-size: 1.5rem;
  }
}
</style>
