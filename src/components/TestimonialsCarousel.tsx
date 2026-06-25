import React, { useState, useEffect, useRef } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  location: string;
  rating: number;
  comment: string;
}

export const TestimonialsCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const autoplayTimer = useRef<any>(null);

  const testimonials: Testimonial[] = [
    {
      name: 'أحمد الخفاجي',
      role: 'مبرمج تطبيقات',
      location: 'بغداد',
      rating: 5,
      comment: 'أول مرة أتعامل مع جهة تفعّل الاشتراك قبل الدفع. تم تفعيل اشتراك Google AI Pro على حسابي أولاً وقمت بالدفع محلياً بعد التأكد من وصول الخدمة.'
    },
    {
      name: 'مريم الجبوري',
      role: 'طالبة ماجستير',
      location: 'الموصل',
      rating: 5,
      comment: 'الخدمة سريعة جداً والاشتراك وصل لحسابي مباشرة، وقمت بتحويل المبلغ عبر زين كاش بعد التأكد من تفعيل Gemini Advanced.'
    },
    {
      name: 'سيف الدين علي',
      role: 'مصمم واجهات UI/UX',
      location: 'أربيل',
      rating: 5,
      comment: 'فكرة التفعيل أولاً ثم الدفع ممتازة وتزيل أي شك أو تردد. الاشتراك رسمي 100% وتم التفعيل في حسابي الشخصي قبل أن أحول أي دينار.'
    },
    {
      name: 'زينب الربيعي',
      role: 'صانعة محتوى رقمي',
      location: 'البصرة',
      rating: 5,
      comment: 'أنصح باشتراك الـ 12 شهراً، هو الأوفر والدفع محلي بالزين كاش وهو ما يحل مشكلة كبيرة جداً لعدم توفر الفيزا كارد بسهولة في العراق.'
    },
    {
      name: 'مصطفى كمال',
      role: 'صاحب مشروع تجاري',
      location: 'النجف',
      rating: 5,
      comment: 'تفعيل سريع جداً وحساب شخصي بالكامل وليس حساباً مشتركاً. هذا يضمن خصوصية ملفات عملي وعملائي ولا أحد يمكنه الاطلاع عليها.'
    },
    {
      name: 'فاطمة البغدادي',
      role: 'كاتبة ومترجمة حرة',
      location: 'بغداد',
      rating: 5,
      comment: 'أفضل خدمة بيع اشتراكات ذكاء اصطناعي في العراق. الدعم متواجد دائماً للإجابة على أي استفسار، والتفعيل رسمي ويقبل التجديد.'
    },
    {
      name: 'علي الحلفي',
      role: 'مهندس برمجيات',
      location: 'الناصرية',
      rating: 5,
      comment: 'استخدمه لكتابة السكربتات ومساعدتي في البرمجة باللغات المعقدة. أداة جبارة وتفعيل ممتاز بدون الحاجة لأي VPN أو بروكسي.'
    },
    {
      name: 'نور الهدى',
      role: 'مصممة جرافيك وسوشيال ميديا',
      location: 'كربلاء',
      rating: 5,
      comment: 'شكراً لكم على هذه الخدمة الرائعة. التفعيل تم على حسابي الشخصي ولم أحتاج إلى تغيير أي إعدادات، وصناعة الصور بجودة خارقة!'
    },
    {
      name: 'حيدر الكعبي',
      role: 'مطور واجهات ويب',
      location: 'الحلة',
      rating: 5,
      comment: 'أفضل قيمة مقابل السعر في السوق العراقي. خدمة عملاء ممتازة ومتابعة مستمرة حتى بعد إتمام عملية الدفع والتفعيل.'
    },
    {
      name: 'سارة التميمي',
      role: 'أخصائية تسويق رقمي',
      location: 'السليمانية',
      rating: 5,
      comment: 'توفير الدفع المحلي عبر زين كاش أو آسيا حوالة حل مشكلتنا، التفعيل رسمي ومباشر على البريد. تجربة رائعة وسأقوم بالتجديد بكل تأكيد.'
    }
  ];

  // Track responsive screen size and adjust items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = testimonials.length - itemsPerPage;

  // Ensure active index is within bounds if screen size changes
  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(Math.max(0, maxIndex));
    }
  }, [itemsPerPage, maxIndex, activeIndex]);

  // Autoplay function
  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);
  };

  const stopAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [maxIndex]);

  const handlePrev = () => {
    stopAutoplay();
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    startAutoplay();
  };

  const handleNext = () => {
    stopAutoplay();
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    startAutoplay();
  };

  const handleDotClick = (index: number) => {
    stopAutoplay();
    setActiveIndex(index);
    startAutoplay();
  };

  // Calculate sliding offsets in RTL
  const gap = 24; // 24px gap
  const offset = activeIndex * (100 / itemsPerPage);
  const gapOffset = activeIndex * (gap - gap / itemsPerPage);

  const trackStyle: React.CSSProperties = {
    transform: `translateX(calc(${offset}% + ${gapOffset}px))`,
  };

  // Total dots to show (one for each slide step)
  const totalDots = maxIndex + 1;

  return (
    <div className="testimonial-carousel-container" onMouseEnter={stopAutoplay} onMouseLeave={startAutoplay}>
      
      {/* Navigation Buttons */}
      <button 
        className="carousel-btn carousel-btn-prev" 
        onClick={handlePrev} 
        aria-label="التقييم السابق"
        title="التقييم السابق"
      >
        <ChevronRight size={22} />
      </button>

      <button 
        className="carousel-btn carousel-btn-next" 
        onClick={handleNext} 
        aria-label="التقييم التالي"
        title="التقييم التالي"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Track Wrapper */}
      <div className="testimonial-carousel-track-wrapper">
        <div className="testimonial-carousel-track" style={trackStyle}>
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-slide">
              <div className="testimonial-card">
                <Quote 
                  size={44} 
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '20px',
                    opacity: 0.04,
                    color: 'var(--secondary)',
                    pointerEvents: 'none'
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  {/* Rating stars */}
                  <div className="flex gap-1 mb-3.5" style={{ color: '#fbbf24' }}>
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="#fbbf24" strokeWidth={0} />
                    ))}
                  </div>
                  
                  {/* Review Comment */}
                  <p 
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      lineHeight: '1.75',
                      marginBottom: '20px',
                    }}
                  >
                    "{t.comment}"
                  </p>
                </div>
                
                {/* Author details */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '12px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', marginBottom: '3px' }}>
                    {t.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t.role} • <span style={{ color: 'var(--secondary)' }}>{t.location}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {totalDots > 1 && (
        <div className="carousel-dots">
          {[...Array(totalDots)].map((_, idx) => (
            <button
              key={idx}
              className={`carousel-dot ${activeIndex === idx ? 'active' : ''}`}
              onClick={() => handleDotClick(idx)}
              aria-label={`الانتقال إلى المجموعة ${idx + 1}`}
              title={`الانتقال إلى المجموعة ${idx + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default TestimonialsCarousel;
