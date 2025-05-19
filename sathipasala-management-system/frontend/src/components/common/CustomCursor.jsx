import React, { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show cursor only after it moves (prevents jumpy initial position)
    const onFirstMove = () => {
      setIsVisible(true);
      window.removeEventListener('mousemove', onFirstMove);
    };
    window.addEventListener('mousemove', onFirstMove);

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseEnter = () => {
      document.body.style.cursor = 'none';
    };

    const onMouseLeave = () => {
      document.body.style.cursor = 'auto';
      setIsVisible(false);
    };

    const addHoverEvents = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, input, textarea, select, [role="button"], .hover-effect'
      );

      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => setIsHovering(true));
        el.addEventListener('mouseleave', () => setIsHovering(false));
      });

      return interactiveElements;
    };

    // Add mouse tracking events
    window.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseenter', onMouseEnter);
    document.body.addEventListener('mouseleave', onMouseLeave);

    // Add interactive element events after a slight delay to make sure DOM is fully loaded
    const timeout = setTimeout(() => {
      const elements = addHoverEvents();
      
      // Cleanup interactive element listeners
      return () => {
        elements.forEach(el => {
          el.removeEventListener('mouseenter', () => setIsHovering(true));
          el.removeEventListener('mouseleave', () => setIsHovering(false));
        });
      };
    }, 500);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousemove', onFirstMove);
      document.body.removeEventListener('mouseenter', onMouseEnter);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      clearTimeout(timeout);
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Don't render on small screens (mobile/tablet)
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <>
      {/* Main circular cursor */}
      <div
        className={`hidden md:block fixed pointer-events-none z-50 rounded-full mix-blend-difference ${
          isHovering ? 'w-12 h-12 bg-white' : 'w-6 h-6 border-2 border-white bg-transparent'
        } transition-all duration-200`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Center dot */}
      <div
        className={`hidden md:block fixed pointer-events-none z-50 rounded-full bg-white ${
          isHovering ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-200 w-1 h-1`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      />
    </>
  );
};

export default CustomCursor;
