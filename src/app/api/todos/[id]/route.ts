import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TodoModel } from "@/models/todo";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const updates = await request.json();
    const todo = await TodoModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(todo);
  } catch (error) {
    console.error("PATCH /api/todos/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await TodoModel.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/todos/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
