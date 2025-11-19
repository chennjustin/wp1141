import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversationId: 1, timestamp: 1 });

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

