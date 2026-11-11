import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../context/RouterContext';
import {
  Truck,
  Upload,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Award,
  Phone,
  Calendar,
  DollarSign,
  MapPin,
  Shield,
  FileCheck,
  ArrowRight,
  Eye,
  Bell,
  LogOut,
  User,
} from 'lucide-react';
import { validatePdfFile, formatFileSize } from '../utils/validation';
import { adminStore, DriverAccount, PortalNotification, DISPATCH_STAGES } from '../services/adminStore';
import NotificationCenter from '../components/NotificationCenter';
import ThemeToggle from '../components/ThemeToggle';

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  fileName: string | null;
  uploadedAt: string | null;
  status: 'Pending Upload' | 'Under Review' | 'Approved & Verified';
}

export default function DriverPortalPage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const [driverRecord, setDriverRecord] = useState<DriverAccount | null>(null);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [stageUpdateNotice, setStageUpdateNotice] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Load real driver data from adminStore
  const refreshDriverData = () => {
    if (!user?.email) return;
    const rec = adminStore.getDriverByEmail(user.email);
    setDriverRecord(rec || null);
    const notifs = adminStore.getNotificationsForUser(user.email, 'driver');
    setNotifications(notifs);
  };

  useEffect(() => {
    refreshDriverData();

    const handleUpdate = () => {
      refreshDriverData();
    };

    window.addEventListener('gallant-store-update', handleUpdate);
    return () => {
      window.removeEventListener('gallant-store-update', handleUpdate);
    };
  }, [user]);

  const assignedRun = driverRecord?.assignedRun;

  const handleUpdateRunStage = (newStage: number) => {
    if (!driverRecord || !assignedRun) return;

    adminStore.updateDriverRunStage(driverRecord.id, newStage);

    setStageUpdateNotice(`Dispatch status updated to: ${DISPATCH_STAGES[newStage].title}. Central dispatch desk synchronized in real-time.`);
    setTimeout(() => {
      setStageUpdateNotice(null);
    }, 4000);
  };

  // Build document vault from real uploaded documents
  const documents: DocumentItem[] = [
    {
      id: 'doc-licence',
      name: "Commercial Driver's Licence (CDL-A / Class 1)",
      category: 'Licence Verification',
      fileName: driverRecord?.licenceDoc || (profile.licence_doc as string) || null,
      uploadedAt: driverRecord?.docsSubmittedAt ? new Date(driverRecord.docsSubmittedAt).toLocaleDateString() : null,
      status: driverRecord?.licenceDoc ? 'Approved & Verified' : 'Pending Upload',
    },
    {
      id: 'doc-picture',
      name: 'Driver Portrait / Photographic ID',
      category: 'Security Identification',
      fileName: driverRecord?.pictureDoc || (profile.picture_doc as string) || null,
      uploadedAt: driverRecord?.docsSubmittedAt ? new Date(driverRecord.docsSubmittedAt).toLocaleDateString() : null,
      status: driverRecord?.pictureDoc ? 'Approved & Verified' : 'Pending Upload',
    },
    {
      id: 'doc-residence',
      name: 'Residential Proof / Utility Bill',
      category: 'FAST Compliance',
      fileName: driverRecord?.residenceDoc || (profile.residence_doc as string) || null,
      uploadedAt: driverRecord?.docsSubmittedAt ? new Date(driverRecord.docsSubmittedAt).toLocaleDateString() : null,
      status: driverRecord?.residenceDoc ? 'Approved & Verified' : 'Pending Upload',
    },
  ];

  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setStageUpdateNotice(`Upload error: ${validation.error}`);
      setTimeout(() => setStageUpdateNotice(null), 5000);
      e.target.value = '';
      return;
    }

    if (driverRecord) {
      const updates: Partial<DriverAccount> = {};
      if (docId === 'doc-licence') updates.licenceDoc = file.name;
      if (docId === 'doc-picture') updates.pictureDoc = file.name;
      if (docId === 'doc-residence') updates.residenceDoc = file.name;
      updates.docsSubmittedAt = new Date().toISOString();

      adminStore.updateDriver(driverRecord.id, updates);
    }

    setUploadFeedback(`Document "${file.name}" (${formatFileSize(file.size)}) validated as PDF < 1MB and uploaded.`);
    setTimeout(() => setUploadFeedback(null), 5000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login/careers');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header / Account Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-slate-700/80 overflow-hidden shrink-0">
              <img
                src="/assets/aistudio/image_341d9178.png"
                alt="Gallant Line Haul Corp Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {driverRecord?.fullName || profile.full_name || 'Driver Operations Desk'}
                </h1>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    driverRecord?.status === 'On Route'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {driverRecord?.status || 'Active Certified Driver'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="text-teal-400 font-mono">
                  {driverRecord?.licenseClass || profile.license_class || 'Class 1 / CDL-A'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationCenter userEmail={user?.email} userRole="driver" />
            <a
              href="tel:+14167355356"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700 btn-dynamic"
            >
              <Phone className="w-4 h-4 text-teal-400" />
              <span>24/7 Safety Dispatch</span>
            </a>
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors border border-rose-800/60 btn-dynamic cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>


        {/* Feedback Notices */}
        {(stageUpdateNotice || uploadFeedback) && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 text-xs font-semibold flex items-center gap-2 section-fade">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>{stageUpdateNotice || uploadFeedback}</span>
          </div>
        )}

        {/* ACTIVE DISPATCH RUN SECTION */}
        {assignedRun ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 section-fade">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                  Assigned Dedicated Load
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy flex items-center gap-2">
                  <span>Trip #{assignedRun.tripNumber}</span>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {assignedRun.equipment}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Settlement Rate: {assignedRun.rate}</span>
                </span>
              </div>
            </div>

            {/* Route details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pickup Facility</span>
                <div className="text-sm font-bold text-slate-900">{assignedRun.origin}</div>
                <div className="text-xs font-mono text-teal-700">Scheduled Dispatch</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Delivery Destination</span>
                <div className="text-sm font-bold text-slate-900">{assignedRun.destination}</div>
                <div className="text-xs font-mono text-teal-700">Target ETA: {assignedRun.eta}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cargo Specifications</span>
                <div className="text-sm font-bold text-slate-900">{assignedRun.cargo}</div>
                <div className="text-xs text-emerald-600 font-semibold">FAST Border Corridor Assigned</div>
              </div>
            </div>

            {/* Interactive Run Status Stepper with Real-Time Progress Bar */}
            <div className="pt-5 border-t border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span>Live Dispatch Milestone</span>
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any milestone checkpoint to transmit real-time GPS & route progress to Gallant Central Dispatch and the Shipper.
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-teal-700">
                    {DISPATCH_STAGES[assignedRun.currentStage ?? 0]?.percent || 10}% Completed
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Checkpoint {(assignedRun.currentStage ?? 0) + 1} of 5
                  </div>
                </div>
              </div>

              {/* Progress bar with teal glow */}
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${DISPATCH_STAGES[assignedRun.currentStage ?? 0]?.percent || 10}%`,
                  }}
                />
              </div>

              {/* Quick Advance Button */}
              {(assignedRun.currentStage ?? 0) < 4 && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateRunStage((assignedRun.currentStage ?? 0) + 1)}
                    className="px-5 py-2.5 rounded-xl gradient-teal text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all btn-dynamic cursor-pointer"
                  >
                    <span>Advance Checkpoint: {DISPATCH_STAGES[(assignedRun.currentStage ?? 0) + 1]?.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 5 Milestone Checkpoint Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {DISPATCH_STAGES.map((stage) => {
                  const currentStage = assignedRun.currentStage ?? 0;
                  const isCompleted = stage.stage <= currentStage;
                  const isCurrent = stage.stage === currentStage;
                  return (
                    <button
                      key={stage.stage}
                      type="button"
                      onClick={() => handleUpdateRunStage(stage.stage)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-teal-600 text-white border-teal-600 shadow-lg transform -translate-y-1 stage-pulse'
                          : isCompleted
                          ? 'bg-teal-50 border-teal-200 text-teal-950 hover:bg-teal-100 hover:border-teal-300'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="font-mono uppercase tracking-wider text-[10px]">
                          Step {stage.stage + 1}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-teal-600'}`} />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-bold leading-snug">{stage.title}</div>
                      <div className={`text-[11px] mt-1 leading-normal ${isCurrent ? 'text-teal-100' : 'text-slate-400'}`}>
                        {stage.shortDesc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Standby State When No Load is Assigned */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Truck className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-extrabold text-navy">No Active Dispatch Assigned</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                You are currently on standby with Gallant Line Haul Corp. When central dispatch assigns a dedicated cross-border load or regional trip, your trip manifest and route milestones will appear here in real-time.
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready & Available for Dedicated Corridors</span>
              </span>
            </div>
          </div>
        )}

        {/* DRIVER DOCUMENT VAULT (Strict PDF < 1MB) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                Compliance & Safety
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy flex items-center gap-2">
                <span>Driver Document Vault</span>
                <Shield className="w-5 h-5 text-teal-600" />
              </h2>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Verified Canadian Bonded & C-TPAT Compliance
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 font-mono">
                      {doc.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === 'Approved & Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{doc.name}</h3>

                  {doc.fileName ? (
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mt-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-600 mt-2 font-medium">
                      ⚠️ Document missing. Please upload in PDF &lt; 1MB.
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Strict PDF &lt; 1MB</span>

                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors">
                      <Upload className="w-3.5 h-3.5 text-teal-400" />
                      <span>{doc.fileName ? 'Replace PDF' : 'Upload PDF'}</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => handleFileUpload(doc.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
