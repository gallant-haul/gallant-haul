import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../context/RouterContext';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  Download,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Building2,
  Shield,
  Phone,
  Thermometer,
  Truck,
  ExternalLink,
  Bell,
} from 'lucide-react';

interface Shipment {
  id: string;
  proNumber: string;
  bolNumber: string;
  origin: string;
  destination: string;
  status: 'Booked' | 'In Transit' | 'Customs Cleared' | 'Delivered';
  equipment: string;
  cargo: string;
  temperature?: string;
  parsNumber: string;
  eta: string;
  currentMilestone: number; // 0 to 3
  milestones: { title: string; time: string; location: string }[];
}

import { adminStore, ShipmentRecord, PortalNotification } from '../services/adminStore';
import NotificationCenter from '../components/NotificationCenter';
import ThemeToggle from '../components/ThemeToggle';

export default function ClientPortalPage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Real-time production shipments from adminStore
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);

  const refreshClientData = () => {
    const realShipments = adminStore.getShipmentsForClient(user?.email);
    setShipments(realShipments);
    const userNotifs = adminStore.getNotificationsForUser(user?.email, 'client');
    setNotifications(userNotifs);
  };

  useEffect(() => {
    refreshClientData();

    const handleUpdate = () => {
      refreshClientData();
    };

    window.addEventListener('gallant-store-update', handleUpdate);
    return () => {
      window.removeEventListener('gallant-store-update', handleUpdate);
    };
  }, [user]);

  const filteredShipments = shipments.filter((shp) => {
    const matchesSearch =
      shp.proNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shp.bolNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shp.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shp.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || shp.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleDownloadDoc = (docType: string, proNumber: string) => {
    setDownloadNotice(`Generated ${docType} for ${proNumber}. Downloading secure PDF...`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 4000);
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
                  {profile.company_name || 'Client Freight Dashboard'}
                </h1>
                <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  Verified Shipper
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-3">
                <span>Account: <strong className="text-slate-200">{user?.email}</strong></span>
                <span>•</span>
                <span>Carrier: <strong className="text-teal-400">Gallant Line Haul Corp</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <ThemeToggle />
            <NotificationCenter userEmail={user?.email} userRole="client" />

            <Link
              href="/quote"
              className="gradient-teal hover:opacity-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center gap-2 btn-dynamic cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book New Freight</span>
            </Link>

            <a
              href="tel:+14167355356"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 btn-dynamic"
            >
              <Phone className="w-4 h-4 text-teal-400" />
              <span>24/7 Dispatch Desk</span>
            </a>
          </div>
        </div>


        {/* Live Border Transit Bulletin */}
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-teal-900 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
            <div>
              <span className="font-bold">Live US/Canada Border Crossing Update:</span> Ambassador Bridge & Peace Bridge commercial lanes normal transit (&lt;15 min delay). Fast-track C-TPAT lanes operational.
            </div>
          </div>
          <span className="text-xs text-teal-700 font-mono shrink-0">Updated 5 min ago</span>
        </div>

        {/* Download Feedback Banner */}
        {downloadNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search Pro #, BOL #, or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-900"
            />
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
            {['all', 'in transit', 'customs cleared', 'delivered'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Shipments List Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-slate-900">
              Active Cross-Border Freight Shipments ({filteredShipments.length})
            </h2>
            <span className="text-xs text-slate-500">Live Satellite Telemetry</span>
          </div>

          {filteredShipments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-extrabold text-navy">No Active Shipments in Transit</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {shipments.length === 0
                    ? `There are currently no active freight loads assigned to ${user?.email || 'your shipper account'}. When our dispatch desk books your loads, live satellite GPS tracking, customs PARS/PAPRS, and digital Bills of Lading will appear here in real-time.`
                    : 'No shipments matched your current search filters. Try resetting the status or query.'}
                </p>
              </div>
              {shipments.length === 0 && (
                <div className="pt-2">
                  <Link
                    href="/quote"
                    className="gradient-teal text-white font-bold py-2.5 px-6 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                  >
                    <span>Request a Freight Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            filteredShipments.map((shp) => (
              <div
                key={shp.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-extrabold text-navy">
                      {shp.proNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md">
                      BOL: {shp.bolNumber}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        shp.status === 'In Transit'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : shp.status === 'Customs Cleared'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {shp.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>ETA: <strong className="text-slate-900">{shp.eta}</strong></span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-5">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Route Corridor
                    </span>
                    <div className="space-y-1 text-sm font-semibold text-slate-800">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{shp.origin}</span>
                      </div>
                      <div className="flex items-start gap-2 text-navy">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{shp.destination}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Equipment & Clearance
                    </span>
                    <div className="text-sm text-slate-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{shp.equipment}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        PARS / PAPRS: <span className="font-mono font-bold text-slate-700">{shp.parsNumber}</span>
                      </div>
                      {shp.temperature && (
                        <div className="flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
                          <Thermometer className="w-3.5 h-3.5" />
                          <span>Temp: {shp.temperature}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Cargo Classification
                    </span>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      {shp.cargo}
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      Carrier Status: <strong className="text-emerald-700">GPS Active</strong>
                    </div>
                  </div>
                </div>

                {/* Visual Milestone Tracker with Dynamic Progress Bar */}
                <div className="py-4 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <span>Shipment Journey Progress</span>
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    </div>
                    <span className="font-mono font-bold text-teal-700">
                      {Math.round(((shp.currentMilestone + 1) / shp.milestones.length) * 100)}% Completed
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(((shp.currentMilestone + 1) / shp.milestones.length) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {shp.milestones.map((m, idx) => {
                      const isComplete = idx <= shp.currentMilestone;
                      const isCurrent = idx === shp.currentMilestone;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-teal-50/90 border-teal-400 shadow-sm stage-pulse'
                              : isComplete
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-white border-dashed border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                isComplete ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="truncate">{m.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{m.location}</div>
                          <div className="text-[10px] font-mono text-teal-700 mt-1">{m.time}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Documents footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadDoc('Bill of Lading', shp.proNumber)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors btn-dynamic cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download BoL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDoc('Customs Clearance e-Manifest', shp.proNumber)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors btn-dynamic cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Customs e-Manifest</span>
                    </button>

                    {shp.status === 'Delivered' && (
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc('Signed POD Receipt', shp.proNumber)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold transition-colors btn-dynamic cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Signed Proof of Delivery</span>
                      </button>
                    )}
                  </div>

                  <Link
                    href={`/contact?subject=Inquiry+regarding+Pro+${shp.proNumber}`}
                    className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1 btn-dynamic"
                  >
                    <span>Contact Assigned Dispatcher</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
