import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  platform: string;
  lineUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      default: "line",
    },
    lineUserId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

