'use client';

import React from 'react';
import { SaleReceipt } from '@/lib/types';
import { formatKHR, formatUSD } from '@/lib/data';
import { Printer, X, CheckCircle2, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  receipt: SaleReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, isOpen, onClose }: ReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.timestamp).toLocaleString('km-KH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[95vh] overflow-hidden">
        {/* Header - No print */}
        <div className="no-print flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-800 bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm sm:text-base font-semibold text-neutral-100">វិក្កយបត្រលក់ (Receipt)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Paper Layout */}
        <div className="p-4 sm:p-6 bg-white text-neutral-900 font-mono text-xs select-text overflow-y-auto flex-1">
          {/* Store Logo/Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-neutral-400">
            <h2 className="text-base font-bold font-sans tracking-wide text-neutral-950">
              អាហារដ្ឋាន ចឹកមី
            </h2>
            <p className="text-[11px] text-neutral-600 font-sans">CHAK MEY RESTAURANT</p>
            <p className="text-[10px] text-neutral-500">អាសយដ្ឋាន: មហាវិថីព្រះមុនីវង្ស រាជធានីភ្នំពេញ</p>
            <p className="text-[10px] text-neutral-500">ទូរស័ព្ទ: 012 345 678 / 098 765 432</p>
          </div>

          {/* Receipt Info */}
          <div className="py-3 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-600">លេខបុង:</span>
              <span className="font-bold">{receipt.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">កាលបរិច្ឆេទ:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">ទីតាំង/តុ:</span>
              <span className="font-semibold text-neutral-900">{receipt.tableNo || 'តុទូទៅ'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">វិធីទូទាត់:</span>
              <span className="uppercase font-semibold">
                {receipt.paymentMethod === 'khqr' ? 'KHQR Scan' : receipt.paymentMethod === 'card' ? 'Card' : 'សាច់ប្រាក់សុទ្ធ'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-neutral-400">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-300 text-[10px] text-neutral-600 uppercase">
                  <th className="pb-1">#</th>
                  <th className="pb-1">មុខម្ហូប</th>
                  <th className="pb-1 text-center">ចំនួន</th>
                  <th className="pb-1 text-right">តម្លៃ</th>
                  <th className="pb-1 text-right">សរុប</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[11px]">
                {receipt.items.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-1.5 text-neutral-400">{idx + 1}</td>
                    <td className="py-1.5 font-sans font-medium text-neutral-900 pr-1">
                      {item.name}
                      {item.note && <div className="text-[9px] text-neutral-500">*{item.note}</div>}
                    </td>
                    <td className="py-1.5 text-center font-bold tabular-nums">{item.quantity}</td>
                    <td className="py-1.5 text-right tabular-nums text-neutral-600">
                      {formatKHR(item.sellingPrice)}
                    </td>
                    <td className="py-1.5 text-right font-semibold tabular-nums text-neutral-950">
                      {formatKHR(item.sellingPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="py-3 border-b border-dashed border-neutral-400 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-neutral-600">
              <span>ចំនួនមុខសរុប:</span>
              <span className="tabular-nums font-semibold">
                {receipt.items.reduce((acc, it) => acc + it.quantity, 0)} ចាន/កែវ
              </span>
            </div>

            <div className="flex justify-between text-sm font-bold border-t border-neutral-300 pt-1.5 text-neutral-950">
              <span>សរុបបុង (KHR):</span>
              <span className="tabular-nums text-base">{formatKHR(receipt.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-700 font-semibold">
              <span>សរុបជាដុល្លារ (USD):</span>
              <span className="tabular-nums">{formatUSD(receipt.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-neutral-600 pt-1 border-t border-neutral-200">
              <span>ប្រាក់បានទទួល:</span>
              <span className="tabular-nums font-semibold">{formatKHR(receipt.cashReceived || receipt.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>ប្រាក់អាប់ជូន:</span>
              <span className="tabular-nums font-semibold text-emerald-700">
                {formatKHR(receipt.changeAmount || 0)}
              </span>
            </div>
          </div>

          {/* KHQR illustration if payment was scan */}
          {receipt.paymentMethod === 'khqr' && (
            <div className="py-3 flex flex-col items-center justify-center text-center border-b border-dashed border-neutral-400">
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 mb-1">
                <QrCode className="w-4 h-4" />
                <span>BAKONG KHQR PAID</span>
              </div>
              <div className="text-[10px] text-neutral-500">បានទូទាត់ជោគជ័យតាមបាគង</div>
            </div>
          )}

          {/* Thank you note */}
          <div className="text-center pt-4 space-y-1">
            <p className="font-sans font-medium text-neutral-900">សូមអរគុណ សូមអញ្ជើញមកម្តងទៀត!</p>
            <p className="text-[10px] text-neutral-500 font-sans">Thank you for your visit!</p>
            <p className="text-[9px] text-neutral-400">Software: Khmer Food POS System</p>
          </div>
        </div>

        {/* Footer Actions - No print */}
        <div className="no-print p-3 sm:p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs sm:text-sm font-medium transition-colors"
          >
            បិទផ្ទាំង
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            បោះពុម្ពបុង (Print)
          </button>
        </div>
      </div>
    </div>
  );
}
