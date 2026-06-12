// /app/components/TaskItem.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarClock,
  MoreVertical,
  Pencil,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "../lib/supabase";

type Props = {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onToggleImportant: (taskId: string) => void;
  tagColors: Record<string, { color: string; textColor: string }>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
};

const TaskItem = ({
  task,
  onToggleComplete,
  onToggleImportant,
  tagColors,
  onEditTask,
  onDeleteTask,
}: Props) => {
  const {
    id,
    title,
    description,
    due_date,
    priority,
    tags,
    completed,
    important,
  } = task;

  const priorityColors = {
    low: "bg-green-100 text-green-700 dark:bg-opacity-75",
    medium: "bg-amber-100 text-amber-700 dark:bg-opacity-75",
    high: "bg-rose-100 text-rose-700 dark:bg-opacity-75",
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "期限なし";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        completed && "opacity-60"
      )}
    >
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* 完了チェックボックス */}
          <Checkbox
            checked={completed}
            className="mt-1"
            onCheckedChange={() => onToggleComplete(id)}
          />
          <div>
            {/* タスクタイトル */}
            <div className="flex items-center gap-2">
              <CardTitle
                className={cn(
                  "text-lg transition-all duration-200",
                  completed && "line-through text-muted-foreground"
                )}
              >
                {title}
              </CardTitle>
              {important && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            {/* タスク内容 */}
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
        {/* ドロップダウンメニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleImportant(id)}>
              {important ? (
                <>
                  <StarOff className="mr-2 h-4 w-4" />
                  <span>重要から削除</span>
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  <span>重要にする</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditTask(task)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>編集</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDeleteTask(id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>削除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* 期限 */}
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarClock className="mr-1 h-3.5 w-3.5" />
            <span>{formatDate(due_date)}</span>
          </div>
          {/* 優先度 */}
          <Badge variant="outline" className={priorityColors[priority]}>
            {priority === "low" ? "低" : priority === "medium" ? "中" : "高"}
            優先度
          </Badge>
          {/* タグ */}
          {tags &&
            tags.map((tag) => {
              // タグの色情報を取得
              const tagColor = tagColors[tag];
              // デフォルトの色クラス
              const defaultColorClass =
                "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    tagColor?.color || defaultColorClass,
                    tagColor?.textColor || "text-gray-800 dark:text-gray-200"
                  )}
                >
                  {tag}
                </Badge>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};
export default TaskItem;
