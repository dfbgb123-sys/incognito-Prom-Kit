# 📦 Prom-Kit (프롬키트)
> 생각은 많은데 AI한테 어떻게 물어볼지 막막할 때! 머릿속 아이디어를 AI가 딱 알아듣는 최적의 질문(프롬프트)으로 뚝딱 조립해 주는 AI 질문 자판기

**🌐 Live Demo:** [incognito-prom-kit.vercel.app](https://incognito-prom-kit.vercel.app)  
**🌐 Descriptions:**  https://podo88.tistory.com/
---

## ✨ 핵심 유저 플로우 (User Flow)
1. **페르소나 설정** : 관심 분야 대주제 선택
2. **키워드 가지치기** : 대분류에 매핑된 중분류/소분류 추천 칩 조합
3. **맥락 입력 & 조립** : 고민이나 구체적 요구사항을 기입해 프롬프트 자동 포맷팅
4. **소비 & 로그 기록** : 원클릭 복사 실행 및 Notion DB에 분석 데이터 실시간 기록

> 🌐 헤더의 `English` 버튼으로 UI 텍스트, 조립되는 프롬프트, AI 응답까지 한/영 전체 전환 가능
---

## 🛠 기술 스택 (Tech Stack)

### Frontend & DevOps
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/> <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white"/> <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white"/> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>

* **Core:** Next.js 16 (App Router), TypeScript, Tailwind CSS
* **AI Providers:** Google Gemini, Anthropic Claude, Groq : 멀티 프로바이더 실행 및 각 응답 실패 메시지 분기 (Groq 우선 구현 상태)
* **Validation:** Zod (`execute` · `generate` · `suggest-subs` 3개 API 라우트 전체 페이로드 유효성 검증)
* **Testing:** Jest, ts-jest (단위 테스트 최적화)
* **CI/CD:** GitHub Actions (Lint ➡️ Test ➡️ Build 자동화), Vercel

---

## 🛡️ 품질 검증 및 CI/CD 파이프라인
* **데이터 검증 (Zod)**: API 진입점(`/api/generate`포함 3개 라우트)의 페이로드 규칙을 체크하여 비정상 데이터 인입을 사전에 차단합니다.
* **단위 테스트 (Jest)**: 프롬프트 템플릿 포맷터(`renderer`) 및 카테고리 필터링 엔진을 독립된 테스트 코드로 자동 검증합니다.
* **배포 수비망 (GitHub Actions)**: 코드 Push/PR 발생 시 가상 머신 상에서 린트 → 빌드 → 테스트 검사를 자동 구동하여 무결성을 보장합니다.
* **레이트리밋**: IP 기준 요청 빈도를 제한해 API 남용 및 AI 프로바이더 호출 폭주를 방지합니다.

---

## 🚀 Quick Start (로컬 실행)
```bash
# 의존성 패키지 설치
npm install

# 로컬 개발 서버 구동 (localhost:3000)
npm run dev

# 단위 테스트 구동 (Jest)
npm run test
```

---

## 📅 Roadmap
- [ ] 프롬프트 2차 재가공 인터페이스 개선
- [ ] 정적 JSON 데이터를 관계형 DB 스키마로 이관 (MySQL/PostgreSQL)
- [x] 다국어 지원(한/영 토글)으로 AI 응답 언어 전환 가능
- [x] AI 기반 카테고리 중분류칩 자동 추천 기능 (Gemini API 연동)
- [x] 한/영 다국어 UI 지원
- [x] Jest 기반 단위 테스트 환경 구축 (완료)
- [x] GitHub Actions 기반 자동 테스트 및 배포 파이프라인 구축 (완료)
