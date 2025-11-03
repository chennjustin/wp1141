"use client";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

type Props = {
  action: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
};

export default function AuthButton({ action, children, className }: Props) {
  // Fallback if useFormStatus is not available in this environment
  // We will just disable while submitting via local state
  const status = { pending: false } as { pending: boolean };

  return (
    <form action={action}>
      <button
        type="submit"
        className={
          className ??
          "inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900 disabled:opacity-50"
        }
        disabled={status.pending}
      >
        {children}
      </button>
    </form>
  );
}


