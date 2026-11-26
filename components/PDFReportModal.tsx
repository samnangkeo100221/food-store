'use client';

import React, { useRef, useState } from 'react';
import { SaleReceipt } from '@/lib/types';
import { formatKHR } from '@/lib/data';
import {
  X,
  Printer,
  Download,
  FileText,
  Calendar,
  Store,
  CheckCircle2,
  TrendingUp,
  Coins,
  ShoppingBag,
  Award,
} from 'lucide-react';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRange: string;
  dateLabel: string;
  stats: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalItemsSold: number;
    profitMargin: string;
    averageOrderValue: number;
    orderCount: number;
  };
  categoryStats: { name: string; revenue: number; profit: number; count: number }[];
  topDishes: { name: string; category: string; quantity: number; revenue: number; profit: number }[];
  filteredReceipts: SaleReceipt[];
}

export default function PDFReportModal({
  isOpen,
  onClose,
  dateLabel,
  stats,
  categoryStats,
  topDishes,
  filteredReceipts,
}: PDFReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const [reportDateStr] = useState(() =>
    new Date().toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  const [reportCode] = useState(
    () =>
      `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        100 + Math.random() * 900
      )}`
  );

  if (!isOpen) return null;

  // Print as PDF
  const handlePrint = () => {
    window.print();
  };

  // Download as standalone HTML file that can be opened and printed anywhere
  const handleDownloadFile = () => {
    if (!reportRef.current) return;
    const reportHtml = reportRef.current.innerHTML;

    const fullHtml = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>របាយការណ៍ចំណូល_អាហារដ្ឋាន_ចឹកមី_${new Date().toISOString().slice(0, 10)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: 'Kantumruy Pro', sans-serif; background: #fff; color: #111; margin: 0; padding: 20px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; font-size: 11px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
    .kpi-card { border: 1px solid #ccc; padding: 10px; border-radius: 6px; }
    .title { font-size: 18px; font-weight: 700; color: #b45309; text-align: center; }
    .sub { text-align: center; font-size: 11px; color: #666; margin-top: 2px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 40px; }
    .sign-box { text-align: center; width: 180px; border-top: 1px dashed #999; padding-top: 8px; font-size: 11px; }
  </style>
</head>
<body>
  ${reportHtml}
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `របាយការណ៍ចំណូល_ចឹកមី_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col my-auto max-h-[95vh] overflow-hidden">
        {/* Header toolbar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-100 flex items-center gap-2">
                <span>ទាញយករបាយការណ៍ PDF (Daily Report)</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-normal">
                  {dateLabel}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                អាចទាញយក ឬបោះពុម្ពរក្សាទុកជាឯកសារ PDF A4 បានភ្លាមៗ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-3 py-1.5 rounded-xl border border-neutral-700 hover:border-neutral-600 bg-neutral-800 text-neutral-200 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              title="ទាញយកឯកសាររបាយការណ៍ (.html file)"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">ទាញយកឯកសារ</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs sm:text-sm font-extrabold transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              title="បោះពុម្ព ឬរក្សាទុកជា PDF (Save as PDF)"
            >
              <Printer className="w-4 h-4" />
              <span>ទាញយក PDF / បោះពុម្ព</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PDF Report Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-950/60 select-text">
          <div
            ref={reportRef}
            className="printable-area max-w-3xl mx-auto bg-white text-neutral-900 rounded-xl shadow-lg p-6 sm:p-10 font-sans space-y-6"
          >
            {/* 1. Official Header */}
            <div className="border-b-2 border-neutral-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight flex items-center gap-2">
                  <Store className="w-6 h-6 text-amber-600 inline-block" />
                  <span>អាហារដ្ឋាន ចឹកមី</span>
                </h1>
                <p className="text-xs font-semibold text-neutral-600 tracking-wide uppercase">
                  CHAK MEY RESTAURANT · POS REPORT
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  អាសយដ្ឋាន: មហាវិថីព្រះមុនីវង្ស រាជធានីភ្នំពេញ | ទូរស័ព្ទ: 012 345 678 / 098 765 432
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1 bg-neutral-50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg border sm:border-none border-neutral-200">
                <div className="font-bold text-neutral-800">
                  លេខកូដរបាយការណ៍: <span className="font-mono">{reportCode}</span>
                </div>
                <div className="text-neutral-600">
                  កាលបរិច្ឆេទបង្កើត: <span className="font-medium">{reportDateStr}</span>
                </div>
                <div className="text-neutral-600">
                  ចន្លោះពេល: <span className="font-bold text-amber-700">{dateLabel}</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  រូបិយប័ណ្ណ: ប្រាក់រៀល (KHR)
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-2 bg-neutral-100 rounded-lg border border-neutral-200">
              <h2 className="text-base sm:text-lg font-black text-neutral-900">
                របាយការណ៍សង្ខេបចំណូល និងចំណេញប្រចាំថ្ងៃ
              </h2>
              <p className="text-[11px] text-neutral-600">
                DAILY SALES REVENUE & PROFIT SUMMARY REPORT
              </p>
            </div>

            {/* 2. Key Performance Indicators (KPI Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg border border-neutral-300 bg-neutral-50 text-left space-y-1">
                <span className="text-[11px] font-semibold text-neutral-600 block">ចំណូលសរុប (Revenue)</span>
                <span className="text-base sm:text-lg font-black text-neutral-950 block font-mono">
                  {formatKHR(stats.totalRevenue)}
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  ពីការលក់ {stats.orderCount} បុង
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-neutral-300 bg-neutral-50 text-left space-y-1">
                <span className="text-[11px] font-semibold text-neutral-600 block">ថ្លៃដើមសរុប (Cost)</span>
                <span className="text-base sm:text-lg font-bold text-neutral-800 block font-mono">
                  {formatKHR(stats.totalCost)}
                </span>
                <span className="text-[10px] text-neutral-500 block">ថ្លៃដើមមុខម្ហូបលក់ចេញ</span>
              </div>

              <div className="p-3.5 rounded-lg border border-emerald-300 bg-emerald-50 text-left space-y-1">
                <span className="text-[11px] font-semibold text-emerald-800 block">ចំណេញសុទ្ធ (Net Profit)</span>
                <span className="text-base sm:text-lg font-black text-emerald-700 block font-mono">
                  +{formatKHR(stats.totalProfit)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  អត្រាចំណេញ {stats.profitMargin}%
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-neutral-300 bg-neutral-50 text-left space-y-1">
                <span className="text-[11px] font-semibold text-neutral-600 block">បរិមាណលក់ (Dishes)</span>
                <span className="text-base sm:text-lg font-black text-neutral-900 block font-mono">
                  {stats.totalItemsSold} ចាន/កែវ
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  មធ្យម {formatKHR(stats.averageOrderValue)}/បុង
                </span>
              </div>
            </div>

            {/* 3. Category Breakdown & Top Dishes (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Breakdown */}
              <div className="border border-neutral-200 rounded-lg p-3 space-y-2">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-1 flex items-center justify-between">
                  <span>១. ចំណូលតាមប្រភេទម្ហូប (Categories)</span>
                  <span className="text-[10px] text-neutral-500 font-normal">
                    {categoryStats.length} ប្រភេទ
                  </span>
                </h3>
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-600 bg-neutral-50">
                      <th className="py-1 px-1.5 font-semibold">ប្រភេទ</th>
                      <th className="py-1 px-1.5 text-center font-semibold">ចំនួន</th>
                      <th className="py-1 px-1.5 text-right font-semibold">ចំណូល</th>
                      <th className="py-1 px-1.5 text-right font-semibold text-emerald-700">ចំណេញ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {categoryStats.map((cat, i) => (
                      <tr key={i}>
                        <td className="py-1.5 px-1.5 font-medium">{cat.name}</td>
                        <td className="py-1.5 px-1.5 text-center font-mono">{cat.count}</td>
                        <td className="py-1.5 px-1.5 text-right font-mono font-semibold">
                          {formatKHR(cat.revenue)}
                        </td>
                        <td className="py-1.5 px-1.5 text-right font-mono font-bold text-emerald-700">
                          +{formatKHR(cat.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top Selling Dishes */}
              <div className="border border-neutral-200 rounded-lg p-3 space-y-2">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-1 flex items-center justify-between">
                  <span>២. មុខម្ហូបលក់ដាច់បំផុត (Top 5 Dishes)</span>
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                </h3>
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-600 bg-neutral-50">
                      <th className="py-1 px-1.5 font-semibold">មុខម្ហូប</th>
                      <th className="py-1 px-1.5 text-center font-semibold">លក់បាន</th>
                      <th className="py-1 px-1.5 text-right font-semibold">ចំណូល</th>
                      <th className="py-1 px-1.5 text-right font-semibold text-emerald-700">ចំណេញ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {topDishes.map((dish, i) => (
                      <tr key={i}>
                        <td className="py-1.5 px-1.5 font-medium">
                          <span className="font-bold text-neutral-900">{i + 1}. {dish.name}</span>
                        </td>
                        <td className="py-1.5 px-1.5 text-center font-mono font-bold">{dish.quantity}</td>
                        <td className="py-1.5 px-1.5 text-right font-mono">{formatKHR(dish.revenue)}</td>
                        <td className="py-1.5 px-1.5 text-right font-mono font-bold text-emerald-700">
                          +{formatKHR(dish.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Detailed Sales Receipts Table */}
            <div className="border border-neutral-200 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-1 flex items-center justify-between">
                <span>៣. បញ្ជីវិក្កយបត្រលក់លម្អិត (Sales Invoices List)</span>
                <span className="text-[10px] text-neutral-500 font-normal">
                  សរុប {filteredReceipts.length} វិក្កយបត្រ
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] sm:text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-300 text-neutral-700 bg-neutral-100 uppercase">
                      <th className="py-1.5 px-2 font-semibold">ល.រ</th>
                      <th className="py-1.5 px-2 font-semibold">លេខបុង</th>
                      <th className="py-1.5 px-2 font-semibold">ម៉ោង</th>
                      <th className="py-1.5 px-2 font-semibold">តុ</th>
                      <th className="py-1.5 px-2 font-semibold text-center">ចំនួនមុខ</th>
                      <th className="py-1.5 px-2 font-semibold text-center">វិធីទូទាត់</th>
                      <th className="py-1.5 px-2 text-right font-semibold">សរុបបុង (៛)</th>
                      <th className="py-1.5 px-2 text-right font-semibold text-emerald-700">
                        ចំណេញសុទ្ធ (៛)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-neutral-500 text-xs">
                          មិនមានវិក្កយបត្រក្នុងចន្លោះពេលនេះទេ។
                        </td>
                      </tr>
                    ) : (
                      filteredReceipts.map((rec, idx) => (
                        <tr key={rec.id} className="hover:bg-neutral-50">
                          <td className="py-1.5 px-2 text-neutral-500 font-mono">{idx + 1}</td>
                          <td className="py-1.5 px-2 font-mono font-semibold text-neutral-900">
                            {rec.invoiceNo}
                          </td>
                          <td className="py-1.5 px-2 text-neutral-600 font-mono">
                            {new Date(rec.timestamp).toLocaleTimeString('km-KH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-1.5 px-2 font-medium">{rec.tableNo || 'តុទូទៅ'}</td>
                          <td className="py-1.5 px-2 text-center font-mono">
                            {rec.items.reduce((acc, it) => acc + it.quantity, 0)} ចាន
                          </td>
                          <td className="py-1.5 px-2 text-center uppercase font-semibold text-neutral-600">
                            {rec.paymentMethod === 'khqr'
                              ? 'KHQR'
                              : rec.paymentMethod === 'card'
                              ? 'កាត'
                              : 'សាច់ប្រាក់'}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-neutral-950">
                            {formatKHR(rec.totalAmount)}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-700">
                            +{formatKHR(rec.totalProfit)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredReceipts.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-neutral-900 font-bold bg-neutral-100 text-[11px]">
                        <td colSpan={6} className="py-2 px-2 text-right uppercase">
                          សរុបរួមទាំងអស់:
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-base font-black text-neutral-950">
                          {formatKHR(stats.totalRevenue)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-base font-black text-emerald-700">
                          +{formatKHR(stats.totalProfit)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* 5. Sign-off / Signatures Block */}
            <div className="pt-8 border-t border-dashed border-neutral-300 flex items-center justify-between px-6 text-xs text-neutral-700">
              <div className="text-center space-y-12">
                <p className="font-semibold">អ្នករៀបចំរបាយការណ៍</p>
                <p className="border-t border-neutral-400 pt-1 text-[11px] text-neutral-500">
                  ( ហត្ថលេខា និងឈ្មោះ )
                </p>
              </div>

              <div className="text-center space-y-12">
                <p className="font-semibold">ម្ចាស់ហាង / អ្នកត្រួតពិនិត្យ</p>
                <p className="border-t border-neutral-400 pt-1 text-[11px] text-neutral-500">
                  ( ហត្ថលេខា និងឈ្មោះ )
                </p>
              </div>
            </div>

            {/* Document Footer Notice */}
            <div className="text-center text-[10px] text-neutral-400 pt-2 border-t border-neutral-100">
              ប្រព័ន្ធគ្រប់គ្រងការលក់ និងរបាយការណ៍ អាហារដ្ឋាន ចឹកមី · រក្សាសិទ្ធិគ្រប់យ៉ាង © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
