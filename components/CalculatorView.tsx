'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatKHR } from '@/lib/data';
import {
  Calculator as CalcIcon,
  Delete,
  RotateCcw,
  Clock,
  Trash2,
  DollarSign,
  Percent,
  Users,
  Coins,
  ArrowRight,
  Sparkles,
  Check,
  Copy,
} from 'lucide-react';

interface CalculationRecord {
  id: string;
  expression: string;
  result: number;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = 'chak_mey_calculator_history_v1';

export default function CalculatorView() {
  // Current active mode tab: 'standard' | 'change' | 'discount' | 'split'
  const [activeTab, setActiveTab] = useState<'standard' | 'change' | 'discount' | 'split'>('standard');

  // Standard Calculator State
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [prevNumber, setPrevNumber] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [isNewEntry, setIsNewEntry] = useState<boolean>(true);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // History State
  const [history, setHistory] = useState<CalculationRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load calculator history:', e);
      }
    }
    return [];
  });

  // Save history to localStorage
  const saveHistory = (rec: CalculationRecord) => {
    setHistory((prev) => {
      const updated = [rec, ...prev].slice(0, 30);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save history:', e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear history:', e);
    }
  };

  // Helper: Format a number with thousand separators
  const formatDisplay = (valStr: string) => {
    if (valStr === 'Error' || valStr === 'NaN' || valStr === 'Infinity') return valStr;
    const parts = valStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    const num = parseFloat(integerPart);
    if (isNaN(num)) return valStr;
    const formattedInt = num.toLocaleString('en-US');
    return formattedInt + decimalPart;
  };

  // Number input
  const handleDigit = useCallback(
    (digit: string) => {
      if (isNewEntry) {
        setDisplay(digit === '.' ? '0.' : digit);
        setIsNewEntry(false);
      } else {
        if (digit === '.') {
          if (!display.includes('.')) {
            setDisplay(display + '.');
          }
        } else if (digit === '00') {
          if (display !== '0') {
            setDisplay(display + '00');
          }
        } else {
          setDisplay(display === '0' ? digit : display + digit);
        }
      }
    },
    [display, isNewEntry]
  );

  // Quick Riel cash adders (+500, +1,000, +5,000, +10,000, +20,000, +50,000, +100,000)
  const handleQuickAdd = useCallback(
    (amount: number) => {
      const current = parseFloat(display.replace(/,/g, '')) || 0;
      const next = current + amount;
      setDisplay(next.toString());
      setIsNewEntry(false);
    },
    [display]
  );

  // Operation (+, -, ×, ÷)
  const handleOperation = useCallback(
    (op: string) => {
      const current = parseFloat(display.replace(/,/g, '')) || 0;

      if (prevNumber !== null && operation && !isNewEntry) {
        // Compute intermediate result
        let result = current;
        if (operation === '+') result = prevNumber + current;
        else if (operation === '-') result = prevNumber - current;
        else if (operation === '×') result = prevNumber * current;
        else if (operation === '÷') result = current !== 0 ? prevNumber / current : 0;

        setPrevNumber(result);
        setDisplay(result.toString());
        setExpression(`${formatKHR(result)} ${op}`);
      } else {
        setPrevNumber(current);
        setExpression(`${formatKHR(current)} ${op}`);
      }

      setOperation(op);
      setIsNewEntry(true);
    },
    [display, prevNumber, operation, isNewEntry]
  );

  // Calculate Equals (=)
  const handleEquals = useCallback(() => {
    if (prevNumber === null || operation === null) return;

    const current = parseFloat(display.replace(/,/g, '')) || 0;
    let result = 0;

    if (operation === '+') result = prevNumber + current;
    else if (operation === '-') result = prevNumber - current;
    else if (operation === '×') result = prevNumber * current;
    else if (operation === '÷') result = current !== 0 ? prevNumber / current : 0;

    const fullExp = `${formatKHR(prevNumber)} ${operation} ${formatKHR(current)} =`;
    setExpression(fullExp);
    setDisplay(result.toString());
    setPrevNumber(null);
    setOperation(null);
    setIsNewEntry(true);

    // Save record to history
    saveHistory({
      id: Date.now().toString(),
      expression: fullExp,
      result: Math.round(result),
      timestamp: Date.now(),
    });
  }, [prevNumber, operation, display]);

  // Clear current entry
  const handleClear = () => {
    setDisplay('0');
    setIsNewEntry(true);
  };

  // All clear (AC)
  const handleAllClear = () => {
    setDisplay('0');
    setExpression('');
    setPrevNumber(null);
    setOperation(null);
    setIsNewEntry(true);
  };

  // Backspace
  const handleBackspace = useCallback(() => {
    if (isNewEntry || display.length <= 1) {
      setDisplay('0');
      setIsNewEntry(true);
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [isNewEntry, display]);

  // Percentage
  const handlePercent = useCallback(() => {
    const current = parseFloat(display.replace(/,/g, '')) || 0;
    const result = current / 100;
    setDisplay(result.toString());
    setIsNewEntry(true);
  }, [display]);

  // Toggle plus/minus
  const handleToggleSign = () => {
    const current = parseFloat(display.replace(/,/g, '')) || 0;
    setDisplay((-current).toString());
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    const val = parseFloat(display.replace(/,/g, '')) || 0;
    navigator.clipboard?.writeText(val.toString());
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 1500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'standard') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDigit('.');
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperation('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperation('-');
      } else if (e.key === '*' || e.key === 'x') {
        e.preventDefault();
        handleOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleAllClear();
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleDigit, handleOperation, handleEquals, handleBackspace, handlePercent]);

  // ==========================================
  // HELPER TOOL 1: CHANGE CALCULATOR (ប្រាក់អាប់)
  // ==========================================
  const [billTotal, setBillTotal] = useState<number>(15000);
  const [cashGiven, setCashGiven] = useState<number>(20000);

  const changeDue = Math.max(0, cashGiven - billTotal);
  const changeShort = billTotal > cashGiven ? billTotal - cashGiven : 0;

  // Suggested Riel breakdown
  const billBreakdown = useMemo(() => {
    if (changeDue <= 0) return [];
    let rem = changeDue;
    const denominations = [50000, 20000, 10000, 5000, 2000, 1000, 500];
    const res: { note: number; count: number }[] = [];

    denominations.forEach((d) => {
      if (rem >= d) {
        const count = Math.floor(rem / d);
        rem %= d;
        res.push({ note: d, count });
      }
    });
    return res;
  }, [changeDue]);

  // ==========================================
  // HELPER TOOL 2: DISCOUNT CALCULATOR (បញ្ចុះតម្លៃ)
  // ==========================================
  const [discountBase, setDiscountBase] = useState<number>(50000);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const discountSaved = Math.round((discountBase * discountPercent) / 100);
  const discountFinal = Math.max(0, discountBase - discountSaved);

  // ==========================================
  // HELPER TOOL 3: SPLIT BILL (ចែកគ្នា)
  // ==========================================
  const [splitTotal, setSplitTotal] = useState<number>(60000);
  const [splitPeople, setSplitPeople] = useState<number>(4);
  const splitPerPerson = splitPeople > 0 ? Math.round(splitTotal / splitPeople) : splitTotal;

  return (
    <div className="max-w-4xl mx-auto px-2.5 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-850 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-neutral-100 flex items-center gap-2">
            <CalcIcon className="w-5 h-5 text-amber-500 shrink-0" />
            <span>ម៉ាស៊ីនគិតលេខដៃ (POS Calculator)</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
            សម្រាប់គណនាដោយដៃ បូកសរុបប្រាក់ គណនាប្រាក់អាប់ បញ្ចុះតម្លៃ និងចែកបុង
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-700/80 rounded-xl overflow-x-auto scrollbar-thin">
          {[
            { id: 'standard', label: 'ម៉ាស៊ីនគិត', icon: CalcIcon },
            { id: 'change', label: 'ប្រាក់អាប់', icon: Coins },
            { id: 'discount', label: 'បញ្ចុះ %', icon: Percent },
            { id: 'split', label: 'ចែកបុង', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[36px] ${
                  isSel
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Body */}
      {activeTab === 'standard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Calculator Pad Column */}
          <div className="lg:col-span-8 bg-neutral-850 border border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md space-y-4">
            {/* Screen Readout */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 text-right relative overflow-hidden shadow-inner flex flex-col justify-end min-h-[120px] sm:min-h-[140px]">
              {/* Previous formula expression */}
              <div className="text-xs sm:text-sm text-neutral-400 font-mono tracking-wide h-6 overflow-hidden text-ellipsis whitespace-nowrap">
                {expression || ' '}
              </div>

              {/* Main value display */}
              <div className="flex items-baseline justify-end gap-2 overflow-x-auto scrollbar-none py-1">
                <span className="font-mono font-black text-3xl sm:text-4xl md:text-5xl text-amber-400 tracking-tight select-all">
                  {formatDisplay(display)}
                </span>
                <span className="text-base sm:text-xl font-bold text-neutral-400">៛</span>
              </div>

              {/* Copy Result Button */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 text-xs font-semibold border border-neutral-800 transition-colors flex items-center gap-1"
                  title="ចម្លងតួលេខ"
                >
                  {copiedNotice ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">បានចម្លង</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>ចម្លង</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Cash Adders (+500, +1,000, +5,000, +10,000, +20,000, +50,000, +100,000) */}
            <div className="space-y-1.5">
              <div className="text-[11px] sm:text-xs text-neutral-400 font-medium flex items-center justify-between">
                <span>បូកក្រដាសប្រាក់រៀលរហ័ស (+KHR):</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[500, 1000, 2000, 5000, 10000, 20000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAdd(amt)}
                    className="py-1.5 px-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500/20 active:text-amber-300 text-neutral-300 border border-neutral-800 hover:border-neutral-700 text-xs font-bold transition-all text-center min-h-[38px] tabular-nums"
                  >
                    +{amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Keypad Grid (4 columns) */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              {/* Row 1: AC, C, Backspace, Divide */}
              <button
                type="button"
                onClick={handleAllClear}
                className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-800 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 font-black text-base sm:text-lg border border-neutral-700 transition-colors min-h-[52px] sm:min-h-[58px]"
              >
                AC
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-200 font-bold text-base sm:text-lg border border-neutral-700 transition-colors min-h-[52px] sm:min-h-[58px]"
              >
                C
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300 font-bold text-base sm:text-lg border border-neutral-700 transition-colors flex items-center justify-center min-h-[52px] sm:min-h-[58px]"
                title="លុបថយក្រោយ"
              >
                <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                type="button"
                onClick={() => handleOperation('÷')}
                className={`py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xl sm:text-2xl border transition-colors min-h-[52px] sm:min-h-[58px] ${
                  operation === '÷'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md'
                    : 'bg-neutral-900 hover:bg-amber-500/20 hover:text-amber-400 text-amber-500 border-neutral-700'
                }`}
              >
                ÷
              </button>

              {/* Row 2: 7, 8, 9, Multiply */}
              {['7', '8', '9'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 text-neutral-100 font-black text-xl sm:text-2xl border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm min-h-[52px] sm:min-h-[58px]"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleOperation('×')}
                className={`py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xl sm:text-2xl border transition-colors min-h-[52px] sm:min-h-[58px] ${
                  operation === '×'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md'
                    : 'bg-neutral-900 hover:bg-amber-500/20 hover:text-amber-400 text-amber-500 border-neutral-700'
                }`}
              >
                ×
              </button>

              {/* Row 3: 4, 5, 6, Minus */}
              {['4', '5', '6'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 text-neutral-100 font-black text-xl sm:text-2xl border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm min-h-[52px] sm:min-h-[58px]"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleOperation('-')}
                className={`py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xl sm:text-2xl border transition-colors min-h-[52px] sm:min-h-[58px] ${
                  operation === '-'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md'
                    : 'bg-neutral-900 hover:bg-amber-500/20 hover:text-amber-400 text-amber-500 border-neutral-700'
                }`}
              >
                −
              </button>

              {/* Row 4: 1, 2, 3, Plus */}
              {['1', '2', '3'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 text-neutral-100 font-black text-xl sm:text-2xl border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm min-h-[52px] sm:min-h-[58px]"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleOperation('+')}
                className={`py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xl sm:text-2xl border transition-colors min-h-[52px] sm:min-h-[58px] ${
                  operation === '+'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md'
                    : 'bg-neutral-900 hover:bg-amber-500/20 hover:text-amber-400 text-amber-500 border-neutral-700'
                }`}
              >
                +
              </button>

              {/* Row 5: ±, 0, 00, Percent */}
              <button
                type="button"
                onClick={handleToggleSign}
                className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-base sm:text-lg border border-neutral-800 transition-colors min-h-[52px] sm:min-h-[58px]"
                title="ប្ដូរសញ្ញា + / -"
              >
                ±
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 text-neutral-100 font-black text-xl sm:text-2xl border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm min-h-[52px] sm:min-h-[58px]"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleDigit('00')}
                className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 text-neutral-100 font-black text-lg sm:text-xl border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm min-h-[52px] sm:min-h-[58px]"
              >
                00
              </button>
              <button
                type="button"
                onClick={handlePercent}
                className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-bold text-lg sm:text-xl border border-neutral-800 transition-colors min-h-[52px] sm:min-h-[58px]"
              >
                %
              </button>
            </div>

            {/* Equals Big CTA */}
            <button
              type="button"
              onClick={handleEquals}
              className="w-full py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black text-2xl sm:text-3xl transition-all shadow-lg shadow-amber-500/25 active:scale-[0.99] flex items-center justify-center gap-2 min-h-[56px] sm:min-h-[62px]"
            >
              <span>=</span>
            </button>
          </div>

          {/* History Column */}
          <div className="lg:col-span-4 bg-neutral-850 border border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2 text-neutral-200 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>ប្រវត្តិគណនា ({history.length})</span>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-neutral-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>សំអាត</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[380px] sm:max-h-[460px] overflow-y-auto scrollbar-thin pr-1">
              {history.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500 space-y-1">
                  <p>មិនទាន់មានប្រវត្តិគណនានៅឡើយទេ។</p>
                  <p className="text-[10px]">ចុច = ដើម្បីរក្សាទុកការគណនា</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setDisplay(item.result.toString());
                      setIsNewEntry(true);
                    }}
                    className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 cursor-pointer transition-all space-y-1 group"
                    title="ចុចដើម្បីទាញតួលេខមកប្រើឡើងវិញ"
                  >
                    <div className="text-[11px] text-neutral-400 font-mono line-clamp-1">
                      {item.expression}
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm sm:text-base font-bold font-mono text-amber-400 group-hover:text-amber-300">
                        {formatKHR(item.result)}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(item.timestamp).toLocaleTimeString('km-KH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Helper Tab: Change Calculator (គណនាប្រាក់អាប់) */}
      {activeTab === 'change' && (
        <div className="bg-neutral-850 border border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-100">
                គណនាប្រាក់អាប់ជូនភ្ញៀវ (Change Calculator)
              </h2>
              <p className="text-xs text-neutral-400">
                បញ្ចូលទឹកប្រាក់ត្រូវគិត និងប្រាក់ដែលភ្ញៀវបានហុច ដើម្បីដឹងចំនួនប្រាក់អាប់ និងក្រដាសប្រាក់
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-neutral-300 block">
                  ទឹកប្រាក់ត្រូវគិត (Total Due ៛):
                </label>
                <input
                  type="number"
                  step="500"
                  value={billTotal || ''}
                  onChange={(e) => setBillTotal(parseFloat(e.target.value) || 0)}
                  className="w-full h-12 bg-neutral-900 border border-neutral-700 rounded-xl px-4 text-lg font-bold text-neutral-100 focus:outline-none focus:border-amber-500 tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-neutral-300 block">
                  ប្រាក់ទទួលពីភ្ញៀវ (Cash Received ៛):
                </label>
                <input
                  type="number"
                  step="500"
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                  className="w-full h-12 bg-neutral-900 border border-neutral-700 rounded-xl px-4 text-lg font-bold text-amber-400 focus:outline-none focus:border-amber-500 tabular-nums"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="space-y-1">
                <div className="text-xs text-neutral-400 font-medium">
                  ជ្រើសរើសប្រាក់ភ្ញៀវហុចរហ័ស:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 20000, 40000, 50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashGiven(amt)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        cashGiven === amt
                          ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {formatKHR(amt)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Output */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                  លទ្ធផលប្រាក់អាប់
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-1">
                  <div className="text-xs text-neutral-400">ប្រាក់ត្រូវអាប់ជូន:</div>
                  <div
                    className={`text-2xl sm:text-3xl font-black tabular-nums ${
                      cashGiven >= billTotal ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {cashGiven >= billTotal
                      ? formatKHR(changeDue)
                      : 'នៅខ្វះ ' + formatKHR(changeShort)}
                  </div>
                </div>

                {/* Breakdown of bills */}
                {changeDue > 0 && billBreakdown.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>ក្រដាសប្រាក់ត្រូវអាប់ (Bills to Give):</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {billBreakdown.map((b) => (
                        <div
                          key={b.note}
                          className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/60 border border-neutral-800 text-xs font-mono"
                        >
                          <span className="text-neutral-300">{formatKHR(b.note)}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            × {b.count} សន្លឹក
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setBillTotal(0);
                  setCashGiven(0);
                }}
                className="w-full py-2.5 rounded-xl border border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-bold transition-colors"
              >
                កំណត់ឡើងវិញ (Reset)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper Tab: Discount Calculator (បញ្ចុះតម្លៃ) */}
      {activeTab === 'discount' && (
        <div className="bg-neutral-850 border border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-100">
                គណនាបញ្ចុះតម្លៃ (Discount Calculator)
              </h2>
              <p className="text-xs text-neutral-400">
                បញ្ចូលតម្លៃដើម និងភាគរយចុះ (% Discount) ដើម្បីដឹងថ្លៃក្រោយបញ្ចុះ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-neutral-300 block">
                  តម្លៃដើម (Original Price ៛):
                </label>
                <input
                  type="number"
                  step="500"
                  value={discountBase || ''}
                  onChange={(e) => setDiscountBase(parseFloat(e.target.value) || 0)}
                  className="w-full h-12 bg-neutral-900 border border-neutral-700 rounded-xl px-4 text-lg font-bold text-neutral-100 focus:outline-none focus:border-amber-500 tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-neutral-300 block">
                  ភាគរយចុះ (Discount %):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent || ''}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full h-12 bg-neutral-900 border border-neutral-700 rounded-xl px-4 text-lg font-bold text-amber-400 focus:outline-none focus:border-amber-500 tabular-nums"
                />
              </div>

              {/* Preset % buttons */}
              <div className="space-y-1">
                <div className="text-xs text-neutral-400 font-medium">ជ្រើសរើសភាគរយរហ័ស:</div>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20, 25, 30, 40, 50].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDiscountPercent(p)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        discountPercent === p
                          ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results box */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                  លទ្ធផលក្រោយបញ្ចុះ
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>ចំនួនប្រាក់បានចុះ:</span>
                    <span className="font-bold text-red-400 tabular-nums font-mono">
                      -{formatKHR(discountSaved)} ({discountPercent}%)
                    </span>
                  </div>

                  <div className="border-t border-neutral-800 pt-2 flex items-baseline justify-between text-neutral-100">
                    <span className="text-sm font-bold">តម្លៃត្រូវទូទាត់:</span>
                    <span className="text-2xl font-black text-emerald-400 tabular-nums">
                      {formatKHR(discountFinal)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDiscountBase(0);
                  setDiscountPercent(0);
                }}
                className="w-full py-2.5 rounded-xl border border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-bold transition-colors"
              >
                កំណត់ឡើងវិញ (Reset)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper Tab: Split Bill (ចែកបុង) */}
      {activeTab === 'split' && (
        <div className="bg-neutral-850 border border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-100">
                គណនាចែកបុងគ្នា (Split Bill Calculator)
              </h2>
              <p className="text-xs text-neutral-400">
                បញ្ចូលទឹកប្រាក់សរុប និងចំនួនមនុស្ស ដើម្បីចែកចំនួនទឹកប្រាក់ស្មើគ្នា
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-neutral-300 block">
                  ទឹកប្រាក់សរុប (Total Bill ៛):
                </label>
                <input
                  type="number"
                  step="500"
                  value={splitTotal || ''}
                  onChange={(e) => setSplitTotal(parseFloat(e.target.value) || 0)}
                  className="w-full h-12 bg-neutral-900 border border-neutral-700 rounded-xl px-4 text-lg font-bold text-neutral-100 focus:outline-none focus:border-amber-500 tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-neutral-300 block">
                  ចំនួនមនុស្ស (People):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={splitPeople || ''}
                    onChange={(e) => setSplitPeople(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full h-12 bg-neutral-900 border border-neutral-700 rounded-xl px-4 text-lg font-bold text-amber-400 focus:outline-none focus:border-amber-500 tabular-nums"
                  />
                </div>
              </div>

              {/* Quick people count */}
              <div className="space-y-1">
                <div className="text-xs text-neutral-400 font-medium">ជ្រើសរើសចំនួនមនុស្ស:</div>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5, 6, 8, 10, 12].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setSplitPeople(cnt)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        splitPeople === cnt
                          ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {cnt} នាក់
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results box */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                  លទ្ធផលក្នុងម្នាក់
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-1.5">
                  <div className="text-xs text-neutral-400">ក្នុងម្នាក់ត្រូវចេញ:</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
                    {formatKHR(splitPerPerson)}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    (សរុប {formatKHR(splitTotal)} ÷ {splitPeople} នាក់)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSplitTotal(0);
                  setSplitPeople(1);
                }}
                className="w-full py-2.5 rounded-xl border border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-bold transition-colors"
              >
                កំណត់ឡើងវិញ (Reset)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
