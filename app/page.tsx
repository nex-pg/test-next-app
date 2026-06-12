// /app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import SideBar from "./components/SideBar";
import TabsMenu from "./components/TabsMenu";
import Header from "./components/Header";
import TaskModal from "./components/TaskModal";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import TagModal, { TagColor } from "./components/TagModal";
import DeleteTagDialog from "./components/DeleteTagDialog";
import { Tag, Task } from "./lib/supabase";
import { toast } from "sonner";
import {
  createTag,
  createTask,
  deleteTag,
  deleteTask,
  fetchTags,
  fetchTasks,
  toggleTaskCompletion,
  toggleTaskImportant,
  updateTag,
  updateTask,
} from "./actions/supabaseActions";

// フィルタータイプの定義
export type FilterType = "all" | "important" | "today" | "scheduled" | "tag";

export default function Home() {
  // タスクとタグの状態
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // フィルター状態
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);

  // モーダルの状態
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentEditTask, setCurrentEditTask] = useState<Task | undefined>(
    undefined
  );

  //削除確認ダイアログの状態
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  //タグモーダルの状態
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagModalMode, setTagModalMode] = useState<"add" | "edit">("add");
  const [currentEditTag, setCurrentEditTag] = useState<Tag | null>(null);

  //タグの色設定
  const [availableTagColors] = useState<TagColor[]>([
    { id: "blue", name: "青", value: "bg-blue-500" },
    { id: "green", name: "緑", value: "bg-green-500" },
    { id: "amber", name: "黄", value: "bg-amber-500" },
    { id: "red", name: "赤", value: "bg-red-500" },
    { id: "purple", name: "紫", value: "bg-purple-500" },
    { id: "pink", name: "ピンク", value: "bg-pink-500" },
    { id: "indigo", name: "藍", value: "bg-indigo-500" },
    { id: "cyan", name: "水色", value: "bg-cyan-500" },
  ]);

  // タグ削除確認ダイアログの状態
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  // 初期データの読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await loadTasks();
      await loadTags();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  // タスクの読み込み
  const loadTasks = async () => {
    const { success, tasks: fetchedTasks, error } = await fetchTasks();
    if (success && fetchedTasks) {
      setTasks(fetchedTasks as Task[]);
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }
  };

  // タグの読み込み
  const loadTags = async () => {
    const { success, tags: fetchedTags, error } = await fetchTags();
    if (success && fetchedTags) {
      setTags(fetchedTags);
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }
  };

  // 今日の日付を取得
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // タグでフィルタリング
  const handleTagFilter = (tagName: string) => {
    setCurrentFilter("tag");
    setSelectedTagName(tagName);
  };

  // フィルタリングされたタスク
  const getFilteredTasks = () => {
    // まず検索クエリでフィルタリング
    let filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // 次にフィルタータイプでフィルタリング
    switch (currentFilter) {
      case "important":
        filtered = filtered.filter((task) => task.important);
        break;
      case "today":
        filtered = filtered.filter((task) => task.due_date === todayStr);
        break;
      case "scheduled":
        filtered = filtered.filter(
          (task) => task.due_date && task.due_date !== ""
        );
        break;
      case "tag":
        filtered = filtered.filter((task) =>
          task.tags?.includes(selectedTagName || "")
        );
        break;
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // フィルターの変更
  const changeFilter = (filter: FilterType) => {
    setCurrentFilter(filter);
    // フィルターが「all」に変更された場合は、タグの選択を解除
    if (filter === "all") {
      setSelectedTagName(null);
    }
  };

  // タグの色情報を取得
  const getTagColors = () => {
    const tagColors: Record<string, { color: string; textColor: string }> = {};

    tags.forEach((tag) => {
      tagColors[tag.name] = {
        color: tag.color,
        textColor: tag.text_color,
      };
    });

    return tagColors;
  };

  const tagColors = getTagColors();
  console.log("tagColors", tagColors);
  console.log("tags", tags);

  // タスクの完了状態を切り替え
  const toggleTaskComplete = async (taskId: string) => {
    const { success, error } = await toggleTaskCompletion(taskId);

    if (success) {
      await loadTasks();
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }
  };

  // タスクの重要フラグを切り替え
  const toggleTaskImportantFlag = async (taskId: string) => {
    const { success, error } = await toggleTaskImportant(taskId);

    if (success) {
      await loadTasks();
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }
  };

  // タスクの追加
  const handleAddTask = async (taskData: Omit<Task, "id" | "completed">) => {
    const { success, error } = await createTask({
      ...taskData,
      completed: false,
    });

    if (success) {
      await loadTasks();
      toast.success("タスクが追加されました", {
        description: `「${taskData.title}」が正常に追加されました。`,
      });
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }
  };

  // タスクの更新
  const handleEditTask = async (taskData: Omit<Task, "id" | "completed">) => {
    if (!currentEditTask) return;

    const { success, error } = await updateTask(currentEditTask.id, {
      ...taskData,
      completed: currentEditTask.completed,
    });

    if (success) {
      await loadTasks();
      toast.success("タスクが更新されました", {
        description: `「${taskData.title}」が正常に更新されました。`,
      });
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }
  };

  // タスクの保存（追加または更新）
  const handleSaveTask = async (taskData: Omit<Task, "id" | "completed">) => {
    if (modalMode === "add") {
      await handleAddTask(taskData);
    } else {
      await handleEditTask(taskData);
    }
  };

  // タスク編集モーダルを開く
  const openEditModal = (task: Task) => {
    setCurrentEditTask(task);
    setModalMode("edit");
    setIsTaskModalOpen(true);
  };

  // タスク追加モーダルを開く
  const openAddModal = () => {
    setCurrentEditTask(undefined);
    setModalMode("add");
    setIsTaskModalOpen(true);
  };

  // タスク削除ダイアログを開く
  const openDeleteDialog = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  // タスクを削除
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    const taskToDeleteObj = tasks.find((task) => task.id === taskToDelete);
    if (!taskToDeleteObj) return;

    const { success, error } = await deleteTask(taskToDelete);

    if (success) {
      await loadTasks();
      toast.success("タスクが削除されました", {
        description: `「${taskToDeleteObj.title}」が削除されました。`,
      });
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }

    // ダイアログを閉じる
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  // タグモーダルを開く関数
  const openAddTagModal = () => {
    setTagModalMode("add");
    setCurrentEditTag(null);
    setIsTagModalOpen(true);
  };

  const openEditTagModal = (tag: Tag) => {
    setTagModalMode("edit");
    setCurrentEditTag(tag);
    setIsTagModalOpen(true);
  };

  // 新しいタグを追加
  const handleAddTag = async (name: string, colorId: string) => {
    const selectedColor = availableTagColors.find(
      (color) => color.id === colorId
    );
    if (!selectedColor) return;

    // 色の設定を作成
    const colorClass = selectedColor.value;
    const baseColor = colorClass.replace("bg-", "").replace("-500", "");

    // 静的なクラス名を使用して色を設定
    const colorValue = `bg-${baseColor}-100 dark:bg-opacity-75`;
    const textColorValue = `text-${baseColor}-700`;

    // 開発時のデバッグ用
    console.log(
      `Creating tag with color: ${colorValue}, textColor: ${textColorValue}`
    );

    const { success, error } = await createTag(
      name,
      colorValue,
      textColorValue
    );

    if (success) {
      await loadTags();
      toast.success("タグが追加されました", {
        description: `「${name}」タグが正常に追加されました。`,
      });
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }
  };

  // タグを更新
  const handleUpdateTag = async (id: string, name: string, colorId: string) => {
    const selectedColor = availableTagColors.find(
      (color) => color.id === colorId
    );
    if (!selectedColor) return;

    // 色の設定を作成
    const colorClass = selectedColor.value;
    const baseColor = colorClass.replace("bg-", "").replace("-500", "");

    // 静的なクラス名を使用して色を設定
    const colorValue = `bg-${baseColor}-100 dark:bg-opacity-75`;
    const textColorValue = `text-${baseColor}-700`;

    const { success, error } = await updateTag(
      id,
      name,
      colorValue,
      textColorValue
    );

    if (success) {
      // タグ名が変更された場合、フィルターも更新
      const oldTag = tags.find((t) => t.id === id);
      if (
        oldTag &&
        currentFilter === "tag" &&
        selectedTagName === oldTag.name
      ) {
        setSelectedTagName(name);
      }

      await loadTags();
      await loadTasks();
      toast.success("タグが更新されました", {
        description: `「${name}」タグが正常に更新されました。`,
      });
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }
  };

  // タグモーダルのonSubmit
  const handleTagModalSubmit = async (
    name: string,
    colorId: string,
    id?: string
  ) => {
    if (tagModalMode === "add") {
      await handleAddTag(name, colorId);
    } else if (tagModalMode === "edit" && id) {
      await handleUpdateTag(id, name, colorId);
    }
  };

  // タグ削除ダイアログを開く
  const openDeleteTagDialog = (tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteTagDialogOpen(true);
  };

  //タグを削除
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    const { success, error } = await deleteTag(tagToDelete.id);

    if (success) {
      // タグが削除されたら、そのタグでフィルタリングしていた場合はすべてのタスクを表示
      if (currentFilter === "tag" && selectedTagName === tagToDelete.name) {
        setCurrentFilter("all");
        setSelectedTagName(null);
      }

      await loadTags();
      await loadTasks();

      toast.success("タグが削除されました", {
        description: `「${tagToDelete.name}」タグが削除されました。`,
      });
    } else if (error) {
      toast.error("エラー", {
        description: error,
      });
    }

    // ダイアログを閉じる
    setIsDeleteTagDialogOpen(false);
    setTagToDelete(null);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-6">
        {/* ヘッダー */}
        <Header />
        <main className="mt-8">
          <div className="grid gap-6 md:grid-cols-[250px_1fr]">
            {/* サイドバー */}
            <SideBar
              currentFilter={currentFilter}
              tags={tags}
              selectedTagName={selectedTagName}
              handleTagFilter={handleTagFilter}
              changeFilter={changeFilter}
              openAddTagModal={openAddTagModal}
              openEditTagModal={openEditTagModal}
              openDeleteTagDialog={openDeleteTagDialog}
            />

            {/* メインコンテンツ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {/* タスク一覧タイトル */}
                  {currentFilter === "all" && "すべてのタスク"}
                  {currentFilter === "important" && "重要なタスク"}
                  {currentFilter === "today" && "今日のタスク"}
                  {currentFilter === "scheduled" && "予定されたタスク"}
                  {currentFilter === "tag" &&
                    selectedTagName &&
                    `タグ: ${selectedTagName}`}
                </h2>
                <Button size="sm" className="gap-1" onClick={openAddModal}>
                  <Plus className="h-4 w-4" />
                  新しいタスク
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="タスクを検索..."
                  className="max-w-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* ローディング条件 */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                //タブメニュー
                <TabsMenu
                  tasks={filteredTasks}
                  tagColors={tagColors}
                  toggleTaskComplete={toggleTaskComplete}
                  toggleTaskImportantFlag={toggleTaskImportantFlag}
                  openEditModal={openEditModal}
                  openDeleteDialog={openDeleteDialog}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      {/* タスクモーダル（追加・編集共用） */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editTask={currentEditTask}
        mode={modalMode}
        availableTags={tags.map((tag) => tag.name)}
        tagColors={tagColors}
      />
      {/* タスク削除ダイアログ */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteTask}
        title="タスクを削除"
        description="このタスクを削除してもよろしいですか？この操作は元に戻せません。"
      />
      {/* タグモーダル */}
      <TagModal
        isOpen={isTagModalOpen}
        mode={tagModalMode}
        onClose={() => {
          setIsTagModalOpen(false);
          setCurrentEditTag(null);
        }}
        onSubmit={handleTagModalSubmit}
        existingTagNames={
          tagModalMode === "edit" && currentEditTag
            ? tags.filter((t) => t.id !== currentEditTag.id).map((t) => t.name)
            : tags.map((t) => t.name)
        }
        availableColors={availableTagColors}
        editTag={currentEditTag}
      />
      {/* タグ削除確認ダイアログ */}
      <DeleteTagDialog
        isOpen={isDeleteTagDialogOpen}
        onClose={() => {
          setIsDeleteTagDialogOpen(false);
          setTagToDelete(null);
        }}
        onConfirm={handleDeleteTag}
        tagName={tagToDelete?.name || ""}
      />
    </div>
  );
}
