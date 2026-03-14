import { useState, useCallback } from 'react';

export function useFeedback() {
  const [feedback, setFeedback] = useState<{ emoji: string; show: boolean }>({
    emoji: '',
    show: false,
  });

  const showFeedback = useCallback((emoji: string, duration = 800) => {
    setFeedback({ emoji, show: true });
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, show: false }));
    }, duration);
  }, []);

  return { feedback, showFeedback };
}

export const FeedbackOverlay: React.FC<{ feedback: { emoji: string; show: boolean } }> = ({ feedback }) => {
  return (
    <div
      id="feedback-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        pointerEvents: 'none',
        opacity: feedback.show ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
    >
      <div
        className="feedback-content"
        style={{
          fontSize: '72px',
          animation: feedback.show ? 'feedbackPop 0.6s ease-out' : 'none',
        }}
      >
        {feedback.emoji}
      </div>
    </div>
  );
};

export function spawnStars(x: number, y: number, count = 5) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star-particle';
    star.textContent = '⭐';
    star.style.cssText = `
      position: fixed;
      font-size: 32px;
      pointer-events: none;
      z-index: 300;
      left: ${x + (Math.random() - 0.5) * 100}px;
      top: ${y + (Math.random() - 0.5) * 60}px;
      animation: starFloat 1s ease-out forwards;
      animation-delay: ${Math.random() * 0.3}s;
    `;
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 1500);
  }
}
