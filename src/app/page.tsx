"use client";

import { WorkoutForm } from "@/components/WorkoutForm";
import { WorkoutFormData } from "@/lib/schema";
export default function Home() {
  const handleFormSubmit = (formData: WorkoutFormData) => {
    console.log("フォーム送信データ:", JSON.stringify(formData, null, 2)); // 見やすいようにインデント付きで出力
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HABITORA</h1>
          <p className="text-gray-600">AI搭載筋トレメニュー生成アプリ</p>
        </div>

        <WorkoutForm onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
