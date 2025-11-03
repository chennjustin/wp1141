import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthButton from "../(components)/AuthButton";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/home");

  async function signInAction() {
    "use server";
    await signIn("google");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-sm text-gray-600">使用 Google 登入以進入 X-Clone。</p>
      <AuthButton action={signInAction}>
        使用 Google 登入
      </AuthButton>
    </div>
  );
}


