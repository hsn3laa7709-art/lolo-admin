import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  MessageSquare, 
  Ticket, 
  LogOut, 
  Menu, 
  X,
  UserCheck,
  FolderHeart
} from 'lucide-react';

// Real Sub-components imports
import DashboardOverview from './DashboardOverview';
import ProductsTab from './ProductsTab';
import OrdersTab from './OrdersTab';
import ChatTab from './ChatTab';
import CouponsTab from './CouponsTab';
import CategoriesTab from './CategoriesTab';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'لوحة الإحصائيات', icon: LayoutDashboard },
    { id: 'products', label: 'إدارة المنتجات', icon: ShoppingBag },
    { id: 'categories', label: 'إدارة الأقسام', icon: FolderHeart },
    { id: 'orders', label: 'إدارة الطلبات', icon: FileText },
    { id: 'chat', label: 'شات الدعم الفني', icon: MessageSquare },
    { id: 'coupons', label: 'الكوبونات والخصومات', icon: Ticket },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  // Switch tabs renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview onTabChange={setActiveTab} />;
      case 'products':
        return <ProductsTab />;
      case 'categories':
        return <CategoriesTab />;
      case 'orders':
        return <OrdersTab />;
      case 'chat':
        return <ChatTab />;
      case 'coupons':
        return <CouponsTab />;
      default:
        return <div>التبويب غير متوفر.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#30343B] font-sans flex">
      {/* Sidebar Mobile Toggle Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-[#30343B]/30 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Layout */}
      <aside 
        className={`fixed inset-y-0 right-0 w-64 bg-[#FFFCF7] border-l border-[#D8CFC0] shadow-md z-50 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#D8CFC0] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#A96F6B] text-white flex items-center justify-center font-serif font-bold text-lg">
              L
            </div>
            <span className="font-serif font-bold tracking-wider text-[#30343B]">LOLO ADMIN</span>
          </div>
          <button className="lg:hidden p-1 text-[#77736D]" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right cursor-pointer ${
                  isActive 
                    ? 'bg-[#A96F6B] text-white shadow-sm' 
                    : 'text-[#77736D] hover:bg-[#EDE7D9]/40 hover:text-[#30343B]'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#D8CFC0]">
          <div className="flex items-center gap-3 px-3 py-2 bg-[#EDE7D9]/30 rounded-xl mb-3 text-right">
            <UserCheck size={16} className="text-[#A96F6B] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[#30343B]">أدمن المتجر</p>
              <p className="text-[10px] text-[#77736D] truncate" dir="ltr">{currentUser?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#FFFCF7] border-b border-[#D8CFC0] flex items-center justify-between px-6 shadow-sm">
          <button 
            className="lg:hidden p-2 text-[#30343B]"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          
          <div className="hidden lg:block text-xs font-bold text-[#77736D]">
            لوحة تحكم الأدمن | متجر لولو للملابس النسائية الأنيقة
          </div>

          <div className="font-serif font-bold text-[#A96F6B] text-lg tracking-wide">
            LOLO STORE
          </div>
        </header>

        {/* Content Box */}
        <main className="flex-grow p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
