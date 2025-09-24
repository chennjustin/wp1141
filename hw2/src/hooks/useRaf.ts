import { useEffect, useRef } from 'react';

export function useRaf(cb: () => void, active: boolean) {
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const loop = () => { cb(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [cb, active]);
}


