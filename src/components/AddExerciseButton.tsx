"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createSessionExercises } from "@/app/actions/createSessionExercises";
import { useRouter } from "next/navigation";

export function AddExerciseButton({ sessionId }: { sessionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isBodyweight, setIsBodyweight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const reset = () => {
    setName("");
    setIsBodyweight(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("メニュー名は必須です");
      return;
    }

    const result = await createSessionExercises({
      sessionId,
      exerciseName: trimmedName,
      isBodyweight,
      initialSetsCount: 3,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setIsOpen(false);
    reset();
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
      >
        ＋ メニューを追加
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">メニューを追加</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="exercise-name">メニュー名</Label>
                <Input
                  id="exercise-name"
                  placeholder="例: ベンチプレス"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-bodyweight"
                  checked={isBodyweight}
                  onCheckedChange={(checked) =>
                    setIsBodyweight(checked as boolean)
                  }
                  disabled={isPending}
                />
                <Label htmlFor="is-bodyweight">自重メニュー</Label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isPending || !name.trim()}>
                  {isPending ? "追加中..." : "追加する"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
