'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createLedger, getLedgers, addTransaction, getTransactions, deleteTransaction, deleteLedger, LedgerData, TransactionData } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Filter, Download, FileText, DollarSign, TrendingUp, TrendingDown, Building, Trash2 } from 'lucide-react';
import Link from 'next/link';



export default function LedgerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ledgers, setLedgers] = useState<LedgerData[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<LedgerData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isCreatingLedger, setIsCreatingLedger] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionData | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');
  const [isDeletingLedger, setIsDeletingLedger] = useState(false);
  const [ledgerToDelete, setLedgerToDelete] = useState<LedgerData | null>(null);

  // Form states
  const [newLedger, setNewLedger] = useState({ name: '', description: '' });
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    particulars: '',
    debit: 0,
    credit: 0,
    category: 'Personal' as 'Personal' | 'Business' | 'Expense' | 'Income'
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadLedgers();
    }
  }, [user]);

  const loadLedgers = async () => {
    if (!user) return;
    
    try {
      const result = await getLedgers(user.uid);
      if (result.error) {
        console.error('Error loading ledgers:', result.error);
      } else {
        setLedgers(result.ledgers);
      }
    } catch (error) {
      console.error('Error loading ledgers:', error);
    }
  };

  const loadTransactions = async (ledgerId: string) => {
    try {
      const result = await getTransactions(ledgerId);
      if (result.error) {
        console.error('Error loading transactions:', result.error);
      } else {
        setTransactions(result.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleCreateLedger = async () => {
    if (!user || !newLedger.name.trim()) return;
    
    try {
      const result = await createLedger({
        name: newLedger.name,
        description: newLedger.description,
        createdBy: user.uid
      });
      
      if (result.error) {
        console.error('Error creating ledger:', result.error);
      } else {
        await loadLedgers(); // Reload ledgers
        setNewLedger({ name: '', description: '' });
        setIsCreatingLedger(false);
      }
    } catch (error) {
      console.error('Error creating ledger:', error);
    }
  };

  const handleAddTransaction = async () => {
    if (!user || !selectedLedger || !newTransaction.particulars.trim() || (newTransaction.debit <= 0 && newTransaction.credit <= 0)) {
      return;
    }
    
    try {
      const result = await addTransaction({
        ledgerId: selectedLedger.id!,
        date: newTransaction.date,
        particulars: newTransaction.particulars,
        debit: newTransaction.debit,
        credit: newTransaction.credit,
        category: newTransaction.category,
        createdBy: user.uid
      });
      
      if (result.error) {
        console.error('Error adding transaction:', result.error);
      } else {
        await loadTransactions(selectedLedger.id!); // Reload transactions
        setNewTransaction({
          date: new Date().toISOString().split('T')[0],
          particulars: '',
          debit: 0,
          credit: 0,
          category: 'Personal'
        });
        setIsAddingTransaction(false);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteTransaction = (transaction: TransactionData) => {
    setTransactionToDelete(transaction);
    setIsDeletingTransaction(true);
    setDeletePassword('');
    setDeletePasswordError('');
  };

  const confirmDeleteTransaction = async () => {
    if (!user || !transactionToDelete || !selectedLedger) return;
    
    const transactionId = transactionToDelete.id;
    if (!transactionId) {
      console.error('Transaction ID is missing');
      return;
    }
    
    // Simple password validation (you can make this more secure)
    if (deletePassword !== 'confirm') {
      setDeletePasswordError('Incorrect password');
      return;
    }
    
    try {
      const result = await deleteTransaction(transactionId);
      if (result.error) {
        console.error('Error deleting transaction:', result.error);
      } else {
        await loadTransactions(selectedLedger.id!); // Reload transactions
        setIsDeletingTransaction(false);
        setTransactionToDelete(null);
        setDeletePassword('');
        setDeletePasswordError('');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const cancelDeleteTransaction = () => {
    setIsDeletingTransaction(false);
    setTransactionToDelete(null);
    setDeletePassword('');
    setDeletePasswordError('');
  };

  const handleDeleteLedger = (ledger: LedgerData) => {
    setLedgerToDelete(ledger);
    setIsDeletingLedger(true);
    setDeletePassword('');
    setDeletePasswordError('');
  };

  const confirmDeleteLedger = async () => {
    if (!user || !ledgerToDelete) return;
    
    const ledgerId = ledgerToDelete.id;
    if (!ledgerId) {
      console.error('Ledger ID is missing');
      return;
    }
    
    // Simple password validation (you can make this more secure)
    if (deletePassword !== 'confirm') {
      setDeletePasswordError('Incorrect password');
      return;
    }
    
    try {
      const result = await deleteLedger(ledgerId);
      if (result.error) {
        console.error('Error deleting ledger:', result.error);
      } else {
        await loadLedgers(); // Reload ledgers
        setIsDeletingLedger(false);
        setLedgerToDelete(null);
        setDeletePassword('');
        setDeletePasswordError('');
        // If the deleted ledger was selected, clear selection
        if (selectedLedger?.id === ledgerId) {
          setSelectedLedger(null);
          setTransactions([]);
        }
      }
    } catch (error) {
      console.error('Error deleting ledger:', error);
    }
  };

  const cancelDeleteLedger = () => {
    setIsDeletingLedger(false);
    setLedgerToDelete(null);
    setDeletePassword('');
    setDeletePasswordError('');
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.particulars.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    const matchesDate = (!dateFilter.start || transaction.date >= dateFilter.start) &&
                       (!dateFilter.end || transaction.date <= dateFilter.end);
    return matchesSearch && matchesCategory && matchesDate;
  });

  const totalDebit = filteredTransactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = filteredTransactions.reduce((sum, t) => sum + t.credit, 0);
  const balance = totalCredit - totalDebit;

  const exportData = () => {
    if (!selectedLedger || filteredTransactions.length === 0) return;

    // Create PDF content
    const pdfContent = `
      <html>
        <head>
          <title>${selectedLedger.name} - Transaction Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 20px; }
            .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .debit { color: #dc2626; }
            .credit { color: #059669; }
            .category { padding: 2px 6px; border-radius: 4px; font-size: 12px; }
            .personal { background-color: #dbeafe; color: #1e40af; }
            .business { background-color: #fef3c7; color: #92400e; }
            .expense { background-color: #fee2e2; color: #991b1b; }
            .income { background-color: #d1fae5; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedLedger.name}</h1>
            <p>${selectedLedger.description}</p>
            <p>Transaction Report - Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <div class="summary-row">
              <span>Total Debit:</span>
              <span class="debit">₹${totalDebit.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Total Credit:</span>
              <span class="credit">₹${totalCredit.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Balance:</span>
              <span style="color: ${balance >= 0 ? '#059669' : '#dc2626'}">₹${balance.toLocaleString()}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars</th>
                <th>Category</th>
                <th>Debit (₹)</th>
                <th>Credit (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.particulars}</td>
                  <td><span class="category ${t.category.toLowerCase()}">${t.category}</span></td>
                  <td class="debit">${t.debit > 0 ? t.debit.toLocaleString() : ''}</td>
                  <td class="credit">${t.credit > 0 ? t.credit.toLocaleString() : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLedger.name}_transactions.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Nepali Ledger Management
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Export as PDF"
              >
                <Download className="h-5 w-5" />
                <span className="text-sm">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedLedger ? (
          // Ledger Selection View
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Ledgers</h2>
              <button
                onClick={() => setIsCreatingLedger(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Ledger</span>
              </button>
            </div>

            {/* Create Ledger Modal */}
            {isCreatingLedger && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Create New Ledger</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Ledger Name"
                      value={newLedger.name}
                      onChange={(e) => setNewLedger({ ...newLedger, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={newLedger.description}
                      onChange={(e) => setNewLedger({ ...newLedger, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCreateLedger}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setIsCreatingLedger(false)}
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ledger Cards */}
            {ledgers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Ledgers Yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Get started by creating your first ledger to track your financial transactions. 
                  Ledgers help you organize your personal and business finances.
                </p>
                <button
                  onClick={() => setIsCreatingLedger(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Your First Ledger</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ledgers.map((ledger) => (
                <div
                  key={ledger.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                      onClick={() => {
                        setSelectedLedger(ledger);
                        if (ledger.id) loadTransactions(ledger.id);
                      }}
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{ledger.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{ledger.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLedger(ledger);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete ledger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div 
                    className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer"
                    onClick={() => {
                      setSelectedLedger(ledger);
                      if (ledger.id) loadTransactions(ledger.id);
                    }}
                  >
                    Created: {ledger.createdAt.toDate().toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        ) : (
          // Ledger Detail View
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={() => setSelectedLedger(null)}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Ledgers</span>
                </button>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedLedger.name}</h2>
                <p className="text-slate-600 dark:text-slate-400">{selectedLedger.description}</p>
              </div>
              <button
                onClick={() => setIsAddingTransaction(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Debit</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      रु {totalDebit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Credit</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      रु {totalCredit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Balance</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      रु {balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="Personal">Personal</option>
                      <option value="Business">Business</option>
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Transactions List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transactions</h3>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredTransactions.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    No transactions found
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                                                         <span className="text-sm text-slate-600 dark:text-slate-400">
                               {transaction.date}
                             </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.category === 'Income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              transaction.category === 'Expense' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              transaction.category === 'Business' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {transaction.category}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 dark:text-white">{transaction.particulars}</p>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <div>
                            {transaction.debit > 0 && (
                              <p className="text-red-600 dark:text-red-400 font-semibold">
                                रु {transaction.debit.toLocaleString()}
                              </p>
                            )}
                            {transaction.credit > 0 && (
                              <p className="text-green-600 dark:text-green-400 font-semibold">
                                रु {transaction.credit.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Transaction Modal */}
        {isAddingTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Particulars</label>
                  <input
                    type="text"
                    placeholder="Transaction description"
                    value={newTransaction.particulars}
                    onChange={(e) => setNewTransaction({ ...newTransaction, particulars: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value as 'Personal' | 'Business' | 'Expense' | 'Income' })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Business">Business</option>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Debit Amount</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newTransaction.debit}
                      onChange={(e) => setNewTransaction({ ...newTransaction, debit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Credit Amount</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newTransaction.credit}
                      onChange={(e) => setNewTransaction({ ...newTransaction, credit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddTransaction}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Transaction
                  </button>
                  <button
                    onClick={() => setIsAddingTransaction(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Transaction Modal */}
        {isDeletingTransaction && transactionToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">Delete Transaction</h3>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    Are you sure you want to delete this transaction?
                  </p>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p><strong>Date:</strong> {transactionToDelete.date}</p>
                    <p><strong>Particulars:</strong> {transactionToDelete.particulars}</p>
                    <p><strong>Amount:</strong> 
                      {transactionToDelete.debit > 0 ? ` रु ${transactionToDelete.debit.toLocaleString()}` : ` रु ${transactionToDelete.credit.toLocaleString()}`}
                    </p>
                    <p><strong>Category:</strong> {transactionToDelete.category}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Enter password to confirm deletion
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeletePasswordError('');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {deletePasswordError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{deletePasswordError}</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Password: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">confirm</code>
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={confirmDeleteTransaction}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Transaction
                  </button>
                  <button
                    onClick={cancelDeleteTransaction}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Ledger Modal */}
        {isDeletingLedger && ledgerToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">Delete Ledger</h3>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    Are you sure you want to delete this ledger?
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                    <strong>Warning:</strong> This will permanently delete the ledger and all its transactions. This action cannot be undone.
                  </p>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p><strong>Name:</strong> {ledgerToDelete.name}</p>
                    <p><strong>Description:</strong> {ledgerToDelete.description}</p>
                    <p><strong>Created:</strong> {ledgerToDelete.createdAt.toDate().toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Enter password to confirm deletion
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeletePasswordError('');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {deletePasswordError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{deletePasswordError}</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Password: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">confirm</code>
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={confirmDeleteLedger}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Ledger
                  </button>
                  <button
                    onClick={cancelDeleteLedger}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 