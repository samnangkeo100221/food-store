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
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-100 whitespace-nowrap block">
              អាហារដ្ឋាន ចឹកមី
            </span>
            <span className="text-[10px] text-neutral-400 -mt-0.5 block">
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
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs sm:text-sm font-semibold transition-colors shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>បញ្ចូលមុខម្ហូប</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-neutral-700/60 font-mono">
              <span className="text-neutral-500">អត្រា:</span>
              <span className="text-neutral-200 font-semibold">1$ = 4,100៛</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
