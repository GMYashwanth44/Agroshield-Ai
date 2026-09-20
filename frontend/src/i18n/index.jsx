import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import kn from './kn.json';
import hi from './hi.json';
import mr from './mr.json';
import te from './te.json';
import ta from './ta.json';

const translations = { en, kn, hi, mr, te, ta };

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
];

const I18nContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  languages: LANGUAGES
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('agroshield_lang') || 'en';
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('agroshield_lang', lang);
    }
  };

  const t = (key, fallback = '') => {
    const current = translations[language] || translations.en;
    if (current && current[key]) {
      return current[key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
export default useTranslation;
