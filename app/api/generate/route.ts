import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { GenerateBodySchema } from '@/app/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = GenerateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid_request', issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { large_name, medium_names, small_names, userInput, length, provider } = parsed.data;

    const token = process.env.NOTION_API_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!token || !databaseId) {
      console.warn("Notion 환경변수가 설정되지 않아 로깅이 건너뛰어집니다.");
      return NextResponse.json({ success: true, message: "환경변수 미설정으로 서버 로컬 로깅 완료" });
    }

    const notion = new Client({ auth: token });

    const materials = [large_name, ...medium_names, ...small_names].filter(Boolean);

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "이름": {
          title: [
            { text: { content: provider === 'copy' ? `[복사] ${large_name || '미선택'}` : `[AI 실행 - ${(provider || '').toUpperCase()}] ${large_name || '미선택'}` } }
          ]
        },
        "작업 구분": {
          select: { name: provider === 'copy' ? 'Copy' : `AI-${provider}` }
        },
        "빌드 상태": {
          select: { name: "Success" }
        },
        "타임스탬프": {
          date: { start: new Date().toISOString() }
        },
        "사용 재료": {
          multi_select: materials.map((name) => ({ name: name.substring(0, 100) }))
        },
        "사용자 요구사항": {
          rich_text: [
            { text: { content: (userInput || '').substring(0, 2000) } }
          ]
        },
        "글자 수": {
          number: length || 0
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Notion 로깅 실패:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}