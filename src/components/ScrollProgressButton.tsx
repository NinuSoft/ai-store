import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollProgressButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const circumference = 2 * Math.PI * 18; // radius = 18 -> ~113.1

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight > 0) {
        const progress = (scrollTop / docHeight) * 100;
        setScrollProgress(progress);
      }

      if (scrollTop > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-progress-btn ${isVisible ? 'visible' : ''}`}
      aria-label="الرجوع للأعلى"
      title="الرجوع للأعلى"
    >
      <svg className="scroll-progress-circle-svg" viewBox="0 0 44 44">
        <defs>
          <linearGradient id="scroll-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>
        <circle
          className="scroll-progress-circle-bg"
          cx="22"
          cy="22"
          r="18"
        />
        <circle
          className="scroll-progress-circle-fill"
          cx="22"
          cy="22"
          r="18"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <ArrowUp size={20} style={{ position: 'relative', zIndex: 2 }} />
    </button>
  );
};

export default ScrollProgressButton;
