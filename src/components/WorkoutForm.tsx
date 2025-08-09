"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  BODY_PARTS,
  initialFormState,
  type WorkoutFormData,
  workoutFormSchema,
} from "@/lib/schema";
import React, { useState } from "react";

export function WorkoutForm() {
  const [formData, setFormData] = useState<WorkoutFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 配列から型を生成
  // type BodyPart = "胸" | "背中" | "肩" | "腕" | "脚" | "全身"
  type BodyPart = (typeof BODY_PARTS)[number];

  // 部位選択の処理
  const handleBodyPartChange = (part: BodyPart, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      parts: checked
        ? [...prev.parts, part]
        : prev.parts.filter((p) => p !== part),
    }));
  };

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // zodのバリデーション
    const result = workoutFormSchema.safeParse(formData);

    // Zodのバリデーションで失敗したときに、フィールドごとのエラーメッセージをまとめて、stateに保存
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((error) => {
        newErrors[error.path[0] as string] = error.message;
      });
      setErrors(newErrors);
      console.log("バリデーションエラー:", result);
      return;
    }

    // バリデーションが成功した場合
    setErrors({});
    console.log("フォーム送信データ:", JSON.stringify(result.data, null, 2)); // 見やすいようにインデント付きで出力
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        筋トレメニュー生成
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* 部位選択 */}
        <div className="space-y-3">
          <Label className="text-base font-medium">トレーニング部位</Label>
          <p className="text-sm text-gray-500">
            鍛えたい部位を選択してください（複数選択可）
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {BODY_PARTS.map((part) => (
              <div key={part} className="flex items-center space-x-2">
                <Checkbox
                  id={part}
                  checked={formData.parts.includes(part)}
                  onCheckedChange={(checked) =>
                    handleBodyPartChange(part, checked as boolean)
                  }
                />
                <Label htmlFor={part} className="font-normal">
                  {part}
                </Label>
              </div>
            ))}
          </div>
          {errors.parts && (
            <p className="text-red-500 text-sm">{errors.parts}</p>
          )}
        </div>

        {/* メニュー生成ボタン */}
        <div className="flex justify-center">
          <Button type="submit" className="w-[300px] mx-auto">
            メニューを生成
          </Button>
        </div>
      </form>
    </div>
  );
}
