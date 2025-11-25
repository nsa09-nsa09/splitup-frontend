<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import MainLayout from '@/layouts/MainLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

// Загрузка сохранённого состояния из sessionStorage
const loadSavedState = () => {
  const savedStep = sessionStorage.getItem('registerStep')
  const savedEmail = sessionStorage.getItem('registerEmail')
  const savedCode = sessionStorage.getItem('registerCode')

  return {
    step: savedStep ? parseInt(savedStep) : 1,
    email: savedEmail || '',
    code: savedCode || ''
  }
}

const savedState = loadSavedState()

// Шаги регистрации: 1 - email, 2 - код, 3 - данные
const step = ref(savedState.step)

const email = ref(savedState.email)
const code = ref(savedState.code)
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Сохранение состояния при изменении
watch([step, email, code], () => {
  sessionStorage.setItem('registerStep', step.value.toString())
  sessionStorage.setItem('registerEmail', email.value)
  sessionStorage.setItem('registerCode', code.value)
})

// Очистка состояния при успешной регистрации
const clearRegistrationState = () => {
  sessionStorage.removeItem('registerStep')
  sessionStorage.removeItem('registerEmail')
  sessionStorage.removeItem('registerCode')
}

onMounted(() => {
  // Если пользователь уже авторизован, перенаправить на главную
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

// Шаг 1: Отправить код на email
const sendCode = async () => {
  if (!email.value) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: t('auth.email'),
      life: 3000
    })
    return
  }

  loading.value = true
  try {
    await authStore.sendVerificationCode(email.value)

    toast.add({
      severity: 'success',
      summary: t('success.success'),
      detail: t('success.codeSent'),
      life: 3000
    })

    step.value = 2
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: error.response?.data?.message || t('errors.sendCodeError'),
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Шаг 2: Проверить код
const verifyCode = async () => {
  if (code.value.length !== 6) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: t('errors.codeMustBe6'),
      life: 3000
    })
    return
  }

  loading.value = true
  try {
    await authStore.checkVerificationCode(email.value, code.value)

    toast.add({
      severity: 'success',
      summary: t('success.success'),
      detail: t('success.codeConfirmed'),
      life: 3000
    })

    step.value = 3
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: error.response?.data?.message || t('errors.invalidCode'),
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Шаг 3: Создать пользователя
const completeRegistration = async () => {
  if (!formData.value.username || !formData.value.password) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: t('errors.fillRequired'),
      life: 3000
    })
    return
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: t('errors.passwordMismatch'),
      life: 3000
    })
    return
  }

  if (formData.value.password.length < 6) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: t('errors.passwordMinLength'),
      life: 3000
    })
    return
  }

  loading.value = true
  try {
    await authStore.completeRegistration({
      email: email.value,
      code: code.value,
      username: formData.value.username,
      password: formData.value.password
    })

    toast.add({
      severity: 'success',
      summary: t('success.success'),
      detail: t('success.registrationComplete'),
      life: 3000
    })

    // Очистить сохранённое состояние
    clearRegistrationState()

    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: error.response?.data?.message || t('errors.registrationError'),
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleCodeInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  code.value = input.value.replace(/\D/g, '').slice(0, 6)
}

const goToLogin = () => {
  // Очистить состояние при переходе на логин
  clearRegistrationState()
  router.push({ name: 'login' })
}

const goBack = () => {
  if (step.value > 1) {
    step.value--
  }
}
</script>

<template>
  <MainLayout>
    <div class="register-view">
      <div class="register-container">
        <div class="register-card">
          <!-- Шаг 1: Ввод email -->
          <div v-if="step === 1">
            <div class="card-header">
              <div class="icon-wrapper">
                <i class="pi pi-envelope" style="font-size: 3rem; color: #16a34a"></i>
              </div>
              <h1>{{ t('auth.register') }}</h1>
              <p>{{ t('auth.enterEmail') }}</p>
            </div>

            <form @submit.prevent="sendCode" class="register-form">
              <div class="form-group">
                <label for="email">{{ t('auth.email') }}</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  placeholder="example@mail.com"
                  autofocus
                />
              </div>

              <button type="submit" class="btn-register" :disabled="loading">
                <i v-if="loading" class="pi pi-spin pi-spinner"></i>
                <span v-else>{{ t('auth.sendCode') }}</span>
              </button>

              <div class="form-footer">
                <p>
                  {{ t('auth.haveAccount') }}
                  <a @click="goToLogin" class="link">{{ t('auth.loginLink') }}</a>
                </p>
              </div>
            </form>
          </div>

          <!-- Шаг 2: Ввод кода -->
          <div v-if="step === 2">
            <div class="card-header">
              <div class="icon-wrapper">
                <i class="pi pi-shield" style="font-size: 3rem; color: #16a34a"></i>
              </div>
              <h1>{{ t('auth.verificationCode') }}</h1>
              <p>{{ t('auth.enterCode') }}</p>
              <p class="email-hint">{{ t('auth.sentTo') }} {{ email }}</p>
            </div>

            <form @submit.prevent="verifyCode" class="register-form">
              <div class="form-group">
                <label for="code">{{ t('auth.verificationCode') }}</label>
                <input
                  id="code"
                  :value="code"
                  @input="handleCodeInput"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="6"
                  required
                  placeholder="000000"
                  class="code-input"
                  autofocus
                />
              </div>

              <button type="submit" class="btn-register" :disabled="loading || code.length !== 6">
                <i v-if="loading" class="pi pi-spin pi-spinner"></i>
                <span v-else>{{ t('auth.verifyCode') }}</span>
              </button>

              <button type="button" class="btn-back" @click="goBack">
                <i class="pi pi-arrow-left"></i>
                {{ t('nav.back') }}
              </button>
            </form>
          </div>

          <!-- Шаг 3: Ввод данных -->
          <div v-if="step === 3">
            <div class="card-header">
              <div class="icon-wrapper">
                <i class="pi pi-user" style="font-size: 3rem; color: #16a34a"></i>
              </div>
              <h1>{{ t('auth.completeRegistration') }}</h1>
              <p>{{ t('auth.completeProfile') }}</p>
            </div>

            <form @submit.prevent="completeRegistration" class="register-form">
              <div class="form-group">
                <label for="username">{{ t('auth.username') }} *</label>
                <input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  required
                  :placeholder="t('auth.enterUsername')"
                  autofocus
                />
              </div>

              <div class="form-group">
                <label for="password">{{ t('auth.password') }} *</label>
                <div class="password-input-wrapper">
                  <input
                    id="password"
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    :placeholder="t('auth.minChars')"
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

              <div class="form-group">
                <label for="confirmPassword">{{ t('auth.confirmPassword') }} *</label>
                <div class="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    required
                    :placeholder="t('auth.repeatPassword')"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                  </button>
                </div>
              </div>

              <button type="submit" class="btn-register" :disabled="loading">
                <i v-if="loading" class="pi pi-spin pi-spinner"></i>
                <span v-else>{{ t('auth.completeRegistration') }}</span>
              </button>

              <button type="button" class="btn-back" @click="goBack">
                <i class="pi pi-arrow-left"></i>
                {{ t('nav.back') }}
              </button>
            </form>
          </div>
        </div>

        <!-- Progress indicator -->
        <div class="progress-indicator">
          <div class="step" :class="{ active: step >= 1, completed: step > 1 }">
            <div class="step-circle">1</div>
            <span>{{ t('auth.stepEmail') }}</span>
          </div>
          <div class="step-line" :class="{ active: step > 1 }"></div>
          <div class="step" :class="{ active: step >= 2, completed: step > 2 }">
            <div class="step-circle">2</div>
            <span>{{ t('auth.stepCode') }}</span>
          </div>
          <div class="step-line" :class="{ active: step > 2 }"></div>
          <div class="step" :class="{ active: step >= 3 }">
            <div class="step-circle">3</div>
            <span>{{ t('auth.stepData') }}</span>
          </div>
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
  margin-bottom: 2rem;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon-wrapper {
  background: #f0fdf4;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
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

.email-hint {
  color: #16a34a;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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

.code-input {
  text-align: center;
  letter-spacing: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: monospace;
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

.btn-back {
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-back:hover {
  background: #f9fafb;
  border-color: #d1d5db;
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

/* Progress Indicator */
.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed .step-circle {
  background: #16a34a;
  color: white;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  transition: all 0.3s ease;
}

.step.active .step-circle {
  background: #dcfce7;
  color: #16a34a;
  border: 2px solid #16a34a;
}

.step span {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.step.active span {
  color: #16a34a;
}

.step-line {
  width: 60px;
  height: 2px;
  background: #e5e7eb;
  transition: all 0.3s ease;
}

.step-line.active {
  background: #16a34a;
}

@media (max-width: 640px) {
  .register-card {
    padding: 2rem 1.5rem;
  }

  .card-header h1 {
    font-size: 1.5rem;
  }

  .progress-indicator {
    padding: 1rem;
  }

  .step span {
    font-size: 0.75rem;
  }

  .step-line {
    width: 40px;
  }
}
</style>
