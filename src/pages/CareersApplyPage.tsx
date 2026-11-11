import React, { useState } from 'react';
import { Link, useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  Award,
  Upload,
  FileText,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { isValidEmail, validatePdfFile, formatFileSize } from '../utils/validation';

export default function CareersApplyPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [licenseClass, setLicenseClass] = useState('Class 1 / CDL-A (Tractor-Trailer)');

  // Mandatory PDF Uploads (<1MB each)
  const [licenceFile, setLicenceFile] = useState<File | null>(null);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [residenceFile, setResidenceFile] = useState<File | null>(null);

  // Email format validation feedback
  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = !email || isValidEmail(email);

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (
    type: 'licence' | 'picture' | 'residence',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file.');
      e.target.value = ''; // Reset input
      return;
    }

    if (type === 'licence') setLicenceFile(file);
    if (type === 'picture') setPictureFile(file);
    if (type === 'residence') setResidenceFile(file);
  };

  const handleRemoveFile = (type: 'licence' | 'picture' | 'residence') => {
    if (type === 'licence') setLicenceFile(null);
    if (type === 'picture') setPictureFile(null);
    if (type === 'residence') setResidenceFile(null);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Strict Email Format Checker
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address (e.g. driver@domain.com).');
      return;
    }

    // 2. Mandatory PDF Documents Verification (<1MB)
    if (!licenceFile) {
      setErrorMsg("Please upload your Commercial Driver's Licence (PDF format strictly below 1MB).");
      return;
    }
    if (!pictureFile) {
      setErrorMsg('Please upload your Driver Picture / Portrait (PDF format strictly below 1MB).');
      return;
    }
    if (!residenceFile) {
      setErrorMsg('Please upload your Residential Proof / Utility Bill (PDF format strictly below 1MB).');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, 'driver', {
        full_name: fullName,
        phone,
        license_class: licenseClass,
        licence_doc: licenceFile.name,
        picture_doc: pictureFile.name,
        residence_doc: residenceFile.name,
        docs_submitted_at: new Date().toISOString(),
      });

      if (error) throw error;

      setStep('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit driver application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex w-full bg-slate-50">
      {/* Left Visual Panel */}
      <div
        className="hidden lg:flex w-5/12 relative bg-slate-900 items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/85 to-teal-950/90"></div>
        <div className="relative z-10 p-12 text-white max-w-lg section-fade space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white hover:text-teal-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <span>Gallant Line Haul</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white tracking-tight">
            Join our elite Canadian & cross-border driver team.
          </h1>

          <p className="text-base text-slate-200 font-light leading-relaxed">
            Set up your commercial driver profile in minutes, upload your verified documents securely, and hit top-paying dedicated lanes.
          </p>

          <div className="p-4 rounded-2xl bg-teal-950/50 border border-teal-500/30 text-xs text-teal-200 space-y-2">
            <div className="font-bold text-teal-300 uppercase tracking-wider">Required Application Documents:</div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Commercial Driver's Licence (PDF &lt; 1MB)</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Driver Photo / Portrait (PDF &lt; 1MB)</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Proof of Residence / Address (PDF &lt; 1MB)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/80 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Canadian Bonded Carrier & C-TPAT Certified Network</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>24-Hour QuickPay & direct deposit options</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-50 relative overflow-y-auto">
        <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200 section-fade my-6">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          {step === 'form' ? (
            <>
              <div className="mb-6 text-center">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                  Driver Onboarding
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-1.5">Apply to Join Network</h2>
                <p className="text-slate-500 text-xs">
                  Fill in your details and upload your licence, picture, and residential proof in PDF (&lt;1MB).
                </p>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                {/* 1. Driver Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                      placeholder="John Michael Smith"
                    />
                  </div>
                </div>

                {/* 2. Email Address with Strict Format Checker */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Driver Email Address *
                    </label>
                    {emailTouched && (
                      <span className={`text-[11px] font-semibold ${emailValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {emailValid ? '✓ Valid format' : '✗ Invalid email format'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onBlur={() => setEmailTouched(true)}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (!emailTouched) setEmailTouched(true);
                      }}
                      required
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-slate-900 text-sm transition-colors ${
                        emailTouched && !emailValid
                          ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-teal-500'
                      }`}
                      placeholder="driver@example.com"
                    />
                  </div>
                  {emailTouched && !emailValid && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      Please enter a valid email format containing @ and domain (e.g., name@domain.com).
                    </p>
                  )}
                </div>

                {/* 3. Phone Number & License Class */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Mobile Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                        placeholder="+1 (416) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      License Class
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <select
                        value={licenseClass}
                        onChange={(e) => setLicenseClass(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm bg-white"
                      >
                        <option value="Class 1 / CDL-A (Tractor-Trailer)">Class 1 / CDL-A</option>
                        <option value="AZ License (Ontario Standard)">AZ License (Ontario)</option>
                        <option value="Class 3 / Straight Truck">Class 3 / Straight Truck</option>
                        <option value="Owner-Operator Fleet">Owner-Operator</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Create Portal Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm tracking-wider"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* MANDATORY PDF UPLOADS SECTION (< 1MB) */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy uppercase tracking-wider">
                      Mandatory Document Uploads (PDF &lt; 1MB each)
                    </span>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      Strict PDF &lt; 1MB
                    </span>
                  </div>

                  {/* Document 1: Commercial Driver's Licence */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        1. Commercial Driver's Licence (PDF) *
                      </span>
                      <span className="text-[10px] text-slate-500">Max 1MB</span>
                    </div>

                    {licenceFile ? (
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-emerald-300 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">{licenceFile.name}</span>
                          <span className="text-slate-400 text-[10px]">({formatFileSize(licenceFile.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('licence')}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-white border border-dashed border-slate-300 hover:border-teal-500 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors">
                        <Upload className="w-4 h-4 text-teal-600" />
                        <span>Upload Driver's Licence (PDF &lt; 1MB)</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileChange('licence', e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Document 2: Driver Picture / Photo */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        2. Driver Picture / Portrait (PDF) *
                      </span>
                      <span className="text-[10px] text-slate-500">Max 1MB</span>
                    </div>

                    {pictureFile ? (
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-emerald-300 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">{pictureFile.name}</span>
                          <span className="text-slate-400 text-[10px]">({formatFileSize(pictureFile.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('picture')}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-white border border-dashed border-slate-300 hover:border-teal-500 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors">
                        <Upload className="w-4 h-4 text-teal-600" />
                        <span>Upload Driver Picture (PDF &lt; 1MB)</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileChange('picture', e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Document 3: Residential Proof */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        3. Residential Proof (Utility Bill / Lease in PDF) *
                      </span>
                      <span className="text-[10px] text-slate-500">Max 1MB</span>
                    </div>

                    {residenceFile ? (
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-emerald-300 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">{residenceFile.name}</span>
                          <span className="text-slate-400 text-[10px]">({formatFileSize(residenceFile.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('residence')}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-white border border-dashed border-slate-300 hover:border-teal-500 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors">
                        <Upload className="w-4 h-4 text-teal-600" />
                        <span>Upload Residential Proof (PDF &lt; 1MB)</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileChange('residence', e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !emailValid}
                  className="w-full gradient-teal text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 text-sm mt-3 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Verifying & Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Application & Register Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 section-fade space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-navy">Application & Credentials Submitted!</h2>
              <p className="text-slate-600 text-xs leading-relaxed max-w-sm mx-auto">
                Your driver application and 3 required documents (Licence, Picture, Residential Proof) have been verified and submitted to the Gallant Line Haul safety desk.
              </p>

              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-left space-y-1">
                <div className="font-bold text-xs text-teal-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-teal-700" />
                  <span>Confirmation Dispatched</span>
                </div>
                <p className="text-xs text-teal-900 leading-relaxed">
                  A verification receipt has been sent to <strong>{email}</strong>. Your profile has been automatically verified and you can now sign in directly to your Driver Portal.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Licence PDF:</span>
                  <span className="text-emerald-700 font-bold">{licenceFile?.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Picture PDF:</span>
                  <span className="text-emerald-700 font-bold">{pictureFile?.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Residential Proof:</span>
                  <span className="text-emerald-700 font-bold">{residenceFile?.name}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login/careers"
                  className="w-full gradient-teal text-white font-bold py-3.5 rounded-xl shadow-md text-sm block"
                >
                  Proceed to Driver Portal Sign In
                </Link>
                <Link
                  href="/"
                  className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl text-xs hover:bg-slate-200 transition-colors block"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          )}

          {step !== 'success' && (
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-xs">
                Already registered with Gallant?{' '}
                <Link href="/login/careers" className="text-teal-600 font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
