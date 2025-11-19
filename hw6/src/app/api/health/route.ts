import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: "Database connection failed",
      },
      { status: 503 }
    );
  }
}

