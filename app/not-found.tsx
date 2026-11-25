import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-neutral-100 p-4">
      <h2 className="text-2xl font-bold mb-4">រកមិនឃើញទំព័រ (404)</h2>
      <p className="text-neutral-400 mb-6">ទំព័រដែលលោកអ្នកកំពុងស្វែងរកមិនមានឡើយ។</p>
      <Link
        href="/"
        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-medium rounded-lg transition-colors"
      >
        ត្រឡប់ទៅទំព័រដើម
      </Link>
    </div>
  );
}
