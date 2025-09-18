"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function AddExerciseButton() {
  return (
    <>
      <Button variant="ghost" size="sm">
        ＋ メニューを追加
      </Button>

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">メニューを追加</h3>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exercise-name">メニュー名</Label>
              <Input id="exercise-name" placeholder="例: ベンチプレス" />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="is-bodyweight" />
              <Label htmlFor="is-bodyweight">自重メニュー</Label>
            </div>

            {/* <p className="text-sm text-red-500">{""}</p> */}

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
              <Button type="submit">追加する</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
