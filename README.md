
머릿속 복잡한 아이디어와 고민을 AI가 즉시 알아듣는 마크다운(Markdown) 프롬프트로 자동 조립해 주는 서비스입니다. 역할 부여, 제약 조건 구조를 매번 짜기 귀찮은 직장인, 학생, 개발자를 위해 만들어졌습니다.

## 📦 Prom-Kit (프롬키트)
더 좋은 생각을 만드는 AI 질문 자판기  
**Link:** [incognito-prom-kit.vercel.app](https://incognito-prom-kit.vercel.app)

  
**핵심 유저 플로우 (User Flow)**
* 상단 (페르소나 & 대주제): 기본 관심사 바운더리
* 중단 (브랜치형 추천 버튼): 대분류에 따라 핵심 키워드를 가지치기(Branch) 형태로 추천
* 하단 (핵심 입력창): 사용자의 구체적인 고민을 입력 시, 조립 준비 완료
* 출력 (최종 액션창): 구조화된 마크다운 프롬프트 조립, 원클릭 복사, 2차 프롬프트 재가공 가능

---

## ✨ 주요 기능 (Features)
* 구조화된 Markdown 프롬프트 자동 조립
* 브랜치형 키워드 추천
* Notion 연동 : POST /logs API를 통해 작업 로그 자동 생성

## 🛠 기술 스택 (Tech Stack)

### Frontend & DevOps Badges
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/> <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
--
### Details
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Deployment & DevOps:** GitHub / Vercel (CI/CD 자동화 및 서버리스 환경 구축)

## 🚀 로드맵 및 확장 계획 (Roadmap)
  
#### AI & Infra Integration (확장 예정)
- [ ] 핵심 확장 " 더 좋은 생각을 하게 돕는 질문 가이드 "
- [ ] 추후 DB 마이그레이션 (JSON → 실제 DB)
- [ ] 프롬프트 재가공 구조 개선
- [ ] Jest 기반 단위 테스트 환경 구축
- [ ] GitHub Actions 기반 자동 테스트 및 배포 파이프라인 구축
