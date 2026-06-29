'use client';
import { useState } from 'react';

interface TuningProps {
  showSecondary: boolean;
  secondaryChips: string[];
  setSecondaryChips: React.Dispatch<React.SetStateAction<string[]>>;
  secondaryPool: string[];
  selectedSecondaries: string[];
  setSelectedSecondaries: React.Dispatch<React.SetStateAction<string[]>>;
  onExhausted: () => void;
  onWarning: (msg: string) => void;
}

export default function TuningSection({ showSecondary, secondaryChips, setSecondaryChips, secondaryPool, selectedSecondaries, setSelectedSecondaries, onExhausted, onWarning }: TuningProps) {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  if (!showSecondary) return null;

  const toggleChip = (text: string) => {
    setSelectedSecondaries(prev => prev.includes(text) ? prev.filter(item => item !== text) : [...prev, text]);
  };

  const appendRow = () => {
    let current = [...secondaryChips];
    let added = 0;
    for (let i = 0; i < secondaryPool.length; i++) {
      if (!current.includes(secondaryPool[i])) {
        current.push(secondaryPool[i]);
        added++; if (added >= 3) break;
      }
    }
    if (added > 0) {
      setSecondaryChips(current);
      const nowExhausted = secondaryPool.every(item => current.includes(item));
      if (nowExhausted) {
        onExhausted();
      }
    } else {
      onExhausted();
    }
  };

  const submitCustom = () => {
    const sanitized = customInput.trim();
    if (!sanitized) { setIsAddingCustom(false); return; }
    if (sanitized.length > 500) {
      onWarning("최대 500자까지만 입력 가능합니다.");
      setCustomInput(sanitized.slice(0, 500));
      return;
    }
    if (!secondaryChips.includes(sanitized)) setSecondaryChips([...secondaryChips, sanitized]);
    if (!selectedSecondaries.includes(sanitized)) setSelectedSecondaries([...selectedSecondaries, sanitized]);
    setCustomInput("");
    setIsAddingCustom(false);
  };

  const handleChange = (val: string) => {
    if (val.length > 500) {
      setCustomInput(val.slice(0, 500));
      onWarning("최대 500자까지만 입력 가능합니다.");
    } else {
      setCustomInput(val);
    }
  };

  const isExhausted = secondaryPool.every(item => secondaryChips.includes(item));

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-200 space-y-3 shadow-sm">
      <span className="text-md font-bold text-amber-800 block">⚠️ 2차 고도화 보완재료 튜닝</span>
      <p className="text-xs text-amber-700">추가할 피드백 제약 조건 칩을 선택하면 프롬프트가 즉시 업그레이드됩니다:</p>
      <div className="flex flex-wrap gap-2 items-center">
        {secondaryChips.map((fbText) => {
          const isSelected = selectedSecondaries.includes(fbText);
          return (
            <button key={fbText} onClick={() => toggleChip(fbText)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isSelected ? 'bg-orange-600 text-white border-orange-700 font-bold' : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'}`}>
              ⚠️ {fbText}
            </button>
          );
        })}
        {isAddingCustom ? (
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-orange-300 shadow-inner">
            <input type="text" value={customInput} onChange={(e) => handleChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitCustom()} placeholder="제약조건 입력" className="px-2 py-1 bg-transparent text-xs w-32 focus:outline-none" autoFocus />
            <button onClick={submitCustom} className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-md">확인</button>
            <button onClick={() => setIsAddingCustom(false)} className="px-1 py-1 text-gray-400 text-xs">취소</button>
          </div>
        ) : (
          <button onClick={() => setIsAddingCustom(true)} className="px-3 py-1.5 bg-orange-400 text-white font-semibold rounded-lg text-xs">✎ 직접 추가</button>
        )}
        <button
          onClick={appendRow}
          disabled={isExhausted}
          className={`px-3 py-1.5 font-semibold rounded-lg text-xs transition-all ${
            isExhausted
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm'
          }`}
        >
          {isExhausted ? '더 이상 추가할 항목이 없습니다' : '＋ 더보기'}
        </button>
      </div>
    </div>
  );
}