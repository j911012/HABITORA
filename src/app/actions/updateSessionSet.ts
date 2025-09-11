"use server";

import { createClient } from "@/lib/supabase/server";

type UpdateSessionSetInput = {
  setId: string;
  targetReps: number;
  targetWeight: number | null;
  memo: string | null;
};

export async function updateSessionSet({
  setId,
  targetReps,
  targetWeight,
  memo,
}: UpdateSessionSetInput) {
  const supabase = await createClient();

  if (!setId) {
    return { error: "無効なセットIDです" };
  }

  const { error } = await supabase
    .from("session_sets")
    .update({
      target_reps: targetReps,
      target_weight: targetWeight,
      memo: memo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", setId);

  if (error) {
    console.error("updateSessionSet error:", error);
    return { error: "更新に失敗しました" };
  }

  return {};
}
