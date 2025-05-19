import React, { useEffect, useState, useRef } from 'react';

/**
 * Hook to detect when an element is visible in viewport
 */
export const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(([entry]) => {
      // Once it's in view, keep it that way
      if (entry.isIntersecting && !isInView) {
        setIsInView(true);
        if (options.once !== false) {
          observer.unobserve(currentRef);
        }
      } else if (!entry.isIntersecting && !options.once) {
        setIsInView(false);
      }
    }, {
      threshold: options.threshold || 0.15,
      rootMargin: options.rootMargin || '0px',
    });

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin, options.once, isInView]);

  return [ref, isInView];
};

/**
 * AnimatedElement component for fade/slide/scale in animations
 */
export const AnimatedElement = ({ 
  children, 
  animation = 'fade-up',
  duration = 800,
  delay = 0,
  threshold = 0.15,
  className = '',
  once = true,
  ...props 
}) => {
  const [ref, isInView] = useInView({ threshold, once });
  
  // Define animation classes
  const getAnimationClass = () => {
    if (!isInView) return 'opacity-0';
    
    return 'opacity-100 transform-none';
  };
  
  const getInitialStyles = () => {
    let transform = '';
    if (animation.includes('fade-up')) transform += 'translateY(40px) ';
    if (animation.includes('fade-down')) transform += 'translateY(-40px) ';
    if (animation.includes('fade-left')) transform += 'translateX(40px) ';
    if (animation.includes('fade-right')) transform += 'translateX(-40px) ';
    if (animation.includes('scale')) transform += 'scale(0.9) ';
    
    return {
      opacity: isInView ? 1 : 0,
      transform: isInView ? 'none' : transform,
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      transitionDelay: `${delay}ms`,
    };
  };

  return (
    <div 
      ref={ref} 
      className={className}
      style={getInitialStyles()}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Floating animation component
 */
export const FloatingElement = ({ 
  children, 
  className = '',
  delay = 0,
  amplitude = 10, // px to move
  period = 3, // seconds for one full cycle
  ...props 
}) => {
  const [style, setStyle] = useState({});
  
  useEffect(() => {
    setStyle({
      animation: `floating-animation ${period}s ease-in-out infinite`,
      animationDelay: `${delay}ms`,
    });
  }, [period, delay]);
  
  return (
    <div 
      className={className}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export const addKeyframes = () => {
  // Only add these once
  if (!document.getElementById('animation-keyframes')) {
    const style = document.createElement('style');
    style.id = 'animation-keyframes';
    style.textContent = `
      @keyframes floating-animation {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
    `;
    document.head.appendChild(style);
  }
};
