// 类型定义

export type Language = 'zh' | 'en';

export interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ClockOptions {
  interactive?: boolean;
  showSecond?: boolean;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export type HandType = 'hour' | 'minute' | 'second' | null;

export type Difficulty = 'medium' | 'hard' | 'expert' | 'minute';

export type QuizMode = 'A' | 'B'; // A = read clock, B = set clock

export type QuizState = 'setup' | 'playing' | 'summary';

export interface Question {
  h: number;
  m: number;
}

export type ModuleType = 'learn' | 'practice' | 'quiz';

export interface SoundManager {
  tick: () => void;
  correct: () => void;
  wrong: () => void;
  fanfare: () => void;
  click: () => void;
}
