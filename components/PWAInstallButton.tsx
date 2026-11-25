'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const media = window.matchMedia('(display-mode: standalone)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getStandaloneSnapshot() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function subscribeIOS() {
  return () => {};
}

function getIOSSnapshot() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const isStandalone = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, () => false);
  const isIOS = useSyncExternalStore(subscribeIOS, getIOSSnapshot, () => false);
  const isInstalled = isStandalone;

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('Service Worker registration failed:', err);
          });
      });
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setJustInstalled(true);
      setDeferredPrompt(null);
    }
  };

  // If already installed, hide the install button
  if (isInstalled && !justInstalled) {
    return null;
  }

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold shadow-sm animate-fade-in">
        <Check className="w-4 h-4" />
        <span>ដំឡើងជោគជ័យ!</span>
      </div>
    );
  }

  // Display install button
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="ដំឡើងកម្មវិធីលើទូរស័ព្ទ (Install PWA)"
        className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/25 active:scale-95 whitespace-nowrap"
      >
        <Download className="w-4 h-4" />
        <span>ដំឡើង App</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-700 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Smartphone className="w-5 h-5" />
                <span>ដំឡើងលើ iPhone / iPad</span>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <p className="font-semibold text-neutral-200">
                ដើម្បីដំឡើងកម្មវិធីនេះលើទូរស័ព្ទ iPhone/iPad ដោយគ្មាន App Store:
              </p>
              <div className="flex items-start gap-2.5 p-2.5 bg-neutral-850 rounded-xl border border-neutral-800">
                <Share2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ជំហានទី ១:</strong> ចុចប៊ូតុង <strong>Share</strong> នៅរបារខាងក្រោមក្នុងកម្មវិធី Safari
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-neutral-850 rounded-xl border border-neutral-800">
                <PlusSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ជំហានទី ២:</strong> អូសចុះក្រោម រួចចុចយក <strong>Add to Home Screen</strong> (បន្ថែមទៅអេក្រង់ដើម)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors"
            >
              យល់ព្រម
            </button>
          </div>
        </div>
      )}
    </>
  );
}
