// /app/actions/supabaseActions.ts

"use server";

import { revalidatePath } from "next/cache";
import { supabase, type Task } from "@/app/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

/* データ取得*/
// タスク関連の取得処理
export async function fetchTasks() {
  try {
    // タスクを取得
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (tasksError) throw tasksError;

    // タスクとタグの関連を取得
    const { data: taskTags, error: taskTagsError } = (await supabase
      .from("task_tags")
      .select("task_id, tags(id, name)")) as {
      data: { task_id: string; tags: { id: string; name: string } }[] | null;
      error: PostgrestError | null;
    };

    if (taskTagsError) throw taskTagsError;

    // タグ情報をタスクに追加
    const tasksWithTags = tasks.map((task) => {
      const tags = taskTags
        ?.filter((tt) => tt.task_id === task.id)
        .map((tt) => tt.tags?.name);
      console.log("taskTags:", taskTags); //デバッグ用
      return {
        ...task,
        tags: tags,
      };
    });

    return { success: true, tasks: tasksWithTags };
  } catch (error) {
    console.error("タスク取得エラー:", error);
    return { success: false, error: "タスクの取得に失敗しました", tasks: [] };
  }
}

// タグの取得
export async function fetchTags() {
  try {
    const { data: tags, error } = await supabase
      .from("tags")
      .select("*")
      .order("name");

    if (error) throw error;

    return { success: true, tags };
  } catch (error) {
    console.error("タグ取得エラー:", error);
    return { success: false, error: "タグの取得に失敗しました", tags: [] };
  }
}

/* データ作成 */
// タスク作成
export async function createTask(taskData: Omit<Task, "id" | "created_at">) {
  try {
    // タスクを作成
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.due_date,
        priority: taskData.priority,
        completed: taskData.completed,
        important: taskData.important,
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // タグが指定されている場合、タグを取得し、関連付ける
    if (taskData.tags && taskData.tags.length > 0) {
      for (const tagName of taskData.tags) {
        // タグを検索
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .single();

        const tagId = existingTag?.id;

        // タスクとタグを関連付ける
        const { error: relationError } = await supabase
          .from("task_tags")
          .insert({
            task_id: task.id,
            tag_id: tagId,
          });

        if (relationError) throw relationError;
      }
    }

    revalidatePath("/");
    return { success: true, task };
  } catch (error) {
    console.error("タスク作成エラー:", error);
    return { success: false, error: "タスクの作成に失敗しました" };
  }
}

// タグの作成
export async function createTag(
  name: string,
  color: string,
  textColor: string
) {
  try {
    const { data: tag, error } = await supabase
      .from("tags")
      .insert({
        name,
        color,
        text_color: textColor,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    return { success: true, tag };
  } catch (error) {
    console.error("タグ作成エラー:", error);
    return { success: false, error: "タグの作成に失敗しました" };
  }
}

/* データ更新 */
//タスクの更新
export async function updateTask(id: string, taskData: Partial<Task>) {
  try {
    // タスクを更新
    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.due_date,
        priority: taskData.priority,
        important: taskData.important,
      })
      .eq("id", id);

    if (taskError) throw taskError;

    // タグが指定されている場合、既存の関連を削除して新しい関連を作成
    if (taskData.tags) {
      // 既存の関連を削除
      const { error: deleteError } = await supabase
        .from("task_tags")
        .delete()
        .eq("task_id", id);

      if (deleteError) throw deleteError;

      // 新しい関連を作成
      for (const tagName of taskData.tags) {
        // タグを検索
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .maybeSingle();

        const tagId = existingTag?.id;

        // タスクとタグを関連付ける
        const { error: relationError } = await supabase
          .from("task_tags")
          .insert({
            task_id: id,
            tag_id: tagId,
          });

        if (relationError) throw relationError;
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("タスク更新エラー:", error);
    return { success: false, error: "タスクの更新に失敗しました" };
  }
}

//タスクの完了状態反転
export async function toggleTaskCompletion(id: string) {
  try {
    // 現在のタスク状態を取得
    const { data: task, error: fetchError } = await supabase
      .from("tasks")
      .select("completed")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // 完了状態を反転
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", id);

    if (updateError) throw updateError;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("タスク完了状態切り替えエラー:", error);
    return {
      success: false,
      error: "タスクの完了状態の切り替えに失敗しました",
    };
  }
}

//タスクの重要フラグ反転
export async function toggleTaskImportant(id: string) {
  try {
    // 現在のタスク状態を取得
    const { data: task, error: fetchError } = await supabase
      .from("tasks")
      .select("important")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // 重要フラグを反転
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ important: !task.important })
      .eq("id", id);

    if (updateError) throw updateError;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("タスク重要フラグ切り替えエラー:", error);
    return {
      success: false,
      error: "タスクの重要フラグの切り替えに失敗しました",
    };
  }
}

//タグの更新
export async function updateTag(
  id: string,
  name: string,
  color: string,
  textColor: string
) {
  try {
    const { data: tag, error } = await supabase
      .from("tags")
      .update({
        name,
        color,
        text_color: textColor,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    return { success: true, tag };
  } catch (error) {
    console.error("タグ更新エラー:", error);
    return { success: false, error: "タグの更新に失敗しました" };
  }
}

/* データ削除 */
//タスクの削除
export async function deleteTask(id: string) {
  try {
    // タスクを削除
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("タスク削除エラー:", error);
    return { success: false, error: "タスクの削除に失敗しました" };
  }
}

//タグの削除
export async function deleteTag(id: string) {
  try {
    // タグを削除
    const { error } = await supabase.from("tags").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("タグ削除エラー:", error);
    return { success: false, error: "タグの削除に失敗しました" };
  }
}
