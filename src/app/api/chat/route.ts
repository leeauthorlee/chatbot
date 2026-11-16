import { NextResponse } from "next/server";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "아직 AI 연결이 설정되지 않았어요. OPENAI_API_KEY를 환경변수에 추가해 주세요." },
      { status: 503 },
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await request.json();
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "메시지를 입력해 주세요." }, { status: 400 });
    }
    messages = body.messages
      .filter(
        (message: unknown): message is ChatMessage =>
          typeof message === "object" &&
          message !== null &&
          "role" in message &&
          "content" in message &&
          ((message as ChatMessage).role === "user" || (message as ChatMessage).role === "assistant") &&
          typeof (message as ChatMessage).content === "string",
      )
      .slice(-12);
  } catch {
    return NextResponse.json({ error: "요청을 읽을 수 없어요." }, { status: 400 });
  }

  if (messages.length === 0) {
    return NextResponse.json({ error: "메시지를 입력해 주세요." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "당신은 따뜻하고 친근한 한국어 커피 큐레이터입니다. 사용자의 취향, 기분, 날씨에 어울리는 커피와 음료를 추천하고 이유를 간결하게 설명하세요. 카페 메뉴나 원두에 관한 질문에 답하고, 알레르기나 건강 관련 내용은 단정하지 말고 주의를 안내하세요. 답변은 읽기 쉽게 짧은 문단으로 작성하세요.",
          },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "답변을 가져오지 못했어요. 잠시 후 다시 시도해 주세요." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "답변이 비어 있어요. 다시 시도해 주세요." }, { status: 502 });
    }

    return NextResponse.json({ reply: content.trim() });
  } catch {
    return NextResponse.json(
      { error: "서버와 연결할 수 없어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
