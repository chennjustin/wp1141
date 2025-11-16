/**
 * Authentication layout component
 * 
 * This layout provides a centered container for authentication pages
 * such as login and registration.
 */

export function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}

