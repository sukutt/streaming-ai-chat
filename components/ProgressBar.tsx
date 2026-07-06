'use client';
import { useEffect, useRef, useState } from 'react';

const TAU = 4000; // ms — asymptotic time constant

export function ProgressBar({ stage, ratio, completed }: { stage: string; ratio: number; completed: boolean }) {
  const [display, setDisplay] = useState(0);
  const floorRef = useRef(0);
  const baseRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => { floorRef.current = Math.max(floorRef.current, ratio); }, [ratio]);

  useEffect(() => {
    let raf = 0;
    if (completed) {
      const from = display; const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min((t - t0) / 300, 1);
        setDisplay(from + (1 - from) * k);
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
    baseRef.current = display; startRef.current = performance.now();
    const tick = (t: number) => {
      const dt = t - startRef.current;
      const target = Math.min(0.98, Math.max(floorRef.current, baseRef.current + (0.98 - baseRef.current) * (1 - Math.exp(-dt / TAU))));
      setDisplay(target);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratio, completed]);

  return (
    <div className="mt-3 w-full max-w-sm">
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>{completed ? 'Done' : stage}</span><span>{Math.round(display * 100)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600 transition-none" style={{ width: `${display * 100}%` }} />
      </div>
    </div>
  );
}
