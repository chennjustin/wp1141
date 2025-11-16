import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "未授權，請先登入" },
        { status: 401 }
      );
    }

    const carriers = await prisma.deviceCarrier.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        carrierCode: true,
        lastSyncedAt: true,
        createdAt: true,
        // 不返回 verifyCode 以保護隱私
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: carriers,
    });
  } catch (error) {
    console.error("獲取載具列表時發生錯誤:", error);
    return NextResponse.json(
      { error: "伺服器錯誤，無法獲取載具列表" },
      { status: 500 }
    );
  }
}

