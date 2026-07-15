import React, { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../services/firestoreService';
import { 
  FileText, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  Eye,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  X,
  Trash2
} from 'lucide-react';

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const list = await getOrders();
      setOrders(list);
      applyFilter(list, statusFilter);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (list, filter) => {
    if (filter === 'ALL') {
      setFilteredOrders(list);
    } else {
      setFilteredOrders(list.filter(o => o.status === filter));
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    applyFilter(orders, filter);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`هل أنتِ متأكدة من رغبتكِ في تغيير حالة الطلب إلى [${
      newStatus === 'PENDING' ? 'معلق' :
      newStatus === 'SHIPPED' ? 'مشحون' :
      newStatus === 'DELIVERED' ? 'تم التسليم' : 'ملغي'
    }]؟`)) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state list
      const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);
      applyFilter(updatedOrders, statusFilter);
      // Update selected order details view if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      alert('تم تحديث حالة الطلب بنجاح.');
    } catch (err) {
      alert('فشل تحديث حالة الطلب.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا الطلب نهائياً من قاعدة البيانات؟ (ملاحظة: هذا الإجراء لا يمكن التراجع عنه).')) return;
    try {
      await deleteOrder(orderId);
      const updatedOrders = orders.filter(o => o.id !== orderId);
      setOrders(updatedOrders);
      applyFilter(updatedOrders, statusFilter);
      alert('تم حذف الطلب بنجاح.');
    } catch (err) {
      alert('حدث خطأ أثناء حذف الطلب.');
    }
  };


  return (
    <div className="space-y-6 animate-fade-in-up text-right">
      {/* Header and Filter Row */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#D8CFC0] pb-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'PENDING', label: 'معلق (Pending)' },
            { id: 'SHIPPED', label: 'مشحون (Shipped)' },
            { id: 'DELIVERED', label: 'تم التسليم (Delivered)' },
            { id: 'CANCELLED', label: 'ملغي (Cancelled)' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => handleFilterChange(btn.id)}
              className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === btn.id 
                  ? 'bg-[#A96F6B] text-white border-transparent' 
                  : 'bg-[#FFFCF7] border-[#D8CFC0] text-[#30343B] hover:bg-[#EDE7D9]/30'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold font-serif">إدارة الطلبات</h2>
      </div>

      {/* Orders List Table */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-[#A96F6B]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-[#D8CFC0] bg-[#EDE7D9]/20 text-[#77736D] text-xs font-bold">
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">العميل</th>
                  <th className="p-4">المحافظة</th>
                  <th className="p-4 text-center">التاريخ</th>
                  <th className="p-4 text-center">حالة الطلب</th>
                  <th className="p-4 text-left">قيمة الطلب</th>
                  <th className="p-4 text-left w-20">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE7D9]/50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7F3EA]/10 transition-all">
                    {/* ID */}
                    <td className="p-4 font-semibold text-[#A96F6B]">{order.id}</td>

                    {/* Customer */}
                    <td className="p-4">
                      <p className="font-semibold text-[#30343B]">{order.customer?.fullName}</p>
                      <p className="text-xs text-[#77736D] mt-0.5">{order.customer?.phone}</p>
                    </td>

                    {/* Governorate */}
                    <td className="p-4 text-xs font-bold text-[#30343B]">
                      {order.customer?.governorate}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-center text-xs text-[#77736D]">
                      {order.date ? new Date(order.date.seconds * 1000).toLocaleString('ar-EG', { hour12: true }) : 'غير محدد'}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {order.status === 'PENDING' ? 'معلق' :
                         order.status === 'SHIPPED' ? 'مشحون' :
                         order.status === 'DELIVERED' ? 'تم التسليم' : 'ملغي'}
                      </span>
                    </td>

                    {/* Total Price */}
                    <td className="p-4 text-left font-bold text-[#30343B]">
                      {order.financials?.total} EGP
                    </td>

                    {/* View Details & Delete Buttons */}
                    <td className="p-4 flex items-center justify-center gap-1">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-[#A96F6B] hover:bg-[#EDE7D9]/40 border border-transparent rounded-lg transition-all cursor-pointer"
                        aria-label="View order details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-red-600 hover:bg-red-50 border border-transparent rounded-lg transition-all cursor-pointer"
                        aria-label="Delete order"
                      >
                        <Trash2 size={16} />
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
          <AlertCircle size={36} className="mx-auto opacity-30 mb-3" />
          <p className="text-sm font-semibold">لا توجد طلبات مطابقة للتصفية الحالية.</p>
        </div>
      )}

      {/* Order Details Overlay Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-[#30343B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#D8CFC0] bg-[#EDE7D9]/20 flex justify-between items-center">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#77736D] hover:bg-[#EDE7D9]/60 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold font-serif text-[#30343B]">تفاصيل الطلب: {selectedOrder.id}</h3>
            </div>

            {/* Modal Body */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Customer Details */}
                <div className="bg-[#F7F3EA]/30 border border-[#D8CFC0] rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-[#77736D] uppercase tracking-wide border-b border-[#D8CFC0]/50 pb-2">تفاصيل العميل</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-[#30343B]">{selectedOrder.customer?.fullName}</p>
                    
                    <p className="text-xs text-[#77736D] flex items-center gap-1.5 justify-end">
                      <span dir="ltr">{selectedOrder.customer?.phone}</span>
                      <Phone size={12} className="text-[#A96F6B]" />
                    </p>
                    {selectedOrder.customer?.altPhone && (
                      <p className="text-xs text-[#77736D] flex items-center gap-1.5 justify-end">
                        <span dir="ltr">{selectedOrder.customer?.altPhone}</span>
                        <Phone size={12} className="text-[#A96F6B]" />
                      </p>
                    )}
                    
                    <p className="text-xs text-[#77736D] flex items-start gap-1.5 justify-end">
                      <span className="text-left">{selectedOrder.customer?.governorate}، {selectedOrder.customer?.address}</span>
                      <MapPin size={12} className="text-[#A96F6B] shrink-0 mt-0.5" />
                    </p>
                  </div>
                </div>

                {/* Column 2: Order Metadata & Status Controls */}
                <div className="bg-[#F7F3EA]/30 border border-[#D8CFC0] rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-[#77736D] uppercase tracking-wide border-b border-[#D8CFC0]/50 pb-2">حالة الطلب والتاريخ</h4>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-[#77736D] flex items-center gap-1.5 justify-end">
                      <span>{selectedOrder.date ? new Date(selectedOrder.date.seconds * 1000).toLocaleString('ar-EG') : 'غير محدد'}</span>
                      <Calendar size={12} className="text-[#A96F6B]" />
                    </p>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#77736D] block">تغيير حالة الشحن والطلب:</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'PENDING')}
                          disabled={isUpdating}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            selectedOrder.status === 'PENDING' 
                              ? 'bg-amber-500 text-white border-transparent' 
                              : 'bg-[#FFFCF7] border-[#D8CFC0] text-[#77736D] hover:bg-[#EDE7D9]/30'
                          }`}
                        >
                          معلق (Pending)
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'SHIPPED')}
                          disabled={isUpdating}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            selectedOrder.status === 'SHIPPED' 
                              ? 'bg-blue-600 text-white border-transparent' 
                              : 'bg-[#FFFCF7] border-[#D8CFC0] text-[#77736D] hover:bg-[#EDE7D9]/30'
                          }`}
                        >
                          مشحون (Shipped)
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'DELIVERED')}
                          disabled={isUpdating}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            selectedOrder.status === 'DELIVERED' 
                              ? 'bg-green-600 text-white border-transparent' 
                              : 'bg-[#FFFCF7] border-[#D8CFC0] text-[#77736D] hover:bg-[#EDE7D9]/30'
                          }`}
                        >
                          تم التسليم
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'CANCELLED')}
                          disabled={isUpdating}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            selectedOrder.status === 'CANCELLED' 
                              ? 'bg-red-600 text-white border-transparent' 
                              : 'bg-[#FFFCF7] border-[#D8CFC0] text-[#77736D] hover:bg-[#EDE7D9]/30'
                          }`}
                        >
                          إلغاء الطلب
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Notes block */}
                <div className="bg-[#F7F3EA]/30 border border-[#D8CFC0] rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-[#77736D] uppercase tracking-wide border-b border-[#D8CFC0]/50 pb-2">ملاحظات العميل</h4>
                  <p className="text-xs text-[#30343B] leading-relaxed">
                    {selectedOrder.customer?.notes || 'لا توجد أي ملاحظات خاصة بالطلب.'}
                  </p>
                </div>
              </div>

              {/* Items List Table */}
              <div className="border border-[#D8CFC0] rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-[#EDE7D9]/20 border-b border-[#D8CFC0] text-[#77736D] font-bold">
                      <th className="p-3">المنتج</th>
                      <th className="p-3 text-center">اللون</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3 text-left">سعر القطعة</th>
                      <th className="p-3 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE7D9]/40">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F3EA]/10">
                        <td className="p-3 flex items-center gap-3">
                          <img src={item.image} alt="" className="w-8 h-10 object-cover rounded border border-[#D8CFC0]" />
                          <span className="font-semibold text-[#30343B]">{item.nameEn}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: item.color }} />
                        </td>
                        <td className="p-3 text-center font-bold">{item.quantity}</td>
                        <td className="p-3 text-left">{item.price} EGP</td>
                        <td className="p-3 text-left font-bold text-[#A96F6B]">{item.price * item.quantity} EGP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Bill Summary */}
              <div className="flex justify-start">
                <div className="w-full md:w-80 bg-[#EDE7D9]/20 border border-[#D8CFC0] rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between text-xs text-[#77736D]">
                    <span>{selectedOrder.financials?.subtotal} EGP</span>
                    <span>قيمة المشتريات:</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#77736D]">
                    <span>+{selectedOrder.financials?.shipping} EGP</span>
                    <span>تكلفة الشحن للمحافظة:</span>
                  </div>
                  {selectedOrder.financials?.discount > 0 && (
                    <div className="flex justify-between text-xs text-red-600 font-bold">
                      <span>-{selectedOrder.financials?.discount} EGP</span>
                      <span>خصم الكوبون ({selectedOrder.financials?.coupon}):</span>
                    </div>
                  )}
                  <div className="border-t border-[#D8CFC0]/50 pt-2 flex justify-between text-sm font-bold text-[#30343B]">
                    <span className="text-[#A96F6B]">{selectedOrder.financials?.total} EGP</span>
                    <span>المبلغ الإجمالي للاستلام:</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D8CFC0] bg-[#EDE7D9]/10 text-center text-[10px] text-[#77736D]">
              يرجى تحديث حالة الطلب بمجرد خروج الشحنة مع مندوب شركة التوصيل.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
