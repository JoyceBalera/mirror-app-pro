import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { translations, Language, TranslationKeys } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  
  // Sync with i18next
  const [language, setLanguageState] = useState<Language>(() => {
    const lang = i18n.language?.split('-')[0] as Language;
    return ['pt', 'en', 'es'].includes(lang) ? lang : 'pt';
  });

  // Listen to i18next language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const lang = lng.split('-')[0] as Language;
      if (['pt', 'en', 'es'].includes(lang)) {
        setLanguageState(lang);
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
