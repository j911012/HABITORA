"use server";

import { createClient } from "@/lib/supabase/server";
import { WorkoutMenu } from "@/lib/schema";

export async function startWorkout(menu: WorkoutMenu) {
  const supabase = await createClient();

  try {
    // 1. workout_sessionsテーブルにセッションを作成
    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: "anonymous", // 後で認証機能実装時に変更
        status: "in_progress",
      })
      .select("id")
      .single(); // session.id として使う

    if (sessionError) {
      console.error("Session createion error:", sessionError);
      return { error: "ワークアウトセッションの作成に失敗しました" };
    }

    // 2. session_exercisesテーブルにエクササイズを保存
    const exercisesToInsert = menu.map((exercise, index) => ({
      session_id: session.id,
      name: exercise.exercise,
      order_index: index,
      is_bodyweight: exercise.weight.isBodyweight,
    }));

    const { data: exercises, error: exercisesError } = await supabase
      .from("session_exercises")
      .insert(exercisesToInsert)
      .select("id, name, order_index");

    if (exercisesError) {
      console.error("Exercise insertion error:", exercisesError);
      return { error: "エクササイズの保存に失敗しました" };
    }

    // 3. session_setsテーブルに各エクササイズのセットを保存
    const setsToInsert = [];

    for (let i = 0; i < menu.length; i++) {
      const menuItem = menu[i];
      const exercise = exercises.find((ex) => ex.order_index === i);

      if (!exercise) continue; // エクササイズが見つからない場合はスキップ

      // 各エクササイズのセット数分のレコードを作成
      for (let setNumber = 1; setNumber <= menuItem.sets; setNumber++) {
        setsToInsert.push({
          session_exercise_id: exercise.id,
          set_number: setNumber,
          target_reps: menuItem.reps,
          target_weight: menuItem.weight.isBodyweight
            ? null
            : menuItem.weight.value,
        });
      }
    }

    const { error: setsError } = await supabase
      .from("session_sets")
      .insert(setsToInsert);

    if (setsError) {
      console.error("Set insertion error:", setsError);
      return { error: "セットの保存に失敗しました" };
    }

    return { sessionId: session.id };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "予期しないエラーが発生しました" };
  }
}
