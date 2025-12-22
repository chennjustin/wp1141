"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Test login button component
 * 
 * This component provides an unobtrusive test login button that allows
 * logging in as user-1 for testing purposes. Only visible and functional
 * in development/test environments.
 */
export function TestLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/test-login-user-1", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Test login failed:", data.error);
        alert(`Test login failed: ${data.error || "Unknown error"}`);
        return;
      }

      // Redirect to home page after successful login
      // Use window.location.href to ensure a full page reload and session cookie is properly read
      window.location.href = "/";
    } catch (error) {
      console.error("Test login error:", error);
      alert("Test login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development/test environments
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <button
      onClick={handleTestLogin}
      disabled={isLoading}
      className="absolute left-4 top-4 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Test login as user-1"
    >
      {isLoading ? "..." : "test"}
    </button>
  );
}

