import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCGgImORGqVZXMzkKE6urjF8IIJyiPxwsQ",
  authDomain: "lolo-380f3.firebaseapp.com",
  projectId: "lolo-380f3",
  storageBucket: "lolo-380f3.firebasestorage.app",
  messagingSenderId: "684326123577",
  appId: "1:684326123577:web:55fbe888353081c877b5e8",
  measurementId: "G-6JMKRDM7HY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = 'admin@lolo.com';
const password = 'LoloAdmin2026!';

console.log('جاري إنشاء حساب الأدمن...');

try {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  console.log(`تم إنشاء الحساب في Authentication بنجاح. الـ UID: ${user.uid}`);

  console.log('جاري إضافة صلاحيات الأدمن في Firestore...');
  await setDoc(doc(db, 'admins', user.uid), {
    email: email,
    role: 'superadmin',
    createdAt: new Date()
  });
  console.log('تم تفعيل حساب الأدمن بنجاح!');
  console.log('--------------------------------------');
  console.log(`الايميل: ${email}`);
  console.log(`الباسورد: ${password}`);
  console.log('--------------------------------------');
  process.exit(0);
} catch (error) {
  console.error('حدث خطأ أثناء إنشاء الحساب:', error.message);
  process.exit(1);
}
