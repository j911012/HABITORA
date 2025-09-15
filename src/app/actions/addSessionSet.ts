"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 指定したエクササイズに新規セットを追加(即時INSERT)
 * - set_number = 直前の最大セット番号 + 1
 * - 直前セットがあれば、reps/weightをコピー
 * - 初回は reps=10, weight=null
 * @param sessionExerciseId
 * @returns { id?: string, error?: string }
 */
export async function addSessionSet(sessionExerciseId: string) {
  const supabase = await createClient();

  if (!sessionExerciseId) {
    return { error: "無効なエクササイズIDです" };
  }

  // 種目の自重フラグを取得（初回時のweight初期化に使用）
  const { data: exercise, error: exerciseError } = await supabase
    .from("session_exercises")
    .select("is_bodyweight")
    .eq("id", sessionExerciseId)
    .single();

  if (exerciseError || !exercise) {
    console.error("exerciseError:", exerciseError);
    return { error: "エクササイズの取得に失敗しました" };
  }

  // 直前セットの取得
  const { data: lastSet, error: lastSetError } = await supabase
    .from("session_sets")
    .select("set_number, target_reps, target_weight")
    .eq("session_exercise_id", sessionExerciseId)
    .order("set_number", { ascending: false }) // 最新のセットを取得
    .limit(1) // 1件取得
    .maybeSingle(); // セットがない場合はnull

  if (lastSetError) {
    console.error("lastSetError:", lastSetError);
    return { error: "直前セットの取得に失敗しました" };
  }

  const nextSetNumber = (lastSet?.set_number ?? 0) + 1; // 直前セットの番号 + 1
  const nextReps = lastSet?.target_reps ?? 10; // 直前セットの回数（デフォルトは10）
  const nextWeight = exercise.is_bodyweight
    ? null
    : typeof lastSet?.target_weight !== "undefined"
    ? lastSet.target_weight
    : null; // 自重フラグがtrueの場合はnull、falseの場合は直前セットの重量（デフォルトはnull）

  const insertBody = {
    session_exercise_id: sessionExerciseId,
    set_number: nextSetNumber,
    target_reps: nextReps,
    target_weight: nextWeight,
  };

  const { data: insertedSet, error: insertError } = await supabase
    .from("session_sets")
    .insert(insertBody)
    .select("id") // 新規セットのIDを取得
    .single();

  if (insertError || !insertedSet) {
    console.error("insertError:", insertError);
    return { error: "セットの追加に失敗しました" };
  }

  return { id: insertedSet.id }; // 新規セットのIDを返す
}
