'use client';

interface SubProps {
  selectedMacro: string;
  subChips: string[];
  selectedSubs: string[];
  onToggleSub: (text: string) => void;
  onAppendSub: () => void;
}

export default function SubSection({ selectedMacro, subChips, selectedSubs, onToggleSub, onAppendSub }: SubProps) {
  return (
    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
      <div className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">세부 키워드</div>
      <div className="flex flex-wrap gap-2 items-center">
        {subChips.length === 0 ? (
          <p className="text-sm text-gray-400">주제를 선택하면 세부 키워드가 나타납니다.</p>
        ) : (
          subChips.map((text) => (
            <button
              key={text}
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
          <button onClick={onAppendSub} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-xs shadow-sm">
            더보기
          </button>
        )}
      </div>
    </div>
  );
}