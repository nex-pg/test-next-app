// /app/components/TaskModal.tsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Check, Star } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Task } from "../lib/supabase";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "completed">) => void;
  editTask?: Task;
  mode: "add" | "edit";
  availableTags: string[];
  tagColors: Record<string, { color: string; textColor: string }>;
};

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  editTask,
  mode,
  availableTags,
  tagColors,
}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<string>("medium");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [important, setImportant] = useState(false);

  // 編集モードの場合、フォームに既存のタスク情報を設定
  useEffect(() => {
    if (mode === "edit" && editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setDueDate(editTask.due_date ? new Date(editTask.due_date) : undefined);
      setPriority(editTask.priority);
      setSelectedTags(editTask.tags || []);
      setImportant(editTask.important || false);
    } else if (mode === "add") {
      resetForm();
    }
  }, [mode, editTask, isOpen]);

  //サブミット処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!title.trim()) return;

    // タスクオブジェクトを作成
    const taskData = {
      title,
      description,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      priority: priority as "low" | "medium" | "high",
      tags: selectedTags,
      important,
    };

    // 親コンポーネントにタスクを渡す
    onSave(taskData);

    // フォームをリセット
    if (mode === "add") {
      resetForm();
    }

    // モーダルを閉じる
    onClose();
  };

  // フォーム初期化
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    setPriority("medium");
    setSelectedTags([]);
    setImportant(false);
  };

  //  タグのトグル処理
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "新しいタスクを追加" : "タスクを編集"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "タスクの詳細を入力してください。すべての項目を入力したら「保存」をクリックします。"
                : "タスクの詳細を編集してください。変更が完了したら「更新」をクリックします。"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="required">
                タイトル
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タスクのタイトルを入力"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="タスクの詳細を入力（任意）"
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="important"
                checked={important}
                onCheckedChange={setImportant}
              />
              <Label htmlFor="important" className="flex items-center gap-1">
                重要 <Star className="h-4 w-4 text-yellow-400" />
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="due-date">期限</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="due-date"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? (
                        format(dueDate, "yyyy年MM月dd日", { locale: ja })
                      ) : (
                        <span>日付を選択</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">優先度</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="優先度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>タグ</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "cursor-pointer",
                      selectedTags.includes(tag)
                        ? cn(
                            tagColors[tag]?.color,
                            tagColors[tag]?.textColor,
                            "hover:brightness-90 dark:hover:brightness-110"
                          )
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <Check className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">{mode === "add" ? "保存" : "更新"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default TaskModal;
