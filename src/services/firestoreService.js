import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper function to extract document data including its ID
const formatDoc = (snap) => ({
  id: snap.id,
  ...snap.data()
});

// ==========================================
// 1. PRODUCTS SERVICES
// ==========================================
export async function getProducts() {
  try {
    const productsCol = collection(db, 'products');
    const q = query(productsCol, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(formatDoc);
  } catch (err) {
    console.error('Error fetching products:', err);
    throw err;
  }
}

export async function addProduct(productData) {
  try {
    const productsCol = collection(db, 'products');
    const docRef = await addDoc(productsCol, {
      ...productData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (err) {
    console.error('Error adding product:', err);
    throw err;
  }
}

export async function updateProduct(productId, productData) {
  try {
    const productDoc = doc(db, 'products', productId);
    await updateDoc(productDoc, productData);
    return true;
  } catch (err) {
    console.error('Error updating product:', err);
    throw err;
  }
}

export async function deleteProduct(productId) {
  try {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
    return true;
  } catch (err) {
    console.error('Error deleting product:', err);
    throw err;
  }
}

// ==========================================
// 2. CATEGORIES SERVICES
// ==========================================
export async function getCategories() {
  try {
    const categoriesCol = collection(db, 'categories');
    const querySnapshot = await getDocs(categoriesCol);
    return querySnapshot.docs.map(formatDoc);
  } catch (err) {
    console.error('Error fetching categories:', err);
    throw err;
  }
}

export async function addCategory(categoryData) {
  try {
    const categoriesCol = collection(db, 'categories');
    // Using ID as slug or nameEn lowered
    const id = categoryData.nameEn.toLowerCase().replace(/\s+/g, '-');
    const docRef = doc(categoriesCol, id);
    await setDoc(docRef, categoryData);
    return id;
  } catch (err) {
    console.error('Error adding category:', err);
    throw err;
  }
}

export async function updateCategory(categoryId, categoryData) {
  try {
    const categoryDoc = doc(db, 'categories', categoryId);
    await updateDoc(categoryDoc, categoryData);
    return true;
  } catch (err) {
    console.error('Error updating category:', err);
    throw err;
  }
}

export async function deleteCategory(categoryId) {
  try {
    const categoryDoc = doc(db, 'categories', categoryId);
    await deleteDoc(categoryDoc);
    return true;
  } catch (err) {
    console.error('Error deleting category:', err);
    throw err;
  }
}


// ==========================================
// 3. ORDERS SERVICES
// ==========================================
export async function getOrders() {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(formatDoc);
  } catch (err) {
    console.error('Error fetching orders:', err);
    throw err;
  }
}

export async function getOrderById(orderId) {
  try {
    const orderDoc = doc(db, 'orders', orderId);
    const snap = await getDoc(orderDoc);
    if (!snap.exists()) return null;
    return formatDoc(snap);
  } catch (err) {
    console.error('Error fetching order by ID:', err);
    throw err;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, { status });
    return true;
  } catch (err) {
    console.error('Error updating order status:', err);
    throw err;
  }
}

export async function deleteOrder(orderId) {
  try {
    const orderDoc = doc(db, 'orders', orderId);
    await deleteDoc(orderDoc);
    return true;
  } catch (err) {
    console.error('Error deleting order:', err);
    throw err;
  }
}


// ==========================================
// 4. COUPONS SERVICES
// ==========================================
export async function getCoupons() {
  try {
    const couponsCol = collection(db, 'coupons');
    const querySnapshot = await getDocs(couponsCol);
    return querySnapshot.docs.map(formatDoc);
  } catch (err) {
    console.error('Error fetching coupons:', err);
    throw err;
  }
}

export async function addCoupon(couponData) {
  try {
    const couponsCol = collection(db, 'coupons');
    const code = couponData.code.toUpperCase();
    const docRef = doc(couponsCol, code);
    await setDoc(docRef, {
      code,
      discountPercent: Number(couponData.discountPercent),
      active: true,
      createdAt: new Date()
    });
    return code;
  } catch (err) {
    console.error('Error adding coupon:', err);
    throw err;
  }
}

export async function deleteCoupon(couponId) {
  try {
    const couponDoc = doc(db, 'coupons', couponId);
    await deleteDoc(couponDoc);
    return true;
  } catch (err) {
    console.error('Error deleting coupon:', err);
    throw err;
  }
}

// ==========================================
// 5. STORE SETTINGS SERVICES
// ==========================================
export async function getStoreSettings() {
  try {
    const settingsDoc = doc(db, 'settings', 'store');
    const snap = await getDoc(settingsDoc);
    if (!snap.exists()) return null;
    return snap.data();
  } catch (err) {
    console.error('Error fetching store settings:', err);
    throw err;
  }
}

export async function updateStoreSettings(settingsData) {
  try {
    const settingsDoc = doc(db, 'settings', 'store');
    await setDoc(settingsDoc, settingsData, { merge: true });
    return true;
  } catch (err) {
    console.error('Error updating store settings:', err);
    throw err;
  }
}

