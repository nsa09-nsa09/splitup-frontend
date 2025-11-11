import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth Routes
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('../views/VerifyCodeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },

    // Main App Routes
    {
      path: '/',
      name: 'home',
      component: () => import('../views/main/HomeView.vue')
    },
    {
      path: '/service/:id',
      name: 'service-detail',
      component: () => import('../views/main/ServiceDetailView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/main/HomeView.vue')
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('../views/main/HomeView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/main/HomeView.vue')
    },

    // Admin Routes
    {
      path: '/admin',
      redirect: '/admin/categories'
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: () => import('../views/CategoriesView.vue')
    },
    {
      path: '/admin/plans',
      name: 'admin-plans',
      component: () => import('../views/PlansView.vue')
    }
  ]
})

export default router
