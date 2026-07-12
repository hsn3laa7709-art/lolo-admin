import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function Login() {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim() || !password.trim()) {
      setLocalError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      // Error is already managed inside AuthContext.jsx and exposed via `error`
      console.log('Login attempt failed:', err.message);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#30343B] font-sans flex flex-col items-center justify-center p-4">
      <div className="bg-[#FFFCF7] rounded-3xl shadow-xl border border-[#D8CFC0] p-8 max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EDE7D9] border border-[#D8CFC0] text-[#A96F6B] font-serif font-bold text-3xl mb-4 shadow-inner">
            L
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#30343B] tracking-wider">LOLO STORE</h1>
          <p className="text-sm text-[#77736D] mt-2 font-medium">لوحة تحكم المشرفين والأدمن</p>
        </div>

        {/* Error Alert Box */}
        {displayError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fade-in-up">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{displayError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#77736D] tracking-wide block uppercase" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lolo.com"
              className="w-full px-4 py-3 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-[#30343B] text-sm focus:outline-none focus:ring-2 focus:ring-[#A96F6B] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#77736D] tracking-wide block uppercase" htmlFor="password">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#F7F3EA] border border-[#D8CFC0] rounded-xl text-[#30343B] text-sm focus:outline-none focus:ring-2 focus:ring-[#A96F6B] focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#A96F6B] hover:bg-[#8F5B58] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري التحقق والدخول...
              </span>
            ) : (
              <>
                <LogIn size={16} />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-8 text-center border-t border-[#EDE7D9] pt-6">
          <p className="text-[11px] text-[#77736D] leading-relaxed">
            محاولة الدخول للمستخدمين غير المصرح لهم تخضع للمراقبة وتعتبر خرقاً للسياسات الأمنية للمتجر.
          </p>
        </div>
      </div>
    </div>
  );
}
