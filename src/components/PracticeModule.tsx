import { useState, useRef, useCallback } from 'react';
import { Clock } from './Clock';
import type { ClockRef } from './Clock';
import type { TimeState } from '../types';
import { formatTimeDigital, formatTimeWords } from '../utils';

interface PracticeModuleProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  soundManager: { click: () => void };
  lang: 'zh' | 'en';
}

export const PracticeModule: React.FC<PracticeModuleProps> = ({ t, soundManager, lang }) => {
  const [time, setTime] = useState<TimeState>({ hours: 12, minutes: 0, seconds: 0 });
  const [snapTo5, setSnapTo5] = useState(true);
  const clockRef = useRef<ClockRef>(null);

  const handleTimeChange = useCallback((newTime: TimeState) => {
    setTime(newTime);
  }, []);

  const handleReset = () => {
    soundManager.click();
    clockRef.current?.setTime(12, 0, 0);
  };

  const handleNow = () => {
    soundManager.click();
    const now = new Date();
    clockRef.current?.setTime(now.getHours(), now.getMinutes(), 0);
  };

  const handleSnapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundManager.click();
    setSnapTo5(e.target.checked);
  };

  return (
    <section className="module active" id="module-practice">
      <div className="practice-layout">
        <div id="practice-clock-wrap">
          <Clock
            ref={clockRef}
            interactive={true}
            showSecond={false}
            hours={12}
            minutes={0}
            snapTo5={snapTo5}
            onTimeChange={handleTimeChange}
          />
        </div>
        <div className="practice-info">
          <div className="digital-time">{formatTimeDigital(time.hours, time.minutes)}</div>
          <div className="time-words">{formatTimeWords(time.hours, time.minutes, lang)}</div>
          <div className="practice-buttons">
            <button className="btn btn-secondary" onClick={handleReset}>
              {t('practice.reset')}
            </button>
            <button className="btn btn-primary" onClick={handleNow}>
              {t('practice.now')}
            </button>
          </div>
          <label className="snap-toggle">
            <input
              type="checkbox"
              className="snap-check"
              checked={snapTo5}
              onChange={handleSnapChange}
            />
            <span>{t('practice.snap')}</span>
          </label>
        </div>
      </div>
    </section>
  );
};
