<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const code = ref('')
const loading = ref(false)

onMounted(() => {
  email.value = route.query.email as string || ''
  if (!email.value) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Email не найден',
      life: 3000
    })
    router.push({ name: 'register' })
  }
})

const handleVerify = async () => {
  if (code.value.length !== 6) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Код должен содержать 6 цифр',
      life: 3000
    })
    return
  }

  loading.value = true
  try {
    await authStore.verify(email.value, code.value)

    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Регистрация завершена!',
      life: 3000
    })

    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.response?.data?.message || 'Неверный код',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  code.value = input.value.replace(/\D/g, '').slice(0, 6)
}
</script>

<template>
  <MainLayout>
    <div class="verify-view">
      <div class="verify-container">
        <div class="verify-card">
          <div class="card-header">
            <div class="icon-wrapper">
              <i class="pi pi-envelope" style="font-size: 3rem; color: #dc2626"></i>
            </div>
            <h1>Подтверждение email</h1>
            <p>Мы отправили 6-значный код на</p>
            <p class="email">{{ email }}</p>
          </div>

          <form @submit.prevent="handleVerify" class="verify-form">
            <div class="form-group">
              <label for="code">Код подтверждения</label>
              <input
                id="code"
                :value="code"
                @input="handleInput"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                required
                placeholder="000000"
                class="code-input"
              />
            </div>

            <button type="submit" class="btn-verify" :disabled="loading || code.length !== 6">
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <span v-else>Подтвердить</span>
            </button>

            <div class="form-footer">
              <p>Не получили код?</p>
              <a class="link">Отправить снова</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.verify-view {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f9fafb;
}

.verify-container {
  width: 100%;
  max-width: 450px;
}

.verify-card {
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

.icon-wrapper {
  background: #fef2f2;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.card-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.card-header p {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.card-header .email {
  color: #dc2626;
  font-weight: 600;
  font-size: 1.125rem;
}

.verify-form {
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
  text-align: center;
}

.code-input {
  padding: 1.25rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 2rem;
  color: #111827;
  text-align: center;
  letter-spacing: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: white;
  font-family: monospace;
}

.code-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.code-input::placeholder {
  color: #d1d5db;
  letter-spacing: 0.5rem;
}

.btn-verify {
  background: #dc2626;
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

.btn-verify:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-verify:disabled {
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
  margin-bottom: 0.5rem;
}

.form-footer .link {
  color: #dc2626;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.875rem;
}

.form-footer .link:hover {
  color: #b91c1c;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .verify-card {
    padding: 2rem 1.5rem;
  }

  .card-header h1 {
    font-size: 1.5rem;
  }
}
</style>
