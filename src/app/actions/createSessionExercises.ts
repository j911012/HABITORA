"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * セッションに新しいメニュー（種目）を追加
 * - デフォルトで３セットを追加
 * - order_indexは直前の最大値 + 1
 * - セットはset_numberのみを保存(target_*は未指定=DBデフォルトnull)
 */
export async function createSessionExercises(input: {
  sessionId: string;
  exerciseName: string;
  isBodyweight: boolean;
  initialSetsCount: number; // デフォルト３セット
}) {
  const supabase = await createClient();
  const { sessionId, exerciseName, isBodyweight, initialSetsCount } = input;

  if (!sessionId || !exerciseName.trim()) {
    return { error: "セッションIDまたは種目名が無効です" };
  }

  // 1) 直前の最大order_indexを取得
  const { data: lastExercise, error: lastExerciseError } = await supabase
    .from("session_exercises")
    .select("order_index")
    .eq("session_id", sessionId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastExerciseError) {
    console.error("lastExerciseError:", lastExerciseError);
    return { error: "直前の種目の取得に失敗しました" };
  }

  const nextOrderIndex = (lastExercise?.order_index ?? 0) + 1;

  // 2) メニューを作成
  const { data: newExercise, error: newExerciseError } = await supabase
    .from("session_exercises")
    .insert({
      session_id: sessionId,
      name: exerciseName,
      is_bodyweight: isBodyweight,
      order_index: nextOrderIndex,
    })
    .select("id")
    .single();

  if (newExerciseError || !newExercise) {
    console.error("newExerciseError:", newExerciseError);
    return { error: "メニューの作成に失敗しました" };
  }

  // 3) 初期セットを作成
  const sets = Array.from({ length: initialSetsCount }, (_, i) => ({
    session_exercise_id: newExercise.id,
    set_number: i + 1,
  }));

  if (sets.length > 0) {
    const { error: setError } = await supabase
      .from("session_sets")
      .insert(sets);

    if (setError) {
      console.error("setError:", setError);
      return { error: "セットの作成に失敗しました" };
    }
  }

  return { id: newExercise.id };
}
