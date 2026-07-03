import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { ExecuteBodySchema } from '@/app/lib/schemas';

type Provider = 'gemini' | 'claude' | 'groq';

const SYSTEM_PROMPT = "Detect the language of the user's message and respond ONLY in that exact language. Do not mix in Chinese, Japanese, or any other language under any circumstances.";

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

async function runGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const client = new Groq({ apiKey });
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  });
  return completion.choices[0]?.message?.content ?? '';
}

const providers: Record<Provider, (prompt: string) => Promise<string>> = {
  gemini: runGemini,
  claude: runClaude,
  groq: runGroq,
};

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ExecuteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { prompt, provider } = parsed.data;
  console.log(`[execute] provider: ${provider}`);

  try {
    const result = await providers[provider as Provider](prompt);
    return NextResponse.json({ result });
  } catch (e: unknown) {
    const raw = e instanceof Error ? e.message : String(e);
    let userMessage = 'AI 실행 중 오류가 발생했습니다.';

    if (provider === 'gemini') {
      userMessage = 'Gemini가 일시적으로 응답하지 않고 있어요.';
    } else if (raw.includes('credit balance') || raw.includes('billing')) {
      userMessage = 'Claude API 크레딧이 부족합니다. Anthropic 대시보드에서 충전해 주세요.';
    } else if (raw.includes('API_KEY') || raw.includes('authentication') || raw.includes('api_key')) {
      userMessage = 'API 키가 설정되지 않았습니다. .env.local을 확인해 주세요.';
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
