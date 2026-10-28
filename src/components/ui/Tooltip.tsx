import React, { useState, useRef, useEffect, useId } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<any>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delayMs?: number;
}

/**
 * Accessible Tooltip component.
 * Supports:
 * - Desktop hover (mouseenter/mouseleave)
 * - Keyboard navigation (focus/blur)
 * - Touch devices (tap/touch toggle with tap-outside dismiss)
 * - Escape key to dismiss
 * - ARIA aria-describedby linkage
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  delayMs = 150
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleTouch = () => {
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        hideTooltip();
      }
    };
    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Dismiss on tap outside for mobile
  useEffect(() => {
    if (!isVisible) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        hideTooltip();
      }
    };
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // Native DOM listeners for resilient cross-framework interaction (focusin/focusout, mouseenter/mouseleave)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMouseEnter = () => showTooltip();
    const handleMouseLeave = () => hideTooltip();
    const handleFocusIn = () => showTooltip();
    const handleFocusOut = () => hideTooltip();

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('focusin', handleFocusIn);
    el.addEventListener('focusout', handleFocusOut);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('focusin', handleFocusIn);
      el.removeEventListener('focusout', handleFocusOut);
    };
  }, [delayMs]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }[position];

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onTouchStart={handleTouch}
    >
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
        onMouseEnter: (e: React.MouseEvent) => {
          showTooltip();
          if (typeof children.props.onMouseEnter === 'function') {
            children.props.onMouseEnter(e);
          }
        },
        onMouseLeave: (e: React.MouseEvent) => {
          hideTooltip();
          if (typeof children.props.onMouseLeave === 'function') {
            children.props.onMouseLeave(e);
          }
        },
        onFocus: (e: React.FocusEvent) => {
          showTooltip();
          if (typeof children.props.onFocus === 'function') {
            children.props.onFocus(e);
          }
        },
        onBlur: (e: React.FocusEvent) => {
          hideTooltip();
          if (typeof children.props.onBlur === 'function') {
            children.props.onBlur(e);
          }
        }
      })}

      {isVisible && content && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute ${positionClasses} z-50 pointer-events-none px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/60 whitespace-nowrap animate-fade-in ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
