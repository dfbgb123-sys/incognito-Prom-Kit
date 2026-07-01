# 📦 Prom-Kit (프롬키트)
> 머릿속 복잡한 아이디어를 즉시 사용 가능한 구조화된 Markdown 프롬프트로 조립해 주는 AI 질문 자판기

**🌐 Live Demo:** [incognito-prom-kit.vercel.app](https://incognito-prom-kit.vercel.app)

---

## ✨ 핵심 유저 플로우 (User Flow)
1. **페르소나 설정** : 관심 분야 대주제 선택
2. **키워드 가지치기** : 대분류에 매핑된 중분류/소분류 추천 칩 조합
3. **맥락 입력 & 조립** : 고민이나 구체적 요구사항을 기입해 프롬프트 자동 포맷팅
4. **소비 & 로그 기록** : 원클릭 복사 실행 및 Notion DB에 분석 데이터 실시간 기록

---

## 🛠 기술 스택 (Tech Stack)

### Frontend & DevOps
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/> <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white"/> <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white"/> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>

* **Core:** Next.js 16 (App Router), TypeScript, Tailwind CSS
* **Validation:** Zod (API 페이로드 유효성 검증)
* **Testing:** Jest, ts-jest (단위 테스트 최적화)
* **CI/CD:** GitHub Actions (Lint ➡️ Test ➡️ Build 자동화), Vercel

---

## 🛡️ 품질 검증 및 CI/CD 파이프라인
* **데이터 검증 (Zod)**: API 진입점(`/api/generate`)의 페이로드 규칙을 체크하여 비정상 데이터 인입을 사전에 차단합니다.
* **단위 테스트 (Jest)**: 프롬프트 템플릿 포맷터(`renderer`) 및 카테고리 필터링 엔진을 독립된 테스트 코드로 자동 검증합니다.
* **배포 수비망 (GitHub Actions)**: 코드 Push/PR 발생 시 가상 머신 상에서 린트와 빌드 검사를 자동 구동하여 무결성을 보장합니다.

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
- [ ] 핵심 확장 " 더 좋은 생각을 하게 돕는 질문 가이드 "
- [ ] 프롬프트 2차 재가공 인터페이스 개선
- [ ] 정적 JSON 데이터를 관계형 DB 스키마로 이관 (MySQL/PostgreSQL)
- [x] Jest 기반 단위 테스트 환경 구축 (완료)
- [x] GitHub Actions 기반 자동 테스트 및 배포 파이프라인 구축 (완료)
