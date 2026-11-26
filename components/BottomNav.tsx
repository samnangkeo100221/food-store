'use client';

import React from 'react';
import { ViewMode } from '@/lib/types';
import { ShoppingBag, Utensils, BarChart3, Calculator } from 'lucide-react';

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
      <div className="max-w-xl mx-auto grid grid-cols-4 gap-1 px-1.5 sm:px-4 py-1.5 sm:py-2">
        {/* Tab 1: ទំព័រលក់ (POS) */}
        <button
          type="button"
          onClick={() => onViewChange('pos')}
          className={`relative flex flex-col items-center justify-center py-2 px-1 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-200 group ${
            currentView === 'pos'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          {/* Active indicator bar */}
          {currentView === 'pos' && (
            <span className="absolute -top-1.5 sm:-top-2 w-8 sm:w-10 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <div className="relative">
            <ShoppingBag
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${
                currentView === 'pos' ? 'scale-110 text-amber-400' : 'group-hover:scale-105'
              }`}
            />
            {occupiedTableCount > 0 && (
              <span className="absolute -top-1.5 -right-3.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 text-[10px] sm:text-xs font-black tabular-nums shadow-md">
                {occupiedTableCount} តុ
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs mt-1 font-semibold tracking-tight truncate max-w-full">
            ទំព័រលក់
          </span>
        </button>

        {/* Tab 2: ទំព័រអាហារ (Food Management) */}
        <button
          type="button"
          onClick={() => onViewChange('food')}
          className={`relative flex flex-col items-center justify-center py-2 px-1 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-200 group ${
            currentView === 'food'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          {currentView === 'food' && (
            <span className="absolute -top-1.5 sm:-top-2 w-8 sm:w-10 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <Utensils
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${
              currentView === 'food' ? 'scale-110 text-amber-400' : 'group-hover:scale-105'
            }`}
          />
          <span className="text-[11px] sm:text-xs mt-1 font-semibold tracking-tight truncate max-w-full">
            ទំព័រអាហារ
          </span>
        </button>

        {/* Tab 3: របាយការណ៍ (Reports) */}
        <button
          type="button"
          onClick={() => onViewChange('reports')}
          className={`relative flex flex-col items-center justify-center py-2 px-1 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-200 group ${
            currentView === 'reports'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          {currentView === 'reports' && (
            <span className="absolute -top-1.5 sm:-top-2 w-8 sm:w-10 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <BarChart3
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${
              currentView === 'reports' ? 'scale-110 text-amber-400' : 'group-hover:scale-105'
            }`}
          />
          <span className="text-[11px] sm:text-xs mt-1 font-semibold tracking-tight truncate max-w-full">
            របាយការណ៍
          </span>
        </button>

        {/* Tab 4: ម៉ាស៊ីនគិត (Calculator) */}
        <button
          type="button"
          onClick={() => onViewChange('calculator')}
          className={`relative flex flex-col items-center justify-center py-2 px-1 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-200 group ${
            currentView === 'calculator'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          {currentView === 'calculator' && (
            <span className="absolute -top-1.5 sm:-top-2 w-8 sm:w-10 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <Calculator
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${
              currentView === 'calculator' ? 'scale-110 text-amber-400' : 'group-hover:scale-105'
            }`}
          />
          <span className="text-[11px] sm:text-xs mt-1 font-semibold tracking-tight truncate max-w-full">
            ម៉ាស៊ីនគិត
          </span>
        </button>
      </div>
    </nav>
  );
}
