'use client';

import React, { useState, useMemo, useRef } from 'react';
import { FoodItem, OrderItem, SaleReceipt } from '@/lib/types';
import { formatKHR, formatUSD, DEFAULT_TABLES } from '@/lib/data';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Check,
  ChevronRight,
  TrendingUp,
  Receipt,
  RotateCcw,
  Coins,
  QrCode,
  DollarSign,
  PlusCircle,
  X,
  CreditCard,
  Utensils,
} from 'lucide-react';

interface POSViewProps {
  foodItems: FoodItem[];
  ordersByTable: Record<string, OrderItem[]>;
  activeTable: string;
  onSelectTable: (table: string) => void;
  onUpdateTableOrder: (table: string, items: OrderItem[]) => void;
  onCompleteSale: (receipt: SaleReceipt) => void;
}

export default function POSView({
  foodItems,
  ordersByTable,
  activeTable,
  onSelectTable,
  onUpdateTableOrder,
  onCompleteSale,
}: POSViewProps) {
  // Available tables list
  const [tablesList, setTablesList] = useState<string[]>(DEFAULT_TABLES);
  const [newTableName, setNewTableName] = useState('');
  const [isAddingTable, setIsAddingTable] = useState(false);

  // Ensure activeTable is always valid
  const currentTable = activeTable || tablesList[0] || 'តុ ១';

  // Catalog collapse state (default open or user toggled)
  const [isCatalogCollapsed, setIsCatalogCollapsed] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ទាំងអស់');
  const [selectedInitialLetter, setSelectedInitialLetter] = useState<string>('');

  // Active Selected Food for the "កាតលក់"
  const [activeFood, setActiveFood] = useState<FoodItem | null>(null);
  const [activeQuantity, setActiveQuantity] = useState<number>(1);
  const [activeNote, setActiveNote] = useState<string>('');

  // Checkout modal
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'khqr' | 'card'>('cash');

  const salesCardRef = useRef<HTMLDivElement>(null);

  // Current order items for the active table
  const currentTableOrders: OrderItem[] = useMemo(() => {
    return ordersByTable[currentTable] || [];
  }, [ordersByTable, currentTable]);

  // Overall table statistics
  const overallStats = useMemo(() => {
    let occupied = 0;
    let totalUnpaid = 0;
    tablesList.forEach((tbl) => {
      const items = ordersByTable[tbl] || [];
      if (items.length > 0) {
        occupied++;
        totalUnpaid += items.reduce((acc, it) => acc + it.sellingPrice * it.quantity, 0);
      }
    });
    return { occupied, totalUnpaid };
  }, [tablesList, ordersByTable]);

  // Available Categories
  const categories = useMemo(() => {
    const cats = ['ទាំងអស់'];
    const unique = Array.from(new Set(foodItems.map((f) => f.category)));
    return [...cats, ...unique];
  }, [foodItems]);

  // Filter available initial letters based on the selected Category!
  // "ប្រភេទ ច្រោះយកអក្សរដំបូង"
  const availableInitialLetters = useMemo(() => {
    const relevantItems =
      selectedCategory === 'ទាំងអស់'
        ? foodItems
        : foodItems.filter((f) => f.category === selectedCategory);

    const letterSet = new Set<string>();
    relevantItems.forEach((item) => {
      if (item.initialLetter) {
        letterSet.add(item.initialLetter.trim());
      } else if (item.name) {
        letterSet.add(item.name.trim().charAt(0));
      }
    });

    return Array.from(letterSet).filter(Boolean).sort();
  }, [foodItems, selectedCategory]);

  // Filter and Sort dishes (ស្រង់តាមអក្សរដំបូង មុននិងអក្សរក្នុងឈ្មោះបន្ទាប់)
  const filteredDishes = useMemo(() => {
    let result = [...foodItems];

    if (selectedCategory !== 'ទាំងអស់') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (selectedInitialLetter) {
      const matchStarts: FoodItem[] = [];
      const matchContains: FoodItem[] = [];

      result.forEach((item) => {
        const firstChar = item.initialLetter || item.name.charAt(0);
        if (firstChar === selectedInitialLetter || item.name.startsWith(selectedInitialLetter)) {
          matchStarts.push(item);
        } else if (item.name.includes(selectedInitialLetter)) {
          matchContains.push(item);
        }
      });

      result = [...matchStarts, ...matchContains];
    }

    return result;
  }, [foodItems, selectedCategory, selectedInitialLetter]);

  // Handle dish selection:
  // "ក្រោយចុចរើសម្ហូបរួចលាក់បញ្ជីម្ហូប" -> auto collapse catalog!
  const handleSelectDish = (food: FoodItem) => {
    setActiveFood(food);
    const existing = currentTableOrders.find((it) => it.itemId === food.id);
    if (existing) {
      setActiveQuantity(existing.quantity);
      setActiveNote(existing.note || '');
    } else {
      setActiveQuantity(1);
      setActiveNote('');
    }

    // ក្រោយចុចរើសម្ហូបរួចលាក់បញ្ជីម្ហូប
    setIsCatalogCollapsed(true);

    setTimeout(() => {
      salesCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  // Add / Update item in the current table's order
  const handleSaveActiveToBill = () => {
    if (!activeFood || activeQuantity <= 0) return;

    const existingIndex = currentTableOrders.findIndex((it) => it.itemId === activeFood.id);
    let updated: OrderItem[];

    if (existingIndex >= 0) {
      updated = [...currentTableOrders];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: activeQuantity,
        note: activeNote.trim() || undefined,
      };
    } else {
      const newItem: OrderItem = {
        itemId: activeFood.id,
        name: activeFood.name,
        category: activeFood.category,
        initialLetter: activeFood.initialLetter,
        image: activeFood.image,
        costPrice: activeFood.costPrice,
        sellingPrice: activeFood.sellingPrice,
        quantity: activeQuantity,
        note: activeNote.trim() || undefined,
      };
      updated = [...currentTableOrders, newItem];
    }

    onUpdateTableOrder(currentTable, updated);
  };

  // Remove active item from bill
  const handleRemoveActiveFromBill = () => {
    if (!activeFood) return;
    const updated = currentTableOrders.filter((it) => it.itemId !== activeFood.id);
    onUpdateTableOrder(currentTable, updated);
    setActiveFood(null);
    setActiveQuantity(1);
    setActiveNote('');
  };

  // Delete item directly from the Sales Bill table
  const handleDeleteBillItem = (itemId: string) => {
    const updated = currentTableOrders.filter((it) => it.itemId !== itemId);
    onUpdateTableOrder(currentTable, updated);
    if (activeFood?.id === itemId) {
      setActiveFood(null);
    }
  };

  // Edit item from Sales Bill: loads into active sales card
  const handleEditBillItem = (item: OrderItem) => {
    const foundFood = foodItems.find((f) => f.id === item.itemId) || {
      id: item.itemId,
      name: item.name,
      category: item.category,
      initialLetter: item.initialLetter,
      image: item.image,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      createdAt: 0,
    };
    setActiveFood(foundFood);
    setActiveQuantity(item.quantity);
    setActiveNote(item.note || '');

    // Make sure sales card is in view
    salesCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Clear entire bill for the active table
  const handleClearCurrentTableBill = () => {
    if (currentTableOrders.length === 0) return;
    if (confirm(`តើលោកអ្នកពិតជាចង់សំអាតបញ្ជីកុម្ម៉ង់សម្រាប់ "${currentTable}" នេះមែនទេ?`)) {
      onUpdateTableOrder(currentTable, []);
      setActiveFood(null);
    }
  };

  // Add new table tab
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    const formatted = newTableName.trim().startsWith('តុ')
      ? newTableName.trim()
      : `តុ ${newTableName.trim()}`;
    if (!tablesList.includes(formatted)) {
      setTablesList([...tablesList, formatted]);
    }
    setNewTableName('');
    setIsAddingTable(false);
    onSelectTable(formatted);
  };

  // Bill Totals for active table
  const totalAmount = useMemo(
    () => currentTableOrders.reduce((acc, it) => acc + it.sellingPrice * it.quantity, 0),
    [currentTableOrders]
  );

  const totalCost = useMemo(
    () => currentTableOrders.reduce((acc, it) => acc + it.costPrice * it.quantity, 0),
    [currentTableOrders]
  );

  const totalProfit = useMemo(() => totalAmount - totalCost, [totalAmount, totalCost]);

  // Active item calculations
  const activeSubtotal = activeFood ? activeFood.sellingPrice * activeQuantity : 0;
  const activeProfit = activeFood
    ? (activeFood.sellingPrice - activeFood.costPrice) * activeQuantity
    : 0;
  const isActiveAlreadyInBill = activeFood
    ? currentTableOrders.some((it) => it.itemId === activeFood.id)
    : false;

  // Checkout submission
  const handleOpenCheckout = () => {
    if (currentTableOrders.length === 0) return;
    setCashReceived(totalAmount);
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (currentTableOrders.length === 0) return;

    const receipt: SaleReceipt = {
      id: 'rec-' + Date.now(),
      invoiceNo: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        100 + Math.random() * 900
      )}`,
      timestamp: Date.now(),
      tableNo: currentTable,
      items: [...currentTableOrders],
      totalAmount,
      totalCost,
      totalProfit,
      cashReceived: paymentMethod === 'cash' ? Math.max(cashReceived, totalAmount) : totalAmount,
      changeAmount: paymentMethod === 'cash' ? Math.max(0, cashReceived - totalAmount) : 0,
      paymentMethod,
    };

    onCompleteSale(receipt);
    setIsCheckoutModalOpen(false);
    onUpdateTableOrder(currentTable, []);
    setActiveFood(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 py-4 space-y-4">
      {/* ========================================================= */}
      {/* 1. HORIZONTAL TABLE TABS BAR (តុ១, តុ២, តុ៣,...)           */}
      {/* ========================================================= */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-2.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-200">Tab តុ:</span>
            <span className="text-[11px] text-amber-400 font-medium">
              កំពុងលក់ {overallStats.occupied} តុ · សរុប {formatKHR(overallStats.totalUnpaid)}
            </span>
          </div>

          <button
            onClick={() => setIsAddingTable(!isAddingTable)}
            className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ បន្ថែមតុ</span>
          </button>
        </div>

        {/* Tab Strip with smooth horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {tablesList.map((tbl) => {
            const items = ordersByTable[tbl] || [];
            const isOccupied = items.length > 0;
            const isSelected = tbl === currentTable;
            const tableTotal = items.reduce((acc, it) => acc + it.sellingPrice * it.quantity, 0);

            return (
              <button
                key={tbl}
                type="button"
                onClick={() => {
                  onSelectTable(tbl);
                  setActiveFood(null);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40'
                    : isOccupied
                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-900/40'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-700/80 hover:bg-neutral-800 hover:text-neutral-100'
                }`}
              >
                <span>{tbl}</span>
                {isOccupied ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold tabular-nums ${
                      isSelected
                        ? 'bg-neutral-950 text-amber-400'
                        : 'bg-amber-500 text-neutral-950'
                    }`}
                  >
                    {items.length} មុខ · {formatKHR(tableTotal)}
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-normal ${
                      isSelected ? 'text-neutral-900/80' : 'text-emerald-500'
                    }`}
                  >
                    (ទំនេរ)
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add Table inline form */}
        {isAddingTable && (
          <form
            onSubmit={handleAddTable}
            className="flex items-center gap-2 p-2 bg-neutral-900 rounded-xl border border-amber-500/40"
          >
            <input
              type="text"
              required
              autoFocus
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="វាយបញ្ចូលឈ្មោះតុ (ឧ. តុ ១១, តុ សួនច្បារ)..."
              className="flex-1 bg-neutral-850 border border-neutral-700 rounded-lg px-3 py-1 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
            >
              បង្កើតតុ
            </button>
            <button
              type="button"
              onClick={() => setIsAddingTable(false)}
              className="p-1 text-neutral-400 hover:text-neutral-200 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. COMPACT HORIZONTAL TOOLBAR: CATEGORIES & FILTERS        */}
      {/* ========================================================= */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-2">
        {/* Categories + Downward Arrow Toggle */}
        <div className="flex items-center justify-between gap-2">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedInitialLetter('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggle Catalog Downward Arrow Button */}
          <button
            type="button"
            onClick={() => setIsCatalogCollapsed(!isCatalogCollapsed)}
            title={isCatalogCollapsed ? 'បង្ហាញបញ្ជីម្ហូប' : 'លាក់បញ្ជីម្ហូប'}
            aria-label={isCatalogCollapsed ? 'បង្ហាញបញ្ជីម្ហូប' : 'លាក់បញ្ជីម្ហូប'}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all shrink-0 flex items-center justify-center ${
              isCatalogCollapsed
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800 hover:text-neutral-100'
            }`}
          >
            {isCatalogCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Initial Letter quick filter */}
        {availableInitialLetters.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pt-1.5 border-t border-neutral-800/80 pb-0.5 shrink-0">
            <span className="text-[10px] text-neutral-500 mr-1">អក្សរ:</span>
              <button
                onClick={() => setSelectedInitialLetter('')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedInitialLetter === ''
                    ? 'bg-neutral-200 text-neutral-900 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                ទាំងអស់
              </button>
              {availableInitialLetters.map((letter) => (
                <button
                  key={letter}
                  onClick={() =>
                    setSelectedInitialLetter(selectedInitialLetter === letter ? '' : letter)
                  }
                  className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-all ${
                    selectedInitialLetter === letter
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN WORKSPACE (HORIZONTAL LAYOUT)                     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ======================================================= */}
        {/* LEFT SECTION: FOOD CATALOG IN 3 VERTICAL COLUMNS        */}
        {/* "បញ្ជីម្ហូប រៀបជាបីជួរឈរ"                               */}
        {/* ======================================================= */}
        {!isCatalogCollapsed && (
          <div className="lg:col-span-7 xl:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span className="font-semibold text-neutral-200">
                បញ្ជីម្ហូប (រៀបជា ៣ ជួរឈរ) · {filteredDishes.length} មុខ
              </span>
              <span className="text-[11px] text-amber-400">
                (ចុចរើសរួច នឹងលាក់បញ្ជីស្វ័យប្រវត្តិ)
              </span>
            </div>

            {filteredDishes.length === 0 ? (
              <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-8 text-center text-xs text-neutral-400 space-y-2">
                <p>មិនមានមុខម្ហូបក្នុងក្រុមនេះទេ។</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ទាំងអស់');
                    setSelectedInitialLetter('');
                  }}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors"
                >
                  កំណត់តម្រងឡើងវិញ
                </button>
              </div>
            ) : (
              /* ៣ ជួរឈរ (3 VERTICAL COLUMNS GRID) */
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {filteredDishes.map((food) => {
                  const isSelected = activeFood?.id === food.id;
                  const inBill = currentTableOrders.find((it) => it.itemId === food.id);

                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectDish(food)}
                      className={`group relative bg-neutral-850 border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-0.5 flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/30 bg-neutral-800'
                          : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {/* Image Box */}
                      <div className="relative aspect-4/3 w-full bg-neutral-900 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={food.image}
                          alt={food.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Initial Letter Badge */}
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded bg-neutral-950/85 text-amber-400 text-[10px] font-bold flex items-center justify-center border border-neutral-700">
                          {food.initialLetter || food.name.charAt(0)}
                        </div>

                        {/* In-Bill count badge */}
                        {inBill && (
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-bold shadow-md">
                            x{inBill.quantity}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-2 space-y-0.5">
                        <h4 className="text-xs font-semibold text-neutral-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {food.name}
                        </h4>
                        <div className="flex items-baseline justify-between pt-0.5">
                          <span className="text-xs font-bold text-amber-400 tabular-nums">
                            {formatKHR(food.sellingPrice)}
                          </span>
                          <span className="text-[10px] text-neutral-500 tabular-nums">
                            {formatUSD(food.sellingPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* RIGHT (OR FULL-WIDTH) SECTION: SALES CARD & SALES BILL  */}
        {/* ======================================================= */}
        <div
          className={`${
            isCatalogCollapsed ? 'lg:col-span-12' : 'lg:col-span-5 xl:col-span-5'
          } space-y-4`}
        >
          {/* If catalog is collapsed, provide clean prompt to re-open */}
          {isCatalogCollapsed && (
            <div className="bg-neutral-850/80 border border-neutral-800 rounded-2xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <Utensils className="w-4 h-4 text-amber-500" />
                <span>បញ្ជីម្ហូបត្រូវបានលាក់ដើម្បីផ្ដោតលើការកុម្ម៉ង់ {currentTable}</span>
              </div>
              <button
                onClick={() => setIsCatalogCollapsed(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ បង្ហាញបញ្ជីម្ហូប (៣ ជួរ)</span>
              </button>
            </div>
          )}

          {/* 1. កាតលក់ (Active Sales Card / Item Action Box) */}
          <div
            ref={salesCardRef}
            className={`border rounded-2xl p-3.5 sm:p-4 shadow-md transition-all ${
              activeFood
                ? 'bg-neutral-850 border-amber-500/60 ring-1 ring-amber-500/20'
                : 'bg-neutral-850/60 border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-200">
                  កាតលក់សម្រាប់: <span className="text-amber-400">{currentTable}</span>
                </span>
                {isActiveAlreadyInBill && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    មានក្នុង {currentTable}
                  </span>
                )}
              </div>
              {activeFood && (
                <button
                  onClick={() => setActiveFood(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-200"
                >
                  បិទកាត
                </button>
              )}
            </div>

            {activeFood ? (
              <div className="mt-3 space-y-3">
                {/* Horizontal dish header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 overflow-hidden shrink-0 border border-neutral-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeFood.image}
                      alt={activeFood.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-neutral-100 truncate">
                      {activeFood.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>{activeFood.category}</span>
                      <span>·</span>
                      <span className="font-bold text-amber-400 tabular-nums">
                        {formatKHR(activeFood.sellingPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls: Horizontal stepper & shortcuts */}
                <div className="flex items-center justify-between gap-2 bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                  <span className="text-xs text-neutral-300 font-medium">ចំនួន:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 hover:bg-neutral-700 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={activeQuantity}
                      onChange={(e) =>
                        setActiveQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-10 text-center bg-transparent text-sm font-bold text-neutral-100 tabular-nums focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveQuantity((q) => q + 1)}
                      className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 hover:bg-neutral-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setActiveQuantity(num)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                          activeQuantity === num
                            ? 'bg-amber-500 text-neutral-950 border-amber-500'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Note input */}
                <input
                  type="text"
                  value={activeNote}
                  onChange={(e) => setActiveNote(e.target.value)}
                  placeholder="ចំណាំបន្ថែម (ឧ. មិនដាក់ម្ទេស, ផ្អែមតិច...)"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                />

                {/* Subtotal & Profit strip */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-400 text-[11px] block">សរុប:</span>
                    <span className="font-bold text-neutral-100 tabular-nums">
                      {formatKHR(activeSubtotal)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-400 text-[11px] block">ចំណេញ:</span>
                    <span className="font-bold text-emerald-400 tabular-nums">
                      +{formatKHR(activeProfit)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Add to Bill + Remove */}
                <div className="flex items-center gap-2">
                  {isActiveAlreadyInBill && (
                    <button
                      type="button"
                      onClick={handleRemoveActiveFromBill}
                      className="px-3 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors flex items-center gap-1"
                      title="លុបចេញ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>លុបចេញ</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveActiveToBill}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {isActiveAlreadyInBill
                        ? `កែប្រែក្នុង ${currentTable}`
                        : `បញ្ចូលក្នុង ${currentTable}`}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-neutral-400 space-y-2">
                <p>សូមជ្រើសរើសមុខម្ហូបពីបញ្ជីដើម្បីកុម្ម៉ង់</p>
                {isCatalogCollapsed && (
                  <button
                    onClick={() => setIsCatalogCollapsed(false)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
                  >
                    + បើកបញ្ជីម្ហូប (៣ ជួរ)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. បញ្ជីលក់សម្រាប់តុនេះ (Sales Bill Table) */}
          <div className="bg-neutral-850 border border-neutral-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-neutral-100">
                  បញ្ជីលក់: <span className="text-amber-400">{currentTable}</span>
                </span>
                <span className="text-[11px] px-2 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                  {currentTableOrders.length} មុខ
                </span>
              </div>

              {currentTableOrders.length > 0 && (
                <button
                  onClick={handleClearCurrentTableBill}
                  className="p-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1"
                  title="សំអាតបុង"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>សំអាត</span>
                </button>
              )}
            </div>

            {/* Bill Table */}
            <div className="overflow-x-auto max-h-72 overflow-y-auto scrollbar-thin">
              {currentTableOrders.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-500 space-y-1">
                  <p>មិនទាន់មានមុខម្ហូបក្នុង {currentTable} នៅឡើយទេ។</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-[11px] text-neutral-400 bg-neutral-900/40">
                      <th className="py-2 px-2.5 font-medium">ល.រ</th>
                      <th className="py-2 px-2 font-medium">ឈ្មោះម្ហូប</th>
                      <th className="py-2 px-2 font-medium text-center">ចំនួន</th>
                      <th className="py-2 px-2 font-medium text-right">តម្លៃ</th>
                      <th className="py-2 px-2 font-medium text-right">សរុប</th>
                      <th className="py-2 px-2.5 font-medium text-center">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {currentTableOrders.map((item, idx) => (
                      <tr
                        key={item.itemId}
                        className={`hover:bg-neutral-800/40 transition-colors ${
                          activeFood?.id === item.itemId ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <td className="py-2 px-2.5 text-neutral-500 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-medium text-neutral-200">{item.name}</div>
                          {item.note && (
                            <div className="text-[10px] text-amber-400/90">*{item.note}</div>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center font-bold tabular-nums text-neutral-100">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-neutral-400">
                          {formatKHR(item.sellingPrice)}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold tabular-nums text-neutral-100">
                          {formatKHR(item.sellingPrice * item.quantity)}
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditBillItem(item)}
                              className="p-1 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                              title="កែប្រែ"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteBillItem(item.itemId)}
                              className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                              title="លុប"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Bill Summary Footer */}
            {currentTableOrders.length > 0 && (
              <div className="p-3 bg-neutral-900 border-t border-neutral-800 space-y-2.5">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1 font-medium text-[11px]">
                      <TrendingUp className="w-3 h-3" />
                      សរុបចំណេញ:
                    </span>
                    <span className="tabular-nums font-bold font-mono">
                      +{formatKHR(totalProfit)} ({((totalProfit / (totalAmount || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-neutral-800 pt-1.5 text-neutral-100">
                    <div>
                      <span className="text-sm font-bold">សរុបបុង {currentTable}:</span>
                      <span className="text-[11px] text-neutral-400 ml-1.5">
                        ({formatUSD(totalAmount)})
                      </span>
                    </div>
                    <span className="text-base font-bold text-amber-400 tabular-nums">
                      {formatKHR(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleOpenCheckout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-amber-500/20"
                >
                  <Receipt className="w-4 h-4" />
                  <span>គិតលុយ {currentTable} & បោះពុម្ពបុង</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-100">
                  ទូទាត់ប្រាក់ {currentTable}
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                បិទ
              </button>
            </div>

            {/* Total due */}
            <div className="p-3 bg-neutral-850 rounded-xl border border-neutral-800 text-center space-y-0.5">
              <div className="text-[11px] text-neutral-400">ទឹកប្រាក់ត្រូវទូទាត់ ({currentTable})</div>
              <div className="text-xl font-bold text-amber-400 tabular-nums">
                {formatKHR(totalAmount)}
              </div>
              <div className="text-xs text-neutral-400 tabular-nums">{formatUSD(totalAmount)}</div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">វិធីទូទាត់:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                      : 'bg-neutral-850 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4 mb-1" />
                  <span>សាច់ប្រាក់សុទ្ធ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('khqr')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === 'khqr'
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                      : 'bg-neutral-850 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <QrCode className="w-4 h-4 mb-1" />
                  <span>ស្កេន KHQR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                      : 'bg-neutral-850 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span>កាតធនាគារ</span>
                </button>
              </div>
            </div>

            {/* If Cash payment */}
            {paymentMethod === 'cash' ? (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">
                    ប្រាក់ទទួលពីអតិថិជន (៛):
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={cashReceived || ''}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-850 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm text-neutral-100 font-bold focus:outline-none focus:border-amber-500 tabular-nums"
                  />
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {[totalAmount, 20000, 40000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCashReceived(val)}
                      className="px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 transition-colors"
                    >
                      {formatKHR(val)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between p-2.5 bg-neutral-850 rounded-xl border border-neutral-800 text-xs">
                  <span className="text-neutral-400">ប្រាក់អាប់ជូន:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      cashReceived >= totalAmount ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {cashReceived >= totalAmount
                      ? formatKHR(cashReceived - totalAmount)
                      : 'នៅខ្វះ ' + formatKHR(totalAmount - cashReceived)}
                  </span>
                </div>
              </div>
            ) : paymentMethod === 'khqr' ? (
              <div className="p-3 bg-neutral-850 rounded-xl border border-neutral-800 text-center space-y-1.5">
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-24 h-24 text-neutral-900 mx-auto" />
                    <div className="text-[8px] font-bold text-red-600">KHQR PAY</div>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 font-medium">ស្កេនទូទាត់ {formatKHR(totalAmount)}</p>
              </div>
            ) : (
              <div className="p-3 bg-neutral-850 rounded-xl border border-neutral-800 text-center text-xs text-neutral-300">
                សូមរៀបចំម៉ាស៊ីន POS ឬប៉ះកាត (Tap to Pay)
              </div>
            )}

            {/* Confirm Checkout Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold transition-colors"
              >
                ត្រឡប់ក្រោយ
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                disabled={paymentMethod === 'cash' && cashReceived < totalAmount}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-neutral-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>បញ្ចប់ការលក់ & បោះពុម្ព</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
