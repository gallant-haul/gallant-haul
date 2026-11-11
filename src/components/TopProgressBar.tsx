import React, { useEffect, useState } from 'react';
import { useRouter } from '../context/RouterContext';

export default function TopProgressBar() {
  const { path } = useRouter();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // When path changes, start loading progress animation
    setIsVisible(true);
    setProgress(25);

    const step1 = setTimeout(() => {
      setProgress(75);
    }, 120);

    const step2 = setTimeout(() => {
      setProgress(100);
    }, 280);

    const finish = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(finish);
    };
  }, [path]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(13,148,136,0.9)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  );
}
