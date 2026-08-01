let animationFrameId = null;

/**
 * 60 FPS Lenis-inspired smooth scroll utility using requestAnimationFrame and easeOutExpo curve.
 * Inspired by Apple, Vercel, Linear, and Framer smooth scrolling.
 * 
 * @param {string|number} targetIdOrY - Element ID or Y position to scroll to
 * @param {number} duration - Scroll duration in ms (default 1000ms)
 * @param {number} offset - Sticky navbar offset in px (default 70px)
 */
export const smoothScrollTo = (targetIdOrY, duration = 1000, offset = 70) => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  let targetY = 0;
  if (typeof targetIdOrY === 'number') {
    targetY = Math.max(0, targetIdOrY);
  } else {
    const element = document.getElementById(targetIdOrY);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    targetY = Math.max(0, window.pageYOffset + rect.top - offset);
  }

  const startY = window.pageYOffset;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) return;

  let startTime = null;

  // Ultra-smooth easeOutExpo easing function
  const easeOutExpo = (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const step = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easeProgress = easeOutExpo(progress);

    window.scrollTo(0, startY + distance * easeProgress);

    if (timeElapsed < duration) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      window.scrollTo(0, targetY);
      animationFrameId = null;
    }
  };

  animationFrameId = requestAnimationFrame(step);
};
