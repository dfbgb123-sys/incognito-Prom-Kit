import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { ExecuteBodySchema } from '@/app/lib/schemas';
import { checkRateLimit, getClientIp } from '@/app/lib/rateLimit';

type Provider = 'gemini' | 'claude' | 'groq';

function hasLanguageContamination(text: string, lang: string): boolean {
  const patterns = [
    /[一-鿿]/,  // CJK (한자)
    /[Ѐ-ӿ]/,  // 키릴 문자 (러시아어 등)
    /[぀-ゟ]/,  // 히라가나
    /[゠-ヿ]/,  // 가타카나
    /[؀-ۿ]/,  // 아랍 문자
  ];
  if (lang !== 'ko') {
    patterns.push(/[가-힣]/); // 영어 모드에서 한글도 오염으로 처리
  }
  return patterns.some(re => re.test(text));
}

// Gemini·Claude: 한국어 지시문으로 충분
const SYSTEM_PROMPT = "사용자가 한국어로 질문하면 반드시 한국어로만 답변하세요. 한자(漢字)나 일본어 가나(仮名)를 절대 사용하지 마세요. 영어로 질문하면 영어로만 답변하세요.";

// Groq(llama): 다국어 혼용 빈도가 높아 영어로 작성된 엄격한 전용 프롬프트 사용
const SYSTEM_PROMPT_GROQ_KO = `You are a helpful assistant. Follow these language rules without any exception:
- The user prompt is written in Korean. You MUST respond EXCLUSIVELY in Korean (한글/Hangul).
- Every single character in your response must be Korean Hangul, numbers, or standard punctuation.
- STRICTLY FORBIDDEN — never output even one character from these scripts:
  • Chinese / CJK: 电 视 的 是 在 有 我 你 等 (and all other CJK Unified Ideographs)
  • Cyrillic / Russian: а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я (and uppercase)
  • Japanese Hiragana: あいうえお…
  • Japanese Katakana: アイウエオ…
  • Arabic, Thai, Greek, Hebrew, or any other non-Korean script
- If a concept is commonly expressed in another language, transliterate it into Korean (한국어 발음) or use English letters only.
- Violating this rule is unacceptable. Check every word before outputting it.`;

const SYSTEM_PROMPT_GROQ_EN = `You are a helpful assistant. Follow these language rules without any exception:
- The user prompt is written in English. You MUST respond EXCLUSIVELY in English.
- Every single character in your response must be standard English letters, numbers, or punctuation.
- STRICTLY FORBIDDEN — never output even one character from these scripts:
  • Chinese / CJK ideographs
  • Cyrillic / Russian characters
  • Korean Hangul
  • Japanese Hiragana or Katakana
  • Arabic, Thai, Greek, Hebrew, or any other non-Latin script
- Violating this rule is unacceptable. Check every word before outputting it.`;

async function runGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    config: { systemInstruction: SYSTEM_PROMPT },
    contents: prompt,
  });
  return response.text ?? '';
}

async function runClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}

async function runGroq(prompt: string, lang: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const systemPrompt = lang === 'en' ? SYSTEM_PROMPT_GROQ_EN : SYSTEM_PROMPT_GROQ_KO;
  const client = new Groq({ apiKey });
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1, // 낮은 temperature → 확률 분포 좁혀서 언어 혼용 빈도 감소
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
  });
  return completion.choices[0]?.message?.content ?? '';
}

const providers: Record<Provider, (prompt: string, lang: string) => Promise<string>> = {
  gemini: (prompt) => runGemini(prompt),
  claude: (prompt) => runClaude(prompt),
  groq:   (prompt, lang) => runGroq(prompt, lang),
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`execute:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const parsed = ExecuteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { prompt, provider, lang } = parsed.data;
  console.log(`[execute] provider: ${provider}`);

  try {
    const result = await providers[provider as Provider](prompt, lang);

    // Part B: 언어 오염 감지 → 1회 재시도
    if (hasLanguageContamination(result, lang)) {
      console.warn(`[execute] language contamination detected (provider: ${provider}), retrying…`);
      const reinforcement = lang === 'ko'
        ? '[CRITICAL: Your previous response contained forbidden non-Korean characters. This time respond in Korean (한글) ONLY — zero tolerance for Chinese, Russian, Japanese, or any other script.]\n\n'
        : '[CRITICAL: Your previous response contained forbidden non-English characters. This time respond in English ONLY — zero tolerance for Chinese, Russian, Korean, Japanese, or any other script.]\n\n';
      try {
        const retried = await providers[provider as Provider](reinforcement + prompt, lang);
        const stillContaminated = hasLanguageContamination(retried, lang);
        return NextResponse.json({ result: retried, languageIssue: stillContaminated });
      } catch {
        return NextResponse.json({ result, languageIssue: true });
      }
    }

    return NextResponse.json({ result });
  } catch (e: unknown) {
    const raw = e instanceof Error ? e.message : String(e);
    let userMessage: string;

    if (lang === 'en') {
      if (provider === 'gemini') {
        userMessage = 'Gemini is temporarily unavailable. Please try again later.';
      } else if (raw.includes('credit balance') || raw.includes('billing')) {
        userMessage = 'Claude API credits are insufficient. Please top up in the Anthropic dashboard.';
      } else if (raw.includes('API_KEY') || raw.includes('authentication') || raw.includes('api_key')) {
        userMessage = 'API key is not configured. Please check your .env.local file.';
      } else {
        userMessage = 'An error occurred while running the AI.';
      }
    } else {
      if (provider === 'gemini') {
        userMessage = 'Gemini가 일시적으로 응답하지 않고 있어요.';
      } else if (raw.includes('credit balance') || raw.includes('billing')) {
        userMessage = 'Claude API 크레딧이 부족합니다. Anthropic 대시보드에서 충전해 주세요.';
      } else if (raw.includes('API_KEY') || raw.includes('authentication') || raw.includes('api_key')) {
        userMessage = 'API 키가 설정되지 않았습니다. .env.local을 확인해 주세요.';
      } else {
        userMessage = 'AI 실행 중 오류가 발생했습니다.';
      }
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
