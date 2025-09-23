"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteSessionSet(setId: string) {
  const supabase = await createClient();

  // 対象セットのエクササイズIDを取得
  const { data: sessionExercise, error: sessionExerciseError } = await supabase
    .from("session_sets")
    .select("id, session_exercise_id")
    .eq("id", setId)
    .single();

  if (sessionExerciseError || !sessionExercise) {
    console.error("fetch set error:", sessionExerciseError);
    return { error: "セットの取得に失敗しました" };
  }

  // セットを削除
  const { error: deleteError } = await supabase
    .from("session_sets")
    .delete()
    .eq("id", setId);

  if (deleteError) {
    console.error("delete set error:", deleteError);
    return { error: "セットの削除に失敗しました" };
  }

  // 残っているセットの一覧を取得
  const { data: remainsSets, error: remainsSetsError } = await supabase
    .from("session_sets")
    .select("id")
    .eq("session_exercise_id", sessionExercise.session_exercise_id)
    .order("set_number", { ascending: true });

  if (remainsSetsError) {
    console.error("fetch remains sets error:", remainsSetsError);
    return { error: "残セットの取得に失敗しました" };
  }

  // 連番に修正（必要なものだけ更新）
  if (remainsSets && remainsSets.length > 0) {
    for (let i = 0; i < remainsSets.length; i++) {
      const set = remainsSets[i];
      const { error: updErr } = await supabase
        .from("session_sets")
        .update({ set_number: i + 1 })
        .eq("id", set.id);

      if (updErr) {
        console.error("update set error:", updErr);
        return { error: "セットの更新に失敗しました" };
      }
    }
  }

  return {};
}
