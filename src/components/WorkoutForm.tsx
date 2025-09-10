"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  BODY_PARTS,
  GOALS,
  LEVELS,
  initialFormState,
  type WorkoutFormData,
  workoutFormSchema,
} from "@/lib/schema";
import React, { useState } from "react";

type WorkoutFormProps = {
  onSubmit: (formData: WorkoutFormData) => void;
};

export function WorkoutForm({ onSubmit }: WorkoutFormProps) {
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

  // 数値入力の処理（複数箇所で使用するため）
  const handleNumberChange = (
    field: "time" | "bench" | "deadlift" | "squat",
    value: string
  ) => {
    const numValue = value === "" ? undefined : Number(value);
    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
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
    onSubmit(result.data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        筋トレメニュー生成
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* 部位選択 */}
        <div className="space-y-3">
          <Label className="text-base font-bold">トレーニング部位</Label>
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

        {/* 時間入力 */}
        <div className="space-y-2">
          <Label htmlFor="time" className="text-base font-bold">
            トレーニング時間（分）
          </Label>
          <Input
            id="time"
            type="number"
            // min={5}
            // max={180}
            value={formData.time ?? ""}
            onChange={(e) => handleNumberChange("time", e.target.value)}
          />
          <p className="text-sm text-gray-500">
            5分〜180分の間で入力してください
          </p>
          {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
        </div>

        {/* 目的選択（ラジオボタン） */}
        <div className="space-y-3">
          <Label className="text-base font-bold">トレーニング目的</Label>
          <RadioGroup
            value={formData.goal}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                goal: value as (typeof GOALS)[number],
              }))
            }
          >
            {GOALS.map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <RadioGroupItem value={goal} id={goal} />
                <Label htmlFor={goal} className="font-normal">
                  {goal}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.goal && <p className="text-red-500 text-sm">{errors.goal}</p>}
        </div>

        {/* レベル選択（ラジオボタン） */}
        <div className="space-y-3">
          <Label className="text-base font-bold">トレーニングレベル</Label>
          <RadioGroup
            value={formData.level}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                level: value as (typeof LEVELS)[number],
              }))
            }
          >
            {LEVELS.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={level} />
                <Label htmlFor={level} className="font-normal">
                  {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.level && (
            <p className="text-red-500 text-sm">{errors.level}</p>
          )}
        </div>

        {/* BIG3 MAX重量（任意入力） */}
        <div className="space-y-4">
          <div>
            <Label className="text-lg font-bold">BIG3 MAX重量（任意）</Label>
            <p className="text-sm text-gray-500">
              より精密なメニュー作成のため、現在のMAX重量を入力してください
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bench">ベンチプレス（kg）</Label>
              <Input
                id="bench"
                type="number"
                min={0}
                value={formData.bench ?? ""}
                onChange={(e) => handleNumberChange("bench", e.target.value)}
                placeholder="例: 80"
              />
              {errors.bench && (
                <p className="text-red-500 text-sm">{errors.bench}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadlift">デッドリフト（kg）</Label>
              <Input
                id="deadlift"
                type="number"
                min={0}
                value={formData.deadlift ?? ""}
                onChange={(e) => handleNumberChange("deadlift", e.target.value)}
                placeholder="例: 120"
              />
              {errors.deadlift && (
                <p className="text-red-500 text-sm">{errors.deadlift}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="squat">バーベルスクワット（kg）</Label>
              <Input
                id="squat"
                type="number"
                min={0}
                value={formData.squat ?? ""}
                onChange={(e) => handleNumberChange("squat", e.target.value)}
                placeholder="例: 100"
              />
              {errors.squat && (
                <p className="text-red-500 text-sm">{errors.squat}</p>
              )}
            </div>
          </div>
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
