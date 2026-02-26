import mongoose, { Schema, type Document } from "mongoose";

export interface ITodo extends Document {
  _id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  tags: string[];
  order: number;
}

const todoSchema = new Schema<ITodo>(
  {
    _id: { type: String, required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: String, required: true },
    completedAt: { type: String, default: null },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  {
    _id: false,
    timestamps: false,
  }
);

export const TodoModel =
  mongoose.models.Todo || mongoose.model<ITodo>("Todo", todoSchema);
