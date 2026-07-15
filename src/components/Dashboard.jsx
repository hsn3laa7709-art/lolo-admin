import React, { useState, useEffect, useRef } from 'react';
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
  FolderHeart,
  Settings
} from 'lucide-react';
import { db, rtdb } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';

// Real Sub-components imports
import DashboardOverview from './DashboardOverview';
import ProductsTab from './ProductsTab';
import OrdersTab from './OrdersTab';
import ChatTab from './ChatTab';
import CouponsTab from './CouponsTab';
import CategoriesTab from './CategoriesTab';
import SettingsTab from './SettingsTab';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  
  const sessionStartRef = useRef(Date.now());
  const prevPendingOrdersCountRef = useRef(-1);
  const lastNotifiedMsgTimesRef = useRef({});

  // Request browser notification permissions on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 1. Listen to PENDING orders in real-time
  useEffect(() => {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('status', '==', 'PENDING'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const size = snapshot.size;
      setPendingOrdersCount(size);
      
      // Dispatch browser notification if order count increased
      if (prevPendingOrdersCountRef.current !== -1 && size > prevPendingOrdersCountRef.current) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('طلب جديد وارد! 📦', {
            body: 'تم تلقي طلب أوردر جديد قيد المراجعة في لوحة التحكم.',
            icon: '/assets/logo.jpg',
            tag: 'lolo-admin-new-order'
          });
        }
      }
      prevPendingOrdersCountRef.current = size;
    }, (error) => {
      console.error("Error listening to pending orders:", error);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to active chats in RTDB to count unread customer messages
  useEffect(() => {
    const chatsRef = ref(rtdb, 'chats');
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let unreadCount = 0;
        Object.keys(data).forEach(key => {
          const room = data[key];
          if (room.active === true || room.active === undefined) {
            const messagesObj = room.messages || {};
            const msgIds = Object.keys(messagesObj);
            if (msgIds.length > 0) {
              msgIds.sort((a, b) => Number(a) - Number(b));
              const lastMsg = messagesObj[msgIds[msgIds.length - 1]];
              if (lastMsg.sender === 'user') {
                unreadCount++;
                
                // Dispatch browser notification for new message
                if (Number(lastMsg.id || 0) > sessionStartRef.current) {
                  const lastNotifiedTime = lastNotifiedMsgTimesRef.current[key] || 0;
                  if (Number(lastMsg.id || 0) > lastNotifiedTime) {
                    lastNotifiedMsgTimesRef.current[key] = Number(lastMsg.id || 0);
                    if ('Notification' in window && Notification.permission === 'granted') {
                      new Notification(`رسالة من ${room.customerName || 'عميلة'} 💬`, {
                        body: lastMsg.text,
                        icon: '/assets/logo.jpg',
                        tag: `lolo-admin-chat-${key}`
                      });
                    }
                  }
                }
              }
            }
          }
        });
        setUnreadChatsCount(unreadCount);
      } else {
        setUnreadChatsCount(0);
      }
    }, (error) => {
      console.error("Error listening to chats:", error);
    });
    return () => unsubscribe();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'لوحة الإحصائيات', icon: LayoutDashboard },
    { id: 'products', label: 'إدارة المنتجات', icon: ShoppingBag },
    { id: 'categories', label: 'إدارة الأقسام', icon: FolderHeart },
    { id: 'orders', label: 'إدارة الطلبات', icon: FileText, badge: pendingOrdersCount },
    { id: 'chat', label: 'شات الدعم الفني', icon: MessageSquare, badge: unreadChatsCount },
    { id: 'coupons', label: 'الكوبونات والخصومات', icon: Ticket },
    { id: 'settings', label: 'إعدادات المتجر', icon: Settings },
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
      case 'settings':
        return <SettingsTab />;
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right cursor-pointer ${
                  isActive 
                    ? 'bg-[#A96F6B] text-white shadow-sm' 
                    : 'text-[#77736D] hover:bg-[#EDE7D9]/40 hover:text-[#30343B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive ? 'bg-white text-[#A96F6B]' : 'bg-[#E15A5A] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
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
