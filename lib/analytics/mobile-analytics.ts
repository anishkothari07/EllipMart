'use client';

// Mobile Commerce Interaction Analytics
export const mobileAnalytics = {
  trackSwipe(direction: 'left' | 'right' | 'up' | 'down', component: string) {
    console.log(`[Analytics] Mobile Swipe detected:`, { direction, component, timestamp: Date.now() });
    // In production, dispatch event payload to analytics API
  },

  trackScrollDepth(depthPercent: number, page: string) {
    console.log(`[Analytics] Mobile Scroll Depth:`, { depthPercent, page, timestamp: Date.now() });
  },

  trackRageTap(selector: string, tapsCount: number) {
    console.warn(`[Analytics] Rage tap detected!`, { selector, tapsCount, timestamp: Date.now() });
  },

  trackConversionFunnel(step: string, details?: any) {
    console.log(`[Analytics] Mobile Conversion Funnel step:`, { step, details, timestamp: Date.now() });
  }
};

// Initialize rage tap listeners automatically in client browsers
if (typeof window !== 'undefined') {
  let clickTimes: number[] = [];
  let lastTarget: any = null;

  window.addEventListener('click', (e) => {
    const now = Date.now();
    const target = e.target as HTMLElement;
    
    // Clear clicks older than 1.5 seconds
    clickTimes = clickTimes.filter(t => now - t < 1500);
    
    if (lastTarget === target) {
      clickTimes.push(now);
      if (clickTimes.length >= 4) {
        mobileAnalytics.trackRageTap(target.tagName + (target.className ? '.' + target.className.split(' ').join('.') : ''), clickTimes.length);
        clickTimes = [];
      }
    } else {
      clickTimes = [now];
      lastTarget = target;
    }
  });

  // Track page scroll depth
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const b = document.body;
    const st = 'scrollTop';
    const sh = 'scrollHeight';
    const percent = Math.round((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100);
    
    if (percent > maxScroll && percent % 25 === 0) {
      maxScroll = percent;
      mobileAnalytics.trackScrollDepth(percent, window.location.pathname);
    }
  });
}
