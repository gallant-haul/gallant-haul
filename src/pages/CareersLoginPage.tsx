import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { Truck, Lock, Mail, ArrowRight, AlertCircle, CheckCircle, User, Phone, Award, MailCheck, RefreshCw, Building2 } from 'lucide-react';
import { isValidEmail } from '../utils/validation';
import ThreeTruckViewer from '../components/ThreeTruckViewer';

export default function CareersLoginPage() {
  const router = useRouter();
  const { user, role, signIn, signUp, resetPassword, resendConfirmationEmail } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [activeField, setActiveField] = useState<'email' | 'password' | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseClass, setLicenseClass] = useState('Class 1 / CDL-A');

  // Email format state
  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = !email || isValidEmail(email);

  // Unconfirmed email alert state
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  // If already authenticated as driver, redirect to driver portal
  useEffect(() => {
    if (user) {
      if (role === 'client') {
        router.push('/portal/client');
      } else {
        router.push('/portal/driver');
      }
    }
  }, [user, role]);

  const handleResendConfirmation = async () => {
    if (!email || !isValidEmail(email)) {
      setResendNotice('Please enter your valid driver email above.');
      return;
    }
    setResending(true);
    setResendNotice(null);
    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) throw error;
      setResendNotice(`✓ Fresh confirmation link sent to ${email}. Check your inbox!`);
    } catch (err: any) {
      setResendNotice(err.message || 'Could not resend email.');
    } finally {
      setResending(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsUnconfirmed(false);
    setResendNotice(null);

    // Strict Email Format Checker
    if (!isValidEmail(email)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid driver email address (e.g. driver@domain.com).',
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error('Please enter your full legal name as it appears on your commercial license.');
        }

        const { error, user: newUser } = await signUp(email, password, 'driver', {
          full_name: fullName,
          phone,
          license_class: licenseClass,
        });

        if (error) throw error;

        if (newUser && newUser.identities && newUser.identities.length === 0) {
          setStatusMessage({
            type: 'error',
            text: 'A driver account with this email address already exists. Please log in.',
          });
        } else {
          setStatusMessage({
            type: 'success',
            text: `Driver registration received! A confirmation receipt has been sent to ${email}. You can now sign in directly to your driver portal.`,
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        router.push('/portal/driver');
      }
    } catch (err: any) {
      const errMsg = err.message || '';
      setStatusMessage({
        type: 'error',
        text: errMsg || 'Driver authentication failed. Please verify your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!isValidEmail(email)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid registered driver email address.',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setStatusMessage({
        type: 'success',
        text: `Password reset instructions sent to ${email}.`,
      });
      setResettingPassword(false);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Could not send driver reset email.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12 sm:py-16 transition-colors duration-300">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch section-fade">
        {/* Left Column: Driver Auth Form Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors duration-300">
          <div>
            {/* Persona Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 max-w-xs">
              <Link
                href="/login/client"
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Shipper Client</span>
              </Link>
              <span className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs flex items-center justify-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Driver Portal</span>
              </span>
            </div>

            {/* Driver Branding Lockup */}
            <div className="mb-6">
              <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 p-1.5 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
                <img
                  src="/assets/aistudio/image_341d9178.png"
                  alt="Gallant Line Haul Corp Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy dark:text-white tracking-tight">
                {resettingPassword
                  ? 'Reset Driver Password'
                  : isSignUp
                  ? 'Driver Registration'
                  : 'Driver & Careers Portal'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {resettingPassword
                  ? 'Enter your registered email to recover your driver account.'
                  : isSignUp
                  ? 'Join Gallant Line Haul Corp’s certified driver team for top dedicated lanes.'
                  : 'Access your dispatch manifests, upload CDL files, and inspect settlements.'}
              </p>
            </div>

        {/* Dedicated Email Confirmation Alert Card */}
        {isUnconfirmed && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3">
            <div className="flex items-start gap-3">
              <MailCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-sm text-amber-900">Check Your Driver Email Inbox</h3>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Supabase requires you to click the confirmation link sent to <strong>{email}</strong> before signing in.
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  * Note: If you don't see the email, please inspect your <strong>Spam</strong> or <strong>Junk</strong> folder.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
                className="text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending...' : 'Resend Confirmation Email'}</span>
              </button>
              {resendNotice && (
                <span className="text-xs font-semibold text-emerald-800 animate-fade">
                  {resendNotice}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {statusMessage && !isUnconfirmed && (
          <div
            className={`p-4 rounded-xl text-sm font-medium mb-6 flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-snug">{statusMessage.text}</div>
          </div>
        )}

        {resettingPassword ? (
          /* Password Reset Form */
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Driver Email Address
                </label>
                {emailTouched && (
                  <span className={`text-[11px] font-semibold ${emailValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {emailValid ? '✓ Valid' : '✗ Invalid format'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onBlur={() => setEmailTouched(true)}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!emailTouched) setEmailTouched(true);
                  }}
                  placeholder="driver@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none text-slate-900 text-sm transition-colors ${
                    emailTouched && !emailValid
                      ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                />
              </div>
              {emailTouched && !emailValid && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  Please enter a valid email format (e.g. driver@domain.com).
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !emailValid}
              className="w-full gradient-teal text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Sending Recovery Link...' : 'Send Driver Password Reset'}
            </button>

            <button
              type="button"
              onClick={() => {
                setResettingPassword(false);
                setStatusMessage(null);
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold py-2"
            >
              ← Back to Driver Sign In
            </button>
          </form>
        ) : (
          /* Sign In & Sign Up Form */
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Michael Smith"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Mobile Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (416) 555-0199"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Commercial License Class
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <select
                      value={licenseClass}
                      onChange={(e) => setLicenseClass(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900 text-sm bg-white"
                    >
                      <option value="Class 1 / CDL-A">Class 1 / CDL-A (Tractor-Trailer)</option>
                      <option value="AZ (Ontario Standard)">AZ License (Ontario)</option>
                      <option value="Class 3 / CDL-B">Class 3 / CDL-B (Straight Truck)</option>
                      <option value="Owner Operator Fleet">Owner-Operator with Equipment</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Driver Email Address *
                </label>
                {emailTouched && (
                  <span className={`text-[11px] font-semibold ${emailValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {emailValid ? '✓ Valid' : '✗ Invalid format'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => {
                    setEmailTouched(true);
                    setActiveField(null);
                  }}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!emailTouched) setEmailTouched(true);
                  }}
                  placeholder="driver@domain.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none text-slate-900 dark:text-white dark:bg-slate-950 text-sm transition-colors ${
                    emailTouched && !emailValid
                      ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                />
              </div>
              {emailTouched && !emailValid && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                  Please enter a valid email format (e.g. driver@domain.com).
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password *
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setResettingPassword(true);
                      setStatusMessage(null);
                    }}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900 dark:text-white text-sm tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !emailValid}
              className="w-full gradient-teal text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 text-sm mt-2 flex items-center justify-center gap-2 btn-dynamic"
            >
              {loading ? (
                <span>Authenticating with Supabase...</span>
              ) : isSignUp ? (
                <>
                  <span>Register Driver Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Driver Portal Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Toggle Mode: Sign In vs Sign Up */}
        {!resettingPassword && (
          <div className="mt-6 text-center text-sm text-slate-600 border-t border-slate-100 pt-5">
            {isSignUp ? (
              <p>
                Already registered with Gallant?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setStatusMessage(null);
                    setIsUnconfirmed(false);
                  }}
                  className="text-teal-600 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                New driver applying?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setStatusMessage(null);
                    setIsUnconfirmed(false);
                  }}
                  className="text-teal-600 font-bold hover:underline"
                >
                  Create Driver Account
                </button>
              </p>
            )}
          </div>
        )}
        </div>

        {/* Switch Persona */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            href="/login/client"
            className="text-xs text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400 font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Looking for freight or load tracking?</span>
            <span className="font-bold underline">Client Login →</span>
          </Link>
        </div>
      </div>

      {/* Right Column: Realistic Three.js 3D Semi-Truck Visualizer */}
      <div className="lg:col-span-5 hidden lg:flex flex-col justify-center">
        <ThreeTruckViewer activeField={activeField} portalType="driver" />
      </div>
    </div>
  </div>
);
}
