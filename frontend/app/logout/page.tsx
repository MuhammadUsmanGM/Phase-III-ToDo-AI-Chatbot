"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LogoutSpinner from "@/components/ui/LogoutSpinner";

export default function LogoutPage() {
  const { isLoggingOut, setIsLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // After the logout process is complete, redirect to home
    const timer = setTimeout(() => {
      // Reset the logging out state
      setIsLoggingOut(false);
      router.push("/");
    }, 1500); // Wait 1.5 seconds to show completion message

    return () => clearTimeout(timer);
  }, [router, setIsLoggingOut]);

  // Show logout spinner while logging out
  return <LogoutSpinner />;
}