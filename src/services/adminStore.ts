// Centralized Operations and Multi-Portal State Store for Gallant Line Haul Corp
// Enables Master Admin management of drivers, shippers, shipments, quotes, and broadcast alerts.

export interface DriverAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  licenseClass: string;
  status: 'Active' | 'On Route' | 'Pending Verification' | 'Suspended';
  registeredAt: string;
  licenceDoc?: string;
  pictureDoc?: string;
  residenceDoc?: string;
  docsSubmittedAt?: string;
  assignedRun?: {
    tripNumber: string;
    origin: string;
    destination: string;
    equipment: string;
    cargo: string;
    rate: string;
    eta: string;
    currentStage: number; // 0: Assigned, 1: Arrived at Shipper, 2: Loaded & Rolling, 3: Border Cleared, 4: Delivered
    stageNotes?: string;
    updatedAt?: string;
  } | null;
  notes?: string;
}

export const DISPATCH_STAGES = [
  { stage: 0, key: 'assigned', title: 'Assigned & Dispatched', shortDesc: 'Carrier manifest active & truck pre-trip cleared', percent: 10 },
  { stage: 1, key: 'arrived_shipper', title: 'Arrived at Shipper', shortDesc: 'At origin warehouse dock for loading', percent: 35 },
  { stage: 2, key: 'loaded_rolling', title: 'Loaded & Rolling', shortDesc: 'In transit across North American corridor', percent: 65 },
  { stage: 3, key: 'customs_cleared', title: 'Customs & Border Cleared', shortDesc: 'C-TPAT / PARS clearance verified at border', percent: 85 },
  { stage: 4, key: 'delivered_signed', title: 'Delivered & Signed', shortDesc: 'Consignee signed POD received & load finished', percent: 100 },
];

export interface ShipperAccount {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Credit Approved' | 'Pending Review' | 'Suspended';
  registeredAt: string;
  address?: string;
  notes?: string;
}

export interface ShipmentRecord {
  id: string;
  shipperEmail: string;
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
  createdAt: string;
}

export interface QuoteSubmission {
  id: string;
  refCode: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  pickup: string;
  destination: string;
  equipment: string;
  date: string;
  notes?: string;
  status: 'New' | 'In Review' | 'Quoted' | 'Booked' | 'Declined';
  quotedRate?: string;
  submittedAt: string;
}

export interface PortalNotification {
  id: string;
  targetType: 'all' | 'shippers' | 'drivers' | 'specific_shipper' | 'specific_driver';
  targetEmail?: string;
  title: string;
  message: string;
  priority: 'info' | 'warning' | 'urgent' | 'customs';
  createdAt: string;
  read?: boolean;
  readBy?: string[]; // user emails who marked as read
}

const STORAGE_KEYS = {
  DRIVERS: 'gallant_drivers_v1',
  SHIPPERS: 'gallant_shippers_v1',
  SHIPMENTS: 'gallant_shipments_v1',
  QUOTES: 'gallant_quotes_v1',
  NOTIFICATIONS: 'gallant_notifications_v1',
};

// Safe JSON loader
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('gallant-store-update'));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

class AdminStore {
  // 1. DRIVERS
  getDrivers(): DriverAccount[] {
    return loadFromStorage<DriverAccount[]>(STORAGE_KEYS.DRIVERS, []);
  }

  saveDrivers(drivers: DriverAccount[]): void {
    saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
  }

  addDriver(driver: Omit<DriverAccount, 'id' | 'registeredAt'>): DriverAccount {
    const drivers = this.getDrivers();
    const newDriver: DriverAccount = {
      ...driver,
      id: `drv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    drivers.unshift(newDriver);
    this.saveDrivers(drivers);
    return newDriver;
  }

  updateDriver(id: string, updates: Partial<DriverAccount>): void {
    const drivers = this.getDrivers().map((d) => (d.id === id ? { ...d, ...updates } : d));
    this.saveDrivers(drivers);
  }

  deleteDriver(idOrEmail: string): void {
    const drivers = this.getDrivers().filter(
      (d) => d.id !== idOrEmail && d.email.toLowerCase() !== idOrEmail.toLowerCase()
    );
    this.saveDrivers(drivers);
  }

  getDriverByEmail(email: string): DriverAccount | undefined {
    return this.getDrivers().find((d) => d.email.toLowerCase() === email.toLowerCase());
  }

  // 2. SHIPPERS / CLIENTS
  getShippers(): ShipperAccount[] {
    return loadFromStorage<ShipperAccount[]>(STORAGE_KEYS.SHIPPERS, []);
  }

  saveShippers(shippers: ShipperAccount[]): void {
    saveToStorage(STORAGE_KEYS.SHIPPERS, shippers);
  }

  addShipper(shipper: Omit<ShipperAccount, 'id' | 'registeredAt'>): ShipperAccount {
    const shippers = this.getShippers();
    const newShipper: ShipperAccount = {
      ...shipper,
      id: `shp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    shippers.unshift(newShipper);
    this.saveShippers(shippers);
    return newShipper;
  }

  updateShipper(id: string, updates: Partial<ShipperAccount>): void {
    const shippers = this.getShippers().map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.saveShippers(shippers);
  }

  deleteShipper(idOrEmail: string): void {
    const shippers = this.getShippers().filter(
      (s) => s.id !== idOrEmail && s.email.toLowerCase() !== idOrEmail.toLowerCase()
    );
    this.saveShippers(shippers);
  }

  getShipperByEmail(email: string): ShipperAccount | undefined {
    return this.getShippers().find((s) => s.email.toLowerCase() === email.toLowerCase());
  }

  // 3. SHIPMENTS
  getShipments(): ShipmentRecord[] {
    return loadFromStorage<ShipmentRecord[]>(STORAGE_KEYS.SHIPMENTS, []);
  }

  saveShipments(shipments: ShipmentRecord[]): void {
    saveToStorage(STORAGE_KEYS.SHIPMENTS, shipments);
  }

  addShipment(shipment: Omit<ShipmentRecord, 'id' | 'createdAt'>): ShipmentRecord {
    const shipments = this.getShipments();
    const newShipment: ShipmentRecord = {
      ...shipment,
      id: `SHP-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    shipments.unshift(newShipment);
    this.saveShipments(shipments);
    return newShipment;
  }

  updateShipment(id: string, updates: Partial<ShipmentRecord>): void {
    const shipments = this.getShipments().map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.saveShipments(shipments);
  }

  deleteShipment(id: string): void {
    const shipments = this.getShipments().filter((s) => s.id !== id);
    this.saveShipments(shipments);
  }

  getShipmentsForClient(clientEmail?: string): ShipmentRecord[] {
    const all = this.getShipments();
    if (!clientEmail) return all;
    return all.filter((s) => s.shipperEmail.toLowerCase() === clientEmail.toLowerCase());
  }

  // 4. QUOTES
  getQuotes(): QuoteSubmission[] {
    return loadFromStorage<QuoteSubmission[]>(STORAGE_KEYS.QUOTES, []);
  }

  saveQuotes(quotes: QuoteSubmission[]): void {
    saveToStorage(STORAGE_KEYS.QUOTES, quotes);
  }

  addQuote(quote: Omit<QuoteSubmission, 'id' | 'submittedAt'>): QuoteSubmission {
    const quotes = this.getQuotes();
    const newQuote: QuoteSubmission = {
      ...quote,
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      submittedAt: new Date().toISOString(),
    };
    quotes.unshift(newQuote);
    this.saveQuotes(quotes);
    return newQuote;
  }

  updateQuote(id: string, updates: Partial<QuoteSubmission>): void {
    const quotes = this.getQuotes().map((q) => (q.id === id ? { ...q, ...updates } : q));
    this.saveQuotes(quotes);
  }

  deleteQuote(id: string): void {
    const quotes = this.getQuotes().filter((q) => q.id !== id);
    this.saveQuotes(quotes);
  }

  // 5. NOTIFICATIONS
  getNotifications(): PortalNotification[] {
    return loadFromStorage<PortalNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  saveNotifications(notifs: PortalNotification[]): void {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  addNotification(notif: Omit<PortalNotification, 'id' | 'createdAt'>): PortalNotification {
    const notifs = this.getNotifications();
    const newNotif: PortalNotification = {
      ...notif,
      id: `ntf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    this.saveNotifications(notifs);
    return newNotif;
  }

  deleteNotification(id: string): void {
    const notifs = this.getNotifications().filter((n) => n.id !== id);
    this.saveNotifications(notifs);
  }

  isNotificationRead(notification: PortalNotification, userEmail?: string): boolean {
    if (!userEmail) return !!notification.read;
    const cleanEmail = userEmail.toLowerCase().trim();
    if (notification.readBy && Array.isArray(notification.readBy)) {
      return notification.readBy.some((e) => e.toLowerCase() === cleanEmail);
    }
    return !!notification.read;
  }

  markNotificationRead(notificationId: string, userEmail: string, isRead: boolean): void {
    const notifs = this.getNotifications();
    const cleanEmail = userEmail.toLowerCase().trim();
    const updated = notifs.map((n) => {
      if (n.id !== notificationId) return n;
      const readBySet = new Set((n.readBy || []).map((e) => e.toLowerCase()));
      if (isRead) {
        readBySet.add(cleanEmail);
      } else {
        readBySet.delete(cleanEmail);
      }
      return {
        ...n,
        read: readBySet.size > 0,
        readBy: Array.from(readBySet),
      };
    });
    this.saveNotifications(updated);
  }

  markAllNotificationsRead(userEmail: string, userRole?: 'client' | 'driver' | 'admin'): void {
    const notifs = this.getNotifications();
    const cleanEmail = userEmail.toLowerCase().trim();
    const updated = notifs.map((n) => {
      // Check if this notification is targeted to this user or role
      const matches =
        userRole === 'admin' ||
        n.targetType === 'all' ||
        (n.targetType === 'shippers' && userRole === 'client') ||
        (n.targetType === 'drivers' && userRole === 'driver') ||
        (n.targetEmail && n.targetEmail.toLowerCase() === cleanEmail);

      if (matches) {
        const readBySet = new Set((n.readBy || []).map((e) => e.toLowerCase()));
        readBySet.add(cleanEmail);
        return {
          ...n,
          read: true,
          readBy: Array.from(readBySet),
        };
      }
      return n;
    });
    this.saveNotifications(updated);
  }

  getNotificationsForUser(userEmail?: string, userRole?: 'client' | 'driver' | 'admin'): PortalNotification[] {
    const notifs = this.getNotifications();
    return notifs.filter((n) => {
      if (userRole === 'admin') return true;
      if (n.targetType === 'all') return true;
      if (n.targetType === 'shippers' && userRole === 'client') return true;
      if (n.targetType === 'drivers' && userRole === 'driver') return true;
      if (userEmail && n.targetEmail && n.targetEmail.toLowerCase() === userEmail.toLowerCase().trim()) return true;
      return false;
    });
  }

  // 6. DYNAMIC 2-WAY DISPATCH STATUS PROGRESS UPDATER
  updateDriverRunStage(driverIdOrEmail: string, stage: number, stageNotes?: string): { success: boolean; stageInfo?: any } {
    const drivers = this.getDrivers();
    const cleanKey = driverIdOrEmail.toLowerCase().trim();
    const clampedStage = Math.max(0, Math.min(4, stage));
    let updatedDriver: DriverAccount | null = null;

    const newDrivers = drivers.map((d) => {
      if (d.id === driverIdOrEmail || d.email.toLowerCase() === cleanKey) {
        if (!d.assignedRun) return d;
        const stageInfo = DISPATCH_STAGES.find((s) => s.stage === clampedStage) || DISPATCH_STAGES[0];
        const updatedRun = {
          ...d.assignedRun,
          currentStage: clampedStage,
          stageNotes: stageNotes !== undefined ? stageNotes : d.assignedRun.stageNotes,
          updatedAt: new Date().toISOString(),
        };
        const updatedStatus: DriverAccount['status'] = clampedStage === 4 ? 'Active' : 'On Route';
        updatedDriver = {
          ...d,
          status: updatedStatus,
          assignedRun: updatedRun,
        };
        return updatedDriver;
      }
      return d;
    });

    if (updatedDriver) {
      this.saveDrivers(newDrivers);

      // Auto-sync matching shipment records if any
      const tripNumber = (updatedDriver as DriverAccount).assignedRun?.tripNumber;
      if (tripNumber) {
        const shipments = this.getShipments();
        const milestoneMap: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 };
        const statusMap: Record<number, ShipmentRecord['status']> = {
          0: 'Booked',
          1: 'Booked',
          2: 'In Transit',
          3: 'Customs Cleared',
          4: 'Delivered',
        };

        const updatedShipments = shipments.map((s) => {
          if (s.proNumber === tripNumber || s.bolNumber === tripNumber) {
            return {
              ...s,
              status: statusMap[clampedStage],
              currentMilestone: milestoneMap[clampedStage],
            };
          }
          return s;
        });
        this.saveShipments(updatedShipments);
      }

      return { success: true, stageInfo: DISPATCH_STAGES[clampedStage] };
    }

    return { success: false };
  }
}

export const adminStore = new AdminStore();
