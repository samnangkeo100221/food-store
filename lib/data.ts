import { FoodItem, SaleReceipt } from './types';

export const STORE_NAME = 'អាហារដ្ឋាន ចឹកមី';

export const DEFAULT_TABLES = [
  'តុ ១',
  'តុ ២',
  'តុ ៣',
  'តុ ៤',
  'តុ ៥',
  'តុ ៦',
  'តុ ៧',
  'តុ ៨',
  'តុ ៩',
  'តុ ១០',
  'តុ VIP',
  'ខ្ចប់ (Takeaway)',
];

export const DEFAULT_CATEGORIES = [
  'ទាំងអស់',
  'បាយ និង ឆា',
  'ស៊ុប និង សម្ល',
  'គុយទាវ និង មី',
  'ភេសជ្ជៈ',
  'បង្អែម',
];

// Helper to extract first Khmer / alphanumeric consonant
export function extractInitialLetter(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  // Return first character
  return trimmed.charAt(0);
}

export function formatKHR(amount: number): string {
  return Math.round(amount).toLocaleString('en-US') + ' ៛';
}

// Generate inline SVG food illustrations for reliable, offline-ready high-fidelity visuals
export function createFoodPlaceholderSvg(name: string, category: string, color: string): string {
  const emoji =
    category.includes('បាយ') || category.includes('ឆា')
      ? '🍚'
      : category.includes('ស៊ុប') || category.includes('សម្ល')
      ? '🍲'
      : category.includes('គុយទាវ') || category.includes('មី')
      ? '🍜'
      : category.includes('ភេសជ្ជៈ')
      ? '🥤'
      : category.includes('បង្អែម')
      ? '🍧'
      : '🍽️';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#18181b" stop-opacity="1" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <circle cx="200" cy="200" r="110" fill="url(#glow)"/>
    <circle cx="200" cy="200" r="75" fill="#27272a" stroke="#fbbf24" stroke-width="2.5" stroke-opacity="0.45"/>
    <text x="200" y="214" font-size="68" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'food-1',
    name: 'បាយឆាសាច់គោ',
    category: 'បាយ និង ឆា',
    initialLetter: 'ប',
    image: createFoodPlaceholderSvg('បាយឆាសាច់គោ', 'បាយ និង ឆា', '#b45309'),
    costPrice: 8000,
    sellingPrice: 14000,
    createdAt: Date.now() - 86400000 * 5,
    available: true,
  },
  {
    id: 'food-2',
    name: 'អាម៉ុកត្រីស្លឹកចេក',
    category: 'ស៊ុប និង សម្ល',
    initialLetter: 'អ',
    image: createFoodPlaceholderSvg('អាម៉ុកត្រីស្លឹកចេក', 'ស៊ុប និង សម្ល', '#047857'),
    costPrice: 9000,
    sellingPrice: 16000,
    createdAt: Date.now() - 86400000 * 5,
    available: true,
  },
  {
    id: 'food-3',
    name: 'ឡុកឡាក់សាច់គោបារាំង',
    category: 'បាយ និង ឆា',
    initialLetter: 'ឡ',
    image: createFoodPlaceholderSvg('ឡុកឡាក់សាច់គោបារាំង', 'បាយ និង ឆា', '#b91c1c'),
    costPrice: 10000,
    sellingPrice: 18000,
    createdAt: Date.now() - 86400000 * 4,
    available: true,
  },
  {
    id: 'food-4',
    name: 'សម្លម្ជូរគ្រឿងសាច់គោ',
    category: 'ស៊ុប និង សម្ល',
    initialLetter: 'ស',
    image: createFoodPlaceholderSvg('សម្លម្ជូរគ្រឿងសាច់គោ', 'ស៊ុប និង សម្ល', '#c2410c'),
    costPrice: 8500,
    sellingPrice: 15000,
    createdAt: Date.now() - 86400000 * 4,
    available: true,
  },
  {
    id: 'food-5',
    name: 'សម្លកកូរសាច់ជ្រូក',
    category: 'ស៊ុប និង សម្ល',
    initialLetter: 'ស',
    image: createFoodPlaceholderSvg('សម្លកកូរសាច់ជ្រូក', 'ស៊ុប និង សម្ល', '#15803d'),
    costPrice: 8000,
    sellingPrice: 15000,
    createdAt: Date.now() - 86400000 * 3,
    available: true,
  },
  {
    id: 'food-6',
    name: 'គុយទាវភ្នំពេញពិសេស',
    category: 'គុយទាវ និង មី',
    initialLetter: 'គ',
    image: createFoodPlaceholderSvg('គុយទាវភ្នំពេញពិសេស', 'គុយទាវ និង មី', '#0369a1'),
    costPrice: 6500,
    sellingPrice: 12000,
    createdAt: Date.now() - 86400000 * 3,
    available: true,
  },
  {
    id: 'food-7',
    name: 'មីឆាសាច់មាន់ពងទា',
    category: 'គុយទាវ និង មី',
    initialLetter: 'ម',
    image: createFoodPlaceholderSvg('មីឆាសាច់មាន់ពងទា', 'គុយទាវ និង មី', '#d97706'),
    costPrice: 5500,
    sellingPrice: 10000,
    createdAt: Date.now() - 86400000 * 2,
    available: true,
  },
  {
    id: 'food-8',
    name: 'បាយសាច់ជ្រូកអាំងពងទា',
    category: 'បាយ និង ឆា',
    initialLetter: 'ប',
    image: createFoodPlaceholderSvg('បាយសាច់ជ្រូកអាំងពងទា', 'បាយ និង ឆា', '#a16207'),
    costPrice: 4000,
    sellingPrice: 8000,
    createdAt: Date.now() - 86400000 * 2,
    available: true,
  },
  {
    id: 'food-9',
    name: 'ឆាក្តៅសាច់មាន់ស្រែ',
    category: 'បាយ និង ឆា',
    initialLetter: 'ឆ',
    image: createFoodPlaceholderSvg('ឆាក្តៅសាច់មាន់ស្រែ', 'បាយ និង ឆា', '#be123c'),
    costPrice: 8000,
    sellingPrice: 14000,
    createdAt: Date.now() - 86400000 * 1,
    available: true,
  },
  {
    id: 'food-10',
    name: 'កាហ្វេទឹកដោះគោទឹកកក',
    category: 'ភេសជ្ជៈ',
    initialLetter: 'ក',
    image: createFoodPlaceholderSvg('កាហ្វេទឹកដោះគោទឹកកក', 'ភេសជ្ជៈ', '#78350f'),
    costPrice: 2000,
    sellingPrice: 5000,
    createdAt: Date.now() - 86400000 * 1,
    available: true,
  },
  {
    id: 'food-11',
    name: 'តែក្រូចឆ្មារទឹកកក',
    category: 'ភេសជ្ជៈ',
    initialLetter: 'ត',
    image: createFoodPlaceholderSvg('តែក្រូចឆ្មារទឹកកក', 'ភេសជ្ជៈ', '#ca8a04'),
    costPrice: 1800,
    sellingPrice: 4500,
    createdAt: Date.now() - 86400000 * 1,
    available: true,
  },
  {
    id: 'food-12',
    name: 'តែបៃតងទឹកដោះគោ',
    category: 'ភេសជ្ជៈ',
    initialLetter: 'ត',
    image: createFoodPlaceholderSvg('តែបៃតងទឹកដោះគោ', 'ភេសជ្ជៈ', '#15803d'),
    costPrice: 2200,
    sellingPrice: 5000,
    createdAt: Date.now() - 86400000 * 1,
    available: true,
  },
  {
    id: 'food-13',
    name: 'ចេកខ្ទិះដូងក្រអូប',
    category: 'បង្អែម',
    initialLetter: 'ច',
    image: createFoodPlaceholderSvg('ចេកខ្ទិះដូងក្រអូប', 'បង្អែម', '#eab308'),
    costPrice: 1500,
    sellingPrice: 3500,
    createdAt: Date.now() - 86400000 * 1,
    available: true,
  },
  {
    id: 'food-14',
    name: 'បង្អែមបបរត្នោតគ្រាប់ឈូក',
    category: 'បង្អែម',
    initialLetter: 'ប',
    image: createFoodPlaceholderSvg('បង្អែមបបរត្នោតគ្រាប់ឈូក', 'បង្អែម', '#854d0e'),
    costPrice: 2000,
    sellingPrice: 4000,
    createdAt: Date.now() - 86400000 * 1,
    available: true,
  },
];

// Seeded sample receipts for previous days
export const INITIAL_SALES_RECEIPTS: SaleReceipt[] = [
  {
    id: 'rec-1',
    invoiceNo: 'INV-20261122-001',
    timestamp: Date.now() - 86400000 * 2 - 3600000 * 4,
    tableNo: 'តុ ០១',
    items: [
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
    totalAmount: 38000,
    totalCost: 20000,
    totalProfit: 18000,
    cashReceived: 40000,
    changeAmount: 2000,
    paymentMethod: 'cash',
  },
  {
    id: 'rec-2',
    invoiceNo: 'INV-20261122-002',
    timestamp: Date.now() - 86400000 * 2 - 3600000 * 2,
    tableNo: 'តុ ០៣',
    items: [
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
        itemId: 'food-2',
        name: 'អាម៉ុកត្រីស្លឹកចេក',
        category: 'ស៊ុប និង សម្ល',
        initialLetter: 'អ',
        image: '',
        costPrice: 9000,
        sellingPrice: 16000,
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
    totalAmount: 43000,
    totalCost: 22600,
    totalProfit: 20400,
    cashReceived: 43000,
    changeAmount: 0,
    paymentMethod: 'khqr',
  },
  {
    id: 'rec-3',
    invoiceNo: 'INV-20261123-001',
    timestamp: Date.now() - 86400000 - 3600000 * 5,
    tableNo: 'តុ ០២',
    items: [
      {
        itemId: 'food-6',
        name: 'គុយទាវភ្នំពេញពិសេស',
        category: 'គុយទាវ និង មី',
        initialLetter: 'គ',
        image: '',
        costPrice: 6500,
        sellingPrice: 12000,
        quantity: 3,
      },
      {
        itemId: 'food-10',
        name: 'កាហ្វេទឹកដោះគោទឹកកក',
        category: 'ភេសជ្ជៈ',
        initialLetter: 'ក',
        image: '',
        costPrice: 2000,
        sellingPrice: 5000,
        quantity: 3,
      },
    ],
    totalAmount: 51000,
    totalCost: 25500,
    totalProfit: 25500,
    cashReceived: 60000,
    changeAmount: 9000,
    paymentMethod: 'cash',
  },
  {
    id: 'rec-4',
    invoiceNo: 'INV-20261123-002',
    timestamp: Date.now() - 86400000 - 3600000 * 1,
    tableNo: 'ខ្ចប់',
    items: [
      {
        itemId: 'food-4',
        name: 'សម្លម្ជូរគ្រឿងសាច់គោ',
        category: 'ស៊ុប និង សម្ល',
        initialLetter: 'ស',
        image: '',
        costPrice: 8500,
        sellingPrice: 15000,
        quantity: 2,
      },
      {
        itemId: 'food-8',
        name: 'បាយសាច់ជ្រូកអាំងពងទា',
        category: 'បាយ និង ឆា',
        initialLetter: 'ប',
        image: '',
        costPrice: 4000,
        sellingPrice: 8000,
        quantity: 2,
      },
      {
        itemId: 'food-13',
        name: 'ចេកខ្ទិះដូងក្រអូប',
        category: 'បង្អែម',
        initialLetter: 'ច',
        image: '',
        costPrice: 1500,
        sellingPrice: 3500,
        quantity: 2,
      },
    ],
    totalAmount: 53000,
    totalCost: 28000,
    totalProfit: 25000,
    cashReceived: 53000,
    changeAmount: 0,
    paymentMethod: 'khqr',
  },
  {
    id: 'rec-5',
    invoiceNo: 'INV-20261124-001',
    timestamp: Date.now() - 3600000 * 2,
    tableNo: 'តុ ០៥',
    items: [
      {
        itemId: 'food-1',
        name: 'បាយឆាសាច់គោ',
        category: 'បាយ និង ឆា',
        initialLetter: 'ប',
        image: '',
        costPrice: 8000,
        sellingPrice: 14000,
        quantity: 1,
      },
      {
        itemId: 'food-9',
        name: 'ឆាក្តៅសាច់មាន់ស្រែ',
        category: 'បាយ និង ឆា',
        initialLetter: 'ឆ',
        image: '',
        costPrice: 8000,
        sellingPrice: 14000,
        quantity: 1,
      },
      {
        itemId: 'food-12',
        name: 'តែបៃតងទឹកដោះគោ',
        category: 'ភេសជ្ជៈ',
        initialLetter: 'ត',
        image: '',
        costPrice: 2200,
        sellingPrice: 5000,
        quantity: 2,
      },
    ],
    totalAmount: 38000,
    totalCost: 20400,
    totalProfit: 17600,
    cashReceived: 40000,
    changeAmount: 2000,
    paymentMethod: 'cash',
  },
];
