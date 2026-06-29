'use client';

interface SubProps {
  selectedMacro: string;
  subChips: string[];
  selectedSubs: string[];
  onToggleSub: (text: string) => void;
  onAppendSub: () => void;
  isExhausted: boolean;
}

export default function SubSection({ selectedMacro, subChips, selectedSubs, onToggleSub, onAppendSub, isExhausted }: SubProps) {
  return (
    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
      <div className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">세부 키워드</div>
      <div className="flex flex-wrap gap-2 items-center">
        {subChips.length === 0 ? (
          <p className="text-sm text-gray-400">주제를 선택하면 세부 키워드가 나타납니다.</p>
        ) : (
          subChips.map((text, index) => (
            <button
              key={`${index}-${text}`}
              onClick={() => onToggleSub(text)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                selectedSubs.includes(text)
                  ? 'bg-blue-100 border-blue-500 text-blue-800'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {text}
            </button>
          ))
        )}
        {selectedMacro && (
          <button
            onClick={onAppendSub}
            disabled={isExhausted}
            className={`px-3 py-1.5 font-medium rounded-lg text-xs shadow-sm transition-all ${
              isExhausted
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {isExhausted ? '더 이상 추가할 항목이 없습니다' : '더보기'}
          </button>
        )}
      </div>
    </div>
  );
}