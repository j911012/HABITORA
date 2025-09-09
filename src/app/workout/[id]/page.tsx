import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { WorkoutSessionSync } from "@/components/WorkoutSessionSync";
import { CompleteWorkoutButton } from "@/components/CompleteWorkoutButton";
import { EditableSetRow } from "@/components/EditableSetRow";

export const dynamic = "force-dynamic";

type UiSet = {
  id: string;
  setNumber: number;
  targetReps: number;
  targetWeight?: number | null;
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
        id,
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
      id: set.id,
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
                    <EditableSetRow
                      key={s.id}
                      setId={s.id}
                      setNumber={s.setNumber}
                      isBodyweight={ex.isBodyweight}
                      initialTargetReps={s.targetReps}
                      initialTargetWeight={s.targetWeight}
                    />
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
