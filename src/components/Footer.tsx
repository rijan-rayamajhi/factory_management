import Link from 'next/link';
import { Building, Shield, Users } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-bold">Parlad Boutique</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Professional boutique management system designed for efficient operations, 
              inventory tracking, and business growth.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Users className="h-4 w-4 text-blue-400" />
                <span>Multi-user</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-slate-300 hover:text-white transition-colors">
                  Profile Settings
                </Link>
              </li>
              <li>
                <Link href="/signin" className="text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-slate-300 hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex justify-center">
            <div className="text-sm text-slate-400">
              © {currentYear} Parlad Boutique. All rights reserved.
            </div>
          </div>
          
          {/* System Info */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
              <div className="flex items-center space-x-4">
                <span>System Version: 1.0.0</span>
                <span>•</span>
                <span>Last Updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 