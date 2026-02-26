import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TodoModel } from "@/models/todo";

export async function GET() {
  try {
    await connectDB();
    const todos = await TodoModel.find().sort({ order: 1 }).lean();
    return NextResponse.json(todos);
  } catch (error) {
    console.error("GET /api/todos failed:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, text, completed, createdAt, completedAt, tags, order } = body;
    const todo = await TodoModel.create({
      _id: id,
      text,
      completed,
      createdAt,
      completedAt,
      tags,
      order,
    });
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("POST /api/todos failed:", error);
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const todos: Array<{
      id: string;
      text: string;
      completed: boolean;
      createdAt: string;
      completedAt: string | null;
      tags: string[];
      order: number;
    }> = body;

    const ops = todos.map((todo) => ({
      updateOne: {
        filter: { _id: todo.id },
        update: {
          $set: {
            _id: todo.id,
            text: todo.text,
            completed: todo.completed,
            createdAt: todo.createdAt,
            completedAt: todo.completedAt,
            tags: todo.tags,
            order: todo.order,
          },
        },
        upsert: true,
      },
    }));

    await TodoModel.bulkWrite(ops);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/todos (bulk) failed:", error);
    return NextResponse.json({ error: "Failed to sync todos" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await TodoModel.deleteMany({ completed: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/todos failed:", error);
    return NextResponse.json({ error: "Failed to delete completed" }, { status: 500 });
  }
}
