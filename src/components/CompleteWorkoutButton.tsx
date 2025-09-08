"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeWorkout } from "@/app/actions/completeWorkout";
import { Button } from "@/components/ui/button";

/**
 * ワークアウト完了ボタン
 * 完了処理 → localStorage削除 → ホームに戻る
 */
export function CompleteWorkoutButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeWorkout(sessionId);
      if (result?.error) {
        alert(result.error);
        return;
      }

      // localStorage からセッションIDを削除
      localStorage.removeItem("activeWorkoutSessionId");
      // ホームページに戻る
      router.push("/");
    });
  };

  return (
    <Button className="w-[300px]" onClick={handleComplete} disabled={isPending}>
      {isPending ? "完了処理中..." : "ワークアウトを完了"}
    </Button>
  );
}
