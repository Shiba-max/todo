"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, X, Tag } from "lucide-react";

type Props = {
  onAdd: (text: string, createdAt?: string, tags?: string[]) => void;
};

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState("");
  const [createdAt, setCreatedAt] = useState(todayString);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = (input: string) => {
    const newTags = input
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !tags.includes(t));
    if (newTags.length > 0) {
      setTags((prev) => [...prev, ...newTags]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, createdAt, tags.length > 0 ? tags : undefined);
    setText("");
    setCreatedAt(todayString());
    setTags([]);
    setTagInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="新しいTODOを入力..."
          className="flex-1 h-11 rounded-xl border-indigo-200 bg-white/70 backdrop-blur-sm shadow-sm transition-all focus-visible:ring-indigo-400 focus-visible:border-indigo-400 placeholder:text-indigo-300 dark:border-white/10 dark:bg-gray-800/50 dark:placeholder:text-gray-500"
        />
        <Button
          type="submit"
          disabled={!text.trim()}
          className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 font-semibold shadow-md shadow-indigo-200 transition-all hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-indigo-300 disabled:opacity-50 disabled:shadow-none dark:shadow-none"
        >
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </div>
      <div className="flex items-center gap-2 pl-1">
        <CalendarDays className="h-4 w-4 text-indigo-400" />
        <label className="text-sm font-medium text-indigo-500 whitespace-nowrap dark:text-indigo-300">
          登録日
        </label>
        <Input
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className="w-auto h-8 rounded-lg border-indigo-200 bg-white/70 text-sm shadow-sm focus-visible:ring-indigo-400 dark:border-white/10 dark:bg-gray-800/50"
        />
      </div>
      <div className="flex items-center gap-2 pl-1">
        <Tag className="h-4 w-4 text-indigo-400" />
        <label className="text-sm font-medium text-indigo-500 whitespace-nowrap dark:text-indigo-300">
          タグ
        </label>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="タグを入力してEnter..."
          className="w-auto h-8 rounded-lg border-indigo-200 bg-white/70 text-sm shadow-sm focus-visible:ring-indigo-400 placeholder:text-indigo-300 dark:border-white/10 dark:bg-gray-800/50 dark:placeholder:text-gray-500"
        />
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-7">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs gap-1 pr-1 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700/50"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full hover:bg-indigo-200 p-0.5 dark:hover:bg-indigo-700/50"
                aria-label={`タグ「${tag}」を削除`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </form>
  );
}
