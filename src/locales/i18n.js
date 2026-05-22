import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationEN from './en.json'
import translationTE from './te.json'
import translationHI from './hi.json'
import translationTA from './ta.json'
import translationKN from './kn.json'
import translationMR from './mr.json'
import translationBN from './bn.json'

const resources = {
  en: { translation: translationEN },
  te: { translation: translationTE },
  hi: { translation: translationHI },
  ta: { translation: translationTA },
  kn: { translation: translationKN },
  mr: { translation: translationMR },
  bn: { translation: translationBN }
}

const savedLanguage = localStorage.getItem('poultrypro-language') || 'en'

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
