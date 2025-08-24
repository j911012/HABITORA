"use client";

import { useState } from "react";
import { type WorkoutMenu, type WorkoutMenuRow } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { startWorkout } from "@/app/actions/startWorkout";
import { useRouter } from "next/navigation";

type WorkoutTableProps = {
  menu: WorkoutMenu;
  onRegenerate: () => void;
  isRegenerating: boolean;
};

export function WorkoutTable({
  menu,
  onRegenerate,
  isRegenerating,
}: WorkoutTableProps) {
  const [isStartWorkout, setIsStartWorkout] = useState(false);
  const router = useRouter();

  // 自重の場合は"自重"、荷重の場合は"kg"を表
  const formatWeight = (weight: WorkoutMenuRow["weight"]) => {
    if (weight.isBodyweight) {
      return "自重";
    }
    return weight.value ? `${weight.value}kg` : "-";
  };

  // ワークアウト開始ボタンのクリックハンドラー
  const handleStartWorkout = async () => {
    setIsStartWorkout(true);
    try {
      const result = await startWorkout(menu);

      if (result.error) {
        alert(`ワークアウト開始に失敗しました: ${result.error}`);
      } else if (result.sessionId) {
        // セッションページにリダイレクト
        router.push(`/workout/${result.sessionId}`);
      }
    } catch (error) {
      console.error("ワークアウト開始エラー:", error);
      alert("ワークアウト開始に失敗しました");
    } finally {
      setIsStartWorkout(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">提案されたメニュー</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                種目
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                重量
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                セット数
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                回数
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                レスト時間
              </th>
            </tr>
          </thead>
          <tbody>
            {menu.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {row.exercise}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {formatWeight(row.weight)}
                </td>
                <td className="border border-gray-300 px-4 py-2">{row.sets}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {row.reps}回
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {row.restSec}秒
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          ※このメニューはAIが自動生成した参考プランです。医療・専門家の指導を代替するものではありません。
        </p>
      </div>

      {/* 再生成ボタン */}
      <div className="mt-6 flex flex-col gap-4 items-center">
        {/* 開始ボタン */}
        <Button
          onClick={handleStartWorkout}
          disabled={isStartWorkout || isRegenerating}
          className="w-[300px] bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isStartWorkout
            ? "ワークアウトを開始中..."
            : "このメニューで開始する"}
        </Button>

        {/* 再生成ボタン */}
        <Button
          onClick={onRegenerate}
          disabled={isRegenerating || isStartWorkout}
          variant="outline"
          className="w-[300px]"
        >
          {isRegenerating ? "メニューを再生成中..." : "メニューを再生成"}
        </Button>
      </div>
    </div>
  );
}
