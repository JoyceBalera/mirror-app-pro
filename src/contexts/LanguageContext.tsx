import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { translations, Language, TranslationKeys } from '@/lib/translations';
import { supabase } from '@/integrations/supabase/client';

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

  // Load preferred language from profile on auth
  useEffect(() => {
    const loadPreferredLanguage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .single();

        if (profile?.preferred_language) {
          const lang = profile.preferred_language as Language;
          if (['pt', 'en', 'es'].includes(lang)) {
            i18n.changeLanguage(lang);
          }
        }
      }
    };

    loadPreferredLanguage();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadPreferredLanguage();
      }
    });

    return () => {
      subscription.unsubscribe();
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
