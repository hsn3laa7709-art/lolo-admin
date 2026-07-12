import React, { useEffect, useState } from 'react';
import { 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../services/firestoreService';
import { uploadImage } from '../services/cloudinaryService';
import { 
  Plus, 
  Edit, 
  Trash2, 
  UploadCloud, 
  X, 
  Check, 
  FolderHeart,
  AlertCircle
} from 'lucide-react';

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [image, setImage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const list = await getCategories();
      setCategories(list);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddNew = () => {
    setEditingCategory(null);
    setName('');
    setNameEn('');
    setImage('');
    setUploadError('');
    setUploadProgress(0);
    setView('add');
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setName(category.name || '');
    setNameEn(category.nameEn || '');
    setImage(category.image || '');
    setUploadError('');
    setUploadProgress(0);
    setView('edit');
  };

  const handleDelete = async (categoryId) => {
    if (categoryId === 'all') {
      alert('لا يمكن حذف قسم "كل المنتجات" لأنه قسم افتراضي للنظام.');
      return;
    }
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا القسم نهائياً؟ (ملاحظة: هذا لن يحذف المنتجات بل سيفصلها فقط عن القسم).')) return;
    try {
      await deleteCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      alert('تم حذف القسم بنجاح.');
    } catch (err) {
      alert('حدث خطأ أثناء حذف القسم.');
    }
  };

  // Cloudinary image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploadProgress(1);

    try {
      const url = await uploadImage(file, (percent) => {
        setUploadProgress(percent);
      });
      setImage(url);
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      setUploadError('فشل رفع الصورة. يرجى التأكد من إعداد Preset الخاص بـ Cloudinary.');
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('يرجى رفع صورة للقسم.');
      return;
    }

    setIsSaving(true);
    try {
      const categoryData = {
        name: name.trim(),
        nameEn: nameEn.trim(),
        image: image,
        count: editingCategory ? (editingCategory.count || 0) : 0
      };

      if (view === 'add') {
        await addCategory(categoryData);
        alert('تم إضافة القسم الجديد بنجاح.');
      } else {
        await updateCategory(editingCategory.id, categoryData);
        alert('تم تعديل القسم بنجاح.');
      }

      setView('list');
      loadCategories();
    } catch (err) {
      alert('فشل حفظ القسم. يرجى التأكد من أن حقل الاسم بالإنجليزية لا يحتوي على رموز خاصة.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-right">
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#D8CFC0] pb-4">
        {view === 'list' ? (
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#A96F6B] text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-[#8F5B58] transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>إضافة قسم جديد</span>
          </button>
        ) : (
          <button 
            onClick={() => setView('list')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#EDE7D9]/40 text-[#77736D] hover:text-[#30343B] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <span>العودة للأقسام</span>
          </button>
        )}
        <h2 className="text-2xl font-bold font-serif">إدارة الأقسام (التصنيفات)</h2>
      </div>

      {view === 'list' ? (
        loading ? (
          <div className="py-20 flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-[#A96F6B]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                {/* Category Image Cover */}
                <div className="relative aspect-video bg-[#EDE7D9]/20 overflow-hidden border-b border-[#D8CFC0]">
                  {category.image ? (
                    <img src={category.image} alt={category.nameEn} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#77736D]">
                      <FolderHeart size={32} />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-[#30343B] text-white text-[10px] font-mono px-2 py-1 rounded-md uppercase">
                    ID: {category.id}
                  </span>
                </div>

                {/* Details Block */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-[#30343B]">{category.nameEn}</h3>
                    <h4 className="text-xs text-[#77736D] mt-1 font-semibold">{category.name}</h4>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-[#EDE7D9] pt-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent rounded-lg transition-all cursor-pointer"
                        aria-label="Edit category"
                      >
                        <Edit size={14} />
                      </button>
                      {category.id !== 'all' && (
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 border border-transparent rounded-lg transition-all cursor-pointer"
                          aria-label="Delete category"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <span className="bg-[#EDE7D9]/50 text-[#77736D] px-2.5 py-1 rounded-lg font-bold">
                      {category.count || 0} منتج
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl p-12 text-center shadow-sm text-[#77736D]">
            <AlertCircle size={36} className="mx-auto opacity-30 mb-3" />
            <p className="text-sm font-semibold">لم يتم إضافة أي تصنيفات في قاعدة البيانات بعد.</p>
          </div>
        )
      ) : (
        /* Form view for Add / Edit */
        <div className="max-w-2xl mx-auto bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl p-6 shadow-sm">
          <h3 className="text-md font-bold font-serif mb-6 border-b border-[#EDE7D9] pb-3">
            {view === 'add' ? 'إضافة قسم جديد' : 'تعديل بيانات القسم'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#77736D] uppercase block">اسم القسم (بالعربية)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محتشم - Modest"
                  className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#77736D] uppercase block">Category Name (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Modest"
                  className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Category Image Uploader */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#77736D] uppercase block">صورة غلاف القسم</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="border-2 border-dashed border-[#D8CFC0] hover:border-[#A96F6B] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#F7F3EA]/30 transition-all text-center">
                  <UploadCloud size={24} className="text-[#77736D]" />
                  <span className="text-xs font-bold text-[#30343B]">اضغط لرفع غلاف القسم</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadProgress > 0}
                  />
                </label>

                {/* Image Preview Box */}
                <div className="aspect-video border border-[#D8CFC0] bg-[#EDE7D9]/20 rounded-2xl overflow-hidden flex items-center justify-center text-[#77736D] relative">
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold">معاينة الغلاف</span>
                  )}
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#A96F6B]">{uploadProgress}%</span>
                    <span>جاري الرفع لـ Cloudinary...</span>
                  </div>
                  <div className="w-full bg-[#EDE7D9] h-1 rounded-full overflow-hidden">
                    <div className="bg-[#A96F6B] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Error Alerts */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[11px] rounded-xl flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Actions Block */}
            <div className="flex gap-3 pt-4 border-t border-[#EDE7D9]">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-grow py-3 bg-[#A96F6B] hover:bg-[#8F5B58] text-white font-bold rounded-xl text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : <Check size={14} />}
                <span>حفظ التغييرات ونشر القسم</span>
              </button>
              
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-6 py-3 bg-transparent border border-[#D8CFC0] text-[#30343B] hover:bg-[#EDE7D9]/30 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
