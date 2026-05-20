'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, PawPrint } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('admin@unsaathi.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  // ROLE-BASED REDIRECT
  useEffect(() => {
    if (shouldRedirect && user) {
      const userRole = localStorage.getItem('userRole') || user.role || 'admin';
      const roleDashboards: Record<string, string> = {
        'admin': '/dashboard/admin',
        'salesman': '/dashboard/salesman', 
        'user': '/dashboard/customer'
      };
      
      const redirectPath = roleDashboards[userRole] || '/dashboard/admin';
      router.push(redirectPath);
    }
  }, [shouldRedirect, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      const userRole = localStorage.getItem('userRole') || 'admin';
      console.log('🔍 Login successful! Role:', userRole);
      
      if (userRole === 'admin') {
        window.location.href = '/dashboard/admin';
      } else if (userRole === 'salesman') {
        window.location.href = '/dashboard/salesman';
      } else {
        window.location.href = '/dashboard/customer';
      }
      
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 space-y-8 border border-orange-100"
      >
        {/* Header */}
        <div className="text-center space-y-4">
  <motion.div
    animate={{ rotate: [0, 10, -10, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <div className="w-50 h-50 mx-auto flex items-center justify-center">
      <img 
        src="/images/tailio.png" 
        alt="Tailio Logo" 
        className="w-full h-full object-contain s"
      />
    </div>
  </motion.div>
  
  <div>
    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
      Tailio
    </h1>
    <p className="text-gray-600 mt-2 text-lg">Pet Registration CRM</p>
  </div>
</div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-2xl"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f88013] w-5 h-5" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#f88013] focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-lg hover:border-orange-300"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f88013] w-5 h-5" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#f88013] focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-lg hover:border-orange-300"
                required
              />
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-[#f88013] to-[#ff9a44] text-white py-5 px-6 rounded-2xl font-semibold text-xl shadow-lg hover:from-[#e06a0a] hover:to-[#f88013] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            <ArrowRight className="w-6 h-6" />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center p-4 bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-2xl border border-orange-200/50"
        >
          <p className="text-sm font-medium text-gray-700 mb-1">Test Accounts:</p>
          <div className="text-xs space-y-1 text-gray-600">
            <div>👑 Admin: <code className="text-[#f88013]">admin@unsaathi.com</code> / <code className="text-[#f88013]">admin123</code></div>
            <div>💼 Salesman: <code className="text-[#f88013]">sales1@test.com</code> / <code className="text-[#f88013]">sales123</code></div>
            <div>👤 Customer: <code className="text-[#f88013]">customer@test.com</code> / <code className="text-[#f88013]">cust123</code></div>
          </div>
        </motion.div>

        {/* Back to Website Link */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-[#f88013] hover:text-[#e06a0a] text-sm font-medium transition-colors"
          >
            ← Back to Tailio Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}