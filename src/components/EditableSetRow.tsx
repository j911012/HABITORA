"use client";

import { useCallback, useState, useTransition } from "react";
import { updateSessionSet } from "@/app/actions/updateSessionSet";
import { calcRm } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { deleteSessionSet } from "@/app/actions/deleteSessionSet";
import { useRouter } from "next/navigation";

type EditableSetRowProps = {
  setId: string;
  setNumber: number;
  isBodyweight: boolean;
  initialTargetReps: number | null;
  initialTargetWeight?: number | null;
  initialMemo?: string | null;
};

export function EditableSetRow({
  setId,
  setNumber,
  isBodyweight,
  initialTargetReps,
  initialTargetWeight,
  initialMemo,
}: EditableSetRowProps) {
  const [reps, setReps] = useState<number | "">(initialTargetReps ?? "");
  const [weight, setWeight] = useState<number | "">(initialTargetWeight ?? "");
  const [memo, setMemo] = useState(initialMemo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 最大挙上重量を計算
  const rm = isBodyweight
    ? null
    : calcRm(
        typeof weight === "number" ? weight : null,
        typeof reps === "number" ? reps : null
      );

  // セットを更新する
  const handleSave = useCallback(() => {
    setError(null);

    // // 入力バリデーション
    if (reps === "" || reps < 1) {
      setError("回数は1以上の整数で入力してください");
      return;
    }
    if (!isBodyweight) {
      if (weight === "") {
        // 空ならnull保存（未指定）
      } else if (typeof weight === "number" && weight < 0) {
        setError("重量は0以上の数値で入力してください");
        return;
      }
    }

    const targetWeight = isBodyweight ? null : weight === "" ? null : weight;

    startTransition(async () => {
      const result = await updateSessionSet({
        setId,
        targetReps: reps,
        targetWeight,
        memo,
      });

      if (result.error) {
        setError(result.error);
        return;
      }
    });
  }, [reps, weight, isBodyweight, setId, memo]);

  // エンターキーでセットを更新
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  // セットを削除する
  const handleDelete = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await deleteSessionSet(setId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }, [setId, router]);

  return (
    <li className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          Set {setNumber}
        </span>
        <span className="text-xs text-gray-400">
          RM {rm !== null ? `${rm.toFixed(1)} kg` : "—"}
        </span>
      </div>

      <div
        className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 shrink-0 w-14">重量</label>
          {isBodyweight ? (
            <span className="text-gray-700 text-sm">自重</span>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <input
                type="number"
                className="w-full h-10 border rounded px-3 text-sm"
                value={weight}
                onChange={(e) =>
                  setWeight(e.target.value === "" ? "" : Number(e.target.value))
                }
                onBlur={handleSave}
                placeholder="kg"
                min={0}
                step={0.25}
                inputMode="decimal"
                disabled={isPending}
              />
              <span className="text-gray-500 text-sm shrink-0">kg</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 shrink-0 w-14">回数</label>
          <div className="flex items-center gap-2 w-full">
            <input
              type="number"
              className="w-full h-10 border rounded px-3 text-sm"
              value={reps}
              onChange={(e) =>
                setReps(e.target.value === "" ? "" : Number(e.target.value))
              }
              onBlur={handleSave}
              placeholder="回数"
              min={1}
              disabled={isPending}
            />
            <span className="text-gray-500 text-sm shrink-0">回</span>
          </div>
        </div>

        <div className="sm:col-span-1">
          <label className="sr-only">メモ</label>
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              className="w-full h-10 border rounded px-3 text-sm"
              placeholder="メモ（任意）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onBlur={handleSave}
              disabled={isPending}
            />
            <button
              type="button"
              aria-label="削除"
              className="text-gray-400 hover:text-red-500 text-sm cursor-pointer"
              onClick={handleDelete}
              disabled={isPending}
              title="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </li>
  );
}
