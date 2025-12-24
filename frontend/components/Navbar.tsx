import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfileIcon from "@/components/ProfileIcon";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  const { isAuthenticated, userId, userEmail, userName, logout } = useAuth();
  const router = useRouter();

  const handleChangePassword = () => {
    // Close profile dropdown and open change password modal
    setShowProfileDropdown(false);
    setShowChangePasswordModal(true);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("New passwords do not match");
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setChangePasswordError("Password must be at least 8 characters long");
      return;
    }

    try {
      // In a real app, this would call an API to change the password
      // For now we'll just show a success message and close the modal
      setChangePasswordSuccess("Password updated successfully!");

      // Clear the form after a delay and close the modal
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setChangePasswordError(null);
        setChangePasswordSuccess(null);
      }, 1500);
    } catch (error: any) {
      setChangePasswordError(error.message || "Failed to change password. Please try again.");
    }
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
                        onClick={handleChangePassword}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-300 font-medium cursor-pointer flex items-center rounded-lg group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Change Password
                      </button>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
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
                {showChangePasswordModal && (
                  <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 w-full h-full">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden transform transition-all duration-300 scale-95 animate-fadeIn">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                          <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                          <button
                            onClick={() => {
                              setShowChangePasswordModal(false);
                              // Clear form fields and errors
                              setCurrentPassword("");
                              setNewPassword("");
                              setConfirmNewPassword("");
                              setChangePasswordError(null);
                              setChangePasswordSuccess(null);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {changePasswordSuccess ? (
                          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-lg text-sm">
                            {changePasswordSuccess}
                          </div>
                        ) : null}

                        {changePasswordError ? (
                          <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {changePasswordError}
                          </div>
                        ) : null}

                        <form onSubmit={handleChangePasswordSubmit}>
                          <div className="mb-4">
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                              Current Password
                            </label>
                            <input
                              type="password"
                              id="currentPassword"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                              placeholder="Enter current password"
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              id="newPassword"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                              placeholder="Enter new password"
                              required
                            />
                          </div>

                          <div className="mb-6">
                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              id="confirmNewPassword"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                              placeholder="Confirm new password"
                              required
                            />
                          </div>

                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowChangePasswordModal(false);
                                setCurrentPassword("");
                                setNewPassword("");
                                setConfirmNewPassword("");
                                setChangePasswordError(null);
                                setChangePasswordSuccess(null);
                              }}
                              className="px-5 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-300 font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2.5 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                              disabled={!currentPassword || !newPassword || !confirmNewPassword}
                            >
                              Update Password
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
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
                      setShowLogoutConfirm(true);
                      setIsOpen(false);
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

      {/* Stunning Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 w-full h-full">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-95 animate-fadeIn border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Log Out</h3>
                  <p className="mt-2 text-gray-600">
                    Are you sure you want to log out? You'll need to sign in again to access your tasks.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setShowLogoutConfirm(false);
                  setShowProfileDropdown(false);
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}