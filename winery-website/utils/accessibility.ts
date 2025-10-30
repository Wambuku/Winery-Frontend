// Accessibility utilities for WCAG compliance and keyboard navigation

import React from 'react';

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-required'?: boolean;
  'aria-modal'?: boolean;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-activedescendant'?: string;
  role?: string;
  tabIndex?: number;
}

export const createAriaLabel = (
  baseLabel: string,
  additionalInfo?: string[]
): string => {
  const parts = [baseLabel];
  if (additionalInfo && additionalInfo.length > 0) {
    parts.push(...additionalInfo.filter(Boolean));
  }
  return parts.join(', ');
};

export const getButtonAriaProps = (
  label: string,
  isPressed?: boolean,
  isDisabled?: boolean,
  controls?: string
): AccessibilityProps => ({
  'aria-label': label,
  'aria-pressed': isPressed,
  'aria-disabled': isDisabled,
  'aria-controls': controls,
  role: 'button',
  tabIndex: isDisabled ? -1 : 0,
});

export const getLinkAriaProps = (
  label: string,
  isCurrent?: boolean,
  isExternal?: boolean
): AccessibilityProps => ({
  'aria-label': isExternal ? `${label} (opens in new tab)` : label,
  'aria-current': isCurrent ? 'page' : undefined,
  role: 'link',
  tabIndex: 0,
});

export const getFormFieldAriaProps = (
  label: string,
  isRequired?: boolean,
  isInvalid?: boolean,
  errorId?: string,
  helpId?: string
): AccessibilityProps => ({
  'aria-label': label,
  'aria-required': isRequired,
  'aria-invalid': isInvalid,
  'aria-describedby': [errorId, helpId].filter(Boolean).join(' ') || undefined,
});

export const getListAriaProps = (
  label: string,
  itemCount?: number
): AccessibilityProps => ({
  'aria-label': itemCount ? `${label}, ${itemCount} items` : label,
  role: 'list',
});

export const getListItemAriaProps = (
  position?: number,
  total?: number,
  isSelected?: boolean
): AccessibilityProps => ({
  role: 'listitem',
  'aria-selected': isSelected,
  'aria-setsize': total,
  'aria-posinset': position,
});

export const getDialogAriaProps = (
  title: string,
  titleId: string,
  descriptionId?: string
): AccessibilityProps => ({
  role: 'dialog',
  'aria-modal': true,
  'aria-labelledby': titleId,
  'aria-describedby': descriptionId,
});

export const getRegionAriaProps = (
  label: string,
  landmark?: string
): AccessibilityProps => ({
  'aria-label': label,
  role: landmark || 'region',
});

// Keyboard navigation utilities
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const;

export type KeyboardKey = typeof KEYBOARD_KEYS[keyof typeof KEYBOARD_KEYS];

export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  handlers: Partial<Record<KeyboardKey, () => void>>
): void => {
  const handler = handlers[event.key as KeyboardKey];
  if (handler) {
    event.preventDefault();
    handler();
  }
};

export const createKeyboardHandler = (
  onActivate?: () => void,
  onEscape?: () => void
) => (event: React.KeyboardEvent) => {
  handleKeyboardNavigation(event, {
    [KEYBOARD_KEYS.ENTER]: onActivate,
    [KEYBOARD_KEYS.SPACE]: onActivate,
    [KEYBOARD_KEYS.ESCAPE]: onEscape,
  });
};

// Focus management utilities
export const focusElement = (selector: string): boolean => {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    element.focus();
    return true;
  }
  return false;
};

export const trapFocus = (containerElement: HTMLElement): (() => void) => {
  const focusableElements = containerElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key === KEYBOARD_KEYS.TAB) {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  containerElement.addEventListener('keydown', handleTabKey);
  
  // Focus the first element
  if (firstElement) {
    firstElement.focus();
  }

  // Return cleanup function
  return () => {
    containerElement.removeEventListener('keydown', handleTabKey);
  };
};

// Screen reader utilities
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // This is a simplified version - in production, you'd use a proper color library
  // Returns a value between 1 and 21
  return 4.5; // Placeholder - implement proper contrast calculation
};

export const meetsWCAGContrast = (
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(color1, color2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};

// Skip link utility - returns props for skip link component
export const getSkipLinkProps = (targetId: string, label: string) => ({
  href: `#${targetId}`,
  className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-black text-white px-4 py-2 rounded z-50",
  children: label,
});