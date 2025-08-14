import { z } from "zod";

// Zodスキーマの定義
export const workoutFormSchema = z.object({
  parts: z
    .array(z.enum(["胸", "背中", "肩", "腕", "脚", "全身"]))
    .min(1, "少なくとも1つの部位を選択してください"),
  time: z
    .number()
    .min(5, "最低5分以上入力してください")
    .max(180, "最大180分まで入力できます"),
  goal: z.enum(["筋肥大", "筋力UP", "健康維持", "シェイプアップ"], {
    required_error: "目的を選択してください",
  }),
  level: z.enum(["初級", "中級", "上級"], {
    required_error: "レベルを選択してください",
  }),
  bench: z.number().optional(),
  deadlift: z.number().optional(),
  squat: z.number().optional(),
});

// 出力メニュー用Zodスキーマの定義
export const workoutMenuSchema = z.array(
  z.object({
    exercise: z.string().min(1, "種目名は必須です"),
    sets: z.number().int().min(1).max(10),
    reps: z.number().int().min(1).max(30),
    restSec: z.number().int().min(0).max(300),
    weight: z.object({
      isBodyweight: z.boolean(), // true: 自重, false: 荷重
      value: z.number().optional(),
    }),
  })
);

// TypeScriptの型定義
export type WorkoutFormData = z.infer<typeof workoutFormSchema>;
export type WorkoutMenu = z.infer<typeof workoutMenuSchema>;
export type WorkoutMenuRow = z.infer<typeof workoutMenuSchema>[number];

// 選択肢の定数定義
export const BODY_PARTS = ["胸", "背中", "肩", "腕", "脚", "全身"] as const;
export const GOALS = [
  "筋肥大",
  "筋力UP",
  "健康維持",
  "シェイプアップ",
] as const;
export const LEVELS = ["初級", "中級", "上級"] as const;

// フォーム状態の初期値
export const initialFormState: WorkoutFormData = {
  parts: [],
  time: 60,
  goal: "筋力UP",
  level: "初級",
  bench: undefined,
  deadlift: undefined,
  squat: undefined,
};
