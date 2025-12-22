/**
 * Layout for API documentation page
 * 
 * This layout ensures Swagger UI CSS is properly loaded
 * and enables scrolling for the API documentation page.
 */

"use client";

import { useEffect } from "react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Enable scrolling for api-docs page
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    
    // Cleanup: restore original styles when leaving the page
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return <>{children}</>;
}

