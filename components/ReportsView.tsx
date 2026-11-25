'use client';

import React, { useState, useMemo } from 'react';
import { SaleReceipt } from '@/lib/types';
import { formatKHR, formatUSD } from '@/lib/data';
import ReceiptModal from './ReceiptModal';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  Calendar,
  Eye,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  Percent,
} from 'lucide-react';

interface ReportsViewProps {
  salesReceipts: SaleReceipt[];
}

type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'all';

export default function ReportsView({ salesReceipts }: ReportsViewProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('all');
  const [activeReceipt, setActiveReceipt] = useState<SaleReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Filter receipts by date range
  const filteredReceipts = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfWeek = startOfToday - 86400000 * 7;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return salesReceipts.filter((rec) => {
      if (selectedRange === 'today') return rec.timestamp >= startOfToday;
      if (selectedRange === 'yesterday')
        return rec.timestamp >= startOfYesterday && rec.timestamp < startOfToday;
      if (selectedRange === 'week') return rec.timestamp >= startOfWeek;
      if (selectedRange === 'month') return rec.timestamp >= startOfMonth;
      return true;
    });
  }, [salesReceipts, selectedRange]);

  // Aggregate Key Statistics
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalItemsSold = 0;

    filteredReceipts.forEach((rec) => {
      totalRevenue += rec.totalAmount;
      totalCost += rec.totalCost;
      totalProfit += rec.totalProfit;
      rec.items.forEach((item) => {
        totalItemsSold += item.quantity;
      });
    });

    const profitMargin =
      totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
    const averageOrderValue =
      filteredReceipts.length > 0 ? Math.round(totalRevenue / filteredReceipts.length) : 0;

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      totalItemsSold,
      profitMargin,
      averageOrderValue,
      orderCount: filteredReceipts.length,
    };
  }, [filteredReceipts]);

  // Category Breakdown (Profit & Revenue per category)
  const categoryStats = useMemo(() => {
    const map = new Map<string, { revenue: number; profit: number; count: number }>();

    filteredReceipts.forEach((rec) => {
      rec.items.forEach((item) => {
        const cat = item.category || 'ផ្សេងៗ';
        const current = map.get(cat) || { revenue: 0, profit: 0, count: 0 };
        current.revenue += item.sellingPrice * item.quantity;
        current.profit += (item.sellingPrice - item.costPrice) * item.quantity;
        current.count += item.quantity;
        map.set(cat, current);
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.profit - a.profit);
  }, [filteredReceipts]);

  // Top Selling Dishes
  const topDishes = useMemo(() => {
    const map = new Map<
      string,
      { name: string; category: string; quantity: number; revenue: number; profit: number }
    >();

    filteredReceipts.forEach((rec) => {
      rec.items.forEach((item) => {
        const current = map.get(item.itemId) || {
          name: item.name,
          category: item.category,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
        current.quantity += item.quantity;
        current.revenue += item.sellingPrice * item.quantity;
        current.profit += (item.sellingPrice - item.costPrice) * item.quantity;
        map.set(item.itemId, current);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredReceipts]);

  // Daily Chart Aggregation (Last 7 Days or current filtered)
  const dailyChartData = useMemo(() => {
    const daysMap = new Map<string, { label: string; revenue: number; profit: number }>();

    // Generate last 7 days buckets
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('km-KH', { weekday: 'short', day: 'numeric' });
      daysMap.set(key, { label, revenue: 0, profit: 0 });
    }

    salesReceipts.forEach((rec) => {
      const recDate = new Date(rec.timestamp).toISOString().slice(0, 10);
      if (daysMap.has(recDate)) {
        const entry = daysMap.get(recDate)!;
        entry.revenue += rec.totalAmount;
        entry.profit += rec.totalProfit;
      }
    });

    return Array.from(daysMap.values());
  }, [salesReceipts]);

  const maxChartVal = useMemo(() => {
    const max = Math.max(...dailyChartData.map((d) => d.revenue), 50000);
    return max * 1.15;
  }, [dailyChartData]);

  const handleViewReceipt = (receipt: SaleReceipt) => {
    setActiveReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6">
      {/* Header & Date Range Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-neutral-850 border border-neutral-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-neutral-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500 shrink-0" />
            <span>ទំព័ររបាយការណ៍លក់ & ចំណេញ (Sales & Profit)</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
            ទិន្នន័យស្ថិតិលក់ ចំណេញសុទ្ធ ក្រាហ្វប្រៀបធៀប និងប្រវត្តិវិក្កយបត្រ
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900 border border-neutral-700 rounded-xl sm:rounded-2xl overflow-x-auto scrollbar-thin">
          {[
            { id: 'today', label: 'ថ្ងៃនេះ' },
            { id: 'yesterday', label: 'ម្សិលមិញ' },
            { id: 'week', label: '៧ថ្ងៃចុងក្រោយ' },
            { id: 'month', label: 'ខែនេះ' },
            { id: 'all', label: 'ទាំងអស់' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRange(tab.id as DateRange)}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors min-h-[38px] sm:min-h-[42px] flex items-center justify-center ${
                selectedRange === tab.id
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stat Cards (60-30-10 discipline) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>ចំណូលសរុប (Revenue)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-neutral-100 tabular-nums">
              {formatKHR(stats.totalRevenue)}
            </div>
            <div className="text-xs text-neutral-400 tabular-nums">
              {formatUSD(stats.totalRevenue)}
            </div>
          </div>
        </div>

        {/* Card 2: Total Net Profit */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>ចំណេញសុទ្ធ (Profit)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
              +{formatKHR(stats.totalProfit)}
            </div>
            <div className="text-xs text-neutral-400 tabular-nums">
              {formatUSD(stats.totalProfit)}
            </div>
          </div>
        </div>

        {/* Card 3: Profit Margin */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>អត្រាចំណេញ (Margin)</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-neutral-100 tabular-nums">
              {stats.profitMargin}%
            </div>
            <div className="text-xs text-neutral-400">
              ថ្លៃដើម: {formatKHR(stats.totalCost)}
            </div>
          </div>
        </div>

        {/* Card 4: Orders & Items Sold */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>ចំនួនវិក្កយបត្រ / មុខម្ហូប</span>
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-neutral-100 tabular-nums">
              {stats.orderCount} <span className="text-xs font-normal text-neutral-400">បុង</span>
            </div>
            <div className="text-xs text-neutral-400 tabular-nums">
              លក់បាន {stats.totalItemsSold} ចាន/កែវ
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Section (ក្រាប់ចំណេញ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Daily Revenue & Profit Comparison Bar Chart (SVG) */}
        <div className="lg:col-span-8 bg-neutral-850 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>ក្រាហ្វប្រៀបធៀបចំណូល និងប្រាក់ចំណេញ ៧ថ្ងៃចុងក្រោយ</span>
              </h3>
              <p className="text-xs text-neutral-400">
                បង្ហាញចំណូល (Revenue) និងប្រាក់ចំណេញសុទ្ធ (Net Profit) ប្រចាំថ្ងៃ
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-neutral-300">ចំណូលសរុប</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-neutral-300">ប្រាក់ចំណេញ</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-64 w-full pt-4">
            <div className="relative h-48 flex items-end justify-between gap-2 sm:gap-4 border-b border-neutral-700/60 pb-1 px-2">
              {dailyChartData.map((d, idx) => {
                const revHeightPercent = Math.min(100, Math.round((d.revenue / maxChartVal) * 100));
                const profHeightPercent = Math.min(
                  100,
                  Math.round((d.profit / maxChartVal) * 100)
                );

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-[10px] text-neutral-100 shadow-xl whitespace-nowrap">
                      <div className="font-bold">{d.label}</div>
                      <div className="text-amber-400">ចំណូល: {formatKHR(d.revenue)}</div>
                      <div className="text-emerald-400">ចំណេញ: {formatKHR(d.profit)}</div>
                    </div>

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-1">
                      {/* Revenue Bar */}
                      <div
                        style={{ height: `${Math.max(revHeightPercent, 4)}%` }}
                        className="w-1/2 max-w-[20px] bg-amber-500/90 rounded-t group-hover:bg-amber-400 transition-all duration-300"
                      />
                      {/* Profit Bar */}
                      <div
                        style={{ height: `${Math.max(profHeightPercent, 2)}%` }}
                        className="w-1/2 max-w-[20px] bg-emerald-500/90 rounded-t group-hover:bg-emerald-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between px-2 pt-2 text-[11px] text-neutral-400">
              {dailyChartData.map((d, idx) => (
                <div key={idx} className="flex-1 text-center truncate">
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Profit by Category Breakdown */}
        <div className="lg:col-span-4 bg-neutral-850 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>ចំណេញតាមប្រភេទមុខម្ហូប</span>
            </h3>
            <p className="text-xs text-neutral-400">ការចូលរួមចំណេញតាមប្រភេទ</p>
          </div>

          <div className="space-y-3 pt-1">
            {categoryStats.length === 0 ? (
              <div className="text-xs text-neutral-500 text-center py-8">មិនមានទិន្នន័យ</div>
            ) : (
              categoryStats.map((cat, idx) => {
                const percent =
                  stats.totalProfit > 0
                    ? Math.round((cat.profit / stats.totalProfit) * 100)
                    : 0;

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-200">{cat.name}</span>
                      <span className="font-bold text-emerald-400 tabular-nums">
                        {formatKHR(cat.profit)} ({percent}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(percent, 2)}%` }}
                        className={`h-full rounded-full ${
                          idx === 0
                            ? 'bg-emerald-500'
                            : idx === 1
                            ? 'bg-amber-500'
                            : idx === 2
                            ? 'bg-sky-500'
                            : 'bg-purple-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Dishes Leaderboard */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>មុខម្ហូបលក់ដាច់បំផុត (Top Best Sellers)</span>
          </h3>
          <p className="text-xs text-neutral-400">
            ចំណាត់ថ្នាក់មុខម្ហូបតាមចំនួនលក់ និងប្រាក់ចំណេញទទួលបាន
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topDishes.map((dish, idx) => (
            <div
              key={dish.name}
              className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-bold flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="text-[11px] text-neutral-400">{dish.category}</span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-neutral-100 truncate">{dish.name}</h4>
                <div className="text-xs text-neutral-300 font-bold tabular-nums">
                  លក់បាន: {dish.quantity} ចាន
                </div>
              </div>
              <div className="border-t border-neutral-800 pt-1 text-[11px] flex justify-between text-neutral-400">
                <span>ចំណេញ:</span>
                <span className="text-emerald-400 font-semibold tabular-nums">
                  +{formatKHR(dish.profit)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Invoices Table (ប្រវត្តិវិក្កយបត្រ) */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>ប្រវត្តិវិក្កយបត្រលក់ ({filteredReceipts.length})</span>
            </h3>
            <p className="text-xs text-neutral-400">
              ចុចមើលវិក្កយបត្រលម្អិត ឬបោះពុម្ពបុងឡើងវិញ (Reprint)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/60 text-[11px] uppercase">
                <th className="py-3 px-3 font-semibold">លេខបុង & កាលបរិច្ឆេទ</th>
                <th className="py-3 px-3 font-semibold">តុ / ទីតាំង</th>
                <th className="py-3 px-3 font-semibold text-center">ចំនួនមុខ</th>
                <th className="py-3 px-3 font-semibold text-right">សរុបបុង</th>
                <th className="py-3 px-3 font-semibold text-right">ចំណេញសុទ្ធ</th>
                <th className="py-3 px-3 font-semibold text-center">វិធីទូទាត់</th>
                <th className="py-3 px-3 font-semibold text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-500 text-xs">
                    មិនមានវិក្កយបត្រក្នុងចន្លោះពេលនេះទេ។
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-neutral-200 block">{rec.invoiceNo}</span>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(rec.timestamp).toLocaleDateString('km-KH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-neutral-300 font-medium">
                      {rec.tableNo || 'តុទូទៅ'}
                    </td>

                    <td className="py-3 px-3 text-center tabular-nums text-neutral-300">
                      {rec.items.length} មុខ ({rec.items.reduce((a, b) => a + b.quantity, 0)} ចាន)
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-neutral-100 tabular-nums">
                      {formatKHR(rec.totalAmount)}
                    </td>

                    <td className="py-3 px-3 text-right font-semibold text-emerald-400 tabular-nums">
                      +{formatKHR(rec.totalProfit)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] uppercase font-semibold text-neutral-400">
                        {rec.paymentMethod === 'khqr' ? 'KHQR' : rec.paymentMethod === 'card' ? 'CARD' : 'CASH'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleViewReceipt(rec)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-700 hover:border-amber-500/50 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 text-xs sm:text-sm font-bold transition-colors shadow-sm min-h-[36px]"
                      >
                        <Eye className="w-4 h-4" />
                        <span>មើលបុង</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View & Print Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
}
