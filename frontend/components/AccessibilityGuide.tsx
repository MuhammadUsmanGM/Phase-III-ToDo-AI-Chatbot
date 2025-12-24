import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accessibility } from 'lucide-react';

export default function AccessibilityGuide() {
  return (
    <div className="fixed bottom-20 right-6 z-50">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-700 w-80 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Accessibility className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-200">Accessibility</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Keyboard Navigation:</strong> Navigate with Tab and interact with Enter/Space
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Screen Reader:</strong> All elements have proper ARIA labels and semantics
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Contrast:</strong> All text meets WCAG AA contrast standards
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Skip Links:</strong> Use Alt+0 to jump to main content
              </p>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button 
                variant="outline" 
                className="text-xs text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/50"
              >
                More Info
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}