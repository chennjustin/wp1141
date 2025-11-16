import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "未授權，請先登入" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { carrierCode, verifyCode } = body;

    // 驗證輸入
    if (!carrierCode || typeof carrierCode !== "string") {
      return NextResponse.json(
        { error: "載具條碼為必填項目" },
        { status: 400 }
      );
    }

    if (!verifyCode || typeof verifyCode !== "string") {
      return NextResponse.json(
        { error: "載具驗證碼為必填項目" },
        { status: 400 }
      );
    }

    // 驗證載具條碼格式（應以 / 開頭）
    if (!carrierCode.startsWith("/")) {
      return NextResponse.json(
        { error: "載具條碼格式錯誤，應以 / 開頭" },
        { status: 400 }
      );
    }

    // 驗證驗證碼長度（16碼）
    if (verifyCode.length !== 16) {
      return NextResponse.json(
        { error: "載具驗證碼必須為16碼" },
        { status: 400 }
      );
    }

    // 檢查是否已存在相同的載具條碼
    const existingCarrier = await prisma.deviceCarrier.findFirst({
      where: {
        userId: session.user.id,
        carrierCode: carrierCode,
      },
    });

    if (existingCarrier) {
      return NextResponse.json(
        { error: "此載具條碼已存在" },
        { status: 409 }
      );
    }

    // 創建載具
    const deviceCarrier = await prisma.deviceCarrier.create({
      data: {
        userId: session.user.id,
        carrierCode: carrierCode.trim(),
        verifyCode: verifyCode.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: deviceCarrier.id,
          carrierCode: deviceCarrier.carrierCode,
          createdAt: deviceCarrier.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("創建載具時發生錯誤:", error);
    return NextResponse.json(
      { error: "伺服器錯誤，無法創建載具" },
      { status: 500 }
    );
  }
}

