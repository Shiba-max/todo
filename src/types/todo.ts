export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type Filter = "all" | "active" | "completed";
