import React, { useEffect, useState } from 'react';

interface StatsCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export const StatsCounter: React.FC<StatsCounterProps> = ({
  target,
  duration = 2000,
  suffix = '',
  prefix = ''
}) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressPercentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progressPercentage * (2 - progressPercentage);
      
      const currentValue = Math.floor(startValue + easeProgress * (target - startValue));
      setCount(currentValue);

      if (progressPercentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return (
    <span className="number-latin">
      {prefix}
      {count.toLocaleString('en-US')}
      {suffix}
    </span>
  );
};
export default StatsCounter;
