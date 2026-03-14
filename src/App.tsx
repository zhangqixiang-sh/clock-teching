import { useState, useEffect, useCallback } from 'react';
import { LearnModule, PracticeModule, QuizModule } from './components';
import { useLanguage, useSoundManager } from './hooks';
import type { ModuleType } from './types';

function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('learn');
  const { lang, toggleLang, t } = useLanguage();
  const { soundEnabled, toggleSound, soundManager } = useSoundManager();

  const switchModule = useCallback((module: ModuleType) => {
    soundManager.click();
    setCurrentModule(module);
  }, [soundManager]);

  const unlockAudio = useCallback(() => {
    // Audio context will be created on first interaction
    const handler = () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
    document.addEventListener('touchstart', handler, { once: true } as any);
    document.addEventListener('click', handler, { once: true });
  }, []);

  useEffect(() => {
    unlockAudio();
  }, [unlockAudio]);

  return (
    <>
      {/* Navigation */}
      <nav id="topbar">
        <div className="app-title">{t('app.title')}</div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${currentModule === 'learn' ? 'active' : ''}`}
            onClick={() => switchModule('learn')}
          >
            {t('nav.learn')}
          </button>
          <button
            className={`nav-tab ${currentModule === 'practice' ? 'active' : ''}`}
            onClick={() => switchModule('practice')}
          >
            {t('nav.practice')}
          </button>
          <button
            className={`nav-tab ${currentModule === 'quiz' ? 'active' : ''}`}
            onClick={() => switchModule('quiz')}
          >
            {t('nav.quiz')}
          </button>
        </div>
        <div className="nav-right">
          <button
            className="sound-btn"
            onClick={() => {
              toggleSound();
              if (soundEnabled) soundManager.click();
            }}
            title="Sound"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <div className="lang-toggle">
            <span className={lang === 'zh' ? 'active-lang' : ''}>中</span>
            <div
              className={`lang-switch ${lang === 'en' ? 'en' : ''}`}
              onClick={() => {
                soundManager.click();
                toggleLang();
              }}
            ></div>
            <span className={lang === 'en' ? 'active-lang' : ''}>EN</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="app">
        {currentModule === 'learn' && <LearnModule t={t} soundManager={soundManager} />}
        {currentModule === 'practice' && <PracticeModule t={t} soundManager={soundManager} lang={lang} />}
        {currentModule === 'quiz' && <QuizModule t={t} soundManager={soundManager} lang={lang} />}
      </main>
    </>
  );
}

export default App;
