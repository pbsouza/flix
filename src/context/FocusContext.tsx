import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface FocusContextType {
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  registerFocusable: (id: string, element: HTMLElement) => void;
  unregisterFocusable: (id: string) => void;
  navigate: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  triggerCurrentFocus: () => void;
  isTVMode: boolean;
  toggleTVMode: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [focusedId, setFocusedId] = useState<string | null>('nav-home');
  const [isTVMode, setIsTVMode] = useState<boolean>(true); // Enabled by default for Smart TV experience
  const elementsRef = React.useRef<Map<string, HTMLElement>>(new Map());

  const registerFocusable = useCallback((id: string, element: HTMLElement) => {
    elementsRef.current.set(id, element);
  }, []);

  const unregisterFocusable = useCallback((id: string) => {
    elementsRef.current.delete(id);
    setFocusedId((prev) => (prev === id ? null : prev));
  }, []);

  const toggleTVMode = useCallback(() => {
    setIsTVMode((prev) => !prev);
  }, []);

  // Calculate closest element in spatial direction
  const navigate = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (elementsRef.current.size === 0) return;

    let currentEl: HTMLElement | null = null;
    if (focusedId && elementsRef.current.has(focusedId)) {
      currentEl = elementsRef.current.get(focusedId) || null;
    }

    // Fallback if current element isn't set or visible
    if (!currentEl) {
      const firstKey = elementsRef.current.keys().next().value;
      if (firstKey) {
        setFocusedId(firstKey);
        const el = elementsRef.current.get(firstKey);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
      return;
    }

    const currentRect = currentEl.getBoundingClientRect();
    const currentCenterX = currentRect.left + currentRect.width / 2;
    const currentCenterY = currentRect.top + currentRect.height / 2;

    let bestCandidateId: string | null = null;
    let minDistance = Infinity;

    elementsRef.current.forEach((el, id) => {
      if (id === focusedId) return;
      const rect = el.getBoundingClientRect();

      // Check element visibility
      if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none') {
        return;
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let isInDirection = false;
      let dx = centerX - currentCenterX;
      let dy = centerY - currentCenterY;

      switch (direction) {
        case 'UP':
          isInDirection = centerY < currentRect.top - 5;
          break;
        case 'DOWN':
          isInDirection = centerY > currentRect.bottom + 5;
          break;
        case 'LEFT':
          isInDirection = centerX < currentRect.left - 5;
          break;
        case 'RIGHT':
          isInDirection = centerX > currentRect.right + 5;
          break;
      }

      if (isInDirection) {
        // Weighted distance calculation penalizing orthogonal distance for tighter horizontal/vertical alignment
        let distance = 0;
        if (direction === 'LEFT' || direction === 'RIGHT') {
          distance = Math.abs(dx) + Math.abs(dy) * 2.5;
        } else {
          distance = Math.abs(dy) + Math.abs(dx) * 2.5;
        }

        if (distance < minDistance) {
          minDistance = distance;
          bestCandidateId = id;
        }
      }
    });

    if (bestCandidateId) {
      setFocusedId(bestCandidateId);
      const targetEl = elementsRef.current.get(bestCandidateId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [focusedId]);

  const triggerCurrentFocus = useCallback(() => {
    if (focusedId && elementsRef.current.has(focusedId)) {
      const el = elementsRef.current.get(focusedId);
      el?.click();
    }
  }, [focusedId]);

  // Global keydown handler for Smart TV remote control arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore arrow keys if active element is an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

      if (isInput && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        return; // Allow cursor movement inside text input
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigate('UP');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigate('DOWN');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigate('LEFT');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigate('RIGHT');
          break;
        case 'Enter':
        case 'NumpadEnter':
          if (!isInput) {
            e.preventDefault();
            triggerCurrentFocus();
          }
          break;
        case 'Escape':
        case 'Backspace':
          // Esc or TV Back key triggers global back or modal close custom event
          window.dispatchEvent(new CustomEvent('smarttv-back'));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, triggerCurrentFocus]);

  return (
    <FocusContext.Provider
      value={{
        focusedId,
        setFocusedId,
        registerFocusable,
        unregisterFocusable,
        navigate,
        triggerCurrentFocus,
        isTVMode,
        toggleTVMode,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocusContext = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocusContext must be used within a FocusProvider');
  }
  return context;
};

// Custom Hook to attach to focusable UI elements
export function useSmartTVFocus(id: string, onClick?: () => void) {
  const { focusedId, setFocusedId, registerFocusable, unregisterFocusable } = useFocusContext();
  const ref = React.useRef<any>(null);

  const isFocused = focusedId === id;

  useEffect(() => {
    if (ref.current) {
      registerFocusable(id, ref.current);
    }
    return () => {
      unregisterFocusable(id);
    };
  }, [id, registerFocusable, unregisterFocusable]);

  const props = {
    ref,
    'data-focusable': 'true',
    'data-focused': isFocused ? 'true' : 'false',
    tabIndex: 0,
    onMouseEnter: () => setFocusedId(id),
    onClick,
  };

  return { isFocused, focusProps: props };
}
