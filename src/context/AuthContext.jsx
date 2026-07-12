import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError('');
      if (user) {
        try {
          // Check if user is in the /admins collection in Firestore
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists()) {
            setCurrentUser(user);
            setIsAdmin(true);
          } else {
            // Logged in but NOT an admin
            setError('غير مصرح لك بالدخول إلى لوحة الأدمن. هذا الحساب لا يملك صلاحيات المشرف.');
            await signOut(auth);
            setCurrentUser(null);
            setIsAdmin(false);
          }
        } catch (err) {
          console.error('Error verifying admin status:', err);
          setError('حدث خطأ أثناء التحقق من صلاحيات المشرف.');
          await signOut(auth);
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Wait for onAuthStateChanged to verify admin status
      return userCredential.user;
    } catch (err) {
      setLoading(false);
      let errMsg = 'فشل تسجيل الدخول. يرجى التأكد من البريد الإلكتروني وكلمة المرور.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      }
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        error,
        setError,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
