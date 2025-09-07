import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { WorkoutSessionSync } from "@/components/WorkoutSessionSync";
import { CompleteWorkoutButton } from "@/components/CompleteWorkoutButton";

export const dynamic = "force-dynamic";

type UiSet = {
  setNumber: number;
  targetReps: number;
  targetWeight?: number;
};

type UiExercise = {
  id: string;
  name: string;
  isBodyweight: boolean;
  sets: UiSet[];
};

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("session_exercises")
    .select(
      `
      id,
      name,
      is_bodyweight,
      order_index,
      session_sets (
        set_number,
        target_reps,
        target_weight
      )
    `
    )
    .eq("session_id", id)
    .order("order_index", { ascending: true })
    .order("set_number", { ascending: true, foreignTable: "session_sets" });

  if (error) return <div>エラーが発生しました: {error.message}</div>;
  if (!data || data.length === 0) return notFound();

  const exercises: UiExercise[] = data.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    isBodyweight: exercise.is_bodyweight,
    sets: exercise.session_sets.map((set) => ({
      setNumber: set.set_number,
      targetReps: set.target_reps,
      targetWeight: set.target_weight,
    })),
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <WorkoutSessionSync sessionId={id} />
      <div className="container mx-auto px-4">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <header className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl font-bold">ワークアウト</h1>
              <p className="text-sm text-gray-500">セッションID: {id}</p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <Link href="/" className="inline-block">
                <Button variant="outline" size="sm">
                  ホームに戻る
                </Button>
              </Link>
              <Button variant="secondary" size="sm">
                ＋ メニューを追加
              </Button>
            </div>
          </header>

          <div className="mt-6 space-y-6">
            {exercises.map((ex) => (
              <div key={ex.id} className="border rounded-lg">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base sm:text-lg font-semibold">
                      {ex.name}
                    </h2>
                  </div>
                  <Button variant="ghost" size="sm">
                    ＋ セットを追加
                  </Button>
                </div>

                <ul className="divide-y">
                  {ex.sets.map((s) => (
                    <li key={s.setNumber} className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Set {s.setNumber}
                        </span>
                        <span className="text-xs text-gray-400">RM —</span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 shrink-0 w-14">
                            重量
                          </label>
                          {ex.isBodyweight ? (
                            <span className="text-gray-700 text-sm">自重</span>
                          ) : (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="number"
                                className="w-full h-10 border rounded px-3 text-sm"
                                defaultValue={s.targetWeight ?? ""}
                                placeholder="kg"
                                inputMode="decimal"
                              />
                              <span className="text-gray-500 text-sm shrink-0">
                                kg
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 shrink-0 w-14">
                            回数
                          </label>
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="number"
                              className="w-full h-10 border rounded px-3 text-sm"
                              defaultValue={s.targetReps}
                              placeholder="回数"
                              inputMode="numeric"
                            />
                            <span className="text-gray-500 text-sm shrink-0">
                              回
                            </span>
                          </div>
                        </div>

                        <div className="sm:col-span-1">
                          <label className="sr-only">メモ</label>
                          <input
                            type="text"
                            className="w-full h-10 border rounded px-3 text-sm"
                            placeholder="メモ（任意）"
                            defaultValue=""
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <CompleteWorkoutButton sessionId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
