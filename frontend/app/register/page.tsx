"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Function to check password strength
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return 0; // No password
    if (pwd.length < 6) return 1; // Weak
    if (pwd.length >= 6 && pwd.length < 10) {
      // Check for mixed case, numbers, special chars
      const hasLower = /[a-z]/.test(pwd);
      const hasUpper = /[A-Z]/.test(pwd);
      const hasNumber = /\d/.test(pwd);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

      const criteriaCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

      if (criteriaCount < 2) return 2; // Medium
      return 3; // Strong
    }
    return 3; // Strong
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authApi.register({ email, password });
      login(response.access_token);
      router.push("/dashboard"); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-24 pb-12">
        <div className="relative w-full max-w-md px-6 py-12">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-10 -left-20 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="relative bg-white shadow-2xl rounded-2xl p-8 z-10 border border-gray-100">
            <div className="text-center mb-10">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600">Join us today to start organizing your tasks</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-center border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white text-gray-900"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white text-gray-900"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white text-gray-900"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${
                          passwordStrength === 1 ? 'text-red-500' :
                          passwordStrength === 2 ? 'text-yellow-500' :
                          passwordStrength === 3 ? 'text-green-500' : 'text-gray-400'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${
                          passwordStrength === 1 ? 'text-red-500' :
                          passwordStrength === 2 ? 'text-yellow-500' :
                          passwordStrength === 3 ? 'text-green-500' : 'text-gray-400'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordStrength === 1 ? 'bg-red-500 w-1/4' :
                        passwordStrength === 2 ? 'bg-yellow-500 w-2/4' :
                        passwordStrength === 3 ? 'bg-green-500 w-full' : 'bg-gray-300 w-0'
                      }`}
                    ></div>
                  </div>
                  <div className="text-xs mt-1">
                    {passwordStrength === 0 && <span className="text-gray-500">Enter a password</span>}
                    {passwordStrength === 1 && <span className="text-red-500">Weak password</span>}
                    {passwordStrength === 2 && <span className="text-yellow-500">Medium password</span>}
                    {passwordStrength === 3 && <span className="text-green-500">Strong password</span>}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
