"use server";

import { createClient } from "@/lib/supabase/server";

export async function completeWorkout(sessionId: string) {
  const supabase = await createClient();

  /**
   * ワークアウトセッションを完了状態に更新
   * ワークアウト終了時にセッション状態を適切に更新し、localStorageをクリア
   * @param sessionId - 完了するセッションID
   * @returns エラー時のみエラーメッセージを返す
   */
  const { error } = await supabase
    .from("workout_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error("ワークアウト完了エラー:", error);
    return { error: "ワークアウト完了に失敗しました" };
  }

  return {};
}
