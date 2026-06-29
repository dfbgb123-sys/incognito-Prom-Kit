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
    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
      <div className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">주제 선택</div>
      <div className="flex flex-wrap gap-2 items-center">
        {macroCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
              selectedMacro === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-blue-400 shadow-inner">
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
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-white border border-dashed border-gray-400 text-gray-500 hover:bg-gray-100 font-medium rounded-full text-sm">
            + 직접 추가
          </button>
        )}

        <button
          onClick={onAppendMacro}
          disabled={isExhausted}
          className={`px-4 py-2 font-medium rounded-full text-sm shadow-sm transition-all ${
            isExhausted
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {isExhausted ? '더 이상 추가할 항목이 없습니다' : '더보기'}
        </button>
      </div>
    </div>
  );
}