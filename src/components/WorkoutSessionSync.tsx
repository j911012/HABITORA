"use client";

import { useEffect } from "react";

/**
 * WorkoutセッションIDをlocalStorageに同期するコンポーネント
 * 直接URLアクセスやリロード時にもlocalStorageが同期されるようにする
 * @param sessionId - 現在のセッションID
 */
export function WorkoutSessionSync({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("activeWorkoutSessionId", sessionId);
    }
  }, [sessionId]);

  return null;
}
