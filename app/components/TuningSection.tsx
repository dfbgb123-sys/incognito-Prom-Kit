'use client';
import { useState } from 'react';
import { Lang, t } from '@/app/lib/i18n';

interface TuningProps {
  showSecondary: boolean;
  secondaryChips: string[];
  setSecondaryChips: React.Dispatch<React.SetStateAction<string[]>>;
  secondaryPool: string[];
  selectedSecondaries: string[];
  setSelectedSecondaries: React.Dispatch<React.SetStateAction<string[]>>;
  onExhausted: () => void;
  onWarning: (msg: string) => void;
  lang: Lang;
}

export default function TuningSection({ showSecondary, secondaryChips, setSecondaryChips, secondaryPool, selectedSecondaries, setSelectedSecondaries, onExhausted, onWarning, lang }: TuningProps) {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  if (!showSecondary) return null;

  const toggleChip = (text: string) => {
    setSelectedSecondaries(prev => prev.includes(text) ? prev.filter(item => item !== text) : [...prev, text]);
  };

  const appendRow = () => {
    const current = [...secondaryChips];
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
      onWarning(t(lang, 'maxChars'));
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
      onWarning(t(lang, 'maxChars'));
    } else {
      setCustomInput(val);
    }
  };

  const isExhausted = secondaryPool.every(item => secondaryChips.includes(item));

  return (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 shadow-sm">
      <span className="text-md font-bold text-slate-700 block">{t(lang, 'tuningTitle')}</span>
      <p className="text-xs text-slate-500">{t(lang, 'tuningDesc')}</p>
      <div className="flex flex-wrap gap-2 items-center">
        {secondaryChips.map((fbText) => {
          const isSelected = selectedSecondaries.includes(fbText);
          return (
            <button key={fbText} onClick={() => toggleChip(fbText)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isSelected ? 'bg-slate-700 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
              {fbText}
            </button>
          );
        })}
        {isAddingCustom ? (
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-inner">
            <input type="text" value={customInput} onChange={(e) => handleChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitCustom()} placeholder={t(lang, 'conditionPlaceholder')} className="px-2 py-1 bg-transparent text-xs w-32 focus:outline-none" autoFocus />
            <button onClick={submitCustom} className="px-2 py-1 bg-slate-600 text-white text-xs font-bold rounded-md">{t(lang, 'confirm')}</button>
            <button onClick={() => setIsAddingCustom(false)} className="px-1 py-1 text-gray-400 text-xs">{t(lang, 'cancel')}</button>
          </div>
        ) : (
          <button onClick={() => setIsAddingCustom(true)} className="px-3 py-1.5 bg-slate-200 text-slate-600 hover:bg-slate-300 font-semibold rounded-lg text-xs transition-all">{t(lang, 'addDirect')}</button>
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
          {isExhausted ? t(lang, 'noMoreItems') : t(lang, 'showMore')}
        </button>
      </div>
    </div>
  );
}
