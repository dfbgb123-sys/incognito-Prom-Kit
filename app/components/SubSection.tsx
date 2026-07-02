import { useState } from 'react';

interface SubProps {
  selectedMacro: string;
  subChips: string[];
  selectedSubs: string[];
  onToggleSub: (text: string) => void;
  onAppendSub: () => void;
  isExhausted: boolean;
  onAddCustomSub: (value: string) => void;
  onWarning: (msg: string) => void;
}

export default function SubSection({ selectedMacro, subChips, selectedSubs, onToggleSub, onAppendSub, isExhausted, onAddCustomSub, onWarning }: SubProps) {
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
    onAddCustomSub(sanitized);
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
        <span className="w-1 h-3.5 rounded-full bg-indigo-400" />
        <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">세부 키워드</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          {subChips.length === 0 ? (
            <p className="text-sm text-gray-400">주제를 선택하면 세부 키워드가 나타납니다.</p>
          ) : (
            subChips.map((text, index) => (
              <button
                key={`${index}-${text}`}
                onClick={() => onToggleSub(text)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedSubs.includes(text)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {text}
              </button>
            ))
          )}

          {selectedMacro && (
            isAdding ? (
              <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-blue-300 shadow-inner">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="키워드 입력"
                  className="px-2 py-1 bg-transparent text-xs w-24 focus:outline-none"
                  autoFocus
                />
                <button onClick={handleSubmit} className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">확인</button>
                <button onClick={() => setIsAdding(false)} className="px-1.5 py-1 text-gray-400 text-xs">취소</button>
              </div>
            ) : (
              <button onClick={() => setIsAdding(true)} className="px-3.5 py-1.5 bg-white border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 font-medium rounded-full text-sm transition-all">
                + 직접 추가
              </button>
            )
          )}

          {selectedMacro && (
            <button
              onClick={onAppendSub}
              disabled={isExhausted}
              className={`px-3.5 py-1.5 font-medium rounded-full text-sm transition-all border ${
                isExhausted
                  ? 'bg-white text-gray-300 cursor-not-allowed border-gray-100'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {isExhausted ? '더 이상 없음' : '더보기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
