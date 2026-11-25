'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export default function OfflineIndicator() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 text-neutral-950 font-bold text-xs shadow-xl animate-fade-in border border-amber-400">
      <WifiOff className="w-4 h-4 text-neutral-950 animate-pulse" />
      <span>របៀប Offline (អាចលក់ និងគិតលុយធម្មតា)</span>
    </div>
  );
}
