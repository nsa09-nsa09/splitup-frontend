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
      redirect: '/admin/service-types'
    },
    {
      path: '/admin/service-types',
      name: 'admin-service-types',
      component: () => import('../views/ServiceTypesView.vue')
    },
    {
      path: '/admin/service-types/:typeId/services',
      name: 'admin-services-by-type',
      component: () => import('../views/admin/ServicesView.vue')
    },
    {
      path: '/admin/services/:serviceId/plans',
      name: 'admin-service-plans',
      component: () => import('../views/admin/ServicePlansView.vue')
    }
  ]
})

export default router
