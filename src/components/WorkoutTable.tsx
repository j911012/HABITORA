"use client";

import { type WorkoutMenu, type WorkoutMenuRow } from "@/lib/schema";

type WorkoutTableProps = {
  menu: WorkoutMenu;
};

export function WorkoutTable({ menu }: WorkoutTableProps) {
  // 自重の場合は"自重"、荷重の場合は"kg"を表
  const formatWeight = (weight: WorkoutMenuRow["weight"]) => {
    if (weight.isBodyweight) {
      return "自重";
    }
    return weight.value ? `${weight.value}kg` : "-";
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
    </div>
  );
}
