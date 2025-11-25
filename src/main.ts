import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Lara from '@primevue/themes/lara'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(PrimeVue, {
  theme: {
    preset: Lara,
    options: {
      darkModeSelector: '.dark-mode',
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities'
      }
    }
  },
  pt: {
    global: {
      css: `
        :root {
          --primary-50: #f0fdf4;
          --primary-100: #dcfce7;
          --primary-200: #bbf7d0;
          --primary-300: #86efac;
          --primary-400: #4ade80;
          --primary-500: #22c55e;
          --primary-600: #16a34a;
          --primary-700: #15803d;
          --primary-800: #166534;
          --primary-900: #14532d;
        }
      `
    }
  }
})
app.use(ToastService)

app.mount('#app')
