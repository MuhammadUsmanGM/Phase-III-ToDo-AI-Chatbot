'use client';

import { useAccessibility } from '@/context/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, ContrastIcon, Type, ZapOff } from 'lucide-react';

export default function AccessibilityPanel() {
  const {
    reduceMotion,
    highContrast,
    fontSize,
    toggleReduceMotion,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize
  } = useAccessibility();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800 dark:text-white">Accessibility</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Close/disable accessibility panel
              document.querySelector('.accessibility-panel')?.classList.add('hidden');
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* High Contrast Mode */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ContrastIcon className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">High Contrast</span>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                highContrast ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Reduce Motion */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ZapOff className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Reduce Motion</span>
            </div>
            <button
              onClick={toggleReduceMotion}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                reduceMotion ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={reduceMotion ? "Enable animations" : "Disable animations"}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  reduceMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Font Size Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Type className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Text Size</span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={decreaseFontSize}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                aria-label="Decrease text size"
              >
                A
              </button>
              <button
                onClick={increaseFontSize}
                className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                aria-label="Increase text size"
              >
                A
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => {
              // Reset all accessibility settings
              toggleHighContrast();
              toggleReduceMotion();
              decreaseFontSize();
              decreaseFontSize();
            }}
          >
            Reset Settings
          </Button>
        </div>
      </div>
    </div>
  );
}