import React, { useEffect, useState, useRef } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { 
  Send, 
  MessageSquare, 
  User, 
  Phone,
  AlertCircle
} from 'lucide-react';

export default function ChatTab() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Listen to all active chat rooms from Realtime Database
  useEffect(() => {
    const chatsRef = ref(rtdb, 'chats');
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      setLoading(true);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const roomsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort rooms by lastMessageTime descending (most recent first)
        roomsList.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
        setRooms(roomsList);
      } else {
        setRooms([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to messages of the selected room
  useEffect(() => {
    if (!selectedRoomId) return;

    const messagesRef = ref(rtdb, `chats/${selectedRoomId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const msgsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort messages by timestamp or ID ascending
        msgsList.sort((a, b) => Number(a.id) - Number(b.id));
        setMessages(msgsList);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [selectedRoomId]);

  // Auto-scroll to bottom of chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedRoomId) return;

    const timeString = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const messageId = String(Date.now());
    const newMessageRef = ref(rtdb, `chats/${selectedRoomId}/messages/${messageId}`);

    try {
      await set(newMessageRef, {
        sender: 'support',
        text: inputMessage.trim(),
        time: timeString
      });

      // Update last message timestamp
      const lastMsgTimeRef = ref(rtdb, `chats/${selectedRoomId}/lastMessageTime`);
      await set(lastMsgTimeRef, Date.now());

      setInputMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSuggestionClick = (text) => {
    setInputMessage(text);
  };

  const activeRoom = rooms.find(r => r.id === selectedRoomId);

  return (
    <div className="h-[calc(100vh-170px)] grid grid-cols-1 md:grid-cols-3 border border-[#D8CFC0] rounded-3xl bg-[#FFFCF7] shadow-sm overflow-hidden animate-fade-in-up text-right">
      
      {/* Right Column: Chat Rooms List */}
      <div className="border-l border-[#D8CFC0] flex flex-col h-full bg-[#FFFCF7]">
        <div className="p-4 border-b border-[#D8CFC0] bg-[#EDE7D9]/20">
          <h3 className="font-bold font-serif text-sm">محادثات العملاء</h3>
        </div>

        {loading ? (
          <div className="flex-grow flex justify-center items-center">
            <svg className="animate-spin h-6 w-6 text-[#A96F6B]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : rooms.length > 0 ? (
          <div className="flex-grow overflow-y-auto divide-y divide-[#EDE7D9]/30">
            {rooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              // Extract last message text
              let lastMsgText = 'دردشة جديدة...';
              if (room.messages) {
                const msgKeys = Object.keys(room.messages);
                const lastKey = msgKeys[msgKeys.length - 1];
                lastMsgText = room.messages[lastKey].text;
              }

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full p-4 flex gap-3 text-right items-center transition-all cursor-pointer ${
                    isSelected ? 'bg-[#EDE7D9]/40' : 'hover:bg-[#F7F3EA]/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#A96F6B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#77736D]" dir="ltr">
                        {room.lastMessageTime ? new Date(room.lastMessageTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      <h4 className="font-semibold text-xs text-[#30343B] truncate">{room.customerName || 'عميلة زائرة'}</h4>
                    </div>
                    <p className="text-[11px] text-[#77736D] truncate leading-normal">{lastMsgText}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-[#77736D] text-xs">
            <MessageSquare size={32} className="opacity-25 mb-3" />
            <p>لا توجد محادثات نشطة مع العملاء حالياً.</p>
          </div>
        )}
      </div>

      {/* Left Column: Chat Window */}
      <div className="md:col-span-2 flex flex-col h-full bg-[#F7F3EA]/10">
        {activeRoom ? (
          <>
            {/* Chat Room Header */}
            <div className="p-4 border-b border-[#D8CFC0] bg-[#FFFCF7] flex justify-between items-center">
              <div className="text-left text-[11px] text-[#77736D] flex items-center gap-1.5" dir="ltr">
                <span>{activeRoom.customerPhone || 'بدون هاتف'}</span>
                <Phone size={12} className="text-[#A96F6B]" />
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <h4 className="font-semibold text-xs text-[#30343B]">{activeRoom.customerName || 'عميلة زائرة'}</h4>
                  <span className="text-[10px] text-green-500 font-bold">متصل الآن</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#EDE7D9] border border-[#D8CFC0] text-[#A96F6B] flex items-center justify-center font-bold text-xs">
                  {activeRoom.customerName ? activeRoom.customerName.charAt(0) : 'م'}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#F7F3EA]/20">
              {messages.map((msg) => {
                const isSupport = msg.sender === 'support';
                return (
                  <div 
                    key={msg.id}
                    className={`flex w-full ${isSupport ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[75%] p-3 rounded-2xl shadow-sm space-y-1 flex flex-col ${
                        isSupport 
                          ? 'bg-[#A96F6B] text-white rounded-tr-none' 
                          : 'bg-[#FFFCF7] text-[#30343B] border border-[#D8CFC0] rounded-tl-none'
                      }`}
                    >
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                      <span className={`text-[8px] opacity-75 self-start ${isSupport ? 'text-white' : 'text-[#77736D]'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Common Answers suggestions pill bar */}
            <div className="px-4 py-2 border-t border-[#D8CFC0]/50 bg-[#FFFCF7] overflow-x-auto flex gap-2 flex-wrap items-center">
              <span className="text-[10px] font-bold text-[#77736D]">أجوبة سريعة:</span>
              {[
                'أهلاً بكِ في لولو ستور! ✨ كيف أقدر أساعدكِ؟',
                'الشحن بياخد من 2 لـ 5 أيام عمل لجميع المحافظات 🚚',
                'كود الخصم الفعال حالياً هو LOLO10 بخصم 10% 🏷️',
                'تقدري تعملي استرجاع أو استبدال مجاني خلال 14 يوم 🔄',
                'ابعتيلي وزنكِ وطولكِ التقريبيين وأرشحلك المقاس المناسب 📏'
              ].map((sugg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(sugg)}
                  className="bg-[#EDE7D9]/30 hover:bg-[#EDE7D9] text-[#77736D] text-[10px] font-bold border border-[#D8CFC0] px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap"
                >
                  {sugg}
                </button>
              ))}
            </div>

            {/* Input Form Panel */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#D8CFC0] bg-[#FFFCF7] flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتبي رسالتكِ للرد على العميلة..."
                className="flex-grow px-4 py-3 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-xs focus:ring-2 focus:ring-[#A96F6B] focus:outline-none transition-all text-right"
                required
              />
              <button 
                type="submit"
                className="w-12 h-12 bg-[#A96F6B] hover:bg-[#8F5B58] text-white rounded-xl shadow transition-all flex items-center justify-center cursor-pointer shrink-0"
              >
                <Send size={16} className="rotate-180" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-[#77736D] text-xs">
            <AlertCircle size={36} className="opacity-25 mb-3" />
            <p>يرجى اختيار محادثة عميل من القائمة الجانبية للبدء بالدردشة.</p>
          </div>
        )}
      </div>
    </div>
  );
}
