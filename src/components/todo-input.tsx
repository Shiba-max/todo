"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus } from "lucide-react";

type Props = {
  onAdd: (text: string, createdAt?: string) => void;
};

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState("");
  const [createdAt, setCreatedAt] = useState(todayString);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, createdAt);
    setText("");
    setCreatedAt(todayString());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="新しいTODOを入力..."
          className="flex-1 h-11 rounded-xl border-indigo-200 bg-white/70 backdrop-blur-sm shadow-sm transition-all focus-visible:ring-indigo-400 focus-visible:border-indigo-400 placeholder:text-indigo-300"
        />
        <Button
          type="submit"
          disabled={!text.trim()}
          className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 font-semibold shadow-md shadow-indigo-200 transition-all hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-indigo-300 disabled:opacity-50 disabled:shadow-none"
        >
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </div>
      <div className="flex items-center gap-2 pl-1">
        <CalendarDays className="h-4 w-4 text-indigo-400" />
        <label className="text-sm font-medium text-indigo-500 whitespace-nowrap">
          登録日
        </label>
        <Input
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className="w-auto h-8 rounded-lg border-indigo-200 bg-white/70 text-sm shadow-sm focus-visible:ring-indigo-400"
        />
      </div>
    </form>
  );
}
