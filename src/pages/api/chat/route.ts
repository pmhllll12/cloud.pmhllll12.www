import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini 호출 예시 (표준 Request / Response).
 * Vite SPA에는 서버 라우트가 없으므로, Next.js App Router 등에 옮길 때 이 로직을 그대로 사용하면 됩니다.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { prompt?: string };
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return Response.json({ error: "prompt 가 필요합니다." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return Response.json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return Response.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
