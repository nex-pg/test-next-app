// /app/components/Header.tsx

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Moon, Palette, Settings, Sun, User } from "lucide-react";

const Header = () => {
  // クライアントサイドでのレンダリングを確認するためのstate
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // コンポーネントがマウントされたことを確認
  useEffect(() => {
    setMounted(true);
  }, []);

  // マウントされるまでは何も表示しない（ハイドレーションエラー防止）
  if (!mounted) {
    return (
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Next Tasks</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* プレースホルダーボタン */}
          <Button variant="ghost" size="icon">
            <Sun className="h-5 w-5" />
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between py-4">
      <h1 className="text-xl font-bold">Next Tasks</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">設定</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>クイック設定</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              ライトモード
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              ダークモード
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Palette className="mr-2 h-4 w-4" />
              システム設定に合わせる
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" className="gap-2">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
export default Header;
