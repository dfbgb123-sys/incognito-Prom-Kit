# API 엔드포인트 테스트

프롬키트의 세 API 라우트를 대상으로 Zod 검증과 정상 응답을 확인한다.

## 실행 순서

1. `http://localhost:3000` 이 응답하는지 확인한다. 응답이 없으면 `npm run dev`를 백그라운드로 실행하고 3초 기다린다.

2. 아래 세 라우트를 각각 **검증 실패 케이스 → 정상 케이스** 순서로 테스트한다.

### /api/suggest-subs
- 실패: `{}` 빈 바디 → 400 + issues.category 확인
- 정상: `{"category": "개발"}` → 200 + subs 배열 확인

### /api/execute
- 실패: `{}` 빈 바디 → 400 + issues.prompt, issues.provider 확인
- 실패: `{"prompt": "테스트", "provider": "잘못된값"}` → 400 + issues.provider 확인
- 정상: `{"prompt": "안녕", "provider": "groq"}` → 200 + result 확인

### /api/generate
- 실패: `{"medium_names": ["test"]}` (large_name 없음) → 400 + issues.large_name 확인
- 정상: `{"large_name": "개발", "medium_names": [], "small_names": [], "userInput": "테스트", "length": 10, "provider": "copy"}` → 200 확인

3. 결과를 아래 표 형식으로 출력한다.

| 라우트 | 케이스 | 상태코드 | 결과 |
|---|---|---|---|
| /api/suggest-subs | 검증 실패 | 400 | ✅/❌ |
| /api/suggest-subs | 정상 | 200 | ✅/❌ |
| ... | ... | ... | ... |

4. 실패한 항목이 있으면 응답 바디를 함께 출력한다.
