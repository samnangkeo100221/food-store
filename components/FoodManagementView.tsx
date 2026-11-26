'use client';

import React, { useState, useMemo } from 'react';
import { FoodItem } from '@/lib/types';
import { formatKHR, extractInitialLetter, createFoodPlaceholderSvg } from '@/lib/data';
import CameraModal from './CameraModal';
import {
  Plus,
  Edit2,
  Trash2,
  Camera,
  Upload,
  Search,
  Check,
  X,
  TrendingUp,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface FoodManagementViewProps {
  foodItems: FoodItem[];
  onAddFood: (food: FoodItem) => void;
  onUpdateFood: (food: FoodItem) => void;
  onDeleteFood: (id: string) => void;
  onResetDefaultFoods: () => void;
  isAddModalOpenInitially?: boolean;
}

export default function FoodManagementView({
  foodItems,
  onAddFood,
  onUpdateFood,
  onDeleteFood,
  onResetDefaultFoods,
  isAddModalOpenInitially = false,
}: FoodManagementViewProps) {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('បាយ និង ឆា');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [initialLetter, setInitialLetter] = useState('');
  const [image, setImage] = useState('');
  const [costPrice, setCostPrice] = useState<number>(5000);
  const [sellingPrice, setSellingPrice] = useState<number>(10000);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ទាំងអស់');

  // Existing categories
  const categories = useMemo(() => {
    const defaultCats = ['បាយ និង ឆា', 'ស៊ុប និង សម្ល', 'គុយទាវ និង មី', 'ភេសជ្ជៈ', 'បង្អែម'];
    const uniqueFromItems = Array.from(new Set(foodItems.map((f) => f.category)));
    return Array.from(new Set([...defaultCats, ...uniqueFromItems]));
  }, [foodItems]);

  // Open modal for new food
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setCategory(categories[0] || 'បាយ និង ឆា');
    setIsCustomCategory(false);
    setCustomCategory('');
    setInitialLetter('');
    setImage(createFoodPlaceholderSvg('មុខម្ហូបថ្មី', 'បាយ និង ឆា', '#b45309'));
    setCostPrice(5000);
    setSellingPrice(10000);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (item: FoodItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setIsCustomCategory(false);
    setCustomCategory('');
    setInitialLetter(item.initialLetter || extractInitialLetter(item.name));
    setImage(item.image);
    setCostPrice(item.costPrice);
    setSellingPrice(item.sellingPrice);
    setIsModalOpen(true);
  };

  // Handle Name change with auto-deriving initial letter
  const handleNameChange = (val: string) => {
    setName(val);
    const letter = extractInitialLetter(val);
    setInitialLetter(letter);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture callback
  const handleCameraCapture = (capturedDataUrl: string) => {
    setImage(capturedDataUrl);
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const effectiveCategory = isCustomCategory && customCategory.trim() ? customCategory.trim() : category;
    const effectiveInitialLetter = initialLetter.trim() || extractInitialLetter(name);
    const effectiveImage = image || createFoodPlaceholderSvg(name, effectiveCategory, '#b45309');

    if (isEditing && editingId) {
      const updatedItem: FoodItem = {
        id: editingId,
        name: name.trim(),
        category: effectiveCategory,
        initialLetter: effectiveInitialLetter,
        image: effectiveImage,
        costPrice: Math.max(0, Number(costPrice) || 0),
        sellingPrice: Math.max(0, Number(sellingPrice) || 0),
        createdAt: Date.now(),
      };
      onUpdateFood(updatedItem);
    } else {
      const newItem: FoodItem = {
        id: 'food-' + Date.now(),
        name: name.trim(),
        category: effectiveCategory,
        initialLetter: effectiveInitialLetter,
        image: effectiveImage,
        costPrice: Math.max(0, Number(costPrice) || 0),
        sellingPrice: Math.max(0, Number(sellingPrice) || 0),
        createdAt: Date.now(),
      };
      onAddFood(newItem);
    }

    setIsModalOpen(false);
  };

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return foodItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ទាំងអស់' || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        item.initialLetter.includes(searchQuery.trim());
      return matchesCategory && matchesSearch;
    });
  }, [foodItems, selectedCategory, searchQuery]);

  const unitProfit = sellingPrice - costPrice;
  const marginPercent = sellingPrice > 0 ? ((unitProfit / sellingPrice) * 100).toFixed(0) : '0';

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-neutral-850 border border-neutral-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-neutral-100 flex items-center gap-2">
            <span>ទំព័រគ្រប់គ្រងមុខម្ហូប (Food Items & Menu)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
              {foodItems.length} មុខ
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            សម្រាប់បញ្ចូល, កែប្រែ, និងលុបមុខម្ហូប ឬភេសជ្ជៈ ជាមួយថ្លៃដើម និងថ្លៃលក់
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDefaultFoods}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-neutral-100 transition-colors whitespace-nowrap"
            title="កំណត់បញ្ជីមុខម្ហូបគំរូឡើងវិញ"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">កំណត់ឡើងវិញ</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-amber-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>បញ្ចូលមុខម្ហូបថ្មី</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះមុខម្ហូប ឬអក្សរដំបូង..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ទាំងអស់')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors min-h-[40px] flex items-center justify-center ${
              selectedCategory === 'ទាំងអស់'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            ទាំងអស់ ({foodItems.length})
          </button>
          {categories.map((cat) => {
            const count = foodItems.filter((f) => f.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors min-h-[40px] flex items-center justify-center ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Foods Table / Grid */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/60 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">រូបភាព & ឈ្មោះម្ហូប</th>
                <th className="py-3 px-3 font-semibold">ប្រភេទ</th>
                <th className="py-3 px-2 font-semibold text-center">អក្សរដំបូង</th>
                <th className="py-3 px-3 font-semibold text-right">ថ្លៃដើម</th>
                <th className="py-3 px-3 font-semibold text-right">ថ្លៃលក់</th>
                <th className="py-3 px-3 font-semibold text-right">ចំណេញ/ចាន</th>
                <th className="py-3 px-4 font-semibold text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs">
                    មិនមានមុខម្ហូបណាត្រូវនឹងការស្វែងរកនេះទេ។
                  </td>
                </tr>
              ) : (
                filteredFoods.map((food) => {
                  const profit = food.sellingPrice - food.costPrice;
                  const profitMargin =
                    food.sellingPrice > 0 ? ((profit / food.sellingPrice) * 100).toFixed(0) : '0';

                  return (
                    <tr key={food.id} className="hover:bg-neutral-800/40 transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-neutral-900 overflow-hidden shrink-0 border border-neutral-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={food.image}
                              alt={food.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-100 block">
                              {food.name}
                            </span>
                            <span className="text-[11px] text-neutral-500">
                              កូដ: #{food.id.slice(-4)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-neutral-300">
                        <span className="text-xs">{food.category}</span>
                      </td>

                      {/* Initial Letter */}
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-700 text-amber-400 font-bold text-xs">
                          {food.initialLetter || food.name.charAt(0)}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-3 text-right tabular-nums text-neutral-400">
                        {formatKHR(food.costPrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-neutral-100">
                        {formatKHR(food.sellingPrice)}
                      </td>

                      {/* Profit per item */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span className="font-semibold text-emerald-400 block">
                          +{formatKHR(profit)}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {profitMargin}% margin
                        </span>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(food)}
                            className="p-2 rounded-xl border border-neutral-700 text-neutral-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-neutral-800 transition-colors shadow-sm"
                            title="កែប្រែមុខម្ហូប (Edit)"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`តើអ្នកពិតជាចង់លុបមុខម្ហូប "${food.name}" នេះមែនទេ?`)) {
                                onDeleteFood(food.id);
                              }
                            }}
                            className="p-2 rounded-xl border border-neutral-700 text-neutral-400 hover:text-red-400 hover:border-red-500/50 hover:bg-neutral-800 transition-colors shadow-sm"
                            title="លុបមុខម្ហូប (Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-100">
                {isEditing ? 'កែប្រែមុខម្ហូប' : 'បញ្ចូលមុខម្ហូបថ្មី'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Name & Initial Letter */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    ឈ្មោះទំនិញ / មុខម្ហូប <span className="text-red-400">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="ឧ. បាយឆាសាច់គោ, អាម៉ុកត្រី..."
                    className="w-full bg-neutral-850 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-neutral-300" title="អក្សរដំបូងសម្រាប់ច្រោះ">
                    អក្សរដំបូង:
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={initialLetter}
                    onChange={(e) => setInitialLetter(e.target.value)}
                    placeholder="ក, ខ, ប..."
                    className="w-full text-center font-bold bg-neutral-850 border border-neutral-700 rounded-xl px-2 py-2 text-xs sm:text-sm text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 2: Category */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300">ប្រភេទ (Category):</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    {isCustomCategory ? 'ជ្រើសរើសពីបញ្ជី' : '+ បង្កើតប្រភេទថ្មី'}
                  </button>
                </div>
                {isCustomCategory ? (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="វាយបញ្ចូលឈ្មោះប្រភេទថ្មី..."
                    className="w-full bg-neutral-850 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-850 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Row 3: Image with Camera & Upload buttons */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300">
                  រូបភាពមុខម្ហូប (ថតរូបពីកាមេរ៉ា ឬ Upload):
                </label>
                <div className="flex items-center gap-3">
                  {/* Image Preview Box */}
                  <div className="relative w-20 h-20 rounded-xl bg-neutral-850 border border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-neutral-600" />
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Take Photo with Camera */}
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-500" />
                        <span>ថតរូប (Camera)</span>
                      </button>

                      {/* Upload File */}
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-amber-500" />
                        <span>Upload រូបភាព</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setImage(createFoodPlaceholderSvg(name || 'មុខម្ហូប', category, '#b45309'))
                      }
                      className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      បង្កើតរូបគំនូរស្វ័យប្រវត្តិ (Generate Illustration)
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Cost Price & Selling Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">ថ្លៃដើម (Cost Price ៛):</label>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-850 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-100 tabular-nums focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    ថ្លៃលក់ (Selling Price ៛) <span className="text-red-400">*</span>:
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-850 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-amber-400 font-bold tabular-nums focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Real-time Profit Preview Box */}
              <div className="p-3 bg-neutral-850 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ចំណេញប៉ាន់ស្មាន:
                </span>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 tabular-nums">
                    +{formatKHR(unitProfit)}
                  </span>
                  <span className="text-[11px] text-neutral-400 ml-1.5">
                    ({marginPercent}% margin)
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលមុខម្ហូប'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
