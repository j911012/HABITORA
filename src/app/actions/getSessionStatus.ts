"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * セッションの有効性をチェック
 * @param sessionId - チェックするセッションID
 * @returns セッションが有効かどうか
 */
export async function getSessionStatus(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("status")
    .eq("id", sessionId)
    .single();

  if (error || !data) {
    return { isValid: false };
  }

  return { isValid: data.status === "in_progress" };
}
