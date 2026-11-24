'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isCancelled = false;

    const runCamera = async () => {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode,
              width: { ideal: 1280 },
              height: { ideal: 960 },
            },
          });
        } catch (err: unknown) {
          console.warn('Initial camera access failed, trying fallback', err);
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.error('Play error', e));
        }
        setIsLoading(false);
      } catch (err: unknown) {
        console.error('Camera access error:', err);
        if (!isCancelled) {
          setIsLoading(false);
          setErrorMsg('មិនអាចបើកកាមេរ៉ាបានទេ។ សូមពិនិត្យសិទ្ធិកាមេរ៉ា ឬប្រើការ Upload រូបភាពជំនួសវិញ។');
        }
      }
    };

    runCamera();

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [isOpen, facingMode, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      setCapturedPhoto(null);
      setErrorMsg(null);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPhoto(null);
    setErrorMsg(null);
    onClose();
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleRetry = () => {
    setErrorMsg(null);
    setIsLoading(true);
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-semibold text-neutral-100">ថតរូបមុខម្ហូប (Camera)</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            title="បិទ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm text-neutral-300">{errorMsg}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors"
              >
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          ) : capturedPhoto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={capturedPhoto}
              alt="រូបថតដែលបានថត"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-neutral-300 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  កំពុងបើកកាមេរ៉ា...
                </div>
              )}
              {/* Viewfinder crosshairs */}
              <div className="absolute inset-8 pointer-events-none border border-white/20 rounded-xl flex items-center justify-center">
                <div className="w-12 h-12 border border-dashed border-amber-400/50 rounded-full" />
              </div>
            </>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                ថតម្តងទៀត
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-sm font-semibold transition-colors shadow-lg shadow-amber-500/20"
              >
                <Check className="w-4 h-4" />
                ប្រើប្រាស់រូបនេះ
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleCameraFacing}
                disabled={!!errorMsg}
                className="p-3 rounded-xl border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors disabled:opacity-40"
                title="ប្តូរកាមេរ៉ាមុខ/ក្រោយ"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleCapture}
                disabled={isLoading || !!errorMsg}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-neutral-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
              >
                <Camera className="w-5 h-5" />
                ចុចថតរូប
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-3 rounded-xl border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-sm transition-colors"
              >
                បោះបង់
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
