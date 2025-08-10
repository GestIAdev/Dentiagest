/**
 * 🏥 DENTIAGEST ANIMATION HOOKS - PHASE 3
 * 
 * Purpose: Professional animation hooks for smooth UX
 * Created: August 9, 2025 - Phase 3 - POLISH & POWER
 * Status: ANIMATION MAGIC HOOKS
 * 
 * Key Features:
 * - Drag & drop animation states
 * - View transition management
 * - Loading state animations
 * - Success/error feedback
 * - Performance optimized
 * 
 * PlatformGest Extraction Notes:
 * - Universal animation patterns
 * - TypeScript-safe hook interfaces
 * - Reusable across all calendar components
 * - Mobile performance optimized
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Animation states for drag & drop
 */
export type DragAnimationState = 
  | 'idle'
  | 'dragging'
  | 'hovering'
  | 'dropping'
  | 'success'
  | 'error';

/**
 * View transition states
 */
export type ViewTransitionState = 
  | 'idle'
  | 'entering'
  | 'exiting'
  | 'complete';

/**
 * Animation configuration
 */
interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

/**
 * 🎪 Hook for drag & drop animations
 */
export const useDragDropAnimation = () => {
  const [dragState, setDragState] = useState<DragAnimationState>('idle');
  const [dragElement, setDragElement] = useState<HTMLElement | null>(null);
  const animationRef = useRef<number>();

  const startDragging = useCallback((element: HTMLElement) => {
    setDragElement(element);
    setDragState('dragging');
    
    // Add dragging class for CSS animations
    element.classList.add('dragging');
  }, []);

  const stopDragging = useCallback((success: boolean = true) => {
    if (dragElement) {
      dragElement.classList.remove('dragging');
      
      if (success) {
        setDragState('success');
        dragElement.classList.add('appointment-success');
        
        // Remove success class after animation
        setTimeout(() => {
          dragElement?.classList.remove('appointment-success');
          setDragState('idle');
        }, 600);
      } else {
        setDragState('error');
        dragElement.classList.add('appointment-error');
        
        // Remove error class after animation
        setTimeout(() => {
          dragElement?.classList.remove('appointment-error');
          setDragState('idle');
        }, 500);
      }
      
      setDragElement(null);
    }
  }, [dragElement]);

  const setHovering = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.classList.add('drag-over');
      setDragState('hovering');
    }
  }, []);

  const clearHovering = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.classList.remove('drag-over');
      if (dragState === 'hovering') {
        setDragState('dragging');
      }
    }
  }, [dragState]);

  const setDropError = useCallback((element: HTMLElement) => {
    element.classList.add('drag-error');
    setTimeout(() => {
      element.classList.remove('drag-error');
    }, 500);
  }, []);

  return {
    dragState,
    startDragging,
    stopDragging,
    setHovering,
    clearHovering,
    setDropError
  };
};

/**
 * 📅 Hook for view transition animations
 */
export const useViewTransition = (initialView: string) => {
  const [currentView, setCurrentView] = useState(initialView);
  const [transitionState, setTransitionState] = useState<ViewTransitionState>('idle');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const changeView = useCallback((newView: string, config: AnimationConfig = {}) => {
    if (newView === currentView || isTransitioning) return;

    setIsTransitioning(true);
    setTransitionState('exiting');

    // Wait for exit animation
    setTimeout(() => {
      setCurrentView(newView);
      setTransitionState('entering');

      // Complete transition
      setTimeout(() => {
        setTransitionState('complete');
        setIsTransitioning(false);
        
        // Reset to idle after brief delay
        setTimeout(() => {
          setTransitionState('idle');
        }, 100);
      }, config.duration || 300);
    }, config.duration || 300);
  }, [currentView, isTransitioning]);

  return {
    currentView,
    transitionState,
    isTransitioning,
    changeView
  };
};

/**
 * ⚡ Hook for loading animations
 */
export const useLoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressRef = useRef<number>();

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    // Simulate progress animation
    const animate = () => {
      setLoadingProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next < 90) {
          progressRef.current = requestAnimationFrame(animate);
          return next;
        }
        return 90;
      });
    };
    
    progressRef.current = requestAnimationFrame(animate);
  }, []);

  const finishLoading = useCallback(() => {
    if (progressRef.current) {
      cancelAnimationFrame(progressRef.current);
    }
    
    setLoadingProgress(100);
    
    setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(0);
    }, 300);
  }, []);

  return {
    isLoading,
    loadingProgress,
    startLoading,
    finishLoading
  };
};

/**
 * 🎯 Hook for micro-interactions
 */
export const useMicroInteractions = () => {
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const triggerHover = useCallback((elementId: string) => {
    setActiveElement(elementId);
  }, []);

  const clearHover = useCallback(() => {
    setActiveElement(null);
  }, []);

  const triggerClick = useCallback((element: HTMLElement, type: 'success' | 'error' = 'success') => {
    element.classList.add(`micro-${type}`);
    
    setTimeout(() => {
      element.classList.remove(`micro-${type}`);
    }, 200);
  }, []);

  const triggerPulse = useCallback((element: HTMLElement, duration: number = 1000) => {
    element.classList.add('micro-pulse');
    
    setTimeout(() => {
      element.classList.remove('micro-pulse');
    }, duration);
  }, []);

  return {
    activeElement,
    triggerHover,
    clearHover,
    triggerClick,
    triggerPulse
  };
};

/**
 * 📱 Hook for responsive animations
 */
export const useResponsiveAnimations = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check reduced motion preference
    const checkReducedMotion = () => {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    
    checkMobile();
    checkReducedMotion();
    
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const getAnimationConfig = useCallback((baseConfig: AnimationConfig): AnimationConfig => {
    if (reducedMotion) {
      return {
        ...baseConfig,
        duration: 1
      };
    }
    
    if (isMobile) {
      return {
        ...baseConfig,
        duration: (baseConfig.duration || 300) * 0.7
      };
    }
    
    return baseConfig;
  }, [isMobile, reducedMotion]);

  return {
    isMobile,
    reducedMotion,
    getAnimationConfig
  };
};

/**
 * 🎨 Hook for theme-aware animations
 */
export const useThemeAnimations = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const getThemeClass = useCallback((baseClass: string) => {
    return isDarkMode ? `${baseClass} dark-theme` : baseClass;
  }, [isDarkMode]);

  return {
    isDarkMode,
    getThemeClass
  };
};

/**
 * 🚀 Master animation hook combining all features
 */
export const useCalendarAnimations = () => {
  const dragDrop = useDragDropAnimation();
  const viewTransition = useViewTransition('month');
  const loading = useLoadingAnimation();
  const microInteractions = useMicroInteractions();
  const responsive = useResponsiveAnimations();
  const theme = useThemeAnimations();

  return {
    dragDrop,
    viewTransition,
    loading,
    microInteractions,
    responsive,
    theme
  };
};
