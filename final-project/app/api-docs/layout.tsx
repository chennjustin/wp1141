/**
 * Layout for API documentation page
 * 
 * This layout ensures Swagger UI CSS is properly loaded.
 */

import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

