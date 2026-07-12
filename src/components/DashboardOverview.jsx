import React, { useEffect, useState } from 'react';
import { getProducts, getOrders } from '../services/firestoreService';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function DashboardOverview({ onTabChange }) {
  const [stats, setStats] = useState({
    sales: 0,
    pendingOrders: 0,
    totalProducts: 0,
    activeChats: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [productList, orderList] = await Promise.all([
          getProducts(),
          getOrders()
        ]);

        // Calculate stats
        const totalSales = orderList
          .filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED')
          .reduce((sum, o) => sum + (o.financials?.total || 0), 0);

        const pendingCount = orderList.filter(o => o.status === 'PENDING').length;

        setStats({
          sales: totalSales,
          pendingOrders: pendingCount,
          totalProducts: productList.length,
          activeChats: 0 // Will connect to RTDB later
        });

        setRecentOrders(orderList.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-[#A96F6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const statCards = [
    {
      label: 'إجمالي المبيعات المؤكدة',
      value: `${stats.sales.toLocaleString()} EGP`,
      desc: 'مجموع الطلبات المشحونة والمستلمة',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    },
    {
      label: 'الطلبات المعلقة قيد المراجعة',
      value: `${stats.pendingOrders} طلب`,
      desc: 'طلبات جديدة تحتاج لمكالمة تأكيد',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      action: () => onTabChange('orders')
    },
    {
      label: 'عدد المنتجات النشطة',
      value: `${stats.totalProducts} منتج`,
      desc: 'المنتجات المعروضة بالكتالوج',
      icon: ShoppingBag,
      color: 'text-[#A96F6B]',
      bgColor: 'bg-[#EDE7D9]/30',
      borderColor: 'border-[#D8CFC0]',
      action: () => onTabChange('products')
    },
    {
      label: 'المحادثات النشطة حالياً',
      value: `${stats.activeChats} شات`,
      desc: 'عملاء يستفسرون في الدردشة',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      action: () => onTabChange('chat')
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up text-right">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#30343B]">لوحة الإحصائيات</h1>
        <p className="text-sm text-[#77736D] mt-1">مرحباً بك مجدداً، إليك ملخص مبيعات ونشاط المتجر اليوم.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              onClick={card.action}
              className={`bg-[#FFFCF7] border ${card.borderColor} rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all ${
                card.action ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon size={22} />
                </div>
                <span className="text-[11px] font-bold text-[#77736D] uppercase">{card.label}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-[#30343B]">{card.value}</h3>
                <p className="text-[11px] text-[#77736D] mt-1">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => onTabChange('orders')}
              className="text-xs font-bold text-[#A96F6B] hover:underline"
            >
              عرض كل الطلبات
            </button>
            <h3 className="text-lg font-bold font-serif">آخر الطلبات المستلمة</h3>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-[#EDE7D9] text-[#77736D] text-xs font-bold">
                    <th className="pb-3">رقم الطلب</th>
                    <th className="pb-3">العميل</th>
                    <th className="pb-3 text-center">المحافظة</th>
                    <th className="pb-3 text-center">الحالة</th>
                    <th className="pb-3 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7D9]/50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F7F3EA]/20 transition-all">
                      <td className="py-3 font-semibold text-[#A96F6B]">{order.id}</td>
                      <td className="py-3">
                        <p className="font-semibold text-[#30343B]">{order.customer?.fullName}</p>
                        <p className="text-[11px] text-[#77736D]">{order.customer?.phone}</p>
                      </td>
                      <td className="py-3 text-center text-xs">{order.customer?.governorate}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border border-green-200' :
                          'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {order.status === 'PENDING' ? 'معلق' :
                           order.status === 'SHIPPED' ? 'مشحون' :
                           order.status === 'DELIVERED' ? 'تم التسليم' : 'ملغي'}
                        </span>
                      </td>
                      <td className="py-3 text-left font-bold text-[#30343B]">{order.financials?.total} EGP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-[#77736D] text-xs">
              <AlertCircle size={32} className="mx-auto opacity-30 mb-3" />
              لا توجد طلبات مسجلة بعد في قاعدة البيانات.
            </div>
          )}
        </div>

        {/* Store Help/Operations Tips */}
        <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif mb-4">إرشادات سريعة للأدمن</h3>
            <div className="p-3 bg-[#EDE7D9]/30 rounded-xl text-xs leading-relaxed text-[#77736D]">
              <p className="font-bold text-[#30343B] mb-1">📞 تأكيد الطلبات هاتفياً</p>
              يُنصح بمكالمة العميل بمجرد استلام الطلب المعلق لتأكيد المقاسات وتفاصيل العنوان قبل تجهيز الشحنة.
            </div>
            <div className="p-3 bg-[#EDE7D9]/30 rounded-xl text-xs leading-relaxed text-[#77736D]">
              <p className="font-bold text-[#30343B] mb-1">🖼️ تحسين صور المنتجات</p>
              لوحة الأدمن متصلة بـ Cloudinary وتقوم بضغط الصور أوتوماتيكياً للحفاظ على سرعة تحميل متجر الموبايل.
            </div>
          </div>
          <div className="border-t border-[#EDE7D9] pt-4 mt-6 text-center text-[10px] text-[#77736D]">
            نسخة لوحة التحكم v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
