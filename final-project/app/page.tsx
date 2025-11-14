import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // middleware 會處理未登入的情況，這裡不需要 redirect
  // 但如果 session 不存在，返回 null（middleware 會處理重定向）
  if (!session || !session.user) {
    return null;
  }

  const { user } = session;
  const userName = user?.name || "使用者";
  const userImage = user?.image || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          {/* 歡迎訊息 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              歡迎回來！
            </h1>
            <p className="text-gray-600">
              您已成功登入
            </p>
          </div>

          {/* 頭像 */}
          <div className="flex justify-center mb-6">
            {userImage ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-100">
                <Image
                  src={userImage}
                  alt={userName}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-4 ring-blue-100">
                <span className="text-4xl font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* 名字 */}
          <div className="text-center mb-8">
            <p className="text-2xl font-semibold text-gray-900">
              {userName}
            </p>
          </div>

          {/* 登出按鈕 */}
          <div className="flex justify-center">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}

