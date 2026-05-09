import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ptBR from './pt-BR.json';

void i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    en: { translation: en }
  },
  lng: localStorage.getItem('worshipflow:idioma') ?? 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false }
});

export default i18n;
