'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Building, Phone, Save, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    phone: '',
    role: 'worker' as 'admin' | 'manager' | 'worker'
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const result = await getUserProfile(user!.uid);
      if (result.profile) {
        setUserProfile(result.profile);
        setFormData({
          firstName: result.profile.firstName || '',
          lastName: result.profile.lastName || '',
          department: result.profile.department || '',
          phone: result.profile.phone || '',
          role: result.profile.role || 'worker'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateUserProfile(user!.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        phone: formData.phone,
        role: formData.role
      });

      if (result.error) {
        console.error('Error updating profile:', result.error);
      } else {
        setShowSuccess(true);
        setIsEditing(false);
        await loadUserProfile(); // Reload profile data
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        department: userProfile.department || '',
        phone: userProfile.phone || '',
        role: userProfile.role || 'worker'
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Profile Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-800 dark:text-green-200">Profile updated successfully!</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                {userProfile ? (
                  <span className="text-white text-xl font-medium">
                    {userProfile.firstName?.charAt(0)}{userProfile.lastName?.charAt(0)}
                  </span>
                ) : (
                  <User className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User Profile'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="text-slate-900 dark:text-white">{user.email}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email address cannot be changed
              </p>
            </div>

            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  First Name
                </label>
                {isEditing ? (
                  <div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.firstName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <User className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-900 dark:text-white">
                      {userProfile?.firstName || 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Last Name
                </label>
                {isEditing ? (
                  <div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.lastName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <User className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-900 dark:text-white">
                      {userProfile?.lastName || 'Not set'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Department and Role */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="department" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Department
                </label>
                {isEditing ? (
                  <div>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.department ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Enter your department"
                    />
                    {errors.department && (
                      <p className="text-sm text-red-500">{errors.department}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Building className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-900 dark:text-white">
                      {userProfile?.department || 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Role
                </label>
                {isEditing ? (
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="worker">Worker</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <User className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-900 dark:text-white capitalize">
                      {userProfile?.role || 'worker'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              {isEditing ? (
                <div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-900 dark:text-white">
                    {userProfile?.phone || 'Not set'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 