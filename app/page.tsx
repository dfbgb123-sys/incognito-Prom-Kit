'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  // --- [1. 상태 관리 정의] ---
  const [macroCategories, setMacroCategories] = useState(["공부", "여행", "영어", "일정", "준비물", "레시피", "맛집", "성형"]);
  const [selectedMacro, setSelectedMacro] = useState("");
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [subChips, setSubChips] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [analysisChips, setAnalysisChips] = useState<string[]>([]);
  const [generatedMarkdown, setGeneratedMarkdown] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const [secondaryChips, setSecondaryChips] = useState<string[]>([]);
  const [selectedSecondaries, setSelectedSecondaries] = useState<string[]>([]);
  const [poolIdx, setPoolIdx] = useState(0);

  // 인라인 입력 필드 상태 관리
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [isAddingSecondaryCustom, setIsAddingSecondaryCustom] = useState(false);
  const [customSecondaryInput, setCustomSecondaryInput] = useState("");

  const subContainerRef = useRef<HTMLDivElement>(null);
  const macroContainerRef = useRef<HTMLDivElement>(null);

  // --- [2. 확장형 데이터 뱅크] ---
  const macroPool = [
    "코딩", "재테크", "다이어트", "비즈니스", "마케팅", "인테리어", "연애", "이직", 
    "독서", "시간관리", "글쓰기", "면접", "인간관계", "유튜브", "스피치", "건강관리"
  ];

  // 무한 더보기용 3차 백업 AI 키워드 풀
  const infiniteMacroPool = [
    "AI자동화", "퍼스널브랜딩", "웰니스", "NFT", "메타버스", "미니멀리즘", "자산배분", "멘탈케어",
    "사이드프로젝트", "노코드", "협상학", "심리학", "데이터분석", "스마트스토어", "카피라이팅", "해외직구"
  ];

  const subCategoryData: Record<string, string[]> = {
    "공부": ["스터디카페", "공부루틴", "하루 5분 20배효율", "집중력 리셋", "노트 필기법", "시험 암기법", "동기부여"],
    "여행": ["3박 4일", "가성비 숙소", "현지인 맛집", "뚜벅이 코스", "인생샷 스팟", "힐링 가득", "최적 동선"],
    "영어": ["비즈니스 이메일", "원어민 회화", "미드 쉐도잉", "하루 10문장", "발음 교정", "토익 스피킹", "영작문 치트키"],
    "일정": ["시간 단위 플래너", "주간 루틴", "루즈하지 않게", "미루기 방지", "워라밸 확보", "핵심 일정 위주"],
    "준비물": ["체크리스트", "해외여행 필수템", "캠핑 장비", "자취방 필수품", "비상약 품목", "가방 경량화"],
    "레시피": ["초간단 10분", "자취요리", "집들이 요리", "초보자 가이드", "에어프라이어", "다이어트 식단", "냉장고 파먹기"],
    "맛집": ["로컬 숨은맛집", "가성비 끝판왕", "데이트 코스", "부모님 동반", "분위기 깡패", "웨이팅 필수", "노포 감성"],
    "성형": ["수술 부위", "리얼 후기", "예산 가이드", "병원 위치", "부작용 주의사항", "회복기간 단축", "자연스러운 라인"],
    "코딩": ["버그 수정", "알고리즘 초보", "깃허브 관리", "클린코드 규칙", "포트폴리오", "AI 코딩 툴", "독학 가이드"],
    "재테크": ["주식 초보", "부동산 임장", "소액 투자", "시드머니 모으기", "가계부 루틴", "절세 꿀팁", "ETF 추천"],
    "다이어트": ["식단 칼로리", "정체기 탈출", "홈트 루틴", "체지방 커팅", "바디프로필", "직장인 다이어트", "치팅데이 규칙"],
    "비즈니스": ["기획서 작성", "협상 스킬", "보고의 정석", "스타트업 입문", "성과 지표", "네트워킹", "이직 타이밍"],
    "마케팅": ["SNS 바이럴", "퍼포먼스 광고", "콘텐츠 기획", "SEO 최적화", "브랜딩 전략", "카피라이팅", "타겟 분석"],
    "인테리어": ["원룸 꾸미기", "가성비 가구", "조명 배치", "수납 가이드", "플랜테리어", "미니멀리즘", "컬러 매칭"],
    "연애": ["소개팅 꿀팁", "대화 이끌기", "밀당의 기술", "기념일 선물", "연애 고민 상담", "서운함 표현법", "심리 분석"],
    "이직": ["경력기술서", "연봉 협상", "퇴사 타이밍", "헤드헌터 접촉", "포트폴리오 튜닝", "이직 면접 질문", "기업 분석"],
    "독서": ["다독 루틴", "독서노트 작성", "책 추천", "몰입 독서법", "전자책 활용", "독서 모임", "글귀 아카이빙"],
    "시간관리": ["뽀모도로 기법", "우선순위 법칙", "데드라인 사수", "아침 루틴", "스케줄러 100% 활용", "자투리 시간"],
    "글쓰기": ["블로그 글쓰기", "에세이 창작", "문장력 강화", "매일 글쓰기 습관", "소재 발굴", "퇴고 체크리스트"],
    "면접": ["1분 자기소개", "압박질문 대처", "정장 스타일링", "시선 처리", "마지막 한마디", "역질문 기술"],
    "인간관계": ["거절하는 법", "선 넘는 사람 대처", "직장 내 대화법", "친구 고민", "자존감 지키기", "가족과의 소통"],
    "유튜브": ["영상 편집 초보", "썸네일 치트키", "조회수 떡상", "장비 추천", "쇼츠 알고리즘", "채널 브랜딩"],
    "스피치": ["발성 교정", "발표 불안 극복", "청중 사로잡기", "딕션 연습", "스토리텔링", "PT 면접 합격"],
    "건강관리": ["영양제 조합", "수면 질 개선", "거북목 교정", "스트레칭 루틴", "만성피로 해소", "수분 섭취 습관"]
  };

  const secondaryPool = [
    "너무 빡빡한 일정 피하기", "실현 가능성 대폭 높여줘", "직장인용 맞춤형으로 변경", "비용 최소화 관점", "초보자 수준으로 쉽게",
    "단계별 템플릿 양식 제공", "예시(Example) 포함해서 출력", "전문 용어 해설 추가", "체크리스트 형태로 요약", "핵심 위주로 분량 압축"
  ];

  const analysisKeywordsPool: Record<string, string[]> = {
    "예산": ["초저가 가성비 지향", "예산 무제한 플렉스", "평균 시장가 기준"],
    "기간": ["단기 속성 완성", "장기 프로젝트", "주말 집중 코스"],
    "수준": ["왕초보 입문 레벨", "중급자 점프업", "실무자 마스터 클래스"]
  };

  // --- [3. 비즈니스 로직 연산 엔진] ---

  const selectMacroCategory = (category: string) => {
    setSelectedMacro(category);
    setSelectedSubs([]);
    setShowResult(false);
    setShowSecondary(false);
    setSelectedSecondaries([]);

    // 직접 추가한 것과 고정 데이터를 모두 커버하는 실시간 지능형 중분류 생성기
    if (subCategoryData[category]) {
      setSubChips(subCategoryData[category].slice(0, 7));
    } else {
      // 1번 피드백: 직접추가 시 텍스트 맞춤형 실시간 가상 생성 기능
      setSubChips([
        `${category} 입문 가이드`, `${category} 트렌드 분석`, `초고속 ${category} 마스터`, 
        `실전 ${category} 전략`, `${category} 리스크 관리`, `가성비 ${category} 팁`
      ]);
    }
  };

  // 2번 피드백: 중복 절대 검사 및 새로운 대분류 실시간 AI 생성기
  const appendMacroRow = () => {
    const width = macroContainerRef.current?.offsetWidth || 500;
    const itemsInRow = Math.max(3, Math.floor(width / 95));
    
    let currentCategories = [...macroCategories];
    let itemsAdded = 0;
    let localIdx = poolIdx;

    while (itemsAdded < itemsInRow) {
      let candidate = "";
      if (localIdx < macroPool.length) {
        candidate = macroPool[localIdx];
        localIdx++;
      } else {
        // 기본 풀 소진 시 무한 풀에서 중복 체크하며 실시간 조립
        const infiniteIdx = (localIdx - macroPool.length) % infiniteMacroPool.length;
        candidate = infiniteMacroPool[infiniteIdx];
        localIdx++;
      }

      // 이미 화면에 노출 중인 대분류가 아닐 때만 안전하게 Push
      if (!currentCategories.includes(candidate)) {
        currentCategories.push(candidate);
        itemsAdded++;
      }
    }
    setMacroCategories(currentCategories);
    setPoolIdx(localIdx);
  };

  const submitCustomMacro = () => {
    if (!customInput || customInput.trim() === "") {
      setIsAddingCustom(false);
      return;
    }
    const sanitized = customInput.trim().substring(0, 10);
    if (!macroCategories.includes(sanitized)) {
      setMacroCategories([...macroCategories, sanitized]);
    }
    selectMacroCategory(sanitized);
    setCustomInput("");
    setIsAddingCustom(false);
  };

  const appendSubRow = () => {
    const width = subContainerRef.current?.offsetWidth || 500;
    const itemsInRow = Math.max(2, Math.floor(width / 90));
    const extendedPool = ["심화 집중", "시간 절약", "A급 퀄리티", "비밀 노하우", "리스크 최소화", "연령별 케어"];
    
    let newSubs = [...subChips];
    const rawSource = subCategoryData[selectedMacro] || [];

    for (let i = 0; i < itemsInRow; i++) {
      const nextText = rawSource[newSubs.length + i] || extendedPool[Math.floor(Math.random() * extendedPool.length)];
      if (!newSubs.includes(nextText)) {
        newSubs.push(nextText.substring(0, 10));
      }
    }
    setSubChips(newSubs);
  };

  const toggleSubChip = (text: string) => {
    if (selectedSubs.includes(text)) {
      setSelectedSubs(selectedSubs.filter(item => item !== text));
    } else {
      setSelectedSubs([...selectedSubs, text]);
    }
  };

  // 3번 피드백: 2차 고도화 구역 전용 더보기 로직
  const appendSecondaryRow = () => {
    let currentChips = [...secondaryChips];
    let added = 0;
    
    for (let i = 0; i < secondaryPool.length; i++) {
      if (!currentChips.includes(secondaryPool[i])) {
        currentChips.push(secondaryPool[i]);
        added++;
        if (added >= 3) break; // 한 번에 3개씩 확장
      }
    }
    // 풀이 모자라면 범용 접미사 AI 확장
    if (added === 0) {
      currentChips.push(`추가 제약 조건 ${currentChips.length + 1}`);
      currentChips.push(`정밀 가이드 ${currentChips.length + 2}`);
    }
    setSecondaryChips(currentChips);
  };

  // 3번 피드백: 2차 고도화 구역 전용 직접추가 로직
  const submitCustomSecondary = () => {
    if (!customSecondaryInput || customSecondaryInput.trim() === "") {
      setIsAddingSecondaryCustom(false);
      return;
    }
    const sanitized = customSecondaryInput.trim();
    if (!secondaryChips.includes(sanitized)) {
      setSecondaryChips([...secondaryChips, sanitized]);
    }
    if (!selectedSecondaries.includes(sanitized)) {
      setSelectedSecondaries([...selectedSecondaries, sanitized]);
    }
    setCustomSecondaryInput("");
    setIsAddingSecondaryCustom(false);
  };

  // 실시간 문맥 검사
  useEffect(() => {
    let chips: string[] = [];
    if (userInput.includes("돈") || userInput.includes("예산") || userInput.includes("경비") || userInput.includes("비용")) {
      chips = [...chips, ...analysisKeywordsPool["예산"]];
    }
    if (userInput.includes("기간") || userInput.includes("며칠") || userInput.includes("시간") || userInput.includes("일정")) {
      chips = [...chips, ...analysisKeywordsPool["기간"]];
    }
    if (userInput.includes("초보") || userInput.includes("수준") || userInput.includes("실력") || userInput.includes("처음")) {
      chips = [...chips, ...analysisKeywordsPool["수준"]];
    }
    setAnalysisChips(chips);
  }, [userInput]);

  const generatePrompt = () => {
    if (!selectedMacro) {
      alert("밀키트를 구성할 대분류(메뉴)를 먼저 선택해 주세요!");
      return;
    }

    const persona = `당신은 핵심을 찌르는 10년 차 최고의 [${selectedMacro}] 전문 컨설턴트이자 멘토입니다.`;
    let targetSituation = `사용자는 현재 [${selectedMacro}] 분야의 작업을 진행 중이며, 특히 { ${selectedSubs.length > 0 ? selectedSubs.join(", ") : "기본 맞춤 전략"} } 요소를 핵심 재료로 고려하고 있습니다.`;
    if (userInput.trim()) {
      targetSituation += `\n- 사용자 추가 맥락 사양: ${userInput.trim()}`;
    }

    let markdown = `# 🤖 AI 페르소나 지정\n- ${persona}\n\n## 🎯 목표 및 상황\n- ${targetSituation}\n\n## 📝 요청 사항\n`;
    markdown += `- 1. 선택한 키워드 재료들과 맥락을 깊이 분석하여 구체적이고 바로 실행 가능한 액션 플랜을 도출해 주세요.\n`;
    markdown += `- 2. 발생 가능한 리스크를 사전 차단할 수 있는 고효율 체크리스트 가이드를 제공해 주세요.\n`;
    markdown += `- 3. 불필요한 서론과 인사를 생략하고 두괄식 핵심 요약 정보 위주로 답변해 주세요.`;

    if (selectedSecondaries.length > 0) {
      markdown += `\n\n## ⚠️ 제약 조건 및 피드백 (2차 재조립)\n`;
      selectedSecondaries.forEach((chipText, i) => {
        markdown += `- [보완사항 ${i+1}] ${chipText}\n`;
      });
      markdown += `- 제시한 제약 사항에 정밀 초점을 맞추어 결과물을 재가공해 수정해 주세요.`;
    }

    setGeneratedMarkdown(markdown);
    setShowResult(true);
  };

  const triggerSecondaryTuning = () => {
    setShowSecondary(true);
    let feedbackPool = ["너무 빡빡한 일정 피하기", "실현 가능성 대폭 높여줘", "직장인용 맞춤형으로 변경", "비용 최소화 관점", "초보자 수준으로 쉽게"];
    if (selectedMacro === "공부") feedbackPool = ["루틴 최적화 집중", "시간대별 시간 분배형", "번아웃 방지 장치 포함", "초단기 벼락치기 모드"];
    if (selectedMacro === "성형") feedbackPool = ["안전 최우선 보수적 관점", "회복 기간 최소화 위주", "상담 시 필수 질문 목록 위주"];
    setSecondaryChips(feedbackPool);
  };

  const toggleSecondaryChip = (text: string) => {
    if (selectedSecondaries.includes(text)) {
      setSelectedSecondaries(selectedSecondaries.filter(item => item !== text));
    } else {
      setSelectedSecondaries([...selectedSecondaries, text]);
    }
  };

  useEffect(() => {
    if (showResult) generatePrompt();
  }, [selectedSecondaries]);

  return (
    <main className="p-4 md:p-8 text-gray-800 bg-gradient-to-b from-blue-50 to-emerald-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6 text-center shadow-md">
          <h1 className="text-3xl font-extrabold tracking-wider">Prom-Kit</h1>
          <p className="text-sm text-blue-100 mt-1">AI Prompt Kit Vending Machine</p>
        </div>

        <div className="p-6 space-y-8">
          
          {/* [1층] 대분류 */}
          <div>
            <div className="mb-3 text-lg font-bold text-gray-900">📦 재료 ① 메뉴 선택 (대분류)</div>
            <div ref={macroContainerRef} className="flex flex-wrap gap-2 items-center">
              {macroCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => selectMacroCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                    selectedMacro === category ? 'bg-blue-600 text-white ring-2 ring-blue-300 font-bold' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}

              {isAddingCustom ? (
                <div className="flex items-center gap-1 bg-yellow-50 p-1 rounded-full border border-yellow-300 shadow-inner">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitCustomMacro()}
                    placeholder="최대 10자 입력"
                    maxLength={10}
                    className="px-3 py-1 bg-transparent text-sm font-medium text-gray-800 focus:outline-none w-28 placeholder-gray-400"
                    autoFocus
                  />
                  <button onClick={submitCustomMacro} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-full transition-all">확인</button>
                  <button onClick={() => setIsAddingCustom(false)} className="px-2 py-1 text-gray-400 hover:text-gray-600 text-xs font-medium">취소</button>
                </div>
              ) : (
                <button onClick={() => setIsAddingCustom(true)} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-full text-sm transition-all shadow-sm">✎ 직접 추가</button>
              )}

              <button onClick={appendMacroRow} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-full text-sm transition-all shadow-sm">＋ 더보기</button>
            </div>
          </div>

          {/* [2층] 중분류 */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div className="mb-3 text-md font-bold text-gray-700">🌿 AI 실시간 추천 재료 (중분류)</div>
            <div ref={subContainerRef} className="flex flex-wrap gap-2 items-center">
              {subChips.length === 0 ? (
                <p className="text-sm text-gray-400">대분류를 선택하면 AI가 실시간으로 신선한 재료 칩을 생성합니다.</p>
              ) : (
                subChips.map((text) => (
                  <button
                    key={text}
                    onClick={() => toggleSubChip(text)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                      selectedSubs.includes(text) ? 'bg-blue-100 border-blue-500 text-blue-800 font-bold' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {text}
                  </button>
                ))
              )}
              {selectedMacro && <button onClick={appendSubRow} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-xs transition-all shadow-sm">＋ 더보기</button>}
            </div>
          </div>

          {/* [3층] 손질창 */}
          <div>
            <div className="flex gap-4 justify-start items-end px-2 mb-2">
              <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="13" r="8"/><path d="M12 2c0 3 2 3 2 3s-2 0-2-3z" stroke="green" strokeWidth={2}/></svg>
              <svg className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3s5 4 2 16c-1 3-3 3-4 0-3-12 2-16 2-16z"/><path d="M12 2v3" stroke="green" strokeWidth={2}/></svg>
              <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="5"/><circle cx="9" cy="12" r="4"/><circle cx="15" cy="12" r="4"/><rect x="11" y="14" width="2" height="7" fill="brown"/></svg>
              <svg className="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="13" rx="7" ry="8" fill="#fff" stroke="#ddd"/><circle cx="12" cy="13" r="3.5"/></svg>
              <svg className="w-8 h-8 text-amber-700" viewBox="0 0 24 24" fill="currentColor"><path d="M6 12c0-4 3-6 6-6s6 2 6 6H6z"/><rect x="10" y="12" width="4" height="7" rx={1}/></svg>
            </div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base placeholder-gray-400 resize-none shadow-inner"
              placeholder="선택한 재료 외에 구체적인 요구사항을 자유롭게 적어주세요..."
            />
            
            <div className="mt-2 flex flex-wrap gap-2">
              {analysisChips.map((text) => (
                <button
                  key={text}
                  onClick={() => setUserInput(userInput.trim() + " " + text + ", ")}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-xs font-medium transition-all shadow-sm"
                >
                  💡 추천 추가: {text}
                </button>
              ))}
            </div>
          </div>

          {/* [4층] 메인 실행 버튼 */}
          <div className="pt-2">
            <button onClick={generatePrompt} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl text-lg transition-all shadow-md flex items-center justify-center gap-2">
              🍳 요리 시작! (프롬프트 조립)
            </button>
          </div>

          {/* 결과 노출 창 */}
          {showResult && (
            <div className="space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-md font-bold text-gray-900">📋 조립 완료된 프롬프트 (Markdown)</span>
                <button onClick={() => navigator.clipboard.writeText(generatedMarkdown).then(() => alert("🎨 복사 완료!"))} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded transition-all shadow-sm">📋 원클릭 복사</button>
              </div>
              <textarea readOnly value={generatedMarkdown} className="w-full h-64 p-4 bg-gray-900 text-emerald-400 font-mono text-sm rounded-xl border border-gray-800 resize-none shadow-2xl" />
              
              <div className="flex justify-end">
                <button onClick={triggerSecondaryTuning} className="text-sm font-bold text-emerald-600 hover:text-emerald-800 underline transition-all">
                  💡 원하는 결과가 아니신가요? (프롬프트 고도화)
                </button>
              </div>
            </div>
          )}

          {/* [5층] 2차 고도화 보완 공간 */}
          {showSecondary && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-200 space-y-3 shadow-sm">
              <span className="text-md font-bold text-amber-800 block">⚠️ 2차 고도화 보완재료 튜닝</span>
              <p className="text-xs text-amber-700">추가할 피드백 제약 조건 칩을 선택하면 프롬프트가 즉시 업그레이드됩니다:</p>
              
              <div className="flex flex-wrap gap-2 items-center">
                {secondaryChips.map((fbText) => {
                  const isSelected = selectedSecondaries.includes(fbText);
                  return (
                    <button
                      key={fbText}
                      onClick={() => toggleSecondaryChip(fbText)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm border ${
                        isSelected ? 'bg-orange-600 text-white border-orange-700 font-bold' : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      ⚠️ {fbText}
                    </button>
                  );
                })}

                {/* 3번 피드백: 2차 공간 내 인라인 직접 추가 컴포넌트 */}
                {isAddingSecondaryCustom ? (
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-orange-300 shadow-inner">
                    <input
                      type="text"
                      value={customSecondaryInput}
                      onChange={(e) => setCustomSecondaryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitCustomSecondary()}
                      placeholder="제약조건 입력"
                      className="px-2 py-1 bg-transparent text-xs font-medium text-gray-800 focus:outline-none w-32 placeholder-gray-400"
                      autoFocus
                    />
                    <button onClick={submitCustomSecondary} className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-md transition-all">확인</button>
                    <button onClick={() => setIsAddingSecondaryCustom(false)} className="px-1 py-1 text-gray-400 text-xs">취소</button>
                  </div>
                ) : (
                  <button onClick={() => setIsAddingSecondaryCustom(true)} className="px-3 py-1.5 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-lg text-xs transition-all shadow-sm">✎ 직접 추가</button>
                )}

                <button onClick={appendSecondaryRow} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-xs transition-all shadow-sm">＋ 더보기</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}