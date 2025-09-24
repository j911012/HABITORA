"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * セッション完了:
 * 1) 空セットの削除（target_reps IS NULL AND target_weight IS NULL）
 * 2) 空メニューの削除（セット0件の session_exercises）
 * 3) workout_sessions を completed に更新
 */
export async function completeWorkout(sessionId: string) {
  const supabase = await createClient();

  if (!sessionId) {
    return { error: "無効なセッションIDです" };
  }

  // 対象セッションのメニューID一覧を取得
  const { data: exercises, error: exErr } = await supabase
    .from("session_exercises")
    .select("id")
    .eq("session_id", sessionId);

  if (exErr) {
    console.error("fetch exercises error:", exErr);
    return { error: "メニューの取得に失敗しました" };
  }

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  // メニューが無い場合はそのまま completed にする
  if (exerciseIds.length === 0) {
    const { error } = await supabase
      .from("workout_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
    if (error) {
      console.error("complete update error:", error);
      return { error: "ワークアウト完了に失敗しました" };
    }
    return {};
  }

  // 1) 空セット削除: reps も weight も NULL の行のみ
  {
    const { error: delEmptySetsErr } = await supabase
      .from("session_sets")
      .delete()
      .in("session_exercise_id", exerciseIds)
      .is("target_reps", null)
      .is("target_weight", null);
    if (delEmptySetsErr) {
      console.error("delete empty sets error:", delEmptySetsErr);
      return { error: "空セットの削除に失敗しました" };
    }
  }

  // 2) 空メニュー削除: セットが1件も残っていないメニューを特定して削除
  // 2-1) まだセットが残っているメニューIDを distinct 取得
  const { data: hasSetRows, error: hasSetErr } = await supabase
    .from("session_sets")
    .select("session_exercise_id")
    .in("session_exercise_id", exerciseIds);

  if (hasSetErr) {
    console.error("fetch non-empty exercises error:", hasSetErr);
    return { error: "メニュー状態の確認に失敗しました" };
  }

  const nonEmptyIds = new Set(
    (hasSetRows ?? []).map(
      (r: { session_exercise_id: string }) => r.session_exercise_id
    )
  );
  const emptyExerciseIds = exerciseIds.filter((id) => !nonEmptyIds.has(id));

  if (emptyExerciseIds.length > 0) {
    const { error: delEmptyExErr } = await supabase
      .from("session_exercises")
      .delete()
      .in("id", emptyExerciseIds);
    if (delEmptyExErr) {
      console.error("delete empty exercises error:", delEmptyExErr);
      return { error: "空メニューの削除に失敗しました" };
    }
  }

  // 3) セッションを completed に更新
  const { error } = await supabase
    .from("workout_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error("complete update error:", error);
    return { error: "ワークアウト完了に失敗しました" };
  }

  return {};
}
