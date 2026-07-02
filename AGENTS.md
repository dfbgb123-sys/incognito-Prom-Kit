<!-- BEGIN:project-context -->
# 프로젝트: Prom-Kit (프롬키트)

머릿속 복잡한 아이디어를 즉시 사용 가능한 구조화된 Markdown 프롬프트로 조립해 주는 AI 질문 자판기.

**Live:** https://incognito-prom-kit.vercel.app

## 핵심 유저 플로우
1. 페르소나 설정 (관심 분야 대주제 선택)
2. 키워드 가지치기 (중/소분류 추천 칩 조합)
3. 맥락 입력 & 조립 (고민 입력 → 프롬프트 자동 포맷팅)
4. 소비 & 로그 기록 (원클릭 복사 + Notion DB 기록)

## 기술 스택
- **Core:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Validation:** Zod (API 페이로드 유효성 검증)
- **Testing:** Jest, ts-jest
- **CI/CD:** GitHub Actions (Lint → Test → Build), Vercel
<!-- END:project-context -->

<!-- BEGIN:nextjs-agent-rules -->
# Next.js 주의사항

이 프로젝트는 **Next.js 16 App Router**를 사용한다. 학습 데이터의 Pages Router 패턴과 다를 수 있으므로, 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 확인하고 deprecation 경고를 따르라.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:response-rules -->
# 핵심 답변 규칙

1. **요점 중심**: 관념적인 설명 대신 개념 위주로 군더더기 없이 핵심만 답변한다.
2. **단계별 서술**: 결론과 추측을 한 번에 쏟아내지 말고 한 번에 하나씩 서술한다. 부연설명은 생략한다.
3. **정확성과 명확성**: 어려운 기술 용어는 쉬운 풀이를 포함하고, 미확인 정보는 반드시 "추정"이라고 명시한다.
4. **맥락 유지**: 사용자의 오개념은 먼저 짚어주고, 대화가 주제에서 벗어나면 간단히 처리 후 원래 주제로 유도한다.
<!-- END:response-rules -->
