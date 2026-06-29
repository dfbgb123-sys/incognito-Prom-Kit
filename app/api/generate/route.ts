// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// .env.local에 저장한 무료 키로 구글 AI 초기화
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { type, currentItems, selectedMacro } = await request.json();

    let systemInstruction = '';
    let prompt = '';

    if (type === 'sub') {
      systemInstruction = "너는 주제에 맞는 참신한 서브 키워드를 뽑아주는 아이디어 뱅크야. 반드시 8자 이내의 단어여야 하며, 다른 설명 없이 오직 쉼표(,)로만 구분해서 출력해. 예시: 수술 부위, 리얼 후기, 비용 분석";
      prompt = `대분류 주제인 '${selectedMacro}'에 관련된 참신하고 구체적인 소분류 키워드(칩)를 딱 5개만 추천해줘. 
      현재 화면에 이미 있는 단어들인 [${currentItems?.join(', ') || ''}]과 절대 중복되면 안 돼.`;
    } else if (type === 'requests') {
      systemInstruction = "너는 주어진 주제에 맞는 최적의 AI 프롬프트 상세 요청 사항 리스트를 작성해 주는 전문가야. 반드시 다른 설명(인사말, 마크다운 기호, 번호 매기기 등) 없이 오직 개별 요청 문장들을 쉼표(,)로만 구분해서 출력해야 해. 쉼표 개수는 정확히 3개(총 4개의 문장)여야 해. 문장 내에는 절대 쉼표(,)가 들어가면 안 돼.";
      prompt = `'${selectedMacro}' 주제에 대한 전문가 수준의 프롬프트를 작성할 때 유용한 상세 요청 사항 4개를 제안해줘.
      각 문장은 '~해 주세요' 또는 '~하시오'로 끝나는 명확하고 구체적인 지시사항이어야 해.`;
    } else {
      return NextResponse.json({ success: false, error: '잘못된 요청 타입입니다.' }, { status: 400 });
    }

    // 구글의 가장 가볍고 빠른 무료 모델 gemini-2.5-flash 사용
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.0, // 창의성을 높여 중복 회피 및 뻔하지 않은 단어 유도
      }
    });

    const resultText = response.text || '';
    // 구글이 뱉은 쉼표 문자열을 정밀하게 배열로 정제
    const newItems = resultText.split(',').map(item => {
      return item.replace(/^\d+[\s\.)-:]+\s*/, '').trim();
    }).filter(Boolean);

    return NextResponse.json({ success: true, data: newItems });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ success: false, error: 'AI 아이디어 생성 실패' }, { status: 500 });
  }
}