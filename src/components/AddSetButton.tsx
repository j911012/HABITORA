"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSessionSet } from "@/app/actions/addSessionSet";
import { Button } from "@/components/ui/button";

export function AddSetButton({
  sessionExerciseId,
}: {
  sessionExerciseId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = async () => {
    const result = await addSessionSet(sessionExerciseId);

    if (result.error) {
      alert(result.error);
      return;
    }

    startTransition(async () => {
      router.refresh();
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "追加中..." : "＋ セットを追加"}
    </Button>
  );
}
