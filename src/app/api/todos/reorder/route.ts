import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TodoModel } from "@/models/todo";

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body: Array<{ id: string; order: number }> = await request.json();

    const ops = body.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    await TodoModel.bulkWrite(ops);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/todos/reorder failed:", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
