"use client";

import { useState } from "react";
import { WorkoutForm } from "@/components/WorkoutForm";
import { WorkoutFormData, WorkoutMenu } from "@/lib/schema";
import { generateWorkout } from "./actions/generateWorkout";
import { WorkoutTable } from "@/components/WorkoutTable";

export default function Home() {
  const [workoutMenu, setWorkoutMenu] = useState<WorkoutMenu | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: WorkoutFormData) => {
    console.log("フォーム送信データ:", JSON.stringify(formData, null, 2)); // 見やすいようにインデント付きで出力

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateWorkout(formData);

      if (result.error) {
        setError(result.error);
        setWorkoutMenu(null);
      } else if (result.data) {
        setWorkoutMenu(result.data);
        setError(null);
      }
    } catch (err) {
      console.error("エラー:", err);
      setError("予期しないエラーが発生しました");
      setWorkoutMenu(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HABITORA</h1>
          <p className="text-gray-600">AI搭載筋トレメニュー生成アプリ</p>
        </div>

        <div className="space-y-8">
          <WorkoutForm onSubmit={handleFormSubmit} />

          {isLoading && (
            <div className="text-center">
              <p className="text-lg">メニューを生成中...</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          )}

          {workoutMenu && <WorkoutTable menu={workoutMenu} />}
        </div>
      </div>
    </div>
  );
}
