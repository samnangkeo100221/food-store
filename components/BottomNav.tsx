'use client';

import React from 'react';
import { ViewMode } from '@/lib/types';
import { ShoppingBag, Utensils, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  occupiedTableCount: number;
}

export default function BottomNav({
  currentView,
  onViewChange,
  occupiedTableCount,
}: BottomNavProps) {
  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 shadow-2xl pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))]">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 sm:px-4 py-2">
        {/* Tab 1: ទំព័រលក់ (POS) */}
        <button
          type="button"
          onClick={() => onViewChange('pos')}
          className={`relative flex flex-col items-center justify-center py-2 px-3 sm:px-5 rounded-2xl transition-all duration-200 group min-w-[85px] sm:min-w-[105px] ${
            currentView === 'pos'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          {/* Active indicator bar */}
          {currentView === 'pos' && (
            <span className="absolute -top-2 w-10 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <div className="relative">
            <ShoppingBag
              className={`w-6 h-6 transition-transform duration-200 ${
                currentView === 'pos' ? 'scale-110 text-amber-400' : 'group-hover:scale-105'
              }`}
            />
            {occupiedTableCount > 0 && (
              <span className="absolute -top-1.5 -right-3.5 px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-xs font-black tabular-nums shadow-md">
                {occupiedTableCount} តុ
              </span>
            )}
          </div>
          <span className="text-xs sm:text-sm mt-1 font-semibold tracking-tight">ទំព័រលក់</span>
        </button>

        {/* Tab 2: ទំព័រអាហារ (Food Management) */}
        <button
          type="button"
          onClick={() => onViewChange('food')}
          className={`relative flex flex-col items-center justify-center py-2 px-3 sm:px-5 rounded-2xl transition-all duration-200 group min-w-[85px] sm:min-w-[105px] ${
            currentView === 'food'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          {currentView === 'food' && (
            <span className="absolute -top-2 w-10 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <Utensils
            className={`w-6 h-6 transition-transform duration-200 ${
              currentView === 'food' ? 'scale-110 text-amber-400' : 'group-hover:scale-105'
            }`}
          />
          <span className="text-xs sm:text-sm mt-1 font-semibold tracking-tight">ទំព័រអាហារ</span>
        </button>

        {/* Tab 3: របាយការណ៍ (Reports) */}
        <button
          type="button"
          onClick={() => onViewChange('reports')}
          className={`relative flex flex-col items-center justify-center py-2 px-3 sm:px-5 rounded-2xl transition-all duration-200 group min-w-[85px] sm:min-w-[105px] ${
            currentView === 'reports'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          {currentView === 'reports' && (
            <span className="absolute -top-2 w-10 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <BarChart3
            className={`w-6 h-6 transition-transform duration-200 ${
              currentView === 'reports' ? 'scale-110 text-amber-400' : 'group-hover:scale-105'
            }`}
          />
          <span className="text-xs sm:text-sm mt-1 font-semibold tracking-tight">របាយការណ៍</span>
        </button>
      </div>
    </nav>
  );
}
