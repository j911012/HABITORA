import { Agent, run } from "@openai/agents";
import { WorkoutFormData, WorkoutMenu, workoutMenuSchema } from "@/lib/schema";

export async function generateWorkout(
  formData: WorkoutFormData
): Promise<{ data?: WorkoutMenu; error?: string }> {
  try {
    // OpenAI APIキー
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI APIキーが設定されていません");
    }

    // エージェント作成
    const agent = new Agent({
      name: "WorkoutGenerator",
      instructions: `あなたは経験豊富な日本語パーソナルトレーナーです。

**重要: JSON配列のみを返してください。説明文やコードブロックは一切禁止です。**

ユーザーの条件に基づいて筋トレメニューを生成し、以下の形式のJSON配列のみを返してください：

[
  {
    "exercise": "種目名（日本語）",
    "sets": セット数（1-10の整数）,
    "reps": 1セットの回数（1-30の整数）,
    "restSec": インターバル秒数（15-300の整数）
  }
]

**制約:**
- 合計時間がユーザーの指定時間内に収まるよう調整
- レベルに応じて難易度・種目選定を調整（初級→基本種目、上級→高難度種目）
- 目的に応じて回数帯を調整：
  - 筋肥大: 8-12回
  - 筋力UP: 3-5回  
  - 健康維持: 10-15回
  - シェイプアップ: 12-20回
- BIG3のMAX重量があれば考慮するが、JSON内に重量は含めない
- 例外なくJSON配列のみ返すこと`,
    });

    // エージェント実行
    const result = await run(
      agent,
      `ユーザーの筋トレ要求: ${JSON.stringify(formData)}`
    );

    // 結果の取得
    const outputText = result.finalOutput;
    if (!outputText) {
      console.error("エージェントから出力が返されませんでした");
      return { error: "メニューの生成に失敗しました" };
    }

    // JSONパース
    let parsedJson;
    try {
      // コードブロックや余計なテキストを除去
      const cleanText = outputText.replace(/```json\n?|\n?```/g, "").trim();
      parsedJson = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON パースエラー:", parseError);
      console.error("エージェント出力:", outputText);
      return { error: "メニューの形式が正しくありません" };
    }

    // Zodによる検証
    try {
      const validatedMenu = workoutMenuSchema.parse(parsedJson);
      console.log("メニュー生成成功:", validatedMenu);
      return { data: validatedMenu };
    } catch (validationError) {
      console.error("Zod バリデーションエラー:", validationError);
      console.error("パース済みJSON:", parsedJson);
      return { error: "メニューの内容が仕様に合いません" };
    }
  } catch (error) {
    console.error("generateWorkout エラー:", error);
    return { error: "メニューの生成中にエラーが発生しました" };
  }
}
