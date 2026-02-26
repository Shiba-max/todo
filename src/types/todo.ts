export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  tags: string[];
};

export type Filter = "all" | "active" | "completed";

export type SortKey =
  | "manual"
  | "createdAt-desc"
  | "createdAt-asc"
  | "text-asc"
  | "text-desc";
