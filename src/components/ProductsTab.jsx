import React, { useEffect, useState } from 'react';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from '../services/firestoreService';
import ProductForm from './ProductForm';
import { 
  Trash2, 
  Edit, 
  Plus, 
  Image as ImageIcon,
  AlertCircle,
  Tag
} from 'lucide-react';

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const list = await getProducts();
      setProducts(list);
    } catch (err) {
      console.error('Error loading products list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddNew = () => {
    setEditingProduct(null);
    setView('add');
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setView('edit');
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('هل أنتِ متأكدة من رغبتكِ في حذف هذا المنتج نهائياً من المتجر؟')) return;
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('تم حذف المنتج بنجاح.');
    } catch (err) {
      alert('حدث خطأ أثناء الحذف.');
    }
  };

  const handleFormSave = async (productData) => {
    try {
      if (view === 'add') {
        await addProduct(productData);
        alert('تمت إضافة المنتج بنجاح ونشره بالمتجر.');
      } else {
        await updateProduct(editingProduct.id, productData);
        alert('تم تعديل المنتج بنجاح.');
      }
      setView('list');
      loadProducts();
    } catch (err) {
      alert('فشل حفظ بيانات المنتج. يرجى مراجعة تفاصيل الاتصال بقاعدة البيانات.');
    }
  };

  if (view === 'add' || view === 'edit') {
    return (
      <ProductForm
        product={editingProduct}
        onSave={handleFormSave}
        onCancel={() => setView('list')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up text-right">
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#D8CFC0] pb-4">
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#A96F6B] text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-[#8F5B58] transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>إضافة منتج جديد</span>
        </button>
        <h2 className="text-2xl font-bold font-serif">إدارة المنتجات</h2>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-[#A96F6B]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : products.length > 0 ? (
        <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-[#D8CFC0] bg-[#EDE7D9]/20 text-[#77736D] text-xs font-bold">
                  <th className="p-4 w-20">الصورة</th>
                  <th className="p-4">اسم المنتج</th>
                  <th className="p-4 text-center">التصنيف</th>
                  <th className="p-4 text-center">السعر</th>
                  <th className="p-4 text-center">الخصم</th>
                  <th className="p-4 text-center">الترويج</th>
                  <th className="p-4 text-left w-28">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE7D9]/50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#F7F3EA]/10 transition-all">
                    {/* Image Column */}
                    <td className="p-4">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt="" 
                          className="w-12 h-16 object-cover rounded-lg border border-[#D8CFC0] bg-[#EDE7D9]/20"
                        />
                      ) : (
                        <div className="w-12 h-16 rounded-lg bg-[#EDE7D9]/50 border border-[#D8CFC0] flex items-center justify-center text-[#77736D]">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>

                    {/* Name Column */}
                    <td className="p-4">
                      <p className="font-semibold text-[#30343B] text-sm">{product.nameEn}</p>
                      <p className="text-xs text-[#77736D] mt-1">{product.name}</p>
                    </td>

                    {/* Category Column */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EDE7D9] text-[#77736D]">
                        <Tag size={10} />
                        {product.category === 'Modest' ? 'محتشم' : 'مريح'}
                      </span>
                    </td>

                    {/* Price Column */}
                    <td className="p-4 text-center">
                      <span className="font-bold text-[#30343B]">{product.price} EGP</span>
                      {product.oldPrice > 0 && (
                        <span className="block text-[11px] text-[#77736D] line-through mt-0.5">{product.oldPrice} EGP</span>
                      )}
                    </td>

                    {/* Discount Column */}
                    <td className="p-4 text-center font-bold text-red-600 text-xs">
                      {product.discount > 0 ? `-${product.discount}%` : 'لا يوجد'}
                    </td>

                    {/* Promotion Badges */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {product.bestSeller && (
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-bold rounded">
                            الاكثر مبيعاً
                          </span>
                        )}
                        {product.featured && (
                          <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[8px] font-bold rounded">
                            مميز
                          </span>
                        )}
                        {!product.bestSeller && !product.featured && (
                          <span className="text-[10px] text-[#77736D] italic">افتراضي</span>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="p-4">
                      <div className="flex items-center justify-start gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all cursor-pointer"
                          aria-label="Edit product"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                          aria-label="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
          <p className="text-sm font-semibold">لم يتم إضافة أي منتجات بالمتجر بعد.</p>
          <button 
            onClick={handleAddNew}
            className="mt-4 px-4 py-2 bg-[#A96F6B] hover:bg-[#8F5B58] text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow"
          >
            إضافة أول منتج الآن
          </button>
        </div>
      )}
    </div>
  );
}
