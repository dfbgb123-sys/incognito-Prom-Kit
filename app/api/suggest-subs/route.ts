import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { SuggestSubsBodySchema } from '@/app/lib/schemas';
import { checkRateLimit, getClientIp } from '@/app/lib/rateLimit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`suggest-subs:${ip}`, 15, 60_000)) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const parsed = SuggestSubsBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { category } = parsed.data;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set');
    return NextResponse.json({ error: 'AI 추천 기능을 사용할 수 없습니다.' }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `이 서비스는 사용자가 AI에게 더 정확한 질문을 하도록 돕는 프롬프트 생성기입니다.

사용자가 입력한 주제: "${category}"

다음 순서로 판단해서 세부 키워드 7개를 추천하세요.

1. 주제 성격 파악: 이 입력이 인물/브랜드/트렌드/학습영역/행동 중 어디에 해당하는지 판단
2. 실제 탐색 의도 유추: 이 주제를 입력한 사람이 AI에게 실제로 무엇을 물어보려 하는지 추론
3. 함께 탐색될 만한 하위 관점 도출: 이 주제와 자주 묶이는 구체적 상황, 목적, 질문 패턴
4. 뻔한 키워드 제외: 너무 일반적이거나 교과서적인 단어는 제외

조건:
- 한국어, 각 항목 2~10자
- JSON 배열만 반환 (다른 텍스트 없이)
- 예시: ["키워드1","키워드2","키워드3","키워드4","키워드5","키워드6","키워드7"]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const text = response.text ?? '';
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) {
      return NextResponse.json({ error: 'AI 응답 파싱 실패' }, { status: 500 });
    }

    const subs: string[] = JSON.parse(match[0]);
    return NextResponse.json({ subs });
  } catch (error: unknown) {
    console.error('추천 키워드 생성 실패:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: '추천 키워드 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
