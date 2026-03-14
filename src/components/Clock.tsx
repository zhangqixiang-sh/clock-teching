import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { TimeState, ClockOptions, HandType } from '../types';

interface ClockProps extends ClockOptions {
  onTimeChange?: (time: TimeState) => void;
  snapTo5?: boolean;
  highlightedHand?: HandType;
  highlightedNumber?: number;
  dragging?: boolean;
}

export interface ClockRef {
  setTime: (h: number, m: number, s?: number) => void;
  getTime: () => TimeState;
  setDragging: (dragging: boolean) => void;
  highlight: (hand: HandType) => void;
  highlightNumber: (index: number | null) => void;
  clearHighlights: () => void;
  startRealtime: () => void;
  stopRealtime: () => void;
  // Expose hand groups for direct DOM manipulation in animations
  hourGroup: SVGGElement | null;
  minuteGroup: SVGGElement | null;
  secondGroup: SVGGElement | null;
}

export const Clock = forwardRef<ClockRef, ClockProps>(({
  interactive = false,
  showSecond = true,
  hours = 12,
  minutes = 0,
  seconds = 0,
  onTimeChange,
  snapTo5 = true,
  highlightedHand,
  highlightedNumber,
  dragging: externalDragging = false,
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const stateRef = useRef<TimeState>({ hours, minutes, seconds });
  const realtimeIntervalRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const totalDeltaRef = useRef(0);
  const startHoursRef = useRef(0);
  const startMinutesRef = useRef(0);
  const snapEnabledRef = useRef(snapTo5);
  const numberRefs = useRef<(SVGTextElement | null)[]>([]);
  const hourGroupRef = useRef<SVGGElement>(null);
  const minuteGroupRef = useRef<SVGGElement>(null);
  const secondGroupRef = useRef<SVGGElement>(null);
  const filterIdRef = useRef('clockShadow_' + Math.random().toString(36).slice(2));

  const cx = 200;
  const cy = 200;

  // Update hands position - using the same logic as the single page app
  const updateHands = useCallback((animate: boolean) => {
    const state = stateRef.current;
    const sAngle = (state.seconds * 6) % 360;
    // Don't modulo minute angle to allow 360° for smooth clockwise snap animation
    const mAngle = state.minutes * 6 + state.seconds * 0.1;
    // Continuous hour angle: don't modulo 12, allow smooth rotation across 12-hour boundaries
    const hAngle = state.hours * 30 + state.minutes * 0.5;

    if (hourGroupRef.current) {
      hourGroupRef.current.style.transform = `rotate(${hAngle}deg)`;
      hourGroupRef.current.style.transition = animate ? 'transform 0.3s ease-out' : 'none';
    }
    if (minuteGroupRef.current) {
      minuteGroupRef.current.style.transform = `rotate(${mAngle}deg)`;
      minuteGroupRef.current.style.transition = animate ? 'transform 0.3s ease-out' : 'none';
    }
    if (secondGroupRef.current) {
      secondGroupRef.current.style.transform = `rotate(${sAngle}deg)`;
      secondGroupRef.current.style.transition = animate ? 'transform 0.3s ease-out' : 'none';
    }
  }, []);

  const setTime = useCallback((h: number, m: number, s?: number) => {
    // Allow hours to be any value (including negative) for continuous rotation
    // Only normalize for display purposes, preserve full value for angle calculation
    stateRef.current = {
      hours: h,
      minutes: m,
      seconds: s ?? 0
    };
    updateHands(true);
    onTimeChange?.(stateRef.current);
  }, [updateHands, onTimeChange]);

  const getTime = useCallback(() => {
    return { ...stateRef.current };
  }, []);

  const setDragging = useCallback((isDragging: boolean) => {
    if (hourGroupRef.current) {
      hourGroupRef.current.classList.toggle('dragging', isDragging);
    }
    if (minuteGroupRef.current) {
      minuteGroupRef.current.classList.toggle('dragging', isDragging);
    }
    if (secondGroupRef.current) {
      secondGroupRef.current.classList.toggle('dragging', isDragging);
    }
  }, []);

  const highlight = useCallback((hand: HandType) => {
    const hands = [hourGroupRef.current, minuteGroupRef.current, secondGroupRef.current];
    hands.forEach(g => {
      if (g) {
        g.classList.remove('highlighted', 'dimmed');
      }
    });
    if (!hand) return;

    const map = { hour: hourGroupRef.current, minute: minuteGroupRef.current, second: secondGroupRef.current };
    const target = map[hand];
    if (target) {
      target.classList.add('highlighted');
      Object.entries(map).forEach(([k, g]) => {
        if (g && k !== hand) g.classList.add('dimmed');
      });
    }
  }, []);

  const highlightNumber = useCallback((index: number | null) => {
    numberRefs.current.forEach((el, i) => {
      if (el) {
        el.setAttribute('fill', i === index ? 'var(--color-accent)' : 'var(--color-clock-rim)');
        el.setAttribute('font-size', i === index ? '34' : '28');
      }
    });
  }, []);

  const clearHighlights = useCallback(() => {
    highlight(null);
    numberRefs.current.forEach(el => {
      if (el) {
        el.setAttribute('fill', 'var(--color-clock-rim)');
        el.setAttribute('font-size', '28');
      }
    });
  }, [highlight]);

  const startRealtime = useCallback(() => {
    stopRealtime();
    realtimeIntervalRef.current = window.setInterval(() => {
      stateRef.current.seconds++;
      if (stateRef.current.seconds >= 60) {
        stateRef.current.seconds = 0;
        stateRef.current.minutes++;
        if (stateRef.current.minutes >= 60) {
          stateRef.current.minutes = 0;
          stateRef.current.hours = (stateRef.current.hours + 1) % 24;
        }
      }
      updateHands(false);
    }, 1000);
  }, [updateHands]);

  const stopRealtime = useCallback(() => {
    if (realtimeIntervalRef.current) {
      clearInterval(realtimeIntervalRef.current);
      realtimeIntervalRef.current = null;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    setTime,
    getTime,
    setDragging,
    highlight,
    highlightNumber,
    clearHighlights,
    startRealtime,
    stopRealtime,
    // Expose hand group refs for direct DOM manipulation
    get hourGroup() { return hourGroupRef.current; },
    get minuteGroup() { return minuteGroupRef.current; },
    get secondGroup() { return secondGroupRef.current; },
  }), [setTime, getTime, setDragging, highlight, highlightNumber, clearHighlights, startRealtime, stopRealtime]);

  // Initialize time
  useEffect(() => {
    setTime(hours, minutes, seconds);
  }, []);

  // Update snap setting
  useEffect(() => {
    snapEnabledRef.current = snapTo5;
  }, [snapTo5]);

  // Handle external highlights
  useEffect(() => {
    if (highlightedHand !== undefined) {
      highlight(highlightedHand);
    }
  }, [highlightedHand, highlight]);

  useEffect(() => {
    if (highlightedNumber !== undefined) {
      highlightNumber(highlightedNumber);
    }
  }, [highlightedNumber, highlightNumber]);

  useEffect(() => {
    setDragging(externalDragging);
  }, [externalDragging, setDragging]);

  // Touch controller for interactive mode - matching single page app logic
  useEffect(() => {
    if (!interactive || !svgRef.current) return;

    const svg = svgRef.current;
    let touchArea: SVGCircleElement | null = svg.querySelector('.touch-area');

    if (!touchArea) return;

    const getAngle = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      let angle = Math.atan2(dx, -dy) * 180 / Math.PI;
      if (angle < 0) angle += 360;
      return angle;
    };

    const getDistance = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return Math.sqrt((clientX - centerX) ** 2 + (clientY - centerY) ** 2) / (rect.width / 2);
    };

    const onStart = (clientX: number, clientY: number) => {
      const dist = getDistance(clientX, clientY);
      if (dist < 0.15 || dist > 1.05) return;
      isDraggingRef.current = true;
      lastAngleRef.current = getAngle(clientX, clientY);
      totalDeltaRef.current = 0;

      // Disable CSS transitions first so normalization is invisible
      setDragging(true);

      // Normalize hours/minutes to standard ranges to prevent
      // unbounded growth of angle values over many drag operations.
      const time = stateRef.current;
      const totalMin = time.hours * 60 + time.minutes;
      startHoursRef.current = Math.floor(totalMin / 60);
      startMinutesRef.current = totalMin - startHoursRef.current * 60;
      // Apply normalized values (no visual jump since transitions are disabled)
      setTime(startHoursRef.current, startMinutesRef.current, 0);

      if (touchArea) touchArea.style.cursor = 'grabbing';
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      const newAngle = getAngle(clientX, clientY);
      let delta = newAngle - lastAngleRef.current;

      // Handle crossing 0/360 boundary
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      totalDeltaRef.current += delta;

      // Only update minutes from drag; keep hours fixed at startHours.
      // The hour hand position is naturally derived via hAngle = hours*30 + minutes*0.5
      // so it advances correctly (30° per full minute-hand rotation).
      const currentMinutes = startMinutesRef.current + totalDeltaRef.current / 6;
      setTime(startHoursRef.current, currentMinutes, 0);
      lastAngleRef.current = newAngle;
    };

    const onEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (touchArea) touchArea.style.cursor = 'grab';

      // Compute continuous (non-wrapped) minutes from the drag
      const rawMinutes = startMinutesRef.current + totalDeltaRef.current / 6;
      let finalMinutes = rawMinutes;

      // Snap to nearest 5-minute mark using continuous value.
      // This keeps the snapped angle within ±15° of the current angle,
      // ensuring a smooth CSS transition with no wild spinning.
      if (snapEnabledRef.current) {
        finalMinutes = Math.round(rawMinutes / 5) * 5;
      }

      // Re-enable transitions for the snap animation, then set time.
      // Hours stay at startHours; the hour hand is positioned correctly
      // via the formula hAngle = hours*30 + minutes*0.5.
      setDragging(false);
      setTime(startHoursRef.current, finalMinutes, 0);
    };

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      onStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      onMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      onEnd();
    };

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      onStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      onMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      onEnd();
    };

    touchArea.addEventListener('touchstart', handleTouchStart, { passive: false });
    touchArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    touchArea.addEventListener('touchend', handleTouchEnd, { passive: false });
    touchArea.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      touchArea?.removeEventListener('touchstart', handleTouchStart);
      touchArea?.removeEventListener('touchmove', handleTouchMove);
      touchArea?.removeEventListener('touchend', handleTouchEnd);
      touchArea?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interactive, setDragging, setTime]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopRealtime();
    };
  }, [stopRealtime]);

  // Render tick marks
  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const isHour = i % 5 === 0;
      const r1 = isHour ? 160 : 168;
      const r2 = 175;
      const rad = angle * Math.PI / 180;
      const x1 = cx + r1 * Math.sin(rad);
      const y1 = cy - r1 * Math.cos(rad);
      const x2 = cx + r2 * Math.sin(rad);
      const y2 = cy - r2 * Math.cos(rad);
      ticks.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={isHour ? 'var(--color-clock-rim)' : '#CCC'}
          strokeWidth={isHour ? 3 : 1.5}
          strokeLinecap="round"
        />
      );
    }
    return ticks;
  };

  // Render numbers
  const renderNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= 12; i++) {
      const angle = i * 30;
      const rad = angle * Math.PI / 180;
      const r = 145;
      const x = cx + r * Math.sin(rad);
      const y = cy - r * Math.cos(rad);
      numbers.push(
        <text
          key={i}
          ref={el => { numberRefs.current[i - 1] = el; }}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="28"
          fontWeight="700"
          fontFamily="-apple-system, PingFang SC, Helvetica Neue, sans-serif"
          fill="var(--color-clock-rim)"
          className="clock-number"
        >
          {i}
        </text>
      );
    }
    return numbers;
  };

  return (
    <div className="clock-container">
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="clock-svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <filter id={filterIdRef.current} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="3" result="shadow" />
            <feFlood floodColor="rgba(0,0,0,0.12)" />
            <feComposite in2="shadow" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Clock face background */}
        <circle
          cx={cx}
          cy={cy}
          r={190}
          fill="#FFF"
          stroke="#E0E0E0"
          strokeWidth={2}
          filter={`url(#${filterIdRef.current})`}
        />

        {/* Rim */}
        <circle
          cx={cx}
          cy={cy}
          r={185}
          fill="var(--color-clock-face)"
          stroke="var(--color-clock-rim)"
          strokeWidth={5}
        />

        {/* Inner decorative circle */}
        <circle
          cx={cx}
          cy={cy}
          r={178}
          fill="none"
          stroke="#F0F0F0"
          strokeWidth={1}
        />

        {/* Tick marks */}
        <g className="ticks">{renderTicks()}</g>

        {/* Numbers */}
        <g className="numbers">{renderNumbers()}</g>

        {/* Hour hand */}
        <g
          ref={hourGroupRef}
          className="clock-hand hour-hand"
          style={{ color: 'var(--color-hour)', transformOrigin: `${cx}px ${cy}px` }}
        >
          <line
            x1={cx}
            y1={cy + 20}
            x2={cx}
            y2={cy - 95}
            stroke="var(--color-hour)"
            strokeWidth={10}
            strokeLinecap="round"
          />
        </g>

        {/* Minute hand */}
        <g
          ref={minuteGroupRef}
          className="clock-hand minute-hand"
          style={{ color: 'var(--color-minute)', transformOrigin: `${cx}px ${cy}px` }}
        >
          <line
            x1={cx}
            y1={cy + 20}
            x2={cx}
            y2={cy - 135}
            stroke="var(--color-minute)"
            strokeWidth={7}
            strokeLinecap="round"
          />
        </g>

        {/* Second hand */}
        {showSecond && (
          <g
            ref={secondGroupRef}
            className="clock-hand second-hand"
            style={{ color: 'var(--color-second)', transformOrigin: `${cx}px ${cy}px` }}
          >
            <line
              x1={cx}
              y1={cy + 30}
              x2={cx}
              y2={cy - 150}
              stroke="var(--color-second)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={8} fill="var(--color-clock-rim)" />
        <circle cx={cx} cy={cy} r={4} fill="#FFF" />

        {/* Touch area */}
        {interactive && (
          <circle
            className="touch-area"
            cx={cx}
            cy={cy}
            r={190}
            fill="transparent"
            style={{ cursor: 'grab', touchAction: 'none' }}
          />
        )}
      </svg>
    </div>
  );
});

Clock.displayName = 'Clock';
