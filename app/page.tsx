'use client';

import React, { useState, useSyncExternalStore, useMemo } from 'react';
import { FoodItem, OrderItem, SaleReceipt, ViewMode } from '@/lib/types';
import { INITIAL_FOOD_ITEMS, INITIAL_SALES_RECEIPTS } from '@/lib/data';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import POSView from '@/components/POSView';
import FoodManagementView from '@/components/FoodManagementView';
import ReportsView from '@/components/ReportsView';
import ReceiptModal from '@/components/ReceiptModal';

const FOOD_STORAGE_KEY = 'chak_mey_pos_foods_v2';
const RECEIPT_STORAGE_KEY = 'chak_mey_pos_receipts_v2';
const TABLE_ORDERS_STORAGE_KEY = 'chak_mey_pos_table_orders_v2';

const emptySubscribe = () => () => {};

// Initial sample table orders
const INITIAL_TABLE_ORDERS: Record<string, OrderItem[]> = {
  'តុ ១': [
    {
      itemId: 'food-1',
      name: 'បាយឆាសាច់គោ',
      category: 'បាយ និង ឆា',
      initialLetter: 'ប',
      image: '',
      costPrice: 8000,
      sellingPrice: 14000,
      quantity: 2,
    },
    {
      itemId: 'food-10',
      name: 'កាហ្វេទឹកដោះគោទឹកកក',
      category: 'ភេសជ្ជៈ',
      initialLetter: 'ក',
      image: '',
      costPrice: 2000,
      sellingPrice: 5000,
      quantity: 2,
    },
  ],
  'តុ ៣': [
    {
      itemId: 'food-3',
      name: 'ឡុកឡាក់សាច់គោបារាំង',
      category: 'បាយ និង ឆា',
      initialLetter: 'ឡ',
      image: '',
      costPrice: 10000,
      sellingPrice: 18000,
      quantity: 1,
    },
    {
      itemId: 'food-11',
      name: 'តែក្រូចឆ្មារទឹកកក',
      category: 'ភេសជ្ជៈ',
      initialLetter: 'ត',
      image: '',
      costPrice: 1800,
      sellingPrice: 4500,
      quantity: 2,
    },
  ],
};

export default function HomePage() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [currentView, setCurrentView] = useState<ViewMode>('pos');

  // Active selected table for ordering ('តុ ១', 'តុ ២', ...)
  const [activeTable, setActiveTable] = useState<string>('តុ ១');

  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(FOOD_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load foods:', e);
      }
    }
    return INITIAL_FOOD_ITEMS;
  });

  // Table-by-table active orders
  const [ordersByTable, setOrdersByTable] = useState<Record<string, OrderItem[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(TABLE_ORDERS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load table orders:', e);
      }
    }
    return INITIAL_TABLE_ORDERS;
  });

  const [salesReceipts, setSalesReceipts] = useState<SaleReceipt[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECEIPT_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load receipts:', e);
      }
    }
    return INITIAL_SALES_RECEIPTS;
  });

  // Newly completed sale for receipt preview
  const [completedReceipt, setCompletedReceipt] = useState<SaleReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Number of currently occupied tables
  const occupiedTableCount = useMemo(() => {
    return Object.values(ordersByTable).filter((items) => items && items.length > 0).length;
  }, [ordersByTable]);

  // Save food items to localStorage
  const handleUpdateFoodItems = (items: FoodItem[]) => {
    setFoodItems(items);
    try {
      localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save foods to localStorage:', e);
    }
  };

  const handleAddFood = (newItem: FoodItem) => {
    const updated = [newItem, ...foodItems];
    handleUpdateFoodItems(updated);
  };

  const handleUpdateFood = (updatedItem: FoodItem) => {
    const updated = foodItems.map((f) => (f.id === updatedItem.id ? updatedItem : f));
    handleUpdateFoodItems(updated);
  };

  const handleDeleteFood = (id: string) => {
    const updated = foodItems.filter((f) => f.id !== id);
    handleUpdateFoodItems(updated);
    // Remove from all active table orders if present
    setOrdersByTable((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((tbl) => {
        next[tbl] = next[tbl].filter((it) => it.itemId !== id);
      });
      try {
        localStorage.setItem(TABLE_ORDERS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleResetDefaultFoods = () => {
    if (confirm('តើលោកអ្នកពិតជាចង់កំណត់មុខម្ហូបដើមឡើងវិញមែនទេ? (មុខម្ហូបបន្ថែមដោយខ្លួនឯងនឹងត្រូវលុប)')) {
      handleUpdateFoodItems(INITIAL_FOOD_ITEMS);
    }
  };

  // Update order items for a specific table
  const handleUpdateTableOrder = (table: string, newItems: OrderItem[]) => {
    setOrdersByTable((prev) => {
      const next = { ...prev, [table]: newItems };
      try {
        localStorage.setItem(TABLE_ORDERS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save table order:', e);
      }
      return next;
    });
  };

  // Complete Sale for a table (ចម្លងទៅបញ្ជីលក់សរុប)
  const handleCompleteSale = (receipt: SaleReceipt, showModal: boolean = true) => {
    const updatedReceipts = [receipt, ...salesReceipts];
    setSalesReceipts(updatedReceipts);
    try {
      localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(updatedReceipts));
    } catch (e) {
      console.warn('Failed to save sale receipt to localStorage:', e);
    }
    // Set completed receipt
    setCompletedReceipt(receipt);
    if (showModal) {
      setIsReceiptModalOpen(true);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-400 text-sm font-['Kantumruy_Pro',sans-serif]">
        កំពុងដំណើរការកម្មវិធី អាហារដ្ឋាន ចឹកមី...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-['Kantumruy_Pro',sans-serif]">
      {/* Top Header */}
      <Navbar
        currentView={currentView}
        activeTable={activeTable}
      />

      {/* Main View Area (with padding-bottom for BottomNav + safe area) */}
      <main className="flex-1 pb-28 sm:pb-24">
        {currentView === 'pos' && (
          <POSView
            foodItems={foodItems}
            ordersByTable={ordersByTable}
            activeTable={activeTable}
            onSelectTable={setActiveTable}
            onUpdateTableOrder={handleUpdateTableOrder}
            onCompleteSale={handleCompleteSale}
          />
        )}

        {currentView === 'food' && (
          <FoodManagementView
            foodItems={foodItems}
            onAddFood={handleAddFood}
            onUpdateFood={handleUpdateFood}
            onDeleteFood={handleDeleteFood}
            onResetDefaultFoods={handleResetDefaultFoods}
          />
        )}

        {currentView === 'reports' && <ReportsView salesReceipts={salesReceipts} />}
      </main>

      {/* របាទំព័រទាំងបី ដាក់មកខាងក្រោម (Bottom Navigation Bar) */}
      <BottomNav
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v);
        }}
        occupiedTableCount={occupiedTableCount}
      />

      {/* Checkout Receipt Modal */}
      <ReceiptModal
        receipt={completedReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
}
