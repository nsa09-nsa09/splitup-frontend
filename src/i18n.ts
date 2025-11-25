import { createI18n } from 'vue-i18n'
import ru from './locales/ru'
import kk from './locales/kk'
import be from './locales/be'
import uz from './locales/uz'
import az from './locales/az'
import hy from './locales/hy'
import ky from './locales/ky'
import tg from './locales/tg'

// Get saved locale from localStorage or default to Russian
const savedLocale = localStorage.getItem('locale') || 'ru'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale,
  fallbackLocale: 'ru',
  messages: {
    ru,
    kk,
    be,
    uz,
    az,
    hy,
    ky,
    tg
  }
})

export default i18n
