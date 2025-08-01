'use client';

import { useAuth } from '@/contexts/AuthContext';
import { logOut, getUserProfile, addFactory, getFactories, addProductionRecord, getProductionRecords } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Settings, ChevronDown, UserCircle, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null);
  const [factories, setFactories] = useState<Record<string, unknown>[]>([]);
  const [productionRecords, setProductionRecords] = useState<Record<string, unknown>[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadUserData = async () => {
    setIsLoadingData(true);
    try {
      // Load user profile
      const profileResult = await getUserProfile(user!.uid);
      if (profileResult.profile) {
        setUserProfile(profileResult.profile);
      }

      // Load factories
      const factoriesResult = await getFactories();
      if (factoriesResult.factories) {
        setFactories(factoriesResult.factories);
      }

      // Load production records
      const productionResult = await getProductionRecords();
      if (productionResult.records) {
        setProductionRecords(productionResult.records);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const addSampleFactory = async () => {
    if (!user) return;
    
    try {
      const factoryData = {
        name: `Parlad Boutique ${factories.length + 1}`,
        location: 'Sample Location',
        capacity: 1000,
        status: 'active' as const,
        managerId: user.uid,
      };

      const result = await addFactory(factoryData);
      if (result.id) {
        await loadUserData(); // Reload data
      }
    } catch (error) {
      console.error('Error adding boutique:', error);
    }
  };

  const addSampleProductionRecord = async () => {
    if (!user || factories.length === 0) return;
    
    try {
      const productionData = {
        factoryId: factories[0].id,
        productName: `Fashion Item ${productionRecords.length + 1}`,
        quantity: Math.floor(Math.random() * 100) + 50,
        unit: 'pieces',
        date: Timestamp.now(),
        status: 'completed' as const,
        notes: 'Sample sales record',
        createdBy: user.uid,
      };

      const result = await addProductionRecord(productionData);
      if (result.id) {
        await loadUserData(); // Reload data
      }
    } catch (error) {
      console.error('Error adding sales record:', error);
    }
  };

  const handleLogout = async () => {
    await logOut();
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Parlad Boutique
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    {userProfile ? (
                      <span className="text-white text-sm font-medium">
                        {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                      </span>
                    ) : (
                      <UserCircle className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                      {userProfile && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {userProfile.role} • {userProfile.department}
                        </p>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Profile Settings
                      </Link>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

            {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div
            onClick={() => router.push('/ledger')}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Nepali Ledger Management
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Manage your financial transactions with traditional Nepali ledger system. 
                Track debits, credits, and maintain multiple ledgers for personal and business use.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Credit</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span>Debit</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UserCircle className="h-4 w-4 text-blue-500" />
                  <span>Shared</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 