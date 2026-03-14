import { useState, useCallback, useEffect } from 'react';
import type { Language } from '../types';
import { t } from '../i18n';

export function useLanguage() {
  const [lang, setLang] = useState<Language>('zh');

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  }, []);

  const translate = useCallback((key: string, params?: Record<string, string | number>) => {
    return t(key, lang, params);
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('app.title', lang);
  }, [lang]);

  return { lang, setLang, toggleLang, t: translate };
}
