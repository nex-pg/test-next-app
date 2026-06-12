// /app/components/TagModal.tsx

import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tag } from "../lib/supabase";

export type TagColor = {
  id: string;
  name: string;
  value: string;
};
type Props = {
  isOpen: boolean;
  mode: "add" | "edit";
  onClose: () => void;
  onSubmit: (name: string, colorId: string, id?: string) => void;
  existingTagNames: string[];
  availableColors: TagColor[];
  editTag: Tag | null;
};

const TagModal = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  existingTagNames,
  availableColors,
  editTag,
}: Props) => {
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    availableColors[0]?.id || ""
  );
  const [error, setError] = useState<string | null>(null);

  // タグデータが変更されたときにフォームを更新
  useEffect(() => {
    if (mode === "edit" && editTag) {
      setTagName(editTag.name);
      // 色IDを特定
      const colorClass = editTag.color.split(" ")[0];
      const baseColor = colorClass.replace(/bg-(\w+)-\d+/, "$1");
      const colorId =
        availableColors.find((c) => c.value.includes(baseColor))?.id ||
        availableColors[0].id;
      setSelectedColor(colorId);
    } else if (mode === "add") {
      setTagName("");
      setSelectedColor(availableColors[0]?.id || "");
    }
    setError(null);
  }, [mode, editTag, availableColors, isOpen]);

  //サブミット処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // バリデーション
    if (!tagName.trim()) {
      setError("タグ名を入力してください");
      return;
    }
    // add時: 既存名と重複不可, edit時: 自分以外と重複不可
    if (
      (mode === "add" && existingTagNames.includes(tagName.trim())) ||
      (mode === "edit" &&
        tagName.trim() !== editTag?.name &&
        existingTagNames.includes(tagName.trim()))
    ) {
      setError("このタグ名は既に存在します");
      return;
    }
    onSubmit(tagName.trim(), selectedColor, editTag?.id);
    // フォームをリセット
    setTagName("");
    setSelectedColor(availableColors[0]?.id || "");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "新しいタグを追加" : "タグを編集"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "タスクの分類に使用する新しいタグを作成します。"
                : "タグの名前や色を変更できます。"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tagName" className="required">
                タグ名
              </Label>
              <Input
                id="tagName"
                value={tagName}
                onChange={(e) => {
                  setTagName(e.target.value);
                  setError(null);
                }}
                placeholder="タグ名を入力"
                className={error ? "border-destructive" : ""}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="grid gap-2">
              <Label>色</Label>
              <RadioGroup
                value={selectedColor}
                onValueChange={setSelectedColor}
                className="flex flex-wrap gap-2"
              >
                {availableColors.map((color) => (
                  <div key={color.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={color.id}
                      id={`color-${color.id}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`color-${color.id}`}
                      className={`h-8 w-8 rounded-full cursor-pointer flex items-center justify-center border-2 ${
                        selectedColor === color.id
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full ${color.value}`} />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">{mode === "add" ? "追加" : "更新"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TagModal;
