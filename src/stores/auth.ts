import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  fullName?: string
  role: 'USER' | 'ADMIN' | 'MANAGER'
  isVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isManager = computed(() => user.value?.role === 'MANAGER')
  const canAccessAdmin = computed(() => isAdmin.value || isManager.value)

  function setAuth(authData: AuthResponse) {
    token.value = authData.token
    user.value = authData.user
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData.user))
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function loadFromStorage() {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  async function register(data: {
    username: string
    email: string
    password: string
  }) {
    const response = await axios.post('http://localhost:8080/api/auth/register', data)
    return response.data
  }

  async function verify(email: string, code: string) {
    const response = await axios.post<AuthResponse>(
      'http://localhost:8080/api/auth/verify',
      { email, code }
    )
    setAuth(response.data)
    return response.data
  }

  async function login(email: string, password: string) {
    const response = await axios.post<AuthResponse>('http://localhost:8080/api/auth/login', {
      email,
      password
    })
    setAuth(response.data)
    return response.data
  }

  function logout() {
    clearAuth()
  }

  // Load user from storage on initialization
  loadFromStorage()

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isManager,
    canAccessAdmin,
    register,
    verify,
    login,
    logout,
    loadFromStorage
  }
})
