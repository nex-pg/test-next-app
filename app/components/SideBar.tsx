// /app/components/SideBar.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Pencil,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { FilterType } from "../page";
import { Tag as TagType } from "../lib/supabase";

type Props = {
  currentFilter: FilterType;
  tags: TagType[];
  selectedTagName: string | null;
  handleTagFilter: (tagName: string) => void;
  changeFilter: (filter: FilterType) => void;
  openAddTagModal: () => void;
  openEditTagModal: (tag: TagType) => void;
  openDeleteTagDialog: (tag: TagType) => void;
};
const SideBar = ({
  currentFilter,
  tags,
  selectedTagName,
  handleTagFilter,
  changeFilter,
  openAddTagModal,
  openEditTagModal,
  openDeleteTagDialog,
}: Props) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <nav className="grid gap-2">
            <Button
              variant={currentFilter === "all" ? "default" : "ghost"}
              className="justify-start gap-2 px-2 w-full"
              onClick={() => changeFilter("all")}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>すべてのタスク</span>
            </Button>
            <Button
              variant={currentFilter === "important" ? "default" : "ghost"}
              className="justify-start gap-2 px-2 w-full"
              onClick={() => changeFilter("important")}
            >
              <Star className="h-4 w-4" />
              <span>重要</span>
            </Button>
            <Button
              variant={currentFilter === "today" ? "default" : "ghost"}
              className="justify-start gap-2 px-2 w-full"
              onClick={() => changeFilter("today")}
            >
              <CalendarDays className="h-4 w-4" />
              <span>今日</span>
            </Button>
            <Button
              variant={currentFilter === "scheduled" ? "default" : "ghost"}
              className="justify-start gap-2 px-2 w-full"
              onClick={() => changeFilter("scheduled")}
            >
              <Clock className="h-4 w-4" />
              <span>予定</span>
            </Button>
          </nav>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">タグ</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center">
                <Button
                  variant={
                    currentFilter === "tag" && selectedTagName === tag.name
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className={cn(
                    "justify-start gap-2 h-8 flex-grow",
                    currentFilter === "tag" && selectedTagName === tag.name
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : tag.text_color
                  )}
                  onClick={() => handleTagFilter(tag.name)}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      tag.color.split(" ")[0]
                    }`}
                  />
                  <span>{tag.name}</span>
                </Button>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-6 ml-1"
                    onClick={() => openEditTagModal(tag)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">タグを編集</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-6 hover:text-destructive"
                    onClick={() => openDeleteTagDialog(tag)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">タグを削除</span>
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-8 text-muted-foreground"
              onClick={openAddTagModal}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>新しいタグ</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SideBar;
