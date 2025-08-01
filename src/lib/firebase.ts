import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

// Your Firebase configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Authentication functions
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// User Profile Functions
export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'worker';
  department?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createUserProfile = async (userData: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const profileData: UserProfile = {
      ...userData,
      uid: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', user.uid), profileData);
    return { profile: profileData, error: null };
  } catch (error: any) {
    return { profile: null, error: error.message };
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { profile: docSnap.data() as UserProfile, error: null };
    } else {
      return { profile: null, error: 'User profile not found' };
    }
  } catch (error: any) {
    return { profile: null, error: error.message };
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Factory Data Functions
export interface FactoryData {
  id?: string;
  name: string;
  location: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  managerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addFactory = async (factoryData: Omit<FactoryData, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const data: Omit<FactoryData, 'id'> = {
      ...factoryData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'factories'), data);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getFactories = async () => {
  try {
    const q = query(collection(db, 'factories'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const factories: FactoryData[] = [];
    querySnapshot.forEach((doc) => {
      factories.push({ id: doc.id, ...doc.data() } as FactoryData);
    });
    
    return { factories, error: null };
  } catch (error: any) {
    return { factories: [], error: error.message };
  }
};

export const getFactoryById = async (id: string) => {
  try {
    const docRef = doc(db, 'factories', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { factory: { id: docSnap.id, ...docSnap.data() } as FactoryData, error: null };
    } else {
      return { factory: null, error: 'Factory not found' };
    }
  } catch (error: any) {
    return { factory: null, error: error.message };
  }
};

export const updateFactory = async (id: string, updates: Partial<FactoryData>) => {
  try {
    const docRef = doc(db, 'factories', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteFactory = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'factories', id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Production Data Functions
export interface ProductionData {
  id?: string;
  factoryId: string;
  productName: string;
  quantity: number;
  unit: string;
  date: Timestamp;
  status: 'completed' | 'in_progress' | 'planned';
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addProductionRecord = async (productionData: Omit<ProductionData, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const data: Omit<ProductionData, 'id'> = {
      ...productionData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'production'), data);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getProductionRecords = async (factoryId?: string) => {
  try {
    let q = query(collection(db, 'production'), orderBy('date', 'desc'));
    
    if (factoryId) {
      q = query(collection(db, 'production'), where('factoryId', '==', factoryId), orderBy('date', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    
    const records: ProductionData[] = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as ProductionData);
    });
    
    return { records, error: null };
  } catch (error: any) {
    return { records: [], error: error.message };
  }
};

export const updateProductionRecord = async (id: string, updates: Partial<ProductionData>) => {
  try {
    const docRef = doc(db, 'production', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteProductionRecord = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'production', id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Ledger Management Functions
export interface LedgerData {
  id?: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TransactionData {
  id?: string;
  ledgerId: string;
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  category: 'Personal' | 'Business' | 'Expense' | 'Income';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createLedger = async (ledgerData: Omit<LedgerData, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const data: Omit<LedgerData, 'id'> = {
      ...ledgerData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'ledgers'), data);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getLedgers = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'ledgers'), 
      where('createdBy', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const ledgers: LedgerData[] = [];
    querySnapshot.forEach((doc) => {
      ledgers.push({ id: doc.id, ...doc.data() } as LedgerData);
    });
    
    // Sort in memory (newest first)
    ledgers.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    
    return { ledgers, error: null };
  } catch (error: any) {
    return { ledgers: [], error: error.message };
  }
};

export const getLedgerById = async (id: string) => {
  try {
    const docRef = doc(db, 'ledgers', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ledger: { id: docSnap.id, ...docSnap.data() } as LedgerData, error: null };
    } else {
      return { ledger: null, error: 'Ledger not found' };
    }
  } catch (error: any) {
    return { ledger: null, error: error.message };
  }
};

export const updateLedger = async (id: string, updates: Partial<LedgerData>) => {
  try {
    const docRef = doc(db, 'ledgers', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteLedger = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'ledgers', id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const addTransaction = async (transactionData: Omit<TransactionData, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const data: Omit<TransactionData, 'id'> = {
      ...transactionData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'transactions'), data);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getTransactions = async (ledgerId: string) => {
  try {
    const q = query(
      collection(db, 'transactions'), 
      where('ledgerId', '==', ledgerId)
    );
    const querySnapshot = await getDocs(q);
    
    const transactions: TransactionData[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as TransactionData);
    });
    
    // Sort in memory by date (descending)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { transactions, error: null };
  } catch (error: any) {
    return { transactions: [], error: error.message };
  }
};

export const updateTransaction = async (id: string, updates: Partial<TransactionData>) => {
  try {
    const docRef = doc(db, 'transactions', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'transactions', id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export default app; 