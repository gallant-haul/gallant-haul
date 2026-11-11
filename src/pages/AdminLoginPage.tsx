import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, KeyRound, Truck, Building2 } from 'lucide-react';
import { isValidEmail } from '../utils/validation';
import ThreeTruckViewer from '../components/ThreeTruckViewer';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin, adminSignIn } = useAuth();

  const [email, setEmail] = useState('info@gallant-corp.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeField, setActiveField] = useState<'email' | 'password' | null>(null);

  // If already authenticated as admin, go directly to master portal
  useEffect(() => {
    if (isAdmin) {
      router.push('/portal/admin');
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid master email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await adminSignIn(email, password);
      if (error) {
        throw error;
      }
      router.push('/portal/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Administrative verification failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center px-4 py-12 sm:py-16 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10 section-fade">
        {/* Left Column: Admin Auth Form Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Command Badge & Brand Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center mx-auto mb-4 shadow-xl border border-slate-700/80 overflow-hidden">
                <img
                  src="/assets/aistudio/image_341d9178.png"
                  alt="Gallant Line Haul Corp Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-teal-400 font-bold bg-teal-950/80 px-3 py-1 rounded-full border border-teal-800/60 inline-block mb-2">
                Executive Command Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Master Dispatch Operations
              </h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Authorized administrative access for Gallant Line Haul Corp. Control drivers, shippers, freight manifests, and live portal broadcasts.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-snug">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Master Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@gallant-corp.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none text-white text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Security Key / Master Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none text-white text-sm font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-teal text-white font-bold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm mt-3 flex items-center justify-center gap-2 btn-dynamic"
              >
                {loading ? (
                  <span>Verifying Administrative Key...</span>
                ) : (
                  <>
                    <span>Access Master Control Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Nav Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center flex flex-col gap-2">
            <p className="text-[11px] text-slate-500">Looking for customer or driver access?</p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <Link href="/login/client" className="text-slate-400 hover:text-teal-400 flex items-center gap-1 transition-colors">
                <Building2 className="w-3.5 h-3.5" />
                <span>Shipper Login</span>
              </Link>
              <span className="text-slate-700">|</span>
              <Link href="/login/careers" className="text-slate-400 hover:text-teal-400 flex items-center gap-1 transition-colors">
                <Truck className="w-3.5 h-3.5" />
                <span>Driver Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Realistic Three.js 3D Semi-Truck Visualizer */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-center">
          <ThreeTruckViewer activeField={activeField} portalType="admin" />
        </div>
      </div>
    </div>
  );
}
