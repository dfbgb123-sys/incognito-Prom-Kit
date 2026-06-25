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

    if (type === 'macro') {
      systemInstruction = "너는 앱 개발을 위한 유니크한 카테고리 단어 생성기야. 반드시 결과는 다른 텍스트 없이 오직 쉼표(,)로만 구분된 단어여야 해. 예시: 코딩, 재테크, 독서, 요리, 운동";
      prompt = `AI 프롬프트 생성 앱의 '대분류 메뉴'로 사용할 참신하고 고유한 주제 단어를 딱 5개만 추천해줘. 
      현재 화면에 이미 존재하는 단어들인 [${currentItems.join(', ')}]과 글자 하나라도 겹치거나 유의어여서는 절대 안 돼. 완전히 새로운 영역의 아이디어를 줘.`;
    } else {
      systemInstruction = "너는 주제에 맞는 참신한 서브 키워드를 뽑아주는 아이디어 뱅크야. 반드시 8자 이내의 단어여야 하며, 다른 설명 없이 오직 쉼표(,)로만 구분해서 출력해. 예시: 수술 부위, 리얼 후기, 비용 분석";
      prompt = `대분류 주제인 '${selectedMacro}'에 관련된 참신하고 구체적인 소분류 키워드(칩)를 딱 5개만 추천해줘. 
      현재 화면에 이미 있는 단어들인 [${currentItems.join(', ')}]과 절대 중복되면 안 돼.`;
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
    const newItems = resultText.split(',').map(item => item.trim()).filter(Boolean);

    return NextResponse.json({ success: true, data: newItems });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ success: false, error: 'AI 아이디어 생성 실패' }, { status: 500 });
  }
}