'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import categoriesData from '../data/categories.json';
import promptTemplatesData from '../data/prompt_templates.json';
import combinationMapsData from '../data/combination_maps.json';
import analysisData from '../data/analysis_keywords.json';
import MacroSection from './components/MacroSection';
import SubSection from './components/SubSection';
import TuningSection from './components/TuningSection';

interface CategoryItem {
  id: string;
  name: string;
  level: number;
  parent_id: string | null;
  type: string;
}

interface CombinationMap {
  id: string;
  large_id: string | null;
  medium_id: string | null;
  small_id: string | null;
  template_id: string;
}

interface PromptTemplate {
  id: string;
  title: string;
  template_content: string;
}

const promptTemplatesList = promptTemplatesData as unknown as PromptTemplate[];

function formatPrompt(template: string, data: { large_name: string, medium_name: string, small_name: string, userInput: string, activeRequests: string[] }) {
  let content = template
    .replace(/\[?\{large_name\}\]?/g, data.large_name)
    .replace(/\[?\{large_category\}\]?/g, data.large_name)
    .replace(/\[?\{medium_name\}\]?/g, data.medium_name)
    .replace(/\[?\{medium_category\}\]?/g, data.medium_name)
    .replace(/\[?\{small_name\}\]?/g, data.small_name)
    .replace(/\[?\{small_category\}\]?/g, data.small_name);

  const contextStr = data.userInput.trim() 
    ? `\n- 사용자 추가 맥락 사양: ${data.userInput.trim()}` 
    : '';
  content = content.replace(/\{user_context\}/g, contextStr);

  const requestsStr = data.activeRequests.map(req => `- ${req}`).join('\n');
  content = content.replace(/\{requests\}/g, requestsStr);

  let constraintsStr = '';
  if (data.small_name.trim()) {
    constraintsStr = data.small_name.split(',').map((name, i) => `- [보완사항 ${i + 1}] ${name.trim()}`).join('\n');
  }

  if (!data.small_name.trim()) {
    content = content.replace(/\n## ⚠️ 제약 조건 및 피드백\n\{constraints\}/g, '');
    content = content.replace(/\{constraints\}/g, '');
  } else {
    content = content.replace(/\{constraints\}/g, constraintsStr);
  }

  return content;
}

export default function Home() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [combinationMaps, setCombinationMaps] = useState<CombinationMap[]>([]);

  useEffect(() => {
    // 1. Load custom categories
    const storedCats = localStorage.getItem('custom_categories');
    const customCats = storedCats ? JSON.parse(storedCats) : [];
    const mergedCats = [...(categoriesData as unknown as CategoryItem[]), ...customCats];
    setCategories(mergedCats);

    // 2. Load custom combinations
    const storedCombos = localStorage.getItem('custom_combinations');
    const customCombos = storedCombos ? JSON.parse(storedCombos) : [];
    setCombinationMaps([...combinationMapsData, ...customCombos]);

    // 3. Populate macro categories & bulk storage
    const initialCategories = ["공부", "여행", "영어", "일정", "준비물", "레시피", "맛집", "성형"];
    const level1Names = mergedCats.filter(c => c.level === 1).map(c => c.name);
    setMacroBulkStorage(level1Names.filter(name => !initialCategories.includes(name)));
  }, []);

  const analysisKeywordsPool = analysisData.analysisKeywordsPool;

  const promptTemplates = {
    persona: "당신은 핵심을 찌르는 10년 차 최고의 [{macro}] 전문 컨설턴트이자 멘토입니다.",
    targetSituation: "사용자는 현재 [{macro}] 분야의 작업을 진행 중이며, 특히 [{subs}] 요소를 핵심 재료로 고려하고 있습니다.",
    requests: [
      "1. 선택한 키워드 재료들과 맥락을 깊이 분석하여 구체적이고 실질적인 단계별 액션 플랜을 도출해 주세요.",
      "2. 발생 가능한 리스크를 사전 차단할 수 있는 고효율 체크리스트 가이드를 제공해 주세요.",
      "3. 불필요한 서론, 인사말, 뻔한 덕담은 전면 생략하고 두괄식 핵심 요약 정보 위주로 답변해 주세요.",
      "4. \"상황에 따라 다를 수 있다\"와 같은 추상적인 조언이나 이론적 설명은 일절 배제하고, 오늘 당장 실행할 수 있는 행동(동사) 단위로만 답변을 구성해 주세요."
    ]
  };

  const subCategoryData: Record<string, string[]> = {};
  const level1Cats = categories.filter(c => c.level === 1);
  const level2Cats = categories.filter(c => c.level === 2);
  level1Cats.forEach(l1 => {
    subCategoryData[l1.name] = level2Cats.filter(c => c.parent_id === l1.id).map(c => c.name);
  });

  const secondaryPool = categories.filter(c => c.level === 3).map(c => c.name);
  const specificSecondaryPools: Record<string, string[]> = {
    "공부": ["루틴 최적화 집중", "시간대별 시간 분배형", "번아웃 방지 장치 포함", "초단기 벼락치기 모드"],
    "성형": ["안전 최우선 보수적 관점", "회복 기간 최소화 위주", "상담 시 필수 질문 목록 위주"]
  };

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

  const [macroBulkStorage, setMacroBulkStorage] = useState<string[]>([]);
  const [subBulkStorage, setSubBulkStorage] = useState<string[]>([]);

  const [appendSubCount, setAppendSubCount] = useState(0);

  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [limitPopupMessage, setLimitPopupMessage] = useState("");

  const [chipsPerAppend, setChipsPerAppend] = useState(5);

  const APPEND_LIMIT = 3;

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const triggerWarning = useCallback((msg: string) => {
    setWarningMessage(msg);
    setShowWarningModal(true);
  }, []);

  const handleUserInputChange = (val: string) => {
    if (val.length > 500) {
      setUserInput(val.slice(0, 500));
      triggerWarning("최대 500자까지만 입력 가능합니다.");
    } else {
      setUserInput(val);
    }
  };

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
    let bulkSubs: string[] = [];
    if (subCategoryData[category]) {
      initialSubs = subCategoryData[category].slice(0, 7);
      bulkSubs = subCategoryData[category].slice(7);
    } else {
      initialSubs = [`${category} 입문 가이드`, `${category} 트렌드 분석`, `실전 ${category} 전략`];
    }
    setSubChips(initialSubs);
    setSubBulkStorage(bulkSubs);

    // 100% 로컬 기본 requests 지정
    setActiveRequests(promptTemplates.requests);
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
      setLimitPopupMessage("더 이상 추천 키워드가 없어요. 직접 입력해서 추가해보세요!");
      setShowLimitPopup(true);
      return;
    }

    // 이미 화면에 있는 칩과 중복된 항목은 필터링
    const cleanBulkStorage = subBulkStorage.filter(item => !subChips.includes(item));

    if (cleanBulkStorage.length === 0) {
      setLimitPopupMessage("더 이상 추천 키워드가 없어요. 직접 입력해서 추가해보세요!");
      setShowLimitPopup(true);
      return;
    }

    const nextChips = cleanBulkStorage.slice(0, chipsPerAppend);
    const remaining = cleanBulkStorage.slice(chipsPerAppend);

    setSubChips((prev) => [...prev, ...nextChips]);
    setSubBulkStorage(remaining);
    const nextCount = appendSubCount + 1;
    setAppendSubCount(nextCount);

    if (nextCount >= APPEND_LIMIT || remaining.length === 0) {
      setLimitPopupMessage("더 이상 추천 키워드가 없어요. 직접 입력해서 추가해보세요!");
      setShowLimitPopup(true);
    }
  };

  const handleAddCustomMacro = (sanitized: string) => {
    if (sanitized.length > 500) {
      triggerWarning("최대 500자까지만 입력 가능합니다.");
      return;
    }
    const newCat: CategoryItem = {
      id: 'cat_l_usr_' + Date.now(),
      name: sanitized,
      level: 1,
      parent_id: null,
      type: 'user'
    };

    const storedCats = localStorage.getItem('custom_categories');
    const customCats = storedCats ? JSON.parse(storedCats) : [];
    customCats.push(newCat);
    localStorage.setItem('custom_categories', JSON.stringify(customCats));

    setCategories(prev => [...prev, newCat]);

    if (!macroCategories.includes(sanitized)) {
      setMacroCategories([...macroCategories, sanitized]);
    }
    handleSelectMacro(sanitized);
  };

  const handleAddCustomSub = (sanitized: string) => {
    if (!selectedMacro) return;
    if (sanitized.length > 500) {
      triggerWarning("최대 500자까지만 입력 가능합니다.");
      return;
    }

    const parentCat = categories.find(c => c.level === 1 && c.name === selectedMacro);
    const parentId = parentCat ? parentCat.id : null;

    const newCat: CategoryItem = {
      id: 'cat_m_usr_' + Date.now(),
      name: sanitized,
      level: 2,
      parent_id: parentId,
      type: 'user'
    };

    const storedCats = localStorage.getItem('custom_categories');
    const customCats = storedCats ? JSON.parse(storedCats) : [];
    customCats.push(newCat);
    localStorage.setItem('custom_categories', JSON.stringify(customCats));

    setCategories(prev => [...prev, newCat]);

    if (!subChips.includes(sanitized)) {
      setSubChips(prev => [...prev, sanitized]);
    }
    if (!selectedSubs.includes(sanitized)) {
      setSelectedSubs(prev => [...prev, sanitized]);
    }
  };

  const handleToggleSub = (text: string) => {
    setSelectedSubs(prev => prev.includes(text) ? prev.filter(item => item !== text) : [...prev, text]);
  };

  const handleTuningExhausted = useCallback(() => {
    setLimitPopupMessage("더 이상 추천 키워드가 없어요. 직접 입력해서 추가해보세요!");
    setShowLimitPopup(true);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedMacro("");
    setSelectedSubs([]);
    setUserInput("");
    setSelectedSecondaries([]);
    setShowResult(false);
    setShowSecondary(false);
    setSubChips([]);
    setSubBulkStorage([]);
    setAppendSubCount(0);

    const initialCategories = ["공부", "여행", "영어", "일정", "준비물", "레시피", "맛집", "성형"];
    setMacroCategories(initialCategories);

    const level1Names = categories.filter(c => c.level === 1).map(c => c.name);
    const filteredPool = level1Names.filter(item => !initialCategories.includes(item));
    setMacroBulkStorage(filteredPool);
    
    showToast("선택 정보가 초기화되었습니다.", "success");
  }, [showToast, categories]);

  // 3번 수정: useCallback으로 감싸서 exhaustive-deps 경고 해소
  const generatePrompt = useCallback(() => {
    if (!selectedMacro) {
      showToast("대분류 주제를 먼저 선택해 주세요.");
      return;
    }
    if (selectedSubs.length === 0) {
      showToast("세부 키워드를 최소 1개 이상 선택해 주세요.");
      return;
    }

    // 1. Resolve IDs
    const largeCat = categories.find(c => c.level === 1 && c.name === selectedMacro);
    const mediumCat = categories.find(c => c.level === 2 && c.parent_id === largeCat?.id && selectedSubs.includes(c.name));
    const smallCat = categories.find(c => c.level === 3 && selectedSecondaries.includes(c.name));

    const large_id = largeCat?.id || null;
    const medium_id = mediumCat?.id || null;
    const small_id = smallCat?.id || null;

    // 2. Lookup Combination
    const foundMap = combinationMaps.find((map: CombinationMap) => 
      map.large_id === large_id && 
      map.medium_id === medium_id && 
      map.small_id === small_id
    );

    let templateId = 'tpl_default';

    if (foundMap) {
      templateId = foundMap.template_id;
    } else {
      // Create and save new combination map entry
      const newCombId = 'comb_user_' + Date.now();
      const newCombo = {
        id: newCombId,
        large_id,
        medium_id,
        small_id,
        template_id: 'tpl_default'
      };

      const storedCombos = localStorage.getItem('custom_combinations');
      const customCombos = storedCombos ? JSON.parse(storedCombos) : [];
      customCombos.push(newCombo);
      localStorage.setItem('custom_combinations', JSON.stringify(customCombos));

      setCombinationMaps(prev => [...prev, newCombo]);
    }

    // 3. Format Template
    const targetTemplate = promptTemplatesList.find(t => t.id === templateId) || promptTemplatesList.find(t => t.id === 'tpl_default');
    const templateContent = targetTemplate ? targetTemplate.template_content : "";

    const formattedPrompt = formatPrompt(templateContent, {
      large_name: selectedMacro,
      medium_name: selectedSubs.join(', ') || '기본 맞춤 전략',
      small_name: selectedSecondaries.join(', '),
      userInput,
      activeRequests
    });

    setGeneratedMarkdown(formattedPrompt);
    setShowResult(true);
  }, [selectedMacro, selectedSubs, userInput, selectedSecondaries, activeRequests, showToast, categories, combinationMaps]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedMarkdown).then(() => {
      showToast("🎨 프롬프트가 클립보드에 복사되었습니다.", "success");
      // Send logging to Notion
      fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          large_name: selectedMacro,
          medium_names: selectedSubs,
          small_names: selectedSecondaries,
          userInput,
          length: generatedMarkdown.length
        })
      }).catch(e => console.error("Notion 로깅 실패:", e));
    });
  }, [generatedMarkdown, selectedMacro, selectedSubs, selectedSecondaries, userInput, showToast]);

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

          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-xs text-gray-400 font-medium">재료를 선택하여 나만의 프롬프트를 조립하세요.</span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 bg-gray-50 border border-gray-200 rounded-lg transition-all shadow-sm active:scale-95"
            >
              🔄 선택 초기화
            </button>
          </div>

          <MacroSection
            macroCategories={macroCategories}
            selectedMacro={selectedMacro}
            onSelectCategory={handleSelectMacro}
            onAppendMacro={handleAppendMacro}
            onAddCustomMacro={handleAddCustomMacro}
            isExhausted={macroBulkStorage.length === 0}
            onWarning={triggerWarning}
          />

          <SubSection
            selectedMacro={selectedMacro}
            subChips={subChips}
            selectedSubs={selectedSubs}
            onToggleSub={handleToggleSub}
            onAppendSub={handleAppendSub}
            isExhausted={appendSubCount >= APPEND_LIMIT || subBulkStorage.filter(item => !subChips.includes(item)).length === 0}
            onAddCustomSub={handleAddCustomSub}
            onWarning={triggerWarning}
          />

          <div>
            <textarea
              value={userInput}
              onChange={(e) => handleUserInputChange(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base placeholder-gray-400 resize-none shadow-inner"
              placeholder="선택한 재료 외에 구체적인 요구사항을 자유롭게 적어주세요..."
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {analysisChips.map((text) => (
                <button key={text} onClick={() => handleUserInputChange(userInput.trim() + " " + text + ", ")} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-xs font-medium transition-all shadow-sm">
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
                <button onClick={handleCopy} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded transition-all shadow-sm">📋 원클릭 복사</button>
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
            onExhausted={handleTuningExhausted}
            onWarning={triggerWarning}
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
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl border border-white/10 transition-all duration-300 ${
          toast.type === 'success' ? 'bg-emerald-600/90 border-emerald-500/20' : 'bg-red-600/90 border-red-500/20'
        }`}>
          <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs">
            {toast.type === 'success' ? '✓' : '⚠️'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full space-y-4 border border-red-100 transition-all">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <span>⚠️</span> 입력 제한 경고
            </div>
            <p className="text-sm text-gray-600 font-medium">{warningMessage}</p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-all active:scale-98"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  );
}