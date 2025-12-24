"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const AuthExpirationNotification = () => {
  const router = useRouter();
  const {
    isAuthenticated,
    logout,
    showExpirationNotification,
    setShowExpirationNotification
  } = useAuth();

  // When the notification is dismissed, update the state
  const dismissNotification = () => {
    setShowExpirationNotification(false);
  };

  // When user logs in again, hide the notification
  useEffect(() => {
    if (isAuthenticated && showExpirationNotification) {
      setShowExpirationNotification(false);
    }
  }, [isAuthenticated, showExpirationNotification, setShowExpirationNotification]);

  if (!showExpirationNotification) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg animate-slideDown">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              Your session has expired. Please log in again to continue.
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={dismissNotification}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Dismiss notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Link
              href="/login"
              className="px-4 py-2 bg-white text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition-colors text-sm"
              onClick={(e) => {
                e.preventDefault();
                // Log out user before redirecting
                logout();
                // Redirect to login page using Next.js router
                router.push('/login');
              }}
            >
              Log In Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthExpirationNotification;