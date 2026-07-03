<!-- BEGIN:project-context -->
# 프로젝트: Prom-Kit (프롬키트)

머릿속 복잡한 아이디어를 즉시 사용 가능한 구조화된 Markdown 프롬프트로 조립해 주는 AI 질문 자판기.

**Live:** https://incognito-prom-kit.vercel.app
<!-- END:project-context -->

<!-- BEGIN:tech-stack -->
# 기술 스택

- **언어:** TypeScript 5, React 19
- **프레임워크:** Next.js 16 (App Router) — Pages Router 패턴 사용 금지
- **스타일:** Tailwind CSS 4
- **검증:** Zod 4 (API 페이로드 유효성 검증, `app/lib/schemas.ts`)
- **AI SDK:** @anthropic-ai/sdk, @google/genai, groq-sdk
- **테스트:** Jest 30 + ts-jest
- **CI/CD:** GitHub Actions (`test-harness.yml`) → Vercel 자동 배포
<!-- END:tech-stack -->

<!-- BEGIN:commands -->
# 빌드 / 실행 / 테스트 명령어

```bash
npm run dev      # 로컬 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드 + TypeScript 타입 체크
npm run lint     # ESLint 검사
npm run test     # Jest 단위 테스트 전체 실행
```

환경변수는 `.env.local` 에 관리 (GEMINI_API_KEY, ANTHROPIC_API_KEY, GROQ_API_KEY, NOTION_API_TOKEN, NOTION_DATABASE_ID).
<!-- END:commands -->

<!-- BEGIN:folder-structure -->
# 폴더 구조

```
app/
  api/
    execute/       # AI 실행 (Gemini·Claude·Groq 호출)
    generate/      # Notion 로그 기록
    suggest-subs/  # 중분류 키워드 자동 추천
  components/      # UI 컴포넌트 (MacroSection, SubSection, TuningSection)
  lib/
    schemas.ts     # Zod 스키마 및 타입 (API 라우트 공유)
  utils/
    renderer.ts         # 프롬프트 Markdown 포맷터
    templateService.ts  # 프롬프트 템플릿 조합 엔진
  *.test.ts        # Jest 단위 테스트
  page.tsx         # 메인 페이지
data/              # 정적 JSON (카테고리, 키워드, 템플릿)
.claude/
  skills/api-test/ # /api-test 커스텀 슬래시 커맨드
.github/workflows/ # GitHub Actions CI 파이프라인
```
<!-- END:folder-structure -->

<!-- BEGIN:autonomy -->
# 자동으로 해도 되는 일 vs 먼저 물어봐야 하는 일

## 물어보지 않고 바로 해도 되는 일
- 파일 읽기, 코드 탐색
- 코드 수정 및 신규 파일 생성
- `npm run lint`, `npm run test`, `npm run build` 실행
- `/api-test` 스킬 실행

## 반드시 먼저 물어봐야 하는 일
- `git push` — 원격 저장소에 반영되는 작업
- `npm install` / 의존성 추가·삭제 — package.json 변경
- 파일·폴더 삭제
- `data/` 하위 JSON 데이터 수정 — 서비스 데이터 직접 영향
- `.env.local` 수정
<!-- END:autonomy -->

