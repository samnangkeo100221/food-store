'use client';

import React, { useState, useMemo, useRef } from 'react';
import { FoodItem, OrderItem, SaleReceipt } from '@/lib/types';
import { formatKHR, DEFAULT_TABLES } from '@/lib/data';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Edit3,
  Check,
  ChevronRight,
  TrendingUp,
  Receipt,
  RotateCcw,
  Coins,
  QrCode,
  Banknote,
  PlusCircle,
  X,
  CreditCard,
  Delete,
  UserPlus,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Printer,
  StickyNote,
  MessageSquarePlus,
} from 'lucide-react';

// Common Cambodian / restaurant quick notes for orders
const COMMON_ORDER_NOTES = [
  'មិនហិរ',        // No spicy
  'ថែមបាយ',        // Extra rice
  'ផ្អែមតិច',       // Less sweet
  'ទឹកកកតិច',      // Less ice
  'ថែមពង',        // Add egg
  'ខ្ចប់',         // Takeaway / To go
  'មិនដាក់ខ្ទឹម',    // No garlic
  'មិនដាក់ប៊ីចេង',  // No MSG
  'ហិរតិចៗ',       // Mild spicy
  'ហិរខ្លាំង',       // Extra spicy
  'ស៊ុបក្ដៅ',       // Hot soup
  'ទឹកកកច្រើន',     // Extra ice
];

// Helper to toggle a note chip in a comma-separated note string
function toggleNoteChip(currentNote: string, chip: string): string {
  const parts = currentNote
    .split(/[,，\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const existingIdx = parts.findIndex((p) => p.toLowerCase() === chip.toLowerCase());
  if (existingIdx >= 0) {
    parts.splice(existingIdx, 1);
    return parts.join(', ');
  } else {
    parts.push(chip);
    return parts.join(', ');
  }
}

interface POSViewProps {
  foodItems: FoodItem[];
  ordersByTable: Record<string, OrderItem[]>;
  activeTable: string;
  onSelectTable: (table: string) => void;
  onUpdateTableOrder: (table: string, items: OrderItem[]) => void;
  onCompleteSale: (receipt: SaleReceipt, showModal?: boolean) => void;
}

export default function POSView({
  foodItems,
  ordersByTable,
  activeTable,
  onSelectTable,
  onUpdateTableOrder,
  onCompleteSale,
}: POSViewProps) {
  const TABLES_STORAGE_KEY = 'chak_mey_pos_tables_list_v2';

  // Available tables list persisted to localStorage
  const [tablesList, setTablesList] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(TABLES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to load tables list:', e);
      }
    }
    return DEFAULT_TABLES;
  });

  const saveTablesList = (newTables: string[]) => {
    setTablesList(newTables);
    try {
      localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(newTables));
    } catch (e) {
      console.warn('Failed to save tables list:', e);
    }
  };

  const [newTableName, setNewTableName] = useState('');
  const [isAddingTable, setIsAddingTable] = useState(false);

  // Delete table modal state
  const [isDeletingTableModal, setIsDeletingTableModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string>('');

  // Success message toast for "រៀបតុថ្មី"
  const [resetTableSuccessMsg, setResetTableSuccessMsg] = useState<string | null>(null);

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
  const [isNewQuantityInput, setIsNewQuantityInput] = useState<boolean>(true);

  // Quick note modal state for direct note editing on bill items
  const [noteModalItem, setNoteModalItem] = useState<{ item: OrderItem; index: number } | null>(null);
  const [noteModalText, setNoteModalText] = useState<string>('');

  // Checkout modal
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'khqr' | 'card'>('cash');

  const salesCardRef = useRef<HTMLDivElement>(null);

  // Current order items for the active table
  const currentTableOrders: OrderItem[] = useMemo(() => {
    return ordersByTable[currentTable] || [];
  }, [ordersByTable, currentTable]);

  // Table status filter: 'all' | 'occupied' | 'vacant'
  const [tableStatusFilter, setTableStatusFilter] = useState<'all' | 'occupied' | 'vacant'>('all');

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
    return {
      occupied,
      totalUnpaid,
      vacant: Math.max(0, tablesList.length - occupied),
    };
  }, [tablesList, ordersByTable]);

  // Filtered tables based on occupied / vacant status
  const filteredTablesList = useMemo(() => {
    if (tableStatusFilter === 'occupied') {
      return tablesList.filter((tbl) => (ordersByTable[tbl]?.length || 0) > 0);
    }
    if (tableStatusFilter === 'vacant') {
      return tablesList.filter((tbl) => (ordersByTable[tbl]?.length || 0) === 0);
    }
    return tablesList;
  }, [tablesList, tableStatusFilter, ordersByTable]);

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

  // Quantity input & Keypad handlers
  const handleKeypadPress = (digit: string) => {
    if (isNewQuantityInput) {
      if (digit === '0' || digit === '00') {
        setActiveQuantity(1);
      } else {
        const val = parseInt(digit, 10);
        if (!isNaN(val) && val > 0) {
          setActiveQuantity(val);
          setIsNewQuantityInput(false);
        }
      }
    } else {
      const currentStr = activeQuantity.toString();
      if (currentStr.length < 4) {
        const newStr = currentStr + digit;
        const val = parseInt(newStr, 10);
        if (!isNaN(val) && val > 0) {
          setActiveQuantity(val);
        }
      }
    }
  };

  const handleKeypadBackspace = () => {
    const currentStr = activeQuantity.toString();
    if (currentStr.length > 1) {
      const newStr = currentStr.slice(0, -1);
      const val = parseInt(newStr, 10);
      setActiveQuantity(isNaN(val) || val < 1 ? 1 : val);
    } else {
      setActiveQuantity(1);
      setIsNewQuantityInput(true);
    }
  };

  const handleKeypadClear = () => {
    setActiveQuantity(1);
    setIsNewQuantityInput(true);
  };

  const handleDecreaseQuantity = () => {
    setActiveQuantity((q) => Math.max(1, q - 1));
    setIsNewQuantityInput(false);
  };

  const handleIncreaseQuantity = () => {
    setActiveQuantity((q) => q + 1);
    setIsNewQuantityInput(false);
  };

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
    setIsNewQuantityInput(true);

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
    setIsNewQuantityInput(true);
  };

  // Delete item directly from the Sales Bill table
  const handleDeleteBillItem = (itemId: string) => {
    const updated = currentTableOrders.filter((it) => it.itemId !== itemId);
    onUpdateTableOrder(currentTable, updated);
    if (activeFood?.id === itemId) {
      setActiveFood(null);
      setIsNewQuantityInput(true);
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
    setIsNewQuantityInput(true);

    // Make sure sales card is in view
    salesCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Open note modal for a specific line item in the table's bill
  const handleOpenItemNoteModal = (item: OrderItem, index: number) => {
    setNoteModalItem({ item, index });
    setNoteModalText(item.note || '');
  };

  // Save updated note for the specific line item in the bill
  const handleSaveItemNoteModal = () => {
    if (!noteModalItem) return;
    const { index } = noteModalItem;
    const trimmed = noteModalText.trim();
    const updated = [...currentTableOrders];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        note: trimmed || undefined,
      };
      onUpdateTableOrder(currentTable, updated);
      if (activeFood?.id === updated[index].itemId) {
        setActiveNote(trimmed);
      }
    }
    setNoteModalItem(null);
    setNoteModalText('');
  };

  // Clear note for the specific line item in the bill
  const handleClearItemNoteModal = () => {
    if (!noteModalItem) return;
    const { index } = noteModalItem;
    const updated = [...currentTableOrders];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        note: undefined,
      };
      onUpdateTableOrder(currentTable, updated);
      if (activeFood?.id === updated[index].itemId) {
        setActiveNote('');
      }
    }
    setNoteModalItem(null);
    setNoteModalText('');
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
      const nextTables = [...tablesList, formatted];
      saveTablesList(nextTables);
    }
    setNewTableName('');
    setIsAddingTable(false);
    onSelectTable(formatted);
  };

  // Delete table from system
  const handleDeleteTable = (targetTable: string) => {
    if (tablesList.length <= 1) {
      alert('មិនអាចលុបបានទេ! ត្រូវមានតុយ៉ាងហោចណាស់ ១ ក្នុងប្រព័ន្ធ។');
      return;
    }

    const hasOrders = (ordersByTable[targetTable] || []).length > 0;
    const confirmMsg = hasOrders
      ? `តុ "${targetTable}" កំពុងមានភ្ញៀវ ឬមុខម្ហូបកុម្ម៉ង់! តើលោកអ្នកពិតជាចង់លុបតុនេះព្រមទាំងការកុម្ម៉ង់ទាំងអស់ចេញពីប្រព័ន្ធមែនទេ?`
      : `តើលោកអ្នកពិតជាចង់លុប "${targetTable}" ចេញពីប្រព័ន្ធមែនទេ?`;

    if (!confirm(confirmMsg)) return;

    const nextTables = tablesList.filter((t) => t !== targetTable);
    saveTablesList(nextTables);

    // Clear orders for this table
    onUpdateTableOrder(targetTable, []);

    // If deleted table was active, switch to first remaining table
    if (currentTable === targetTable) {
      onSelectTable(nextTables[0] || 'តុ ១');
      setActiveFood(null);
    }
  };

  // Open delete modal
  const handleOpenDeleteModal = () => {
    setTableToDelete(currentTable);
    setIsDeletingTableModal(true);
  };

  // រៀបតុថ្មី: សំដៅដល់ការលក់តុណាមួយ បញ្ចប់ និងគិតលុយរួច ហើយរៀបចំសម្រាប់ភ្ញៀវថ្មីនៅតុនោះដដែល
  const handleResetTableNewGuest = (targetTable: string = currentTable) => {
    const items = ordersByTable[targetTable] || [];

    if (items.length === 0) {
      setResetTableSuccessMsg(
        `តុ "${targetTable}" ទំនេរស្រាប់ហើយ! លោកអ្នកអាចចាប់ផ្ដើមជ្រើសរើសមុខម្ហូប និងបញ្ចូលការកុម្ម៉ង់សម្រាប់ភ្ញៀវថ្មីនៅតុនេះបានភ្លាមៗ។`
      );
      setTimeout(() => setResetTableSuccessMsg(null), 4000);
      return;
    }

    if (currentTable !== targetTable) {
      onSelectTable(targetTable);
    }

    const billTotal = items.reduce((acc, it) => acc + it.sellingPrice * it.quantity, 0);
    setCashReceived(billTotal);
    setIsCheckoutModalOpen(true);
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

  const handleConfirmCheckout = (showReceiptModal: boolean = true) => {
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

    onCompleteSale(receipt, showReceiptModal);
    setIsCheckoutModalOpen(false);

    // សម្អាតបញ្ជីតុនោះ និងរៀបចំសម្រាប់ភ្ញៀវថ្មីនៅតុនោះដដែល
    onUpdateTableOrder(currentTable, []);
    setActiveFood(null);

    // បង្ហាញសារបញ្ជាក់ថាបានគិតលុយរួចរាល់ និងបានរៀបចំតុរួចរាល់សម្រាប់ភ្ញៀវថ្មីនៅតុនោះដដែល
    setResetTableSuccessMsg(
      `🎉 តុ "${currentTable}" បានបញ្ចប់ការលក់ និងគិតលុយរួចរាល់ (${formatKHR(
        totalAmount
      )})! តុនេះត្រូវបានរៀបចំរួចស្រេចសម្រាប់ទទួលភ្ញៀវថ្មីនៅតុនោះដដែល។`
    );
    setTimeout(() => setResetTableSuccessMsg(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-5 py-2.5 sm:py-4 space-y-3 sm:space-y-4">
      {/* ========================================================= */}
      {/* 1. HORIZONTAL TABLE TABS BAR (តុ១, តុ២, តុ៣,...)           */}
      {/* ========================================================= */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-sm space-y-2.5">
        {/* Table Bar Header: Status summary on left, Action buttons on right */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
          {/* Status info & filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="font-bold text-neutral-100">Tab តុ:</span>
              <span className="text-amber-400 font-semibold">
                កំពុងលក់ <span className="font-bold">{overallStats.occupied}</span> តុ • សរុប{' '}
                <span className="font-bold font-mono">{formatKHR(overallStats.totalUnpaid)}</span>
              </span>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 ml-0.5">
              <button
                type="button"
                onClick={() => setTableStatusFilter('all')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border min-h-[36px] sm:min-h-[40px] flex items-center justify-center ${
                  tableStatusFilter === 'all'
                    ? 'bg-neutral-200 text-neutral-950 border-neutral-300 shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                }`}
              >
                ទាំងអស់ ({tablesList.length})
              </button>

              <button
                type="button"
                onClick={() => setTableStatusFilter('occupied')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border min-h-[36px] sm:min-h-[40px] ${
                  tableStatusFilter === 'occupied'
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
                    : 'bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 border-amber-500/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>មានភ្ញៀវ ({overallStats.occupied})</span>
              </button>

              <button
                type="button"
                onClick={() => setTableStatusFilter('vacant')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border min-h-[36px] sm:min-h-[40px] ${
                  tableStatusFilter === 'vacant'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                    : 'bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 border-emerald-500/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>ទំនេរ ({overallStats.vacant})</span>
              </button>
            </div>
          </div>

          {/* Action buttons: Reset Table, Delete Table, Add Table */}
          <div className="flex items-center gap-2">
            {/* Reset Table Button (រៀបតុថ្មី) */}
            <button
              type="button"
              onClick={() => handleResetTableNewGuest(currentTable)}
              title={`ចម្លងបញ្ជីលក់ "${currentTable}" ទៅការលក់សរុប រួចសម្អាតតុសម្រាប់ភ្ញៀវថ្មី`}
              className="text-emerald-400 hover:text-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 shadow-sm min-h-[36px] sm:min-h-[40px]"
            >
              <UserCheck className="w-4 h-4" />
              <span>រៀបតុថ្មី</span>
            </button>

            {/* Delete Table Button (លុបតុ) */}
            <button
              type="button"
              onClick={handleOpenDeleteModal}
              title="លុបតុចេញពីប្រព័ន្ធ"
              className="text-rose-400 hover:text-rose-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 shadow-sm min-h-[36px] sm:min-h-[40px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>លុបតុ</span>
            </button>

            {/* Add Table Button */}
            <button
              type="button"
              onClick={() => setIsAddingTable(!isAddingTable)}
              className="text-amber-400 hover:text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 shadow-sm min-h-[36px] sm:min-h-[40px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ បន្ថែមតុ</span>
            </button>
          </div>
        </div>

        {/* Success toast notification for "រៀបតុថ្មី" */}
        {resetTableSuccessMsg && (
          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resetTableSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setResetTableSuccessMsg(null)}
              className="text-emerald-400 hover:text-emerald-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Strip with color-coded buttons arranged in TWO HORIZONTAL ROWS (ពីរជួរដេក) - ENLARGED BUTTONS */}
        <div className="grid grid-rows-2 grid-flow-col gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin auto-cols-max items-center">
          {filteredTablesList.length === 0 ? (
            <div className="row-span-2 text-xs sm:text-sm text-neutral-400 py-4 px-3 italic flex items-center">
              មិនមានតុស្ថិតក្នុងស្ថានភាពនេះទេ (ចុច &quot;ទាំងអស់&quot; ដើម្បីមើលតុទាំងអស់)
            </div>
          ) : (
            filteredTablesList.map((tbl) => {
              const items = ordersByTable[tbl] || [];
              const isOccupied = items.length > 0;
              const isSelected = tbl === currentTable;
              const tableTotal = items.reduce(
                (acc, it) => acc + it.sellingPrice * it.quantity,
                0
              );

              return (
                <div key={tbl} className="relative group/tbl flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTable(tbl);
                      setActiveFood(null);
                    }}
                    className={`group flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold whitespace-nowrap transition-all duration-150 border min-h-[46px] sm:min-h-[50px] shadow-sm ${
                      isSelected
                        ? isOccupied
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                          : 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-300'
                        : isOccupied
                        ? 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-500/60'
                        : 'bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {/* Status dot */}
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isSelected
                          ? isOccupied
                            ? 'bg-neutral-950'
                            : 'bg-white'
                          : isOccupied
                          ? 'bg-amber-400 ring-2 ring-amber-400/40 animate-pulse'
                          : 'bg-emerald-400 ring-2 ring-emerald-400/40'
                      }`}
                    />

                    <span>{tbl}</span>

                    {isOccupied ? (
                      <span
                        className={`text-xs sm:text-sm px-2.5 py-0.5 rounded-lg font-bold tabular-nums flex items-center gap-1 ${
                          isSelected
                            ? 'bg-neutral-950 text-amber-300'
                            : 'bg-amber-500 text-neutral-950'
                        }`}
                      >
                        <span>{items.length} មុខ</span>
                        <span>·</span>
                        <span>{formatKHR(tableTotal)}</span>
                      </span>
                    ) : (
                      <span
                        className={`text-xs sm:text-sm px-2.5 py-0.5 rounded-lg font-bold ${
                          isSelected
                            ? 'bg-emerald-700 text-emerald-100'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        (ទំនេរ)
                      </span>
                    )}
                  </button>

                  {/* Quick delete table icon button */}
                  {tablesList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTable(tbl);
                      }}
                      title={`លុប ${tbl}`}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-900 border border-rose-500/60 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center text-xs opacity-0 group-hover/tbl:opacity-100 transition-opacity shadow-md z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Table inline form */}
        {isAddingTable && (
          <form
            onSubmit={handleAddTable}
            className="flex items-center gap-2 p-2.5 bg-neutral-900 rounded-xl border border-amber-500/40"
          >
            <input
              type="text"
              required
              autoFocus
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="វាយបញ្ចូលឈ្មោះតុ (ឧ. តុ ១១, តុ សួនច្បារ)..."
              className="flex-1 bg-neutral-850 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap min-h-[40px]"
            >
              បង្កើតតុ
            </button>
            <button
              type="button"
              onClick={() => setIsAddingTable(false)}
              className="p-1.5 text-neutral-400 hover:text-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>

      {/* Delete Table Modal */}
      {isDeletingTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-neutral-100">លុបតុចេញពីប្រព័ន្ធ</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeletingTableModal(false)}
                className="text-xs text-neutral-400 hover:text-neutral-200 p-1"
              >
                បិទ
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-300 block">
                ជ្រើសរើសតុដែលត្រូវលុប:
              </label>
              <select
                value={tableToDelete}
                onChange={(e) => setTableToDelete(e.target.value)}
                className="w-full bg-neutral-850 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-rose-500"
              >
                {tablesList.map((tbl) => {
                  const count = (ordersByTable[tbl] || []).length;
                  return (
                    <option key={tbl} value={tbl}>
                      {tbl} {count > 0 ? `(មានកុម្ម៉ង់ ${count} មុខ)` : '(ទំនេរ)'}
                    </option>
                  );
                })}
              </select>

              {(ordersByTable[tableToDelete] || []).length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    ⚠️ ការព្រមាន:
                  </span>
                  <p>
                    តុ &quot;{tableToDelete}&quot; កំពុងមានមុខម្ហូបកុម្ម៉ង់ចំនួន{' '}
                    {(ordersByTable[tableToDelete] || []).length} មុខ! ការលុបតុក៏នឹងលុបការកុម្ម៉ង់ទាំងអស់ក្នុងតុនេះដែរ។
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsDeletingTableModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors min-h-[42px]"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteTable(tableToDelete);
                  setIsDeletingTableModal(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition-colors shadow-md shadow-rose-600/20 min-h-[42px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>លុបតុនេះ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. COMPACT HORIZONTAL TOOLBAR: CATEGORIES & FILTERS        */}
      {/* ========================================================= */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-2.5">
        {/* Categories (arranged in 2 horizontal rows) + Toggle Catalog Arrow */}
        <div className="flex items-center justify-between gap-2">
          {/* Categories arranged in TWO HORIZONTAL ROWS (ពីរជួរដេក) - ENLARGED BUTTONS */}
          <div className="grid grid-rows-2 grid-flow-col gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-thin auto-cols-max flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedInitialLetter('');
                }}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base font-bold whitespace-nowrap transition-colors border min-h-[40px] sm:min-h-[44px] flex items-center justify-center ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggle Catalog Downward Arrow Button - ENLARGED */}
          <button
            type="button"
            onClick={() => setIsCatalogCollapsed(!isCatalogCollapsed)}
            title={isCatalogCollapsed ? 'បង្ហាញបញ្ជីម្ហូប' : 'លាក់បញ្ជីម្ហូប'}
            aria-label={isCatalogCollapsed ? 'បង្ហាញបញ្ជីម្ហូប' : 'លាក់បញ្ជីម្ហូប'}
            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border transition-all shrink-0 flex items-center justify-center self-stretch min-w-[44px] min-h-[44px] ${
              isCatalogCollapsed
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800 hover:text-neutral-100'
            }`}
          >
            {isCatalogCollapsed ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Initial Letter quick filter (arranged in TWO HORIZONTAL ROWS (ពីរជួរដេក)) - ENLARGED */}
        {availableInitialLetters.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-neutral-800/80 pb-0.5 scrollbar-thin">
            <span className="text-xs sm:text-sm text-neutral-400 font-bold shrink-0 mr-1">អក្សរ:</span>
            <div className="grid grid-rows-2 grid-flow-col gap-1.5 auto-cols-max">
              <button
                type="button"
                onClick={() => setSelectedInitialLetter('')}
                className={`row-span-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center border min-h-[44px] ${
                  selectedInitialLetter === ''
                    ? 'bg-neutral-200 text-neutral-900 border-neutral-300 shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                }`}
              >
                ទាំងអស់
              </button>
              {availableInitialLetters.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() =>
                    setSelectedInitialLetter(selectedInitialLetter === letter ? '' : letter)
                  }
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-sm sm:text-base font-black transition-all border ${
                    selectedInitialLetter === letter
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border-neutral-800'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
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
            <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-400 px-1">
              <span className="font-bold text-neutral-200">
                បញ្ជីម្ហូប (រៀបជា ៣ ជួរឈរ) · {filteredDishes.length} មុខ
              </span>
              <span className="text-xs text-amber-400 font-medium">
                (ចុចរើសរួច នឹងលាក់បញ្ជីស្វ័យប្រវត្តិ)
              </span>
            </div>

            {filteredDishes.length === 0 ? (
              <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-8 text-center text-xs sm:text-sm text-neutral-400 space-y-2">
                <p>មិនមានមុខម្ហូបក្នុងក្រុមនេះទេ។</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ទាំងអស់');
                    setSelectedInitialLetter('');
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
                >
                  កំណត់តម្រងឡើងវិញ
                </button>
              </div>
            ) : (
              /* ៣ ជួរឈរ (3 VERTICAL COLUMNS GRID) */
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {filteredDishes.map((food) => {
                  const isSelected = activeFood?.id === food.id;
                  const inBill = currentTableOrders.find((it) => it.itemId === food.id);

                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectDish(food)}
                      className={`group relative bg-neutral-850 border rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-0.5 flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/30 bg-neutral-800'
                          : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {/* Image Box - Square (height = width) */}
                      <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={food.image}
                          alt={food.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* In-Bill count badge */}
                        {inBill && (
                          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-xs font-black shadow-md">
                            x{inBill.quantity}
                          </div>
                        )}
                      </div>

                      {/* Content - Compact height, single prominent dish title */}
                      <div className="p-2 sm:p-2.5 space-y-0.5">
                        <h4 className="text-xs sm:text-sm md:text-base font-bold text-neutral-100 line-clamp-1 group-hover:text-amber-400 transition-colors leading-snug">
                          {food.name}
                        </h4>
                        <div className="pt-0.5">
                          <span className="text-sm sm:text-base md:text-lg font-black text-amber-400 tabular-nums">
                            {formatKHR(food.sellingPrice)}
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
          {/* 1. កាតលក់ (Active Sales Card / Item Action Box) */}
          <div
            ref={salesCardRef}
            className={`border rounded-2xl p-4 sm:p-5 shadow-md transition-all ${
              activeFood
                ? 'bg-neutral-850 border-amber-500/60 ring-1 ring-amber-500/20'
                : 'bg-neutral-850/60 border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-neutral-200">
                  កាតលក់សម្រាប់: <span className="text-amber-400">{currentTable}</span>
                </span>
                {isActiveAlreadyInBill && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    មានក្នុង {currentTable}
                  </span>
                )}
              </div>
              {activeFood && (
                <button
                  onClick={() => setActiveFood(null)}
                  className="text-xs sm:text-sm text-neutral-400 hover:text-neutral-200 font-medium"
                >
                  បិទកាត
                </button>
              )}
            </div>

            {activeFood ? (
              <div className="mt-3.5 space-y-3.5">
                {/* Horizontal dish header */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-900 overflow-hidden shrink-0 border border-neutral-700 shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeFood.image}
                      alt={activeFood.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-neutral-100 truncate">
                      {activeFood.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 mt-0.5">
                      <span>{activeFood.category}</span>
                      <span>·</span>
                      <span className="font-extrabold text-amber-400 tabular-nums text-sm sm:text-base">
                        {formatKHR(activeFood.sellingPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls: Editable Box with -/+ Stepper & Numeric Keypad */}
                <div className="bg-neutral-900/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-neutral-200 font-bold">ចំនួនកុម្ម៉ង់:</span>
                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className="text-xs sm:text-sm text-amber-400/90 hover:text-amber-300 font-bold transition-colors"
                      title="កំណត់ចំនួនទៅ 1 វិញ"
                    >
                      កំណត់ឡើងវិញ (1)
                    </button>
                  </div>

                  {/* Editable input box with large - (decrease) and + (increase) on each side */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={handleDecreaseQuantity}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-100 flex items-center justify-center font-black text-xl sm:text-2xl border border-neutral-700 transition-all shrink-0 shadow-sm"
                      title="បន្ថយចំនួន (-)"
                    >
                      <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      value={activeQuantity}
                      onFocus={() => setIsNewQuantityInput(false)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setActiveQuantity(isNaN(val) || val < 1 ? 1 : val);
                        setIsNewQuantityInput(false);
                      }}
                      className="flex-1 h-12 sm:h-14 text-center bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl sm:rounded-2xl px-3 text-2xl sm:text-3xl font-black text-amber-400 tabular-nums focus:outline-none transition-colors shadow-inner"
                    />

                    <button
                      type="button"
                      onClick={handleIncreaseQuantity}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-100 flex items-center justify-center font-black text-xl sm:text-2xl border border-neutral-700 transition-all shrink-0 shadow-sm"
                      title="បង្កើនចំនួន (+)"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Numeric Keypad (1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 00, Delete) - ENLARGED BUTTONS */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleKeypadPress(digit)}
                        className="py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 text-neutral-100 font-bold text-lg sm:text-xl border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm min-h-[48px] sm:min-h-[54px] flex items-center justify-center"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('0')}
                      className="py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 text-neutral-100 font-bold text-lg sm:text-xl border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm min-h-[48px] sm:min-h-[54px] flex items-center justify-center"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('00')}
                      className="py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 text-neutral-100 font-bold text-lg sm:text-xl border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm min-h-[48px] sm:min-h-[54px] flex items-center justify-center"
                    >
                      00
                    </button>
                    <button
                      type="button"
                      onClick={handleKeypadBackspace}
                      title="លុបថយក្រោយ"
                      className="py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-red-500/20 active:text-red-400 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-colors shadow-sm min-h-[48px] sm:min-h-[54px]"
                    >
                      <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>

                {/* Custom Order Item Note */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-neutral-300 font-semibold">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <StickyNote className="w-4 h-4" />
                      <span>ចំណាំមុខម្ហូប (Custom Note):</span>
                    </span>
                    {activeNote && (
                      <button
                        type="button"
                        onClick={() => setActiveNote('')}
                        className="text-neutral-400 hover:text-red-400 text-[11px] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-neutral-800"
                        title="លុបចំណាំទាំងអស់"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>សម្អាតចំណាំ</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={activeNote}
                      onChange={(e) => setActiveNote(e.target.value)}
                      placeholder="ចំណាំបន្ថែម (ឧ. មិនហិរ, ថែមបាយ, ផ្អែមតិច...)"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-3.5 pr-8 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    {activeNote && (
                      <button
                        type="button"
                        onClick={() => setActiveNote('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1"
                        title="សម្អាត"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Preset quick-select chips (e.g., 'no spicy', 'extra rice') */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-neutral-400">
                      ជម្រើសពេញនិយម (ចុចដើម្បីដាក់/ដក):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_ORDER_NOTES.map((chip) => {
                        const isSelected = activeNote
                          .split(/[,，\n]+/)
                          .map((s) => s.trim().toLowerCase())
                          .includes(chip.toLowerCase());
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setActiveNote((prev) => toggleNoteChip(prev, chip))}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                              isSelected
                                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700/80 hover:border-neutral-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-neutral-950" />}
                            <span>{chip}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Subtotal & Profit strip */}
                <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-xs sm:text-sm">
                  <div>
                    <span className="text-neutral-400 text-xs block">សរុប:</span>
                    <span className="font-extrabold text-neutral-100 tabular-nums text-sm sm:text-base">
                      {formatKHR(activeSubtotal)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-400 text-xs block">ចំណេញ:</span>
                    <span className="font-extrabold text-emerald-400 tabular-nums text-sm sm:text-base">
                      +{formatKHR(activeProfit)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Add to Bill + Remove */}
                <div className="flex items-center gap-2.5">
                  {isActiveAlreadyInBill && (
                    <button
                      type="button"
                      onClick={handleRemoveActiveFromBill}
                      className="px-4 py-3 rounded-xl sm:rounded-2xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 min-h-[48px]"
                      title="លុបចេញ"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>លុបចេញ</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveActiveToBill}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-sm sm:text-base font-bold transition-colors shadow-lg shadow-amber-500/20 min-h-[48px]"
                  >
                    <Check className="w-5 h-5" />
                    <span>
                      {isActiveAlreadyInBill
                        ? `កែប្រែក្នុង ${currentTable}`
                        : `បញ្ចូលក្នុង ${currentTable}`}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs sm:text-sm text-neutral-400 space-y-3">
                <p>សូមជ្រើសរើសមុខម្ហូបពីបញ្ជីដើម្បីកុម្ម៉ង់</p>
                {isCatalogCollapsed && (
                  <button
                    onClick={() => setIsCatalogCollapsed(false)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-md"
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
            <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-amber-500" />
                <span className="text-sm sm:text-base font-bold text-neutral-100">
                  បញ្ជីលក់: <span className="text-amber-400">{currentTable}</span>
                </span>
                <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono font-bold">
                  {currentTableOrders.length} មុខ
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Reset Table (រៀបតុថ្មី) button */}
                <button
                  type="button"
                  onClick={() => handleResetTableNewGuest(currentTable)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm min-h-[38px]"
                  title="ចម្លងបញ្ជីលក់ទៅបញ្ជីលក់សរុប រួចសម្អាតតុសម្រាប់ភ្ញៀវថ្មី"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>រៀបតុថ្មី</span>
                </button>

                {currentTableOrders.length > 0 && (
                  <button
                    onClick={handleClearCurrentTableBill}
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors text-xs sm:text-sm flex items-center gap-1"
                    title="សំអាតបុងចោល"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>សំអាត</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bill Table */}
            <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin">
              {currentTableOrders.length === 0 ? (
                <div className="py-12 text-center text-xs sm:text-sm text-neutral-500 space-y-1">
                  <p>មិនទាន់មានមុខម្ហូបក្នុង {currentTable} នៅឡើយទេ។</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-xs text-neutral-400 bg-neutral-900/40">
                      <th className="py-2.5 px-3 font-semibold">ល.រ</th>
                      <th className="py-2.5 px-2.5 font-semibold">ឈ្មោះម្ហូប</th>
                      <th className="py-2.5 px-2.5 font-semibold text-center">ចំនួន</th>
                      <th className="py-2.5 px-2.5 font-semibold text-right">តម្លៃ</th>
                      <th className="py-2.5 px-2.5 font-semibold text-right">សរុប</th>
                      <th className="py-2.5 px-3 font-semibold text-center">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {currentTableOrders.map((item, idx) => (
                      <tr
                        key={`${item.itemId}-${idx}`}
                        className={`hover:bg-neutral-800/40 transition-colors ${
                          activeFood?.id === item.itemId ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-neutral-500 font-mono text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="font-bold text-neutral-100">{item.name}</div>
                          {item.note ? (
                            <button
                              type="button"
                              onClick={() => handleOpenItemNoteModal(item, idx)}
                              className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-semibold transition-colors group text-left max-w-full"
                              title="ចុចដើម្បីកែប្រែចំណាំ"
                            >
                              <StickyNote className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">*{item.note}</span>
                              <Edit3 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0 ml-0.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenItemNoteModal(item, idx)}
                              className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-dashed border-neutral-700 hover:border-amber-500/60 text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/60 text-[11px] transition-colors"
                              title="បន្ថែមចំណាំលើម្ហូបនេះ (ឧ. មិនហិរ, ថែមបាយ)"
                            >
                              <MessageSquarePlus className="w-3 h-3 text-neutral-500" />
                              <span>+ ចំណាំ</span>
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-black tabular-nums text-sm sm:text-base text-neutral-100">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-2.5 text-right tabular-nums text-xs sm:text-sm text-neutral-400">
                          {formatKHR(item.sellingPrice)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold tabular-nums text-xs sm:text-sm text-neutral-100">
                          {formatKHR(item.sellingPrice * item.quantity)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenItemNoteModal(item, idx)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                item.note
                                  ? 'text-amber-400 hover:bg-amber-500/15'
                                  : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
                              }`}
                              title={item.note ? 'កែប្រែចំណាំ (Note)' : 'បន្ថែមចំណាំ (Note)'}
                            >
                              <StickyNote className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditBillItem(item)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                              title="កែប្រែមុខម្ហូប"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBillItem(item.itemId)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                              title="លុប"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-3">
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                      <TrendingUp className="w-4 h-4" />
                      សរុបចំណេញ:
                    </span>
                    <span className="tabular-nums font-bold font-mono">
                      +{formatKHR(totalProfit)} ({((totalProfit / (totalAmount || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-neutral-800 pt-2 text-neutral-100">
                    <div>
                      <span className="text-base sm:text-lg font-bold">សរុបបុង {currentTable}:</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
                      {formatKHR(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Reset Table (រៀបតុថ្មី) + Checkout (គិតលុយ) - ENLARGED BUTTONS */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleResetTableNewGuest(currentTable)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base transition-colors shadow-lg shadow-emerald-600/20 min-h-[50px] sm:min-h-[54px]"
                    title="ចម្លងបញ្ជីលក់ទៅបញ្ជីលក់សរុប (ការលក់ទាំងអស់) រួចសម្អាតតុសម្រាប់ភ្ញៀវថ្មី"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>រៀបតុថ្មី (ភ្ញៀវថ្មី)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCheckout}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-sm sm:text-base transition-colors shadow-lg shadow-amber-500/20 min-h-[50px] sm:min-h-[54px]"
                  >
                    <Receipt className="w-5 h-5" />
                    <span>គិតលុយ & បោះពុម្ព</span>
                    <ChevronRight className="w-5 h-5 ml-auto hidden sm:inline" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-100">
                    គិតលុយ & រៀបតុថ្មី: <span className="text-amber-400">{currentTable}</span>
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    បញ្ចប់ការលក់ គិតលុយរួចរាល់ និងរៀបចំសម្រាប់ភ្ញៀវថ្មីនៅ {currentTable} ដដែល
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1.5 rounded-xl hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total due */}
            <div className="p-4 bg-neutral-850 rounded-2xl border border-neutral-800 text-center space-y-1">
              <div className="text-xs sm:text-sm text-neutral-400 font-medium">ទឹកប្រាក់ត្រូវទូទាត់ ({currentTable})</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
                {formatKHR(totalAmount)}
              </div>
            </div>

            {/* Payment Method Selector - ENLARGED BUTTONS */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-neutral-300">វិធីទូទាត់:</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-bold transition-all min-h-[64px] ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                      : 'bg-neutral-850 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-1" />
                  <span>សាច់ប្រាក់សុទ្ធ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('khqr')}
                  className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-bold transition-all min-h-[64px] ${
                    paymentMethod === 'khqr'
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                      : 'bg-neutral-850 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-1" />
                  <span>ស្កេន KHQR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-bold transition-all min-h-[64px] ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                      : 'bg-neutral-850 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span>កាតធនាគារ</span>
                </button>
              </div>
            </div>

            {/* If Cash payment */}
            {paymentMethod === 'cash' ? (
              <div className="space-y-2.5">
                <div>
                  <label className="text-xs sm:text-sm text-neutral-300 block mb-1 font-semibold">
                    ប្រាក់ទទួលពីអតិថិជន (៛):
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={cashReceived || ''}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 bg-neutral-850 border border-neutral-700 rounded-xl px-4 text-base sm:text-lg text-neutral-100 font-black focus:outline-none focus:border-amber-500 tabular-nums shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[totalAmount, 20000, 40000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCashReceived(val)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold text-neutral-200 transition-colors"
                    >
                      {formatKHR(val)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-850 rounded-xl border border-neutral-800 text-xs sm:text-sm">
                  <span className="text-neutral-400 font-semibold">ប្រាក់អាប់ជូន:</span>
                  <span
                    className={`font-black text-sm sm:text-base tabular-nums ${
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
              <div className="p-4 bg-neutral-850 rounded-2xl border border-neutral-800 text-center space-y-2">
                <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-md">
                  <div className="text-center">
                    <QrCode className="w-28 h-28 text-neutral-900 mx-auto" />
                    <div className="text-[9px] font-bold text-red-600">KHQR PAY</div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-neutral-200 font-bold">ស្កេនទូទាត់ {formatKHR(totalAmount)}</p>
              </div>
            ) : (
              <div className="p-4 bg-neutral-850 rounded-2xl border border-neutral-800 text-center text-xs sm:text-sm text-neutral-300 font-medium">
                សូមរៀបចំម៉ាស៊ីន POS ឬប៉ះកាត (Tap to Pay)
              </div>
            )}

            {/* Notice regarding table reset */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                ក្រោយពីគិតលុយរួច បញ្ជីលក់នឹងត្រូវចម្លងទៅ <strong>«បញ្ជីលក់សរុប (របាយការណ៍)»</strong> ហើយតុ <strong>{currentTable}</strong> នឹងត្រូវបានរៀបចំឱ្យនៅទំនេរស្អាត សម្រាប់ទទួលភ្ញៀវថ្មីនៅតុនោះដដែល។
              </span>
            </div>

            {/* Confirm Checkout Buttons - ENLARGED BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="px-4 py-3 sm:py-3.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs sm:text-sm font-bold transition-colors min-h-[46px] sm:min-h-[50px]"
              >
                ត្រឡប់ក្រោយ
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCheckout(false)}
                disabled={paymentMethod === 'cash' && cashReceived < totalAmount}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs sm:text-sm font-extrabold transition-colors shadow-md shadow-emerald-600/20 min-h-[46px] sm:min-h-[50px]"
              >
                <UserCheck className="w-5 h-5" />
                <span>គិតលុយរួច & រៀបតុថ្មី</span>
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCheckout(true)}
                disabled={paymentMethod === 'cash' && cashReceived < totalAmount}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-neutral-950 text-xs sm:text-sm font-extrabold transition-colors shadow-md shadow-amber-500/20 min-h-[46px] sm:min-h-[50px]"
              >
                <Printer className="w-5 h-5" />
                <span>គិតលុយ & បោះពុម្ព</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Item Note Modal */}
      {noteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <StickyNote className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-neutral-100">
                    កំណត់ចំណាំមុខម្ហូប
                  </h3>
                  <p className="text-xs text-amber-400 font-medium">
                    {noteModalItem.item.name} ({currentTable})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNoteModalItem(null)}
                className="text-neutral-400 hover:text-neutral-200 p-1.5 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                សរសេរចំណាំ ឬជ្រើសរើសពីជម្រើសរហ័ស:
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={noteModalText}
                  onChange={(e) => setNoteModalText(e.target.value)}
                  placeholder="ឧ. មិនហិរ, ថែមបាយ, ផ្អែមតិច, ខ្ចប់..."
                  className="w-full bg-neutral-850 border border-neutral-700 rounded-xl pl-3.5 pr-8 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 font-medium transition-colors"
                />
                {noteModalText && (
                  <button
                    type="button"
                    onClick={() => setNoteModalText('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1"
                    title="សម្អាត"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <div className="text-xs text-neutral-400 font-medium">
                ជម្រើសពេញនិយម (ចុចដើម្បីដាក់/ដក):
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {COMMON_ORDER_NOTES.map((chip) => {
                  const isSelected = noteModalText
                    .split(/[,，\n]+/)
                    .map((s) => s.trim().toLowerCase())
                    .includes(chip.toLowerCase());
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setNoteModalText((prev) => toggleNoteChip(prev, chip))}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 border text-center ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                          : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border-neutral-700/80 hover:border-neutral-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate">{chip}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 text-xs space-y-1">
              <span className="text-neutral-500 block">បង្ហាញលើវិក្កយបត្រ (Preview):</span>
              <div className="text-neutral-200 font-medium flex items-center gap-1.5 flex-wrap">
                <span>{noteModalItem.item.name}</span>
                {noteModalText.trim() ? (
                  <span className="text-amber-400 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                    *{noteModalText.trim()}
                  </span>
                ) : (
                  <span className="text-neutral-500 italic font-normal">(គ្មានចំណាំ)</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              {noteModalItem.item.note && (
                <button
                  type="button"
                  onClick={handleClearItemNoteModal}
                  className="px-3 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-colors min-h-[44px]"
                >
                  លុបចំណាំ
                </button>
              )}
              <button
                type="button"
                onClick={() => setNoteModalItem(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs sm:text-sm font-bold transition-colors min-h-[44px]"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleSaveItemNoteModal}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs sm:text-sm font-extrabold transition-colors shadow-md shadow-amber-500/20 min-h-[44px] flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>រក្សាទុក</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
