'use client';

import React from 'react';
import { ViewMode } from '@/lib/types';
import { Utensils, PlusCircle, Store } from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  activeTable?: string;
  onOpenNewFoodModal?: () => void;
}

export default function Navbar({
  currentView,
  activeTable,
  onOpenNewFoodModal,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 h-14 sm:h-16">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
            <Store className="w-4 h-4 sm:w-5 h-5" />
          </div>
          <div>
            <span className="text-sm sm:text-lg font-bold tracking-tight text-neutral-100 whitespace-nowrap block">
              អាហារដ្ឋាន ចឹកមី
            </span>
            <span className="text-[9px] sm:text-[10px] text-neutral-400 -mt-0.5 block">
              CHAK MEY RESTAURANT · POS
            </span>
          </div>
        </div>

        {/* Zone 2: Contextual Indicator */}
        <div className="hidden sm:flex items-center gap-2">
          {currentView === 'pos' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-850 border border-neutral-700/80 text-xs text-neutral-300">
              <span className="text-neutral-400">Tab តុបច្ចុប្បន្ន:</span>
              <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                {activeTable || 'តុ ១'}
              </span>
            </div>
          ) : (
            <div className="text-xs text-neutral-400 font-medium">
              ប្រព័ន្ធលក់ និងគ្រប់គ្រងអាហារដ្ឋាន
            </div>
          )}
        </div>

        {/* Zone 3: 1 Primary action or Rate */}
        <div className="flex items-center gap-2 shrink-0">
          {currentView === 'food' && onOpenNewFoodModal ? (
            <button
              onClick={onOpenNewFoodModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs sm:text-sm font-semibold transition-colors shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>បញ្ចូលមុខម្ហូប</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-neutral-400 bg-neutral-800/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-neutral-700/60 font-mono">
              <span className="text-neutral-500 hidden sm:inline">អត្រា:</span>
              <span className="text-neutral-200 font-semibold">1$ = 4,100៛</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
