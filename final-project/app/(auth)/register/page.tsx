import { UserIdForm } from "@/components/auth/UserIdForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  // Redirect away if the user has already completed registration (has userID)
  const session = await getServerSession(authOptions);
  if (session?.user?.userID) {
    redirect("/");
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
      <div>
        <h1 className="text-center text-2xl font-bold">Create your handle</h1>
        <p className="mt-2 text-center text-gray-600">
          Choose your unique user ID
        </p>
      </div>
      <UserIdForm />
    </div>
  );
}

