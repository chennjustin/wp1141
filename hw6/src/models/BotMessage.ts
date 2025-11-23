import mongoose, { Schema, Document } from "mongoose";

export type MessageType = "incoming" | "outgoing";

export interface IBotMessage extends Document {
  userId: string; // LINE userId
  messageType: MessageType;
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BotMessageSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 複合索引：方便查詢使用者的訊息歷史
BotMessageSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.BotMessage || mongoose.model<IBotMessage>("BotMessage", BotMessageSchema);

