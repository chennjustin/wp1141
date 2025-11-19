import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { LineWebhookSchema } from "@/lib/utils/validation";
import { handleText } from "@/bot/handlers/text.handler";
import { handleFollow } from "@/bot/handlers/follow.handler";
import { Logger } from "@/lib/utils/logger";
import { BotContext } from "@/types/bot";
import { LineMessagingClient } from "@/lib/line/client";

const lineClient = new LineMessagingClient();

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// 創建 Context 物件
function createContext(event: any, replyToken?: string): BotContext {
  return {
    event,
    sendText: async (text: string) => {
      if (replyToken) {
        await lineClient.sendTextMessage(replyToken, text);
      } else {
        Logger.warn("No replyToken available", { eventType: event.type });
      }
    },
  };
}

export async function POST(request: NextRequest) {
  console.log("=".repeat(50));
  console.log("📨 [Webhook] 收到 Line Webhook 要求");
  console.log("=".repeat(50));
  
  try {
    const body = await request.text();
    console.log("📦 [Webhook] Body length:", body.length);
    console.log("📦 [Webhook] Body preview:", body.substring(0, 200));
    
    const signature = request.headers.get("x-line-signature");
    console.log("🔐 [Webhook] Signature:", signature ? "存在" : "不存在");
    
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    console.log("🔑 [Webhook] Channel Secret:", channelSecret ? "存在" : "不存在");

    if (!signature || !channelSecret) {
      Logger.warn("Missing LINE signature or channel secret");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // 驗證簽名
    if (!verifySignature(body, signature, channelSecret)) {
      Logger.warn("Invalid LINE signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 解析 webhook 事件
    console.log("📋 [Webhook] 解析 webhook 資料...");
    const webhookData = JSON.parse(body);
    console.log("📋 [Webhook] Webhook data:", JSON.stringify(webhookData, null, 2));
    
    const validatedData = LineWebhookSchema.parse(webhookData);
    console.log("✅ [Webhook] 驗證通過，事件數量:", validatedData.events.length);

    // 處理每個事件
    for (const event of validatedData.events) {
      console.log("🔄 [Webhook] 處理事件:", event.type);
      const replyToken = (event as any).replyToken;
      const context = createContext(event, replyToken);

      try {
        Logger.info("Processing webhook event", { 
          eventType: event.type,
          messageType: (event as any).message?.type,
        });
        
        if (event.type === "message" && event.message?.type === "text") {
          Logger.info("Routing to handleText");
          await handleText(context);
        } else if (event.type === "follow") {
          Logger.info("Routing to handleFollow");
          await handleFollow(context);
        } else {
          Logger.warn("Unhandled event type", { 
            eventType: event.type,
            messageType: (event as any).message?.type,
          });
        }
      } catch (error) {
        Logger.error("Error processing event", { 
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          eventType: event.type,
        });
        // 嘗試發送錯誤訊息
        if (replyToken) {
          try {
            await lineClient.sendTextMessage(
              replyToken,
              "抱歉，處理您的訊息時發生錯誤，請稍後再試。"
            );
          } catch (sendError) {
            Logger.error("Failed to send error message", { sendError });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Logger.error("Webhook error", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

