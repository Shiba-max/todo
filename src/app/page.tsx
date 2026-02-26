import { TodoList } from "@/components/todo-list";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-900/20" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/20" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-pink-100/30 blur-3xl dark:bg-pink-900/10" />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10">
        <TodoList />
      </div>
    </main>
  );
}
