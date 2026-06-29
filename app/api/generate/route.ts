// app/api/generate/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json(
    { success: false, error: "모든 동작이 클라이언트 오프라인 및 LocalStorage 방식으로 마이그레이션되었습니다." },
    { status: 400 }
  );
}