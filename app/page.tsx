'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import appData from './data.json';

import MacroSection from './components/MacroSection';
import SubSection from './components/SubSection';
import TuningSection from './components/TuningSection';

interface AppDataStructure {
  macroPool: string[];
  infiniteMacroPool: string[];
  subCategoryData: Record<string, string[]>;
  extendedSubPool: string[];
  secondaryPool: string[];
  specificSecondaryPools: Record<string, string[]>;
  analysisKeywordsPool: Record<string, string[]>;
  promptTemplates: {
    persona: string;
    targetSituation: string;
    requests: string[];
  };
}

export default function Home() {
  const data = appData as unknown as AppDataStructure;

  const subCategoryData = data.subCategoryData;
  const secondaryPool = data.secondaryPool;
  const specificSecondaryPools = data.specificSecondaryPools;
  const analysisKeywordsPool = data.analysisKeywordsPool;
  const promptTemplates = data.promptTemplates;

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

  const [macroBulkStorage, setMacroBulkStorage] = useState<string[]>(() => {
    const initialCategories = ["공부", "여행", "영어", "일정", "준비물", "레시피", "맛집", "성형"];
    const pool = [...(appData.macroPool || []), ...(appData.infiniteMacroPool || [])];
    return pool.filter(item => !initialCategories.includes(item));
  });
  const [subBulkStorage, setSubBulkStorage] = useState<string[]>([]);

  const [appendMacroCount, setAppendMacroCount] = useState(0);
  const [appendSubCount, setAppendSubCount] = useState(0);

  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [limitPopupMessage, setLimitPopupMessage] = useState("");

  const [chipsPerAppend, setChipsPerAppend] = useState(5);

  const APPEND_LIMIT = 3;

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [activeRequests, setActiveRequests] = useState<string[]>(promptTemplates.requests);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 현재 선택된 대분류를 ref로 추적 — 비동기 응답 오염 방지용
  const selectedMacroRef = useRef(selectedMacro);
  useEffect(() => {
    selectedMacroRef.current = selectedMacro;
  }, [selectedMacro]);

  useEffect(() => {
    const updateChipsPerAppend = () => {
      setChipsPerAppend(window.innerWidth < 768 ? 3 : 5);
    };
    updateChipsPerAppend();
    window.addEventListener('resize', updateChipsPerAppend);
    return () => window.removeEventListener('resize', updateChipsPerAppend);
  }, []);



  // 1번 수정: 요청 시점의 macro를 캡처해서 응답 시점에 현재 선택과 비교
  const topUpSubStorage = async (macro: string, currentList: string[]) => {
    if (!macro) return;
    const requestedMacro = macro; // 요청 시점 캡처
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sub', currentItems: currentList, selectedMacro: macro }),
      });
      const res = await response.json();
      if (res.success && res.data) {
        // 응답이 돌아왔을 때 현재 선택된 대분류와 다르면 버림
        if (selectedMacroRef.current !== requestedMacro) return;
        const newItems = (res.data as string[]).filter(item => !currentList.includes(item));
        setSubBulkStorage((prev) => [...new Set([...prev, ...newItems])]);
      }
    } catch (error) {
      console.error("중분류 벌크 수급 실패:", error);
    }
  };

  const fetchDynamicRequests = async (macro: string) => {
    if (!macro) return;
    const requestedMacro = macro;
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'requests', selectedMacro: macro }),
      });
      const res = await response.json();
      if (res.success && res.data && res.data.length >= 4) {
        if (selectedMacroRef.current !== requestedMacro) return;
        setActiveRequests(res.data.slice(0, 4));
      }
    } catch (error) {
      console.error("동적 요청사항 수급 실패:", error);
    }
  };



  const handleSelectMacro = (category: string) => {
    setSelectedMacro(category);
    selectedMacroRef.current = category; // ref 즉시 동기화
    setSelectedSubs([]);
    setShowResult(false);
    setShowSecondary(false);
    setSelectedSecondaries([]);
    setSubBulkStorage([]);
    setAppendSubCount(0);

    let initialSubs: string[] = [];
    if (subCategoryData[category]) {
      initialSubs = subCategoryData[category].slice(0, 7);
    } else {
      initialSubs = [`${category} 입문 가이드`, `${category} 트렌드 분석`, `실전 ${category} 전략`];
    }
    setSubChips(initialSubs);
    topUpSubStorage(category, initialSubs);

    // 로딩 중에는 기존 고정 requests를 fallback으로 지정
    setActiveRequests(promptTemplates.requests);
    fetchDynamicRequests(category);
  };

  const handleAppendMacro = async () => {
    if (macroBulkStorage.length === 0) {
      setLimitPopupMessage("더 이상 추천 키워드가 없어요. 직접 입력해서 추가해보세요!");
      setShowLimitPopup(true);
      return;
    }

    const nextChips = macroBulkStorage.slice(0, chipsPerAppend);
    const remaining = macroBulkStorage.slice(chipsPerAppend);

    const newItemsToAppend = nextChips.filter(item => !macroCategories.includes(item));
    if (newItemsToAppend.length > 0) {
      setMacroCategories((prev) => [...prev, ...newItemsToAppend]);
      setMacroBulkStorage(remaining);
      setAppendMacroCount((prev) => prev + 1);

      if (!selectedMacro) {
        handleSelectMacro(newItemsToAppend[newItemsToAppend.length - 1]);
      }
    } else {
      setMacroBulkStorage(remaining);
    }
  };

  const handleAppendSub = async () => {
    if (!selectedMacro) return;

    if (appendSubCount >= APPEND_LIMIT) {
      setLimitPopupMessage("원하는 키워드가 없다면 아래 텍스트 창에 직접 입력해보세요.");
      setShowLimitPopup(true);
      return;
    }

    // 이미 화면에 있는 칩과 중복된 항목은 필터링
    const cleanBulkStorage = subBulkStorage.filter(item => !subChips.includes(item));

    if (cleanBulkStorage.length === 0) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'sub', currentItems: subChips, selectedMacro }),
        });
        const res = await response.json();
        if (res.success && res.data) {
          if (selectedMacroRef.current !== selectedMacro) return;
          const newItems = (res.data as string[]).filter((item: string) => !subChips.includes(item));
          const toAdd = newItems.slice(0, chipsPerAppend);
          const toStore = newItems.slice(chipsPerAppend);

          if (toAdd.length > 0) {
            setSubChips((prev) => [...prev, ...toAdd]);
            setSubBulkStorage(toStore);
            setAppendSubCount((prev) => prev + 1);
          } else {
            showToast("새로운 키워드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
          }
        }
      } catch (error) {
        console.error("중분류 직접 호출 실패:", error);
      }
      return;
    }

    const nextChips = cleanBulkStorage.slice(0, chipsPerAppend);
    const remaining = cleanBulkStorage.slice(chipsPerAppend);

    setSubChips((prev) => [...prev, ...nextChips]);
    setSubBulkStorage(remaining);
    setAppendSubCount((prev) => prev + 1);

    if (remaining.length < 3) topUpSubStorage(selectedMacro, [...subChips, ...nextChips]);
  };

  const handleAddCustomMacro = (sanitized: string) => {
    if (!macroCategories.includes(sanitized)) {
      setMacroCategories([...macroCategories, sanitized]);
    }
    handleSelectMacro(sanitized);
  };

  const handleToggleSub = (text: string) => {
    setSelectedSubs(prev => prev.includes(text) ? prev.filter(item => item !== text) : [...prev, text]);
  };

  // 3번 수정: useCallback으로 감싸서 exhaustive-deps 경고 해소
  const generatePrompt = useCallback(() => {
    if (!selectedMacro) return;
    const persona = promptTemplates.persona.replace("{macro}", selectedMacro);
    const subComponent = selectedSubs.length > 0 ? selectedSubs.join(", ") : "기본 맞춤 전략";
    let targetSituation = promptTemplates.targetSituation.replace("{macro}", selectedMacro).replace("{subs}", subComponent);

    if (userInput.trim()) targetSituation += `\n- 사용자 추가 맥락 사양: ${userInput.trim()}`;
    let markdown = `# 🤖 AI 페르소나 지정\n- ${persona}\n\n## 🎯 목표 및 상황\n- ${targetSituation}\n\n## 📝 요청 사항\n`;
    activeRequests.forEach((req) => { markdown += `- ${req}\n`; });

    if (selectedSecondaries.length > 0) {
      markdown += `\n## ⚠️ 제약 조건 및 피드백\n`;
      selectedSecondaries.forEach((chipText, i) => { markdown += `- [보완사항 ${i + 1}] ${chipText}\n`; });
    }
    setGeneratedMarkdown(markdown);
    setShowResult(true);
  }, [selectedMacro, selectedSubs, userInput, selectedSecondaries, promptTemplates, activeRequests]);

  // 2번 수정: analysisChips 중복 제거
  useEffect(() => {
    let chips: string[] = [];
    if (/돈|예산|경비|비용/.test(userInput)) chips = [...chips, ...analysisKeywordsPool["예산"]];
    if (/기간|며칠|시간|일정/.test(userInput)) chips = [...chips, ...analysisKeywordsPool["기간"]];
    if (/초보|수준|실력|처음/.test(userInput)) chips = [...chips, ...analysisKeywordsPool["수준"]];
    setAnalysisChips([...new Set(chips)]);
  }, [userInput, analysisKeywordsPool]);

  useEffect(() => {
    if (showResult) generatePrompt();
  }, [selectedSecondaries, generatePrompt, showResult]);

  return (
    <main className="p-4 md:p-8 text-gray-800 bg-gradient-to-b from-blue-50 to-emerald-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6 text-center shadow-md">
          <h1 className="text-3xl font-extrabold tracking-wider">Prom-Kit</h1>
          <p className="text-sm text-blue-100 mt-1">AI Prompt Kit Vending Machine</p>
        </div>

        <div className="p-6 space-y-8">

          <MacroSection
            macroCategories={macroCategories}
            selectedMacro={selectedMacro}
            onSelectCategory={handleSelectMacro}
            onAppendMacro={handleAppendMacro}
            onAddCustomMacro={handleAddCustomMacro}
          />

          <SubSection
            selectedMacro={selectedMacro}
            subChips={subChips}
            selectedSubs={selectedSubs}
            onToggleSub={handleToggleSub}
            onAppendSub={handleAppendSub}
          />

          <div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base placeholder-gray-400 resize-none shadow-inner"
              placeholder="선택한 재료 외에 구체적인 요구사항을 자유롭게 적어주세요..."
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {analysisChips.map((text) => (
                <button key={text} onClick={() => setUserInput(userInput.trim() + " " + text + ", ")} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-xs font-medium transition-all shadow-sm">
                  💡 추천 추가: {text}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button onClick={generatePrompt} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl text-lg transition-all shadow-md flex items-center justify-center gap-2">
              ✨ 프롬프트 생성하기
            </button>
          </div>

          {showResult && (
            <div className="space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-md font-bold text-gray-900">📋 조립 완료된 프롬프트 (Markdown)</span>
                <button onClick={() => navigator.clipboard.writeText(generatedMarkdown).then(() => alert("🎨 복사 완료!"))} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded transition-all shadow-sm">📋 원클릭 복사</button>
              </div>
              <textarea readOnly value={generatedMarkdown} className="w-full h-64 p-4 bg-gray-900 text-emerald-400 font-mono text-sm rounded-xl border border-gray-800 resize-none shadow-2xl" />
              <div className="flex justify-end">
                <button onClick={() => { setShowSecondary(true); setSecondaryChips(specificSecondaryPools[selectedMacro] || secondaryPool.slice(0, 5)); }} className="text-sm font-bold text-emerald-600 hover:text-emerald-800 underline transition-all">
                  💡 원하는 결과가 아니신가요? (프롬프트 고도화)
                </button>
              </div>
            </div>
          )}

          <TuningSection
            showSecondary={showSecondary}
            secondaryChips={secondaryChips}
            setSecondaryChips={setSecondaryChips}
            secondaryPool={secondaryPool}
            selectedSecondaries={selectedSecondaries}
            setSelectedSecondaries={setSelectedSecondaries}
          />

        </div>
      </div>

      {showLimitPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full space-y-4">
            <p className="text-sm font-bold text-gray-800">더 이상 불러올 수 없어요</p>
            <p className="text-sm text-gray-600">{limitPopupMessage}</p>
            <button
              onClick={() => setShowLimitPopup(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-red-600/90 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl border border-white/10 transition-all duration-300">
          <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs">⚠️</span>
          <span>{toast.message}</span>
        </div>
      )}
    </main>
  );
}