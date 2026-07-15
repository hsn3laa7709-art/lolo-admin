import React, { useEffect, useState } from 'react';
import { getStoreSettings, updateStoreSettings } from '../services/firestoreService';
import { 
  Settings, 
  Truck, 
  Megaphone, 
  Plus, 
  Trash2, 
  Save, 
  Check,
  AlertCircle
} from 'lucide-react';

const defaultGovernorates = [
  { name: 'القاهرة', shipping: 50, active: true },
  { name: 'الجيزة', shipping: 50, active: true },
  { name: 'الإسكندرية', shipping: 60, active: true },
  { name: 'القليوبية', shipping: 60, active: true },
  { name: 'الدقهلية', shipping: 70, active: true },
  { name: 'الغربية', shipping: 70, active: true },
  { name: 'الشرقية', shipping: 70, active: true },
  { name: 'المنوفية', shipping: 70, active: true },
  { name: 'البحيرة', shipping: 70, active: true },
  { name: 'كفر الشيخ', shipping: 70, active: true },
  { name: 'دمياط', shipping: 80, active: true },
  { name: 'بورسعيد', shipping: 80, active: true },
  { name: 'الإسماعيلية', shipping: 80, active: true },
  { name: 'السويس', shipping: 80, active: true },
  { name: 'الفيوم', shipping: 80, active: true },
  { name: 'بني سويف', shipping: 80, active: true },
  { name: 'المنيا', shipping: 90, active: true },
  { name: 'أسيوط', shipping: 90, active: true },
  { name: 'سوهاج', shipping: 90, active: true },
  { name: 'قنا', shipping: 100, active: true },
  { name: 'الأقصر', shipping: 100, active: true },
  { name: 'أسوان', shipping: 100, active: true },
  { name: 'البحر الأحمر', shipping: 100, active: true },
  { name: 'مطروح', shipping: 100, active: true },
  { name: 'الوادي الجديد', shipping: 100, active: true },
  { name: 'شمال سيناء', shipping: 100, active: true },
  { name: 'جنوب سيناء', shipping: 100, active: true }
];

const defaultAnnouncements = [
  { ar: 'شحن سريع لجميع المحافظات 🚚', en: 'Fast shipping to all governorates 🚚' },
  { ar: 'اكتشفي أحدث كوليكشن ملابس LOLO STORE 🎀', en: 'Discover the latest collection of LOLO STORE 🎀' },
  { ar: 'تسوقي الآن واستمتعي بخصومات تصل إلى 30% ✨', en: 'Shop now and enjoy discounts up to 30% ✨' }
];

export default function SettingsTab() {
  const [governorates, setGovernorates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newAnnouncementAr, setNewAnnouncementAr] = useState('');
  const [newAnnouncementEn, setNewAnnouncementEn] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError('');
        const data = await getStoreSettings();
        if (data) {
          setGovernorates(data.governorates && data.governorates.length > 0 ? data.governorates : defaultGovernorates);
          setAnnouncements(data.announcements && data.announcements.length > 0 ? data.announcements : defaultAnnouncements);
        } else {
          setGovernorates(defaultGovernorates);
          setAnnouncements(defaultAnnouncements);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('تعذر جلب الإعدادات المخصصة من السيرفر (قد يكون بسبب قيود الصلاحيات). تم تحميل الإعدادات الافتراضية مؤقتاً.');
        setGovernorates(defaultGovernorates);
        setAnnouncements(defaultAnnouncements);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleShippingChange = (index, value) => {
    const updated = [...governorates];
    updated[index].shipping = Number(value) || 0;
    setGovernorates(updated);
  };

  const handleActiveToggle = (index, isChecked) => {
    const updated = [...governorates];
    updated[index].active = isChecked;
    setGovernorates(updated);
  };

  const handleAnnouncementChange = (index, field, value) => {
    const updated = [...announcements];
    const current = updated[index];
    if (typeof current === 'object' && current !== null) {
      updated[index] = { ...current, [field]: value };
    } else {
      // Legacy string fallback
      updated[index] = { ar: field === 'ar' ? value : current, en: field === 'en' ? value : '' };
    }
    setAnnouncements(updated);
  };

  const deleteAnnouncement = (index) => {
    setAnnouncements(prev => prev.filter((_, idx) => idx !== index));
  };

  const addAnnouncement = () => {
    if (!newAnnouncementAr.trim() && !newAnnouncementEn.trim()) return;
    setAnnouncements(prev => [...prev, { ar: newAnnouncementAr.trim(), en: newAnnouncementEn.trim() }]);
    setNewAnnouncementAr('');
    setNewAnnouncementEn('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateStoreSettings({
        governorates,
        announcements
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الإعدادات، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <svg className="animate-spin h-6 w-6 text-[#A96F6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up text-right">
      {/* Tab Header */}
      <div className="flex justify-between items-center border-b border-[#D8CFC0] pb-4 flex-wrap gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#A96F6B] hover:bg-[#8F5B58] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : saveSuccess ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          <span>{saveSuccess ? 'تم الحفظ بنجاح!' : 'حفظ الإعدادات بالكامل'}</span>
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold font-serif">إعدادات المتجر العامة</h2>
          <Settings className="text-[#A96F6B]" size={24} />
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-2 justify-end">
          <span>تم تحديث أسعار الشحن ونصوص شريط الإعلانات بنجاح ومزامنتها مع المتجر.</span>
          <Check size={16} className="shrink-0" />
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-2xl flex items-center gap-2 justify-end">
          <span>{error}</span>
          <AlertCircle size={16} className="shrink-0" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Announcement bar control */}
        <div className="space-y-6">
          <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EDE7D9] pb-3 justify-end">
              <h3 className="text-md font-bold font-serif text-[#30343B]">شريط الإعلانات المتحرك</h3>
              <Megaphone size={18} className="text-[#A96F6B]" />
            </div>

            {/* Existing Announcements List */}
            <div className="space-y-3">
              {announcements.map((ann, idx) => {
                const isObj = typeof ann === 'object' && ann !== null;
                const valAr = isObj ? (ann.ar || '') : ann;
                const valEn = isObj ? (ann.en || '') : '';
                return (
                  <div key={idx} className="flex flex-col gap-2 p-3 bg-[#F7F3EA]/35 border border-[#D8CFC0] rounded-2xl">
                    <div className="flex gap-2 items-start">
                      <button
                        onClick={() => deleteAnnouncement(idx)}
                        className="p-2.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-bold cursor-pointer shrink-0 mt-1"
                        type="button"
                        title="حذف هذا الإعلان"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="flex-grow space-y-1.5">
                        <div className="flex gap-1.5 items-center">
                          <span className="text-[10px] text-[#77736D] w-12 text-left shrink-0">العربية:</span>
                          <input
                            type="text"
                            value={valAr}
                            onChange={(e) => handleAnnouncementChange(idx, 'ar', e.target.value)}
                            placeholder="الإعلان بالعربية"
                            className="w-full px-3 py-1.5 bg-[#FFFCF7] border border-[#D8CFC0] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#A96F6B]"
                          />
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <span className="text-[10px] text-[#77736D] w-12 text-left shrink-0">English:</span>
                          <input
                            type="text"
                            value={valEn}
                            onChange={(e) => handleAnnouncementChange(idx, 'en', e.target.value)}
                            placeholder="Announcement in English"
                            dir="ltr"
                            className="w-full px-3 py-1.5 bg-[#FFFCF7] border border-[#D8CFC0] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#A96F6B]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {announcements.length === 0 && (
                <p className="text-xs text-[#77736D] text-center py-4">لا توجد إعلانات نشطة حالياً. شريط الإعلانات في المتجر سيكون فارغاً.</p>
              )}
            </div>

            {/* Add New Announcement form */}
            <div className="pt-3 border-t border-[#EDE7D9] space-y-3">
              <label className="text-xs font-bold text-[#77736D] block">إضافة إعلان جديد</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="نص الإعلان بالعربية..."
                  value={newAnnouncementAr}
                  onChange={(e) => setNewAnnouncementAr(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-xs focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="English announcement text..."
                  value={newAnnouncementEn}
                  onChange={(e) => setNewAnnouncementEn(e.target.value)}
                  dir="ltr"
                  className="w-full px-3 py-2 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-xs focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={addAnnouncement}
                className="w-full bg-[#A96F6B] hover:bg-[#8F5B58] text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold text-xs"
              >
                <Plus size={14} />
                <span>إضافة الإعلان</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Shipping settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#FFFCF7] border border-[#D8CFC0] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EDE7D9] pb-3 justify-end">
              <h3 className="text-md font-bold font-serif text-[#30343B]">أسعار شحن المحافظات</h3>
              <Truck size={18} className="text-[#A96F6B]" />
            </div>

            <p className="text-xs text-[#77736D] leading-relaxed">
              قم بتعديل تكلفة الشحن أمام كل محافظة. سيتم تطبيق هذه التكاليف فوراً في صفحة إتمام الطلب عند قيام العميل باختيار محافظته.
            </p>

            {/* Governorates grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {governorates.map((gov, idx) => (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center border rounded-2xl p-3 gap-3 transition-all ${
                    gov.active !== false 
                      ? 'bg-[#F7F3EA]/30 border-[#D8CFC0]' 
                      : 'bg-gray-100/50 border-gray-200 opacity-60'
                  }`}
                >
                  {/* Left Side: Price Input */}
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#30343B]">
                    <span>EGP</span>
                    <input
                      type="number"
                      value={gov.shipping}
                      onChange={(e) => handleShippingChange(idx, e.target.value)}
                      disabled={gov.active === false}
                      className="w-20 px-2 py-1 bg-[#FFFCF7] border border-[#D8CFC0] rounded-lg text-sm text-center focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      min="0"
                    />
                  </div>
                  
                  {/* Right Side: Toggle Switch + Name */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${gov.active !== false ? 'text-[#30343B]' : 'text-gray-400 line-through'}`}>
                      {gov.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={gov.active !== false}
                      onChange={(e) => handleActiveToggle(idx, e.target.checked)}
                      className="w-4 h-4 text-[#A96F6B] border-[#D8CFC0] rounded focus:ring-[#A96F6B] cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
