// /app/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 型定義
export type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  completed: boolean;
  important: boolean;
  created_at?: string;
  user_id?: string | null;
  tags?: string[];
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  text_color: string;
  created_at?: string;
  user_id?: string | null;
};

export type TaskTag = {
  task_id: string;
  tag_id: string;
};
