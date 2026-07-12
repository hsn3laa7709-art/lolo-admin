import React, { useEffect, useState } from 'react';
import { getCoupons, addCoupon, deleteCoupon } from '../services/firestoreService';
import { 
  Ticket, 
  Trash2, 
  Plus, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [isAdding, setIsAdding] = useState(false);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const list = await getCoupons();
      setCoupons(list);
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsAdding(true);
    try {
      const generatedCode = await addCoupon({
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent)
      });
      alert(`تمت إضافة الكود [${generatedCode}] بنجاح.`);
      setCode('');
      loadCoupons();
    } catch (err) {
      alert('فشل إضافة الكوبون. قد يكون الكوبون مكرر أو هناك مشكلة اتصال.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm(`هل أنتِ متأكدة من حذف الكوبون [${couponId}] نهائياً؟`)) return;
    try {
      await deleteCoupon(couponId);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      alert('تم حذف الكوبون.');
    } catch (err) {
      alert('حدث خطأ أثناء حذف الكوبون.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-right">
      <div className="border-b border-[#D8CFC0] pb-4">
        <h2 className="text-2xl font-bold font-serif">إدارة الكوبونات والخصومات</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Panel */}
        <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl p-6 shadow-sm h-fit">
          <h3 className="text-md font-bold font-serif mb-4 flex items-center gap-2 justify-end">
            <span>إنشاء كود خصم جديد</span>
            <Ticket size={18} className="text-[#A96F6B]" />
          </h3>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#77736D] uppercase block">كود الخصم (مثال: SUPER20)</label>
              <input
                type="text"
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="LOLO10"
                className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#77736D] uppercase block">نسبة الخصم (%)</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="10"
                min="1"
                max="100"
                className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="w-full py-3 bg-[#A96F6B] hover:bg-[#8F5B58] text-white font-bold rounded-xl text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isAdding ? (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : <Plus size={14} />}
              <span>إضافة الكوبون</span>
            </button>
          </form>
        </div>

        {/* Right Listing Panel */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <svg className="animate-spin h-6 w-6 text-[#A96F6B]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : coupons.length > 0 ? (
            <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-[#D8CFC0] bg-[#EDE7D9]/20 text-[#77736D] text-xs font-bold">
                      <th className="p-4">الكود</th>
                      <th className="p-4 text-center">نسبة الخصم</th>
                      <th className="p-4 text-center">الحالة</th>
                      <th className="p-4 text-left w-20">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE7D9]/50">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-[#F7F3EA]/10 transition-all">
                        <td className="p-4 font-mono font-bold text-sm text-[#A96F6B] uppercase">{coupon.code}</td>
                        <td className="p-4 text-center font-bold text-[#30343B]">{coupon.discountPercent}%</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold">
                            <CheckCircle2 size={12} />
                            نشط
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 text-red-600 hover:bg-red-50 border border-transparent rounded-lg transition-all cursor-pointer"
                            aria-label="Delete coupon"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl p-12 text-center shadow-sm text-[#77736D]">
              <AlertCircle size={32} className="mx-auto opacity-30 mb-2" />
              <p className="text-xs font-semibold">لا توجد أي كوبونات خصم مسجلة حالياً.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
