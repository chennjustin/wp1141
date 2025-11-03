import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthButton from "../(components)/AuthButton";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const name = session.user?.name ?? "";
  const email = session.user?.email ?? "";
  const userId = (session.user as any)?.userId ?? "(pending)";

  async function signOutAction() {
    "use server";
    await signOut();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <div className="rounded-lg border p-4 bg-gray-50">
        <div className="text-sm text-gray-700">姓名：<span className="font-medium">{name}</span></div>
        <div className="text-sm text-gray-700">Email：<span className="font-medium">{email}</span></div>
        <div className="text-sm text-gray-700">userId：<span className="font-mono">{userId}</span></div>
      </div>
      <AuthButton action={signOutAction} className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">
        登出
      </AuthButton>
    </div>
  );
}


