import { NextResponse } from "next/server";
import { OpenAIClient } from "@/lib/llm/openai";
import connectDB from "@/lib/db/mongoose";

export async function GET() {
  const checks: Record<string, { status: string; message: string }> = {};

  // 檢查環境變數
  checks.env = {
    status: "ok",
    message: "環境變數檢查",
  };

  const envVars = {
    LINE_CHANNEL_SECRET: !!process.env.LINE_CHANNEL_SECRET,
    LINE_CHANNEL_ACCESS_TOKEN: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    OPENAI_MODEL: !!process.env.OPENAI_MODEL,
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "未設定（將使用 Vercel URL）",
  };

  // 檢查 LLM 初始化
  try {
    const llmClient = new OpenAIClient();
    checks.llm = {
      status: "ok",
      message: "LLM 客戶端初始化成功",
    };
  } catch (error) {
    checks.llm = {
      status: "error",
      message: `LLM 初始化失敗: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  // 檢查資料庫連線
  try {
    await connectDB();
    checks.database = {
      status: "ok",
      message: "資料庫連線成功",
    };
  } catch (error) {
    checks.database = {
      status: "error",
      message: `資料庫連線失敗: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  return NextResponse.json({
    success: true,
    envVars,
    checks,
  });
}

