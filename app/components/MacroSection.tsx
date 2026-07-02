'use client';

import { useState } from 'react';

interface MacroProps {
  macroCategories: string[];
  selectedMacro: string;
  onSelectCategory: (cat: string) => void;
  onAppendMacro: () => void;
  onAddCustomMacro: (value: string) => void;
  isExhausted: boolean;
  onWarning: (msg: string) => void;
}

export default function MacroSection({ macroCategories, selectedMacro, onSelectCategory, onAppendMacro, onAddCustomMacro, isExhausted, onWarning }: MacroProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    const sanitized = inputValue.trim();
    if (!sanitized) { setIsAdding(false); return; }
    if (sanitized.length > 500) {
      onWarning("최대 500자까지만 입력 가능합니다.");
      setInputValue(sanitized.slice(0, 500));
      return;
    }
    onAddCustomMacro(sanitized);
    setInputValue("");
    setIsAdding(false);
  };

  const handleChange = (val: string) => {
    if (val.length > 500) {
      setInputValue(val.slice(0, 500));
      onWarning("최대 500자까지만 입력 가능합니다.");
    } else {
      setInputValue(val);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1 h-3.5 rounded-full bg-blue-400" />
        <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">토픽 선택</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          {macroCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedMacro === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {cat}
            </button>
          ))}

          {isAdding ? (
            <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-blue-300 shadow-inner">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="주제 입력"
                className="px-3 py-1 bg-transparent text-sm w-24 focus:outline-none"
                autoFocus
              />
              <button onClick={handleSubmit} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">확인</button>
              <button onClick={() => setIsAdding(false)} className="px-2 py-1 text-gray-400 text-xs">취소</button>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className="px-3.5 py-1.5 bg-white border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 font-medium rounded-full text-sm transition-all">
              + 직접 추가
            </button>
          )}

          <button
            onClick={onAppendMacro}
            disabled={isExhausted}
            className={`px-3.5 py-1.5 font-medium rounded-full text-sm transition-all border ${
              isExhausted
                ? 'bg-white text-gray-300 cursor-not-allowed border-gray-100'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {isExhausted ? '더 이상 없음' : '더보기'}
          </button>
        </div>
      </div>
    </div>
  );
}
