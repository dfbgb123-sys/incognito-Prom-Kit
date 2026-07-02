import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  const { category } = await request.json();

  if (!category || typeof category !== 'string') {
    return NextResponse.json({ error: 'category is required' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
  });

  const text = response.text ?? '';
  const match = text.match(/\[[\s\S]*?\]/);
  if (!match) {
    return NextResponse.json({ error: 'AI 응답 파싱 실패', raw: text }, { status: 500 });
  }

  const subs: string[] = JSON.parse(match[0]);
  return NextResponse.json({ subs });
}
