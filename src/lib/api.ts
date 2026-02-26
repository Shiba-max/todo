import { type Todo } from "@/types/todo";

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText} for ${url}`);
      return null;
    }
    return res;
  } catch (error) {
    console.error(`API fetch failed for ${url}:`, error);
    return null;
  }
}

export type TodoWithOrder = Todo & { order: number };

export const todosApi = {
  async getAll(): Promise<TodoWithOrder[] | null> {
    const res = await safeFetch("/api/todos");
    if (!res) return null;
    const data = await res.json();
    return data.map((item: Record<string, unknown>) => ({
      id: item._id,
      text: item.text,
      completed: item.completed,
      createdAt: item.createdAt,
      completedAt: item.completedAt,
      tags: item.tags,
      order: item.order,
    }));
  },

  async create(todo: Todo, order: number): Promise<void> {
    await safeFetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt,
        completedAt: todo.completedAt,
        tags: todo.tags,
        order,
      }),
    });
  },

  async update(id: string, updates: Partial<Todo & { order: number }>): Promise<void> {
    await safeFetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  },

  async remove(id: string): Promise<void> {
    await safeFetch(`/api/todos/${id}`, { method: "DELETE" });
  },

  async deleteCompleted(): Promise<void> {
    await safeFetch("/api/todos", { method: "DELETE" });
  },

  async syncAll(todos: Todo[]): Promise<void> {
    const payload = todos.map((todo, index) => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      createdAt: todo.createdAt,
      completedAt: todo.completedAt,
      tags: todo.tags,
      order: index,
    }));
    await safeFetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async reorder(items: Array<{ id: string; order: number }>): Promise<void> {
    await safeFetch("/api/todos/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
  },
};
