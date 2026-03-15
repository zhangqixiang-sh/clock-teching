import { useState, useRef, useEffect, useCallback } from 'react';
import { Clock } from './Clock';
import type { ClockRef } from './Clock';

interface LearnModuleProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  soundManager: { click: () => void };
}

const TOTAL_STEPS = 5;

export const LearnModule: React.FC<LearnModuleProps> = ({ t, soundManager }) => {
  const [step, setStep] = useState(0);
  const clockRef = useRef<ClockRef>(null);
  const animTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const rafRunningRef = useRef(false);

  const clearAnimations = useCallback(() => {
    if (animTimerRef.current) {
      clearInterval(animTimerRef.current);
      animTimerRef.current = null;
    }
    rafRunningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    clockRef.current?.stopRealtime();
    clockRef.current?.setDragging(false);
  }, []);

  const runStepAnimation = useCallback((currentStep: number) => {
    clearAnimations();
    clockRef.current?.clearHighlights();

    const hourGroup = clockRef.current?.hourGroup;
    const minuteGroup = clockRef.current?.minuteGroup;
    const secondGroup = clockRef.current?.secondGroup;

    switch (currentStep) {
      case 0: // Clock face - highlight numbers sequentially
        clockRef.current?.setTime(3, 0, 0);
        let numIdx = 0;
        animTimerRef.current = window.setInterval(() => {
          clockRef.current?.highlightNumber(numIdx);
          numIdx = (numIdx + 1) % 12;
        }, 600);
        break;

      case 1: // Hour hand — continuous rotation demo (requestAnimationFrame)
        clockRef.current?.setTime(3, 0, 0);
        clockRef.current?.highlight('hour');
        clockRef.current?.setDragging(true);
        {
          const H_START = 90; // 3 o'clock = 90°
          const H_SPEED = 20; // °/s for hour hand
          let startTime: number | null = null;
          rafRunningRef.current = true;
          const animate = (timestamp: number) => {
            if (!rafRunningRef.current) return;
            if (!startTime) startTime = timestamp;
            const elapsed = (timestamp - startTime) / 1000;
            const hProgress = (elapsed * H_SPEED) % 360;
            const hAngle = H_START + hProgress;
            const mAngle = hProgress * 12; // minute hand 12x faster
            if (hourGroup) {
              hourGroup.style.transform = `rotate(${hAngle}deg)`;
            }
            if (minuteGroup) {
              minuteGroup.style.transform = `rotate(${mAngle}deg)`;
            }
            rafRef.current = requestAnimationFrame(animate);
          };
          rafRef.current = requestAnimationFrame(animate);
        }
        break;

      case 2: // Minute hand — one full smooth rotation (requestAnimationFrame)
        clockRef.current?.setTime(12, 0, 0);
        clockRef.current?.highlight('minute');
        clockRef.current?.setDragging(true);
        {
          const M_SPEED = 50; // °/s for minute hand
          let startTime: number | null = null;
          rafRunningRef.current = true;
          const animate = (timestamp: number) => {
            if (!rafRunningRef.current) return;
            if (!startTime) startTime = timestamp;
            const elapsed = (timestamp - startTime) / 1000;
            // Don't modulo mAngle - allow continuous rotation for smooth hour hand movement
            const mAngle = elapsed * M_SPEED;
            if (minuteGroup) {
              minuteGroup.style.transform = `rotate(${mAngle}deg)`;
            }
            if (hourGroup) {
              hourGroup.style.transform = `rotate(${mAngle / 12}deg)`;
            }
            rafRef.current = requestAnimationFrame(animate);
          };
          rafRef.current = requestAnimationFrame(animate);
        }
        break;

      case 3: // Second hand - realtime
        {
          const now = new Date();
          clockRef.current?.setTime(now.getHours(), now.getMinutes(), now.getSeconds());
          clockRef.current?.highlight('second');
          clockRef.current?.startRealtime();
        }
        break;

      case 4: // Time relationships — fast-forward demo (requestAnimationFrame)
        clockRef.current?.setTime(12, 0, 0);
        clockRef.current?.clearHighlights();
        clockRef.current?.setDragging(true);
        {
          const SEC_SPEED = 400;       // °/s
          const MIN_SPEED = 6.667;     // °/s
          let startTime: number | null = null;
          rafRunningRef.current = true;
          const animate = (timestamp: number) => {
            if (!rafRunningRef.current) return;
            if (!startTime) startTime = timestamp;
            const elapsed = (timestamp - startTime) / 1000;
            const secA = (elapsed * SEC_SPEED) % 360;
            const minA = elapsed * MIN_SPEED;
            const hourA = minA / 12;
            if (secondGroup) {
              secondGroup.style.transform = `rotate(${secA}deg)`;
            }
            if (minuteGroup) {
              minuteGroup.style.transform = `rotate(${minA}deg)`;
            }
            if (hourGroup) {
              hourGroup.style.transform = `rotate(${hourA}deg)`;
            }
            if (minA >= 360) {
              rafRunningRef.current = false;
              return;
            }
            rafRef.current = requestAnimationFrame(animate);
          };
          rafRef.current = requestAnimationFrame(animate);
        }
        break;
    }
  }, [clearAnimations]);

  useEffect(() => {
    runStepAnimation(step);
    return () => clearAnimations();
  }, [step, runStepAnimation, clearAnimations]);

  const goToStep = (newStep: number) => {
    soundManager.click();
    if (newStep >= 0 && newStep < TOTAL_STEPS) {
      setStep(newStep);
    }
  };

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < TOTAL_STEPS; i++) {
      dots.push(
        <div
          key={i}
          className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
          onClick={() => goToStep(i)}
        />
      );
    }
    return dots;
  };

  return (
    <section className="module active" id="module-learn">
      <div className="step-dots">{renderDots()}</div>
      <div className="learn-layout">
        <div className="learn-clock-wrap">
          <Clock
            ref={clockRef}
            interactive={false}
            showSecond={true}
            hours={3}
            minutes={0}
            seconds={0}
          />
        </div>
        <div className="learn-content">
          <div className="learn-card">
            <h2>{t(`learn.s${step + 1}.title`)}</h2>
            <p>{t(`learn.s${step + 1}.text`)}</p>
          </div>
          <div className="learn-nav">
            <button
              className="btn btn-secondary"
              disabled={step === 0}
              onClick={() => goToStep(step - 1)}
            >
              {t('learn.prev')}
            </button>
            <button
              className="btn btn-primary"
              disabled={step === TOTAL_STEPS - 1}
              onClick={() => goToStep(step + 1)}
            >
              {t('learn.next')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
