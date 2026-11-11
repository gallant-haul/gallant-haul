import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  adminStore,
  DriverAccount,
  ShipperAccount,
  ShipmentRecord,
  QuoteSubmission,
  PortalNotification,
  DISPATCH_STAGES,
} from '../services/adminStore';
import NotificationCenter from '../components/NotificationCenter';
import ThemeToggle from '../components/ThemeToggle';
import {
  ShieldCheck,
  Truck,
  Building2,
  Package,
  FileText,
  Bell,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  LogOut,
  Send,
  Eye,
  MapPin,
  RefreshCw,
  Phone,
  Mail,
  Award,
  DollarSign,
  ChevronRight,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { isValidEmail } from '../utils/validation';

export default function AdminPortalPage() {
  const router = useRouter();
  const { isAdmin, signOut } = useAuth();

  // Guard: Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/login/admin');
    }
  }, [isAdmin]);

  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'shippers' | 'shipments' | 'quotes' | 'notifications'>('overview');

  // Real-time store state
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [shippers, setShippers] = useState<ShipperAccount[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [quotes, setQuotes] = useState<QuoteSubmission[]>([]);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);

  // Search & Filters
  const [driverSearch, setDriverSearch] = useState('');
  const [driverFilterStatus, setDriverFilterStatus] = useState<string>('all');
  const [shipperSearch, setShipperSearch] = useState('');
  const [shipperFilterStatus, setShipperFilterStatus] = useState<string>('all');

  // Modals state
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [driverFormError, setDriverFormError] = useState<string | null>(null);
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverAccount | null>(null);
  const [assigningRunDriver, setAssigningRunDriver] = useState<DriverAccount | null>(null);

  const [isAddShipperOpen, setIsAddShipperOpen] = useState(false);
  const [shipperFormError, setShipperFormError] = useState<string | null>(null);
  const [isSubmittingShipper, setIsSubmittingShipper] = useState(false);
  const [editingShipper, setEditingShipper] = useState<ShipperAccount | null>(null);

  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);
  const [selectedShipperForShipment, setSelectedShipperForShipment] = useState<string>('');

  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);
  const [targetedEmailForNotif, setTargetedEmailForNotif] = useState<string>('');

  // In-App Delete Confirmation Modal State (Replaces blocked window.confirm)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'driver' | 'shipper' | 'shipment';
    id: string;
    name: string;
    email?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setShipments(adminStore.getShipments());
    setQuotes(adminStore.getQuotes());
    setNotifications(adminStore.getNotifications());

    // Fetch live users directly from Supabase Database
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.success && Array.isArray(json.users)) {
        const dbDrivers: DriverAccount[] = [];
        const dbShippers: ShipperAccount[] = [];

        json.users.forEach((u: any) => {
          if (u.role === 'driver') {
            dbDrivers.push({
              id: u.id,
              fullName: u.fullName || 'Driver Candidate',
              email: u.email,
              phone: u.phone,
              licenseClass: u.licenseClass || 'Class 1 / CDL-A',
              status: u.status || 'Active',
              registeredAt: new Date(u.createdAt).toLocaleDateString(),
              licenceDoc: u.licenceDoc,
              pictureDoc: u.pictureDoc,
              residenceDoc: u.residenceDoc,
              docsSubmittedAt: u.docsSubmittedAt,
              notes: u.notes,
            });
          } else {
            dbShippers.push({
              id: u.id,
              companyName: u.companyName || u.fullName || 'Shipper Enterprise',
              contactName: u.contactName || u.fullName || '',
              email: u.email,
              phone: u.phone,
              status: u.status || 'Active',
              registeredAt: new Date(u.createdAt).toLocaleDateString(),
              notes: u.notes,
            });
          }
        });

        // Supabase DB is the source of truth for accounts.
        // We merge local dispatch runs for active drivers.
        const localDrivers = adminStore.getDrivers();
        const mergedDrivers = dbDrivers.map((dbD) => {
          const localMatch = localDrivers.find(
            (ld) => ld.email.toLowerCase() === dbD.email.toLowerCase() || ld.id === dbD.id
          );
          return {
            ...dbD,
            assignedRun: localMatch?.assignedRun || null,
          };
        });

        const localShippers = adminStore.getShippers();
        const mergedShippers = dbShippers.map((dbS) => {
          const localMatch = localShippers.find(
            (ls) => ls.email.toLowerCase() === dbS.email.toLowerCase() || ls.id === dbS.id
          );
          return {
            ...dbS,
            address: localMatch?.address,
          };
        });

        setDrivers(mergedDrivers);
        setShippers(mergedShippers);
        adminStore.saveDrivers(mergedDrivers);
        adminStore.saveShippers(mergedShippers);
        return;
      }
    } catch (err) {
      console.warn('Could not load from /api/admin/users, falling back to local store:', err);
    }

    setDrivers(adminStore.getDrivers());
    setShippers(adminStore.getShippers());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('gallant-store-update', handleUpdate);
    return () => {
      window.removeEventListener('gallant-store-update', handleUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/login/admin');
  };

  // --- CONFIRMED DELETION ACTION (NO BLOCKED window.confirm) ---
  const confirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeleting(true);

    try {
      if (deleteConfirmTarget.type === 'driver') {
        const query = deleteConfirmTarget.email ? `?email=${encodeURIComponent(deleteConfirmTarget.email)}` : '';
        await fetch(`/api/admin/users/${deleteConfirmTarget.id}${query}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: deleteConfirmTarget.email }),
        });
        adminStore.deleteDriver(deleteConfirmTarget.id);
        if (deleteConfirmTarget.email) {
          adminStore.deleteDriver(deleteConfirmTarget.email);
        }
        showToast(`✓ Driver ${deleteConfirmTarget.name} removed from Supabase DB.`);
        await loadData();
      } else if (deleteConfirmTarget.type === 'shipper') {
        const query = deleteConfirmTarget.email ? `?email=${encodeURIComponent(deleteConfirmTarget.email)}` : '';
        await fetch(`/api/admin/users/${deleteConfirmTarget.id}${query}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: deleteConfirmTarget.email }),
        });
        adminStore.deleteShipper(deleteConfirmTarget.id);
        if (deleteConfirmTarget.email) {
          adminStore.deleteShipper(deleteConfirmTarget.email);
        }
        showToast(`✓ Shipper ${deleteConfirmTarget.name} removed from Supabase DB.`);
        await loadData();
      } else if (deleteConfirmTarget.type === 'shipment') {
        adminStore.deleteShipment(deleteConfirmTarget.id);
        showToast('Shipment removed.');
        loadData();
      }
    } catch (err: any) {
      showToast(`Error deleting: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmTarget(null);
    }
  };

  // --- DRIVER ACTIONS ---
  const handleCreateDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDriverFormError(null);
    setIsSubmittingDriver(true);

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get('fullName') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const password = (formData.get('password') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const licenseClass = (formData.get('licenseClass') as string || '').trim();
    const status = formData.get('status') as DriverAccount['status'];
    const notes = (formData.get('notes') as string || '').trim();

    if (!fullName) {
      setDriverFormError('Please enter full legal name for the driver.');
      setIsSubmittingDriver(false);
      return;
    }

    if (!isValidEmail(email)) {
      setDriverFormError('Please enter a valid driver email address (e.g. driver@example.com).');
      setIsSubmittingDriver(false);
      return;
    }

    if (password && password.length < 6) {
      setDriverFormError('Password must be at least 6 characters long (or leave blank to auto-generate).');
      setIsSubmittingDriver(false);
      return;
    }

    try {
      // 1. Create directly in Supabase Database
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: password || undefined,
          role: 'driver',
          metadata: {
            full_name: fullName,
            phone,
            license_class: licenseClass || 'Class 1 / CDL-A',
            status: status || 'Active',
            notes,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.error || 'Failed to create driver in database.');
      }

      // 2. Also register in local adminStore with real Supabase DB ID
      const newDriver = adminStore.addDriver({
        fullName,
        email,
        phone,
        licenseClass: licenseClass || 'Class 1 / CDL-A',
        status: status || 'Active',
        notes,
      });

      if (json.user?.id) {
        adminStore.updateDriver(newDriver.id, { id: json.user.id });
      }

      setIsAddDriverOpen(false);
      showToast(`✓ Driver ${fullName} saved to Supabase DB!`);
      await loadData();
    } catch (err: any) {
      setDriverFormError(err.message || 'Database error occurred while adding driver.');
    } finally {
      setIsSubmittingDriver(false);
    }
  };

  const handleUpdateDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDriver) return;
    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get('fullName') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const licenseClass = (formData.get('licenseClass') as string || '').trim();
    const status = formData.get('status') as DriverAccount['status'];
    const notes = (formData.get('notes') as string || '').trim();

    try {
      // Update in Supabase Database
      await fetch(`/api/admin/users/${editingDriver.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingDriver.email,
          user_metadata: {
            role: 'driver',
            full_name: fullName,
            phone,
            license_class: licenseClass,
            status,
            notes,
          },
        }),
      });
    } catch (err) {
      console.warn('Could not update in DB:', err);
    }

    adminStore.updateDriver(editingDriver.id, {
      fullName,
      phone,
      licenseClass,
      status,
      notes,
    });

    setEditingDriver(null);
    showToast(`Driver ${fullName} updated in database.`);
    loadData();
  };

  const handleDeleteDriver = (driver: DriverAccount) => {
    setDeleteConfirmTarget({
      type: 'driver',
      id: driver.id,
      name: driver.fullName,
      email: driver.email,
    });
  };

  const handleAssignRunToDriver = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assigningRunDriver) return;
    const formData = new FormData(e.currentTarget);

    const tripNumber = formData.get('tripNumber') as string || `TRIP-${Math.floor(10000 + Math.random() * 90000)}`;
    const origin = formData.get('origin') as string;
    const destination = formData.get('destination') as string;
    const equipment = formData.get('equipment') as string;
    const cargo = formData.get('cargo') as string;
    const rate = formData.get('rate') as string;
    const eta = formData.get('eta') as string;

    adminStore.updateDriver(assigningRunDriver.id, {
      status: 'On Route',
      assignedRun: {
        tripNumber,
        origin,
        destination,
        equipment,
        cargo,
        rate,
        eta,
        currentStage: 0,
      },
    });

    // Also auto-notify the driver
    adminStore.addNotification({
      targetType: 'specific_driver',
      targetEmail: assigningRunDriver.email,
      title: `New Dispatch Assigned: ${tripNumber}`,
      message: `You have been dispatched on ${origin} to ${destination} (${equipment}). Rate: ${rate}. Check your driver portal for details.`,
      priority: 'urgent',
    });

    setAssigningRunDriver(null);
    showToast(`Dispatch ${tripNumber} assigned to ${assigningRunDriver.fullName}.`);
  };

  const handleClearDriverRun = (driverId: string) => {
    adminStore.updateDriver(driverId, {
      status: 'Active',
      assignedRun: null,
    });
    showToast('Driver run marked complete/standby.');
  };

  // --- SHIPPER ACTIONS ---
  const handleCreateShipper = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShipperFormError(null);
    setIsSubmittingShipper(true);

    const formData = new FormData(e.currentTarget);
    const companyName = (formData.get('companyName') as string || '').trim();
    const contactName = (formData.get('contactName') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const password = (formData.get('password') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const status = formData.get('status') as ShipperAccount['status'];
    const notes = (formData.get('notes') as string || '').trim();

    if (!companyName) {
      setShipperFormError('Please enter company/enterprise name.');
      setIsSubmittingShipper(false);
      return;
    }

    if (!isValidEmail(email)) {
      setShipperFormError('Please enter a valid company email address.');
      setIsSubmittingShipper(false);
      return;
    }

    if (password && password.length < 6) {
      setShipperFormError('Password must be at least 6 characters long (or leave blank to auto-generate).');
      setIsSubmittingShipper(false);
      return;
    }

    try {
      // 1. Create directly in Supabase Database
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: password || undefined,
          role: 'client',
          metadata: {
            company_name: companyName,
            contact_name: contactName || companyName,
            full_name: contactName || companyName,
            phone,
            status: status || 'Active',
            notes,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.error || 'Failed to create shipper in database.');
      }

      // 2. Also register in local adminStore with real Supabase DB ID
      const newShipper = adminStore.addShipper({
        companyName,
        contactName: contactName || companyName,
        email,
        phone,
        status: status || 'Active',
        notes,
      });

      if (json.user?.id) {
        adminStore.updateShipper(newShipper.id, { id: json.user.id });
      }

      setIsAddShipperOpen(false);
      showToast(`✓ Shipper ${companyName} saved to Supabase DB!`);
      await loadData();
    } catch (err: any) {
      setShipperFormError(err.message || 'Database error occurred while adding shipper.');
    } finally {
      setIsSubmittingShipper(false);
    }
  };

  const handleUpdateShipper = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingShipper) return;
    const formData = new FormData(e.currentTarget);
    const companyName = (formData.get('companyName') as string || '').trim();
    const contactName = (formData.get('contactName') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const status = formData.get('status') as ShipperAccount['status'];
    const notes = (formData.get('notes') as string || '').trim();

    try {
      // Update in Supabase Database
      await fetch(`/api/admin/users/${editingShipper.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingShipper.email,
          user_metadata: {
            role: 'client',
            company_name: companyName,
            contact_name: contactName,
            full_name: contactName,
            phone,
            status,
            notes,
          },
        }),
      });
    } catch (err) {
      console.warn('Could not update shipper in DB:', err);
    }

    adminStore.updateShipper(editingShipper.id, {
      companyName,
      contactName,
      phone,
      status,
      notes,
    });

    setEditingShipper(null);
    showToast(`Shipper ${companyName} updated in database.`);
    loadData();
  };

  const handleDeleteShipper = (shipper: ShipperAccount) => {
    setDeleteConfirmTarget({
      type: 'shipper',
      id: shipper.id,
      name: shipper.companyName,
      email: shipper.email,
    });
  };

  // --- SHIPMENT ACTIONS ---
  const handleCreateShipment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const shipperEmail = formData.get('shipperEmail') as string;
    const proNumber = formData.get('proNumber') as string || `GLH-${Math.floor(10000 + Math.random() * 90000)}-CDN`;
    const bolNumber = formData.get('bolNumber') as string || `BOL-${Math.floor(10000 + Math.random() * 90000)}`;
    const origin = formData.get('origin') as string;
    const destination = formData.get('destination') as string;
    const status = formData.get('status') as ShipmentRecord['status'];
    const equipment = formData.get('equipment') as string;
    const cargo = formData.get('cargo') as string;
    const temperature = formData.get('temperature') as string;
    const parsNumber = formData.get('parsNumber') as string || `PARS-${Math.floor(10000 + Math.random() * 90000)}`;
    const eta = formData.get('eta') as string;

    adminStore.addShipment({
      shipperEmail,
      proNumber,
      bolNumber,
      origin,
      destination,
      status,
      equipment,
      cargo,
      temperature,
      parsNumber,
      eta,
      currentMilestone: status === 'Delivered' ? 3 : status === 'Customs Cleared' ? 2 : status === 'In Transit' ? 1 : 0,
      milestones: [
        { title: 'Load Booked & Dispatched', time: 'Initial Manifest', location: origin },
        { title: 'In Transit across Corridor', time: 'En Route', location: 'Commercial Highway' },
        { title: 'Customs & Border Cleared', time: 'Inspection Complete', location: 'Ambassador / Peace Bridge' },
        { title: 'Delivered & Signed', time: eta, location: destination },
      ],
    });

    // Notify shipper
    adminStore.addNotification({
      targetType: 'specific_shipper',
      targetEmail: shipperEmail,
      title: `Freight Load Confirmed: ${proNumber}`,
      message: `Your shipment from ${origin} to ${destination} is confirmed under PRO #${proNumber}. Live GPS tracking is now available in your portal.`,
      priority: 'info',
    });

    setIsAddShipmentOpen(false);
    showToast(`Shipment ${proNumber} created and assigned to ${shipperEmail}.`);
  };

  const handleUpdateShipmentStatus = (shipmentId: string, newStatus: ShipmentRecord['status']) => {
    const milestoneMap: Record<ShipmentRecord['status'], number> = {
      Booked: 0,
      'In Transit': 1,
      'Customs Cleared': 2,
      Delivered: 3,
    };

    adminStore.updateShipment(shipmentId, {
      status: newStatus,
      currentMilestone: milestoneMap[newStatus],
    });
    showToast(`Shipment status updated to: ${newStatus}`);
  };

  const handleDeleteShipment = (id: string) => {
    setDeleteConfirmTarget({
      type: 'shipment',
      id,
      name: `Shipment #${id}`,
    });
  };

  // --- QUOTE ACTIONS ---
  const handleUpdateQuoteStatus = (quoteId: string, status: QuoteSubmission['status'], quotedRate?: string) => {
    adminStore.updateQuote(quoteId, {
      status,
      quotedRate: quotedRate || undefined,
    });
    showToast(`Quote updated to: ${status}`);
  };

  // --- NOTIFICATION ACTIONS ---
  const handleSendNotification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const targetType = formData.get('targetType') as PortalNotification['targetType'];
    const targetEmail = formData.get('targetEmail') as string;
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const priority = formData.get('priority') as PortalNotification['priority'];

    adminStore.addNotification({
      targetType,
      targetEmail: targetEmail || undefined,
      title,
      message,
      priority,
    });

    setIsCreateNotificationOpen(false);
    showToast(`Notification broadcast dispatched.`);
  };

  const handleDeleteNotification = (id: string) => {
    adminStore.deleteNotification(id);
    showToast('Notification alert deleted.');
  };

  // Filtered Lists
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.email.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.phone.toLowerCase().includes(driverSearch.toLowerCase());
    const matchesStatus = driverFilterStatus === 'all' || d.status.toLowerCase() === driverFilterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredShippers = shippers.filter((s) => {
    const matchesSearch =
      s.companyName.toLowerCase().includes(shipperSearch.toLowerCase()) ||
      s.contactName.toLowerCase().includes(shipperSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(shipperSearch.toLowerCase());
    const matchesStatus = shipperFilterStatus === 'all' || s.status.toLowerCase() === shipperFilterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Command Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden border border-slate-700/60 shrink-0">
              <img
                src="/assets/aistudio/image_341d9178.png"
                alt="Gallant Line Haul Corp Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">Gallant Line Haul Corp</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-900/70 text-teal-300 border border-teal-600/50">
                  MASTER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Logged in as: info@gallant-corp.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationCenter userEmail="info@gallant-corp.com" userRole="admin" />
            <button
              onClick={() => {
                setTargetedEmailForNotif('');
                setIsCreateNotificationOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 btn-dynamic"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Broadcast Alert</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-800/60 btn-dynamic"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-Header Navigation Tabs */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Operations Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'drivers'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Driver Desk ({drivers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shippers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'shippers'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Shipper Desk ({shippers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'shipments'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Live Shipments ({shipments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'quotes'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Freight Quotes ({quotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Portal Broadcasts ({notifications.length})</span>
          </button>
        </div>
      </div>

      {/* Main Administrative Views */}
      <main className="max-w-7xl mx-auto w-full p-6 flex-1">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 section-fade">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('drivers')}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 cursor-pointer hover:border-teal-500/50 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Driver Fleet</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-teal-400 transition-colors">
                      {drivers.length}
                    </h3>
                  </div>
                  <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span>{drivers.filter((d) => d.status === 'Active' || d.status === 'On Route').length} Active / On Route</span>
                  <span className="text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">Manage →</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('shippers')}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 cursor-pointer hover:border-teal-500/50 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Shipper Clients</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-teal-400 transition-colors">
                      {shippers.length}
                    </h3>
                  </div>
                  <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span>{shippers.filter((s) => s.status === 'Active' || s.status === 'Credit Approved').length} Verified Accounts</span>
                  <span className="text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">Manage →</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('shipments')}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 cursor-pointer hover:border-teal-500/50 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live Shipments</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-teal-400 transition-colors">
                      {shipments.length}
                    </h3>
                  </div>
                  <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span>{shipments.filter((s) => s.status === 'In Transit').length} In Transit</span>
                  <span className="text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">Track →</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('quotes')}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 cursor-pointer hover:border-teal-500/50 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Freight Quotes</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-teal-400 transition-colors">
                      {quotes.length}
                    </h3>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span>{quotes.filter((q) => q.status === 'New').length} Pending Review</span>
                  <span className="text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">Review →</span>
                </div>
              </div>
            </div>

            {/* Quick Action Matrix */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>⚡</span> Master Operations Command
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setIsAddDriverOpen(true)}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group flex items-center gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-teal-400">Add New Driver</h4>
                    <p className="text-xs text-slate-400">Register driver & credentials</p>
                  </div>
                </button>

                <button
                  onClick={() => setIsAddShipperOpen(true)}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group flex items-center gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-teal-400">Add New Shipper</h4>
                    <p className="text-xs text-slate-400">Create client corporate profile</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (shippers.length === 0) {
                      showToast('Please register at least one shipper before creating a shipment load.');
                      return;
                    }
                    setSelectedShipperForShipment(shippers[0].email);
                    setIsAddShipmentOpen(true);
                  }}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group flex items-center gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-teal-400">Create Shipment</h4>
                    <p className="text-xs text-slate-400">Assign live PRO & BOL to client</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setTargetedEmailForNotif('');
                    setIsCreateNotificationOpen(true);
                  }}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group flex items-center gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400">Send Notification</h4>
                    <p className="text-xs text-slate-400">Broadcast alert to portals</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Shipments & Drivers Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Active Drivers */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-teal-400" />
                    <span>Driver Roster Overview</span>
                  </h3>
                  <button onClick={() => setActiveTab('drivers')} className="text-xs text-teal-400 hover:underline">
                    View all ({drivers.length}) →
                  </button>
                </div>

                {drivers.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No drivers registered yet. Use "Add New Driver" or wait for driver applications via /careers/apply.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {drivers.slice(0, 4).map((drv) => (
                      <div key={drv.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{drv.fullName}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                drv.status === 'On Route'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : drv.status === 'Active'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {drv.status}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {drv.email} • {drv.licenseClass}
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingDriver(drv)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                        >
                          Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Shippers */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-400" />
                    <span>Client Shippers Overview</span>
                  </h3>
                  <button onClick={() => setActiveTab('shippers')} className="text-xs text-teal-400 hover:underline">
                    View all ({shippers.length}) →
                  </button>
                </div>

                {shippers.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No shipper accounts registered yet. Use "Add New Shipper" or shippers can register at /login/client.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {shippers.slice(0, 4).map((shp) => (
                      <div key={shp.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{shp.companyName}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {shp.status}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            Contact: {shp.contactName} • {shp.email}
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingShipper(shp)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                        >
                          Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DRIVERS DESK */}
        {/* ========================================================= */}
        {activeTab === 'drivers' && (
          <div className="space-y-6 section-fade">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">Driver Fleet Operations</h2>
                <p className="text-xs text-slate-400">
                  Manage driver credentials, change verification statuses, assign dedicated runs, and upload safety docs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddDriverOpen(true)}
                  className="gradient-teal text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Driver</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  placeholder="Search drivers by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={driverFilterStatus}
                  onChange={(e) => setDriverFilterStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="on route">On Route</option>
                  <option value="pending verification">Pending Verification</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Drivers List */}
            {filteredDrivers.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Truck className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Drivers Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {driverSearch || driverFilterStatus !== 'all'
                    ? 'No drivers match your search filters.'
                    : 'There are currently no driver accounts in the system. Use "Add New Driver" or wait for driver applications.'}
                </p>
                <button
                  onClick={() => setIsAddDriverOpen(true)}
                  className="gradient-teal text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Driver Profile</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{driver.fullName}</h3>
                          <select
                            value={driver.status}
                            onChange={(e) => {
                              adminStore.updateDriver(driver.id, {
                                status: e.target.value as DriverAccount['status'],
                              });
                              showToast(`Status updated to ${e.target.value}`);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold outline-none cursor-pointer ${
                              driver.status === 'On Route'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : driver.status === 'Active'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : driver.status === 'Pending Verification'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="On Route">On Route</option>
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            {driver.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            {driver.phone || 'N/A'}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingDriver(driver)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Edit Driver Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                          title="Remove Driver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* License & Onboarding Documents */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold text-slate-400">License Class:</span>
                        <span className="font-mono text-teal-400">{driver.licenseClass}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold text-slate-400">Registered:</span>
                        <span>{driver.registeredAt}</span>
                      </div>
                      {(driver.licenceDoc || driver.pictureDoc || driver.residenceDoc) && (
                        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                          <span className="text-teal-400 font-bold block">Uploaded Application Documents:</span>
                          {driver.licenceDoc && <div>📄 Licence: {driver.licenceDoc} (PDF &lt; 1MB)</div>}
                          {driver.pictureDoc && <div>📷 Picture: {driver.pictureDoc} (PDF &lt; 1MB)</div>}
                          {driver.residenceDoc && <div>🏠 Residence: {driver.residenceDoc} (PDF &lt; 1MB)</div>}
                        </div>
                      )}
                    </div>

                    {/* Active Run Status with Real-time Multi-Stage Progress Tracker */}
                    <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-3">
                      {driver.assignedRun ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-400">Load #{driver.assignedRun.tripNumber}</span>
                              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                                {driver.assignedRun.equipment}
                              </span>
                            </div>
                            <button
                              onClick={() => handleClearDriverRun(driver.id)}
                              className="text-[10px] text-slate-400 hover:text-rose-400 underline transition-colors cursor-pointer"
                            >
                              End Load / Standby
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-300 flex items-center justify-between">
                            <span className="truncate max-w-[220px]">
                              {driver.assignedRun.origin} → {driver.assignedRun.destination}
                            </span>
                            <span className="font-mono text-emerald-400 font-bold">{driver.assignedRun.rate}</span>
                          </div>

                          {/* 5-Stage Live Dispatch Progress */}
                          <div className="pt-2 border-t border-slate-800/80 space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-slate-400 uppercase tracking-wider">
                                Dispatch Progress (Stage {(driver.assignedRun.currentStage ?? 0) + 1}/5)
                              </span>
                              <span className="font-mono font-bold text-teal-400">
                                {DISPATCH_STAGES[driver.assignedRun.currentStage ?? 0]?.percent || 10}%
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                                style={{
                                  width: `${DISPATCH_STAGES[driver.assignedRun.currentStage ?? 0]?.percent || 10}%`,
                                }}
                              />
                            </div>

                            {/* Stage Stepper Buttons */}
                            <div className="grid grid-cols-5 gap-1 pt-1">
                              {DISPATCH_STAGES.map((stg) => {
                                const current = driver.assignedRun?.currentStage ?? 0;
                                const isPassed = stg.stage <= current;
                                const isActive = stg.stage === current;
                                return (
                                  <button
                                    key={stg.stage}
                                    type="button"
                                    onClick={() => {
                                      adminStore.updateDriverRunStage(driver.id, stg.stage);
                                      showToast(`Dispatch progress updated to: ${stg.title}`);
                                    }}
                                    title={`${stg.title}: ${stg.shortDesc}`}
                                    className={`p-1.5 rounded text-center transition-all cursor-pointer ${
                                      isActive
                                        ? 'bg-teal-500 text-slate-950 font-bold shadow-xs stage-pulse'
                                        : isPassed
                                        ? 'bg-teal-950 text-teal-300 border border-teal-800/60'
                                        : 'bg-slate-800/80 text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                                    }`}
                                  >
                                    <div className="text-[9px] font-mono leading-none">Step {stg.stage + 1}</div>
                                    <div className="text-[10px] truncate leading-tight mt-0.5">{stg.title.split(' ')[0]}</div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Advance stage quick action button */}
                            {(driver.assignedRun.currentStage ?? 0) < 4 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = (driver.assignedRun?.currentStage ?? 0) + 1;
                                  adminStore.updateDriverRunStage(driver.id, next);
                                  showToast(`Advanced to Stage ${next + 1}: ${DISPATCH_STAGES[next].title}`);
                                }}
                                className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all btn-dynamic cursor-pointer"
                              >
                                <span>Advance to: {DISPATCH_STAGES[(driver.assignedRun.currentStage ?? 0) + 1]?.title}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-xs italic">No active dispatch assigned (Standby)</span>
                          <button
                            onClick={() => setAssigningRunDriver(driver)}
                            className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-bold border border-teal-500/30 btn-dynamic"
                          >
                            + Assign Run
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                      <button
                        onClick={() => {
                          setTargetedEmailForNotif(driver.email);
                          setIsCreateNotificationOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-400" />
                        <span>Send Driver Alert</span>
                      </button>
                      {!driver.assignedRun && (
                        <button
                          onClick={() => setAssigningRunDriver(driver)}
                          className="px-3 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900 text-teal-300 border border-teal-700/50 text-xs font-semibold flex items-center gap-1.5 ml-auto"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Assign Load</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SHIPPERS DESK */}
        {/* ========================================================= */}
        {activeTab === 'shippers' && (
          <div className="space-y-6 section-fade">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">Shipper Accounts Desk</h2>
                <p className="text-xs text-slate-400">
                  Manage client accounts, credit status, create freight shipments, and broadcast portal messages.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddShipperOpen(true)}
                  className="gradient-teal text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Shipper</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={shipperSearch}
                  onChange={(e) => setShipperSearch(e.target.value)}
                  placeholder="Search by company name, contact, or email..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={shipperFilterStatus}
                  onChange={(e) => setShipperFilterStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="credit approved">Credit Approved</option>
                  <option value="pending review">Pending Review</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Shippers List */}
            {filteredShippers.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Shipper Accounts</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {shipperSearch || shipperFilterStatus !== 'all'
                    ? 'No shippers match your search query.'
                    : 'There are currently no shipper client accounts. Use "Add New Shipper" to register a client.'}
                </p>
                <button
                  onClick={() => setIsAddShipperOpen(true)}
                  className="gradient-teal text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Shipper</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredShippers.map((shipper) => {
                  const clientShipments = shipments.filter(
                    (s) => s.shipperEmail.toLowerCase() === shipper.email.toLowerCase()
                  );

                  return (
                    <div
                      key={shipper.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base">{shipper.companyName}</h3>
                            <select
                              value={shipper.status}
                              onChange={(e) => {
                                adminStore.updateShipper(shipper.id, {
                                  status: e.target.value as ShipperAccount['status'],
                                });
                                showToast(`Shipper status updated to ${e.target.value}`);
                              }}
                              className="px-2 py-0.5 rounded text-[11px] font-bold outline-none cursor-pointer bg-emerald-950 text-emerald-300 border border-emerald-800"
                            >
                              <option value="Active">Active</option>
                              <option value="Credit Approved">Credit Approved</option>
                              <option value="Pending Review">Pending Review</option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Contact: <span className="text-slate-200">{shipper.contactName}</span> • {shipper.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingShipper(shipper)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                            title="Edit Shipper"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteShipper(shipper)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                            title="Delete Shipper"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Info & Loads */}
                      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="font-semibold text-slate-400">Phone:</span>
                          <span>{shipper.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="font-semibold text-slate-400">Live Loads:</span>
                          <span className="font-bold text-teal-400">{clientShipments.length} Active Shipments</span>
                        </div>
                        {shipper.notes && (
                          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-1.5">
                            Notes: {shipper.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                        <button
                          onClick={() => {
                            setTargetedEmailForNotif(shipper.email);
                            setIsCreateNotificationOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Bell className="w-3.5 h-3.5 text-amber-400" />
                          <span>Send Client Alert</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedShipperForShipment(shipper.email);
                            setIsAddShipmentOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900 text-teal-300 border border-teal-700/50 text-xs font-semibold flex items-center gap-1.5 ml-auto"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>+ Assign Load</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LIVE SHIPMENTS */}
        {/* ========================================================= */}
        {activeTab === 'shipments' && (
          <div className="space-y-6 section-fade">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">Live Client Freight Shipments</h2>
                <p className="text-xs text-slate-400">
                  Real-time milestone dispatcher. Any update here reflects immediately on the client's self-service portal.
                </p>
              </div>

              <button
                onClick={() => {
                  if (shippers.length === 0) {
                    showToast('Please add a shipper before creating a shipment.');
                    return;
                  }
                  setSelectedShipperForShipment(shippers[0].email);
                  setIsAddShipmentOpen(true);
                }}
                className="gradient-teal text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Freight Shipment</span>
              </button>
            </div>

            {shipments.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Active Shipments in Pipeline</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  There are currently no active freight loads assigned to clients. All hardcoded demo data has been cleared.
                </p>
                <button
                  onClick={() => {
                    if (shippers.length === 0) {
                      setIsAddShipperOpen(true);
                    } else {
                      setSelectedShipperForShipment(shippers[0].email);
                      setIsAddShipmentOpen(true);
                    }
                  }}
                  className="gradient-teal text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Real Shipment</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {shipments.map((shp) => (
                  <div key={shp.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            PRO #{shp.proNumber}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">BOL #{shp.bolNumber}</span>
                          <span className="text-xs text-teal-400 font-mono">PARS: {shp.parsNumber}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                          Assigned Client: <strong className="text-slate-200">{shp.shipperEmail}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status selector */}
                        <select
                          value={shp.status}
                          onChange={(e) => handleUpdateShipmentStatus(shp.id, e.target.value as ShipmentRecord['status'])}
                          className="bg-slate-900 border border-teal-500/50 text-teal-300 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                        >
                          <option value="Booked">Booked</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Customs Cleared">Customs Cleared</option>
                          <option value="Delivered">Delivered</option>
                        </select>

                        <button
                          onClick={() => handleDeleteShipment(shp.id)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                          title="Delete Load"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Origin / Shipper</span>
                        <span className="text-white font-medium">{shp.origin}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Destination / Consignee</span>
                        <span className="text-white font-medium">{shp.destination}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Equipment & ETA</span>
                        <span className="text-teal-400 font-medium">
                          {shp.equipment} {shp.temperature ? `(${shp.temperature})` : ''} • {shp.eta}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Milestone Progress (Stage {shp.currentMilestone + 1} of 4)</span>
                        <span className="text-teal-400">{shp.status}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-teal-500 h-full transition-all duration-500"
                          style={{ width: `${((shp.currentMilestone + 1) / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: FREIGHT QUOTES DESK */}
        {/* ========================================================= */}
        {activeTab === 'quotes' && (
          <div className="space-y-6 section-fade">
            <div>
              <h2 className="text-xl font-extrabold text-white">Freight Quote Inquiries (/quote)</h2>
              <p className="text-xs text-slate-400">
                All freight quote submissions received from the public website. Also dispatched to info@gallant-corp.com.
              </p>
            </div>

            {quotes.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Quote Requests Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When shippers submit a freight quote request on /quote, it will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((q) => (
                  <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-900 text-teal-400 px-2 py-0.5 rounded border border-slate-800">
                            {q.refCode}
                          </span>
                          <h4 className="font-bold text-white text-sm">{q.company || q.fullName}</h4>
                          <span className="text-xs text-slate-400">({q.fullName})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {q.email} • {q.phone} • Submitted: {new Date(q.submittedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={q.status}
                          onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value as QuoteSubmission['status'])}
                          className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-2.5 py-1 text-white outline-none"
                        >
                          <option value="New">New</option>
                          <option value="In Review">In Review</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Booked">Booked</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Lane</span>
                        <span className="text-white font-medium">{q.pickup} → {q.destination}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Equipment & Date</span>
                        <span className="text-slate-300">{q.equipment} • {q.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Notes</span>
                        <span className="text-slate-300">{q.notes || 'None'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: NOTIFICATIONS & BROADCASTS */}
        {/* ========================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 section-fade">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">Portal Broadcasts & Live Alerts</h2>
                <p className="text-xs text-slate-400">
                  Broadcast system-wide notices or targeted dispatches to client and driver portals.
                </p>
              </div>

              <button
                onClick={() => {
                  setTargetedEmailForNotif('');
                  setIsCreateNotificationOpen(true);
                }}
                className="gradient-teal text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Portal Broadcast</span>
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Bell className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Active Alerts</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Dispatch weather advisories, customs border delays, or load notifications directly to portals.
                </p>
                <button
                  onClick={() => setIsCreateNotificationOpen(true)}
                  className="gradient-teal text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Alert</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-teal-300">
                            Target: {notif.targetType} {notif.targetEmail ? `(${notif.targetEmail})` : ''}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase text-amber-400 bg-amber-950/60">
                            {notif.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 mt-2 block">
                          Dispatched: {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: ADD DRIVER */}
      {/* ========================================================= */}
      {isAddDriverOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative section-fade">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-400" />
                <span>Register New Driver</span>
              </h3>
              <button
                onClick={() => {
                  setDriverFormError(null);
                  setIsAddDriverOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {driverFormError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{driverFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDriver} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wider">Full Legal Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. David Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wider">Driver Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="driver@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wider">Account Password (Optional)</label>
                <input
                  type="text"
                  name="password"
                  placeholder="Leave empty for auto-generated secure password (min 6 chars)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (416) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wider">Status</label>
                  <select
                    name="status"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="On Route">On Route</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wider">License Class</label>
                <select
                  name="licenseClass"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                >
                  <option value="Class 1 / CDL-A">Class 1 / CDL-A (Tractor-Trailer)</option>
                  <option value="AZ (Ontario Standard)">AZ License (Ontario)</option>
                  <option value="Class 3 / CDL-B">Class 3 / CDL-B (Straight Truck)</option>
                  <option value="Owner-Operator Fleet">Owner-Operator with Equipment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wider">Dispatcher Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Clean abstract, FAST card verified, preferred lanes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingDriver}
                  onClick={() => {
                    setDriverFormError(null);
                    setIsAddDriverOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDriver}
                  className="gradient-teal text-white font-bold px-5 py-2 rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingDriver ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>Save Driver Profile</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT DRIVER */}
      {/* ========================================================= */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative section-fade">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-white text-lg">Edit Driver: {editingDriver.fullName}</h3>
              <button onClick={() => setEditingDriver(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDriver} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={editingDriver.fullName}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingDriver.phone}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Status</label>
                  <select
                    name="status"
                    defaultValue={editingDriver.status}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="On Route">On Route</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">License Class</label>
                <input
                  type="text"
                  name="licenseClass"
                  defaultValue={editingDriver.licenseClass}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingDriver.notes || ''}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDriver(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-teal text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Update Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ASSIGN RUN TO DRIVER */}
      {/* ========================================================= */}
      {assigningRunDriver && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative section-fade">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-white text-lg">Assign Dedicated Load</h3>
                <p className="text-xs text-slate-400">Driver: {assigningRunDriver.fullName} ({assigningRunDriver.email})</p>
              </div>
              <button onClick={() => setAssigningRunDriver(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignRunToDriver} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Trip Number</label>
                  <input
                    type="text"
                    name="tripNumber"
                    defaultValue={`GLH-TRIP-${Math.floor(1000 + Math.random() * 9000)}`}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Settlement Rate</label>
                  <input
                    type="text"
                    name="rate"
                    defaultValue="$3,850.00 CAD"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-teal-400 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Origin / Pick-Up Shipper *</label>
                <input
                  type="text"
                  name="origin"
                  required
                  defaultValue="Brampton Distribution Terminal, ON"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Destination / Consignee *</label>
                <input
                  type="text"
                  name="destination"
                  required
                  defaultValue="Detroit Logistics Hub, MI, USA"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Equipment</label>
                  <select
                    name="equipment"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  >
                    <option value="53' Air-Ride Dry Van">53' Air-Ride Dry Van</option>
                    <option value="53' Climate-Controlled Reefer">53' Climate-Controlled Reefer</option>
                    <option value="53' Tri-Axle Van">53' Tri-Axle Van</option>
                    <option value="Flatbed / Roll-Tite">Flatbed / Roll-Tite</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Target ETA</label>
                  <input
                    type="text"
                    name="eta"
                    defaultValue="Tomorrow 04:30 PM EST"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Cargo Description</label>
                <input
                  type="text"
                  name="cargo"
                  defaultValue="Industrial Automotive Parts (FAST Lane Cleared)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningRunDriver(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-teal text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Dispatch Load to Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD SHIPPER */}
      {/* ========================================================= */}
      {isAddShipperOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative section-fade">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-400" />
                <span>Create Shipper Account</span>
              </h3>
              <button
                onClick={() => {
                  setShipperFormError(null);
                  setIsAddShipperOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {shipperFormError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{shipperFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateShipper} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Company / Enterprise Name *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="e.g. Atlas Logistics International"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Primary Contact Person *</label>
                <input
                  type="text"
                  name="contactName"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Corporate Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="logistics@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Portal Password (Optional)</label>
                <input
                  type="text"
                  name="password"
                  placeholder="Leave empty for auto-generated secure password (min 6 chars)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Direct Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (416) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Status</label>
                  <select
                    name="status"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Credit Approved">Credit Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Payment terms: Net 30, primary lanes: Ontario to Midwest..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-teal-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingShipper}
                  onClick={() => {
                    setShipperFormError(null);
                    setIsAddShipperOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShipper}
                  className="gradient-teal text-white font-bold px-5 py-2 rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingShipper ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>Save Shipper</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: EDIT SHIPPER */}
      {/* ========================================================= */}
      {editingShipper && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative section-fade">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-white text-lg">Edit Shipper: {editingShipper.companyName}</h3>
              <button onClick={() => setEditingShipper(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShipper} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  defaultValue={editingShipper.companyName}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Contact Person</label>
                <input
                  type="text"
                  name="contactName"
                  defaultValue={editingShipper.contactName}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingShipper.phone}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Status</label>
                  <select
                    name="status"
                    defaultValue={editingShipper.status}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Credit Approved">Credit Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingShipper.notes || ''}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingShipper(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-teal text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Update Shipper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: CREATE SHIPMENT FOR CLIENT */}
      {/* ========================================================= */}
      {isAddShipmentOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative section-fade max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-400" />
                <span>Create & Assign Shipment to Client</span>
              </h3>
              <button onClick={() => setIsAddShipmentOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Assign to Shipper Account *</label>
                <select
                  name="shipperEmail"
                  defaultValue={selectedShipperForShipment}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                >
                  {shippers.map((s) => (
                    <option key={s.id} value={s.email}>
                      {s.companyName} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">PRO Number</label>
                  <input
                    type="text"
                    name="proNumber"
                    defaultValue={`GLH-${Math.floor(10000 + Math.random() * 90000)}-ON`}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">BOL Number</label>
                  <input
                    type="text"
                    name="bolNumber"
                    defaultValue={`BOL-${Math.floor(10000 + Math.random() * 90000)}`}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">PARS/PAPRS</label>
                  <input
                    type="text"
                    name="parsNumber"
                    defaultValue={`PARS-CDN-${Math.floor(10000 + Math.random() * 90000)}`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-teal-400 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Origin Facility *</label>
                  <input
                    type="text"
                    name="origin"
                    required
                    defaultValue="Mississauga, ON Distribution Center"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Destination Hub *</label>
                  <input
                    type="text"
                    name="destination"
                    required
                    defaultValue="Chicago, IL Midwest Logistics Center"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Status</label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  >
                    <option value="Booked">Booked</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Customs Cleared">Customs Cleared</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Equipment</label>
                  <select
                    name="equipment"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  >
                    <option value="53' Air-Ride Dry Van">53' Air-Ride Dry Van</option>
                    <option value="53' Climate Reefer">53' Climate Reefer</option>
                    <option value="53' Tri-Axle Van">53' Tri-Axle Van</option>
                    <option value="Flatbed">Flatbed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Temp (Optional)</label>
                  <input
                    type="text"
                    name="temperature"
                    placeholder="e.g. 34°F Compliant"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Cargo Description</label>
                  <input
                    type="text"
                    name="cargo"
                    defaultValue="Industrial Manufacturing Equipment"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">ETA Timestamp</label>
                  <input
                    type="text"
                    name="eta"
                    defaultValue="Today at 4:30 PM CST"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddShipmentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-teal text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Create Live Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: CREATE NOTIFICATION / BROADCAST */}
      {/* ========================================================= */}
      {isCreateNotificationOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative section-fade">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <span>Send Portal Notification</span>
              </h3>
              <button onClick={() => setIsCreateNotificationOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Target Audience *</label>
                <select
                  name="targetType"
                  defaultValue={targetedEmailForNotif ? 'specific_driver' : 'all'}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                >
                  <option value="all">Broadcast to All Users</option>
                  <option value="shippers">All Shippers / Clients Only</option>
                  <option value="drivers">All Drivers Only</option>
                  <option value="specific_driver">Specific Driver Email</option>
                  <option value="specific_shipper">Specific Shipper Email</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Target Email (If Specific)</label>
                <input
                  type="email"
                  name="targetEmail"
                  defaultValue={targetedEmailForNotif}
                  placeholder="user@domain.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Alert Priority</label>
                  <select
                    name="priority"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  >
                    <option value="info">Info</option>
                    <option value="urgent">Urgent Dispatch</option>
                    <option value="warning">Weather / Advisory</option>
                    <option value="customs">Customs Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase">Subject / Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Winter Storm Advisory"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase">Message Body *</label>
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="Enter message visible on the recipient portal..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateNotificationOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-teal text-white font-bold px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: PERMANENT DELETE CONFIRMATION (REPLACES BLOCKED window.confirm) */}
      {/* ========================================================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative section-fade">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-white text-lg">
              Delete {deleteConfirmTarget.type === 'driver' ? 'Driver Profile' : deleteConfirmTarget.type === 'shipper' ? 'Shipper Account' : 'Shipment Record'}?
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-white">{deleteConfirmTarget.name}</strong>
              {deleteConfirmTarget.email ? ` (${deleteConfirmTarget.email})` : ''} from the Supabase database? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting from Supabase...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
