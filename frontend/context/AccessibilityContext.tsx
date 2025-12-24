'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AccessibilityContextType {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'larger';
  toggleReduceMotion: () => void;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');

  // Load preferences from localStorage
  useEffect(() => {
    const savedReduceMotion = localStorage.getItem('reduceMotion');
    const savedHighContrast = localStorage.getItem('highContrast');
    const savedFontSize = localStorage.getItem('fontSize');

    if (savedReduceMotion) setReduceMotion(savedReduceMotion === 'true');
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedFontSize && ['normal', 'large', 'larger'].includes(savedFontSize)) {
      setFontSize(savedFontSize as 'normal' | 'large' | 'larger');
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('reduceMotion', reduceMotion.toString());
    localStorage.setItem('highContrast', highContrast.toString());
    localStorage.setItem('fontSize', fontSize);
  }, [reduceMotion, highContrast, fontSize]);

  const toggleReduceMotion = () => {
    setReduceMotion(!reduceMotion);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const increaseFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    if (fontSize === 'large') setFontSize('larger');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'larger') setFontSize('large');
    if (fontSize === 'large') setFontSize('normal');
  };

  const contextValue: AccessibilityContextType = {
    reduceMotion,
    highContrast,
    fontSize,
    toggleReduceMotion,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div className={`${highContrast ? 'high-contrast' : ''} text-${fontSize}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}