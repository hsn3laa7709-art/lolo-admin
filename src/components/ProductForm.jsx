import React, { useState, useEffect } from 'react';
import { uploadImage } from '../services/cloudinaryService';
import { getCategories } from '../services/firestoreService';
import { 
  ArrowRight, 
  UploadCloud, 
  Trash2, 
  Check, 
  Plus, 
  X,
  AlertCircle
} from 'lucide-react';

export default function ProductForm({ product, onSave, onCancel }) {
  const [dbCategories, setDbCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    price: '',
    oldPrice: '',
    discount: 0,
    category: '', // Starts empty, will be set on categories load
    description: '',
    descriptionEn: '',
    bestSeller: false,
    featured: false,
    images: [],
    colors: []
  });

  const [newColor, setNewColor] = useState('#FFFFFF');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch categories from database on mount
  useEffect(() => {
    async function loadFormCategories() {
      try {
        const list = await getCategories();
        const filteredList = list.filter(c => c.id !== 'all');
        setDbCategories(filteredList);
        // If adding a new product, set default category to first database category
        if (!product && filteredList.length > 0) {
          setFormData(prev => ({ ...prev, category: filteredList[0].id }));
        }
      } catch (err) {
        console.error('Failed to load categories for dropdown:', err);
      }
    }
    loadFormCategories();
  }, [product]);

  // Fill in data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        nameEn: product.nameEn || '',
        price: product.price || '',
        oldPrice: product.oldPrice || '',
        discount: product.discount || 0,
        category: product.category || 'Modest',
        description: product.description || '',
        descriptionEn: product.descriptionEn || '',
        bestSeller: !!product.bestSeller,
        featured: !!product.featured,
        images: product.images || [],
        colors: product.colors || []
      });
    }
  }, [product]);

  // Calculate discount automatically
  useEffect(() => {
    const price = Number(formData.price);
    const oldPrice = Number(formData.oldPrice);
    if (price > 0 && oldPrice > price) {
      const discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
      setFormData(prev => ({ ...prev, discount: discountPercent }));
    } else {
      setFormData(prev => ({ ...prev, discount: 0 }));
    }
  }, [formData.price, formData.oldPrice]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Cloudinary image upload handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadError('');
    setUploadProgress(1);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadImage(file, (percent) => {
          setUploadProgress(percent);
        });
        uploadedUrls.push(url);
      }

      setFormData(prev => ({
        ...prev,
        ...formData,
        images: [...prev.images, ...uploadedUrls]
      }));
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      setUploadError('فشل الرفع. يرجى التأكد من إعداد Upload Preset الخاص بـ Cloudinary.');
      setUploadProgress(0);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Add hex color to array
  const addColor = () => {
    if (formData.colors.includes(newColor)) return;
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, newColor]
    }));
  };

  const removeColor = (colorToRemove) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== colorToRemove)
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      alert('يرجى رفع صورة واحدة على الأقل للمنتج.');
      return;
    }
    if (formData.colors.length === 0) {
      alert('يرجى تحديد لون واحد على الأقل للمنتج.');
      return;
    }

    setIsSaving(true);
    try {
      const finalProductData = {
        ...formData,
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice) || 0,
        discount: Number(formData.discount) || 0,
        sizes: [],
        hoverImage: formData.images[1] || formData.images[0] // Set second image as hover, fallback to first
      };
      await onSave(finalProductData);
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-right">
      {/* Header Row */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#D8CFC0] pb-4">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-bold text-[#77736D] hover:text-[#30343B] bg-[#EDE7D9]/40 px-3 py-1.5 rounded-lg transition-all"
        >
          <ArrowRight size={14} />
          <span>العودة للمنتجات</span>
        </button>
        <h2 className="text-2xl font-bold font-serif">
          {product ? 'تعديل المنتج الحالي' : 'إضافة منتج جديد للمتجر'}
        </h2>
      </div>

      {/* Main Form container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Text properties */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl p-6 space-y-5 shadow-sm">
            
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#77736D] uppercase block">اسم المنتج (بالعربية)</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="بلوزة كتان بيور أنيقة"
                  className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#77736D] uppercase block">Product Name (English)</label>
                <input
                  type="text"
                  name="nameEn"
                  dir="ltr"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  placeholder="Pure Linen Blouse"
                  className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#77736D] uppercase block">السعر الحالي (EGP)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="750"
                  min="1"
                  className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#77736D] uppercase block">السعر القديم قبل الخصم (EGP)</label>
                <input
                  type="number"
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleInputChange}
                  placeholder="950 (اختياري)"
                  className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#77736D] uppercase block">نسبة الخصم المحسوبة (%)</label>
                <input
                  type="text"
                  value={`${formData.discount}%`}
                  disabled
                  className="w-full px-4 py-2.5 bg-[#EDE7D9]/50 border border-[#D8CFC0] rounded-xl text-sm text-[#77736D] font-bold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#77736D] uppercase block">التصنيف</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
              >
                {dbCategories.length > 0 ? (
                  dbCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                ) : (
                  <option value="">جاري تحميل الأقسام...</option>
                )}
              </select>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#77736D] uppercase block">وصف المنتج بالتفصيل (بالعربية)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="تفاصيل حول جودة الخامة والمقاسات وإرشادات الغسيل..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#77736D] uppercase block">Product Description (English)</label>
                <textarea
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleInputChange}
                  placeholder="Details about material quality, sizing, washing instructions..."
                  rows={4}
                  dir="ltr"
                  className="w-full px-4 py-2.5 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-sm focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Badges / Promotions */}
            <div className="flex items-center gap-6 pt-2 border-t border-[#EDE7D9]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="bestSeller"
                  checked={formData.bestSeller}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#A96F6B] border-[#D8CFC0] rounded focus:ring-[#A96F6B]"
                />
                <span className="text-xs font-semibold text-[#30343B]">تمييز كـ الأكثر مبيعاً (Best Seller)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#A96F6B] border-[#D8CFC0] rounded focus:ring-[#A96F6B]"
                />
                <span className="text-xs font-semibold text-[#30343B]">تمييز كـ منتج مميز (Featured)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Media, Colors, and Sizes */}
        <div className="space-y-6">
          
          {/* Cloudinary Gallery */}
          <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold block uppercase border-b border-[#EDE7D9] pb-2">معرض صور المنتج</h3>
            
            {/* Drag & Drop Upload Zone */}
            <label className="border-2 border-dashed border-[#D8CFC0] hover:border-[#A96F6B] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#F7F3EA]/30 transition-all text-center">
              <UploadCloud size={32} className="text-[#77736D]" />
              <span className="text-xs font-bold text-[#30343B]">اضغط لرفع صور المنتج</span>
              <span className="text-[10px] text-[#77736D]">امتدادات: JPG, PNG, WEBP (حجم أقل من 5MB)</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadProgress > 0}
              />
            </label>

            {/* Upload progress indicator */}
            {uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#A96F6B]">{uploadProgress}%</span>
                  <span>جاري رفع الصور لـ Cloudinary...</span>
                </div>
                <div className="w-full bg-[#EDE7D9] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#A96F6B] h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error alerts */}
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[11px] rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Images Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-[3/4] border border-[#D8CFC0] rounded-lg overflow-hidden bg-[#EDE7D9]/30">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700"
                      aria-label="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 right-1 text-center bg-[#A96F6B] text-white text-[8px] py-0.5 rounded">
                        صورة رئيسية
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color Selector Card */}
          <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold block uppercase border-b border-[#EDE7D9] pb-2">الألوان المتاحة</h3>
            
            <div className="flex gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-10 border border-[#D8CFC0] rounded-xl cursor-pointer"
              />
              <button
                type="button"
                onClick={addColor}
                className="flex-grow bg-[#EDE7D9] hover:bg-[#D8CFC0] text-[#30343B] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus size={14} />
                إضافة اللون
              </button>
            </div>

            {/* Render added colors list */}
            {formData.colors.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.colors.map((color, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#EDE7D9]/40 border border-[#D8CFC0] rounded-xl text-xs"
                  >
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                    <span className="font-mono text-[10px] uppercase text-[#77736D]">{color}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove color"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#77736D]">يرجى إضافة لون واحد على الأقل للمنتج.</p>
            )}
          </div>



          {/* Submit Block */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-[#A96F6B] hover:bg-[#8F5B58] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري الحفظ بقاعدة البيانات...
              </span>
            ) : (
              <>
                <Check size={16} />
                حفظ ونشر المنتج بالمتجر
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
