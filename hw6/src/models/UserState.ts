import mongoose, { Schema, Document } from "mongoose";

export type FlowType = "add_deadline_step" | "edit_deadline" | null;

export interface IUserState extends Document {
  userId: string; // LINE userId
  currentFlow: FlowType;
  flowData?: Record<string, unknown>;
  updatedAt: Date;
}

const UserStateSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currentFlow: {
      type: String,
      enum: ["add_deadline_step", "edit_deadline", null],
      default: null,
    },
    flowData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserState || mongoose.model<IUserState>("UserState", UserStateSchema);

