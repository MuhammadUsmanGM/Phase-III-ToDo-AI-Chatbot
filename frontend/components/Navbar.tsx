import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfileIcon from "@/components/ProfileIcon";
import { useToast } from "@/components/ToastProvider";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { isAuthenticated, userId, userEmail, userName, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleChangePassword = () => {
    // Close profile dropdown and show info toast
    setShowProfileDropdown(false);
    showToast("Password change functionality is available in the settings page.", "info");
  };

  const handleLogout = () => {
    logout();
    showToast("You have been logged out successfully!", "success");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl py-3 border-b border-gray-200/50 shadow-xl shadow-indigo-500/5"
          : "bg-white/80 backdrop-blur-xl py-4"
      }`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <span className="font-bold text-gray-900">
                Todo<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">App</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="font-medium transition-all duration-300 relative group text-gray-800 hover:text-indigo-600"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/#how-it-works"
              className="font-medium transition-all duration-300 relative group text-gray-800 hover:text-indigo-600"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/#testimonials"
              className="font-medium transition-all duration-300 relative group text-gray-800 hover:text-indigo-600"
            >
              Testimonials
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center text-gray-800 hover:text-indigo-600 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                      <ProfileIcon size={24} />
                    </div>
                  </div>
                  <span className="ml-2 text-sm font-medium hidden lg:block truncate max-w-[120px]">{userName || 'User'}</span>
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fadeIn origin-top-right transform transition-all duration-200 scale-100 opacity-100">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5">
                      <div className="flex items-center">
                        <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white">
                          <ProfileIcon size={28} />
                        </div>
                        <div className="ml-4">
                          <p className="text-white font-bold text-base">{userName || 'User'}</p>
                          <p className="text-indigo-100 text-sm truncate max-w-[140px]">{userEmail || 'Account@email.com'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          // Show info toast instead of opening modal
                          setShowProfileDropdown(false);
                          showToast("Password change functionality is available in the settings page.", "info");
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-300 font-medium cursor-pointer flex items-center rounded-lg group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Change Password
                      </button>
                      <button
                        onClick={() => {
                          // Show confirmation toast with action buttons
                          showToast(
                            "Are you sure you want to log out?",
                            "warning",
                            0, // Don't auto-dismiss
                            {
                              label: "Log Out",
                              onClick: () => {
                                handleLogout();
                              }
                            }
                          );
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-300 font-medium cursor-pointer flex items-center rounded-lg group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}

                {/* Change Password Modal */}
                {/* Change Password functionality is now handled with toast notifications */}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium transition-all duration-300 relative group text-gray-800 hover:text-indigo-600"
                >
                  Login
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-800 hover:bg-gray-100 transition-colors duration-300 cursor-pointer relative"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-3 animate-fadeIn">
            <div className="px-4 pt-4 pb-5 space-y-3 bg-gradient-to-b from-white/90 to-gray-50/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200">
              <Link
                href="/#features"
                className="block px-6 py-4 rounded-xl text-lg font-medium text-gray-900 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="block px-6 py-4 rounded-xl text-lg font-medium text-gray-900 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/#testimonials"
                className="block px-6 py-4 rounded-xl text-lg font-medium text-gray-900 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Testimonials
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3">
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                        <ProfileIcon size={28} />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{userName || 'User'}</p>
                        <p className="text-gray-600 text-sm truncate max-w-[140px]">{userEmail || 'Account@email.com'}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // Show confirmation toast with action buttons
                      showToast(
                        "Are you sure you want to log out?",
                        "warning",
                        0, // Don't auto-dismiss
                        {
                          label: "Log Out",
                          onClick: () => {
                            handleLogout();
                          }
                        }
                      );
                    }}
                    className="w-full text-left px-6 py-4 rounded-xl text-lg font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 cursor-pointer flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-6 py-4 rounded-xl text-lg font-medium text-gray-900 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full px-6 py-4 rounded-xl text-lg font-medium text-center text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout confirmation is now handled with toast notifications */}
    </nav>
  );
}