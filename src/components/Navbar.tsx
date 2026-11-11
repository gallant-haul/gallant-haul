import React, { useState } from 'react';
import { Link, useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { Truck, ChevronDown, Menu, X, LogIn, UserCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const { navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);

  const toggleMobileMenu = (menu: string) => {
    setActiveMobileMenu(activeMobileMenu === menu ? null : menu);
  };

  const closeAll = () => {
    setIsOpen(false);
    setActiveMobileMenu(null);
  };

  const handleLogout = async () => {
    await signOut();
    closeAll();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* 1. Brand Logo */}
          <div className="flex items-center">
            <Link href="/" onClick={closeAll} className="flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden border border-slate-700/60 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/assets/aistudio/image_341d9178.png"
                  alt="Gallant Line Haul Corp Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-teal-400 transition-colors">
                    Gallant Line Haul
                  </span>
                  <span className="text-xs bg-teal-950/80 text-teal-300 border border-teal-800/80 px-1.5 py-0.5 rounded font-bold">
                    CORP
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <span className="text-rose-500 font-bold">🍁</span> Canadian Bonded Carrier
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 h-full">
            {/* Client Services Dropdown */}
            <div className="relative group h-full flex items-center">
              <button className="text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 py-7 cursor-pointer">
                Client Services
                <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-[76px] left-0 w-64 bg-slate-900 border border-slate-800 text-slate-100 rounded-b-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform -translate-y-1 group-hover:translate-y-0 border-t-2 border-teal-500 py-3 px-1">
                <Link href="/services/truckload" className="block px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors">
                  <div className="font-semibold text-white">Full Truckload (FTL)</div>
                  <div className="text-xs text-slate-400">Dedicated cross-border capacity</div>
                </Link>
                <Link href="/services/intermodal" className="block px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors">
                  <div className="font-semibold text-white">Intermodal Logistics</div>
                  <div className="text-xs text-slate-400">Rail and highway synergy</div>
                </Link>
                <Link href="/services/ltl" className="block px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors">
                  <div className="font-semibold text-white">Less Than Truckload (LTL)</div>
                  <div className="text-xs text-slate-400">Consolidated freight shipping</div>
                </Link>
                <Link href="/services/warehousing" className="block px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors">
                  <div className="font-semibold text-white">Warehousing & Storage</div>
                  <div className="text-xs text-slate-400">Cross-dock & secure facilities</div>
                </Link>
                <Link href="/services/port-services" className="block px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors">
                  <div className="font-semibold text-white">Port & Drayage</div>
                  <div className="text-xs text-slate-400">Terminal drayage & customs</div>
                </Link>
                <Link href="/services/technology" className="block px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors">
                  <div className="font-semibold text-white">Logistics Technology</div>
                  <div className="text-xs text-slate-400">Real-time GPS & e-Manifests</div>
                </Link>
              </div>
            </div>

            {/* About Dropdown */}
            <div className="relative group h-full flex items-center">
              <button className="text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 py-7 cursor-pointer">
                About
                <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-[76px] left-0 w-48 bg-slate-900 border border-slate-800 text-slate-100 rounded-b-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform -translate-y-1 group-hover:translate-y-0 border-t-2 border-teal-500 py-2 px-1">
                <Link href="/about" className="block px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors">
                  About Us
                </Link>
                <Link href="/about/leadership" className="block px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors">
                  Leadership & Team
                </Link>
              </div>
            </div>

            <Link href="/carriers" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
              Careers & Carriers
            </Link>

            <Link href="/contact" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* 3. Right Zone: Auth & CTAs */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              /* Authenticated User Menu */
              <div className="flex items-center gap-3">
                <Link
                  href={role === 'driver' ? '/portal/driver' : '/portal/client'}
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-teal-500/50 px-3.5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span className="max-w-[140px] truncate">{user.email?.split('@')[0]}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">
                    {role || 'Portal'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-1"
                >
                  Log Out
                </button>
              </div>
            ) : (
              /* Login Dropdown */
              <div className="relative group h-full flex items-center">
                <button className="text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 py-7 cursor-pointer">
                  <LogIn className="w-4 h-4 text-teal-400" />
                  <span>Login</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-hover:rotate-180" />
                </button>

                <div className="absolute top-[76px] right-0 w-52 bg-slate-900 border border-slate-800 text-slate-100 rounded-b-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform -translate-y-1 group-hover:translate-y-0 border-t-2 border-teal-500 py-2 px-1">
                  <Link
                    href="/login/client"
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors"
                  >
                    <span>Client Portal</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Shipper</span>
                  </Link>
                  <Link
                    href="/login/careers"
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-800 hover:text-teal-400 rounded-lg transition-colors"
                  >
                    <span>Careers Portal</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Driver</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Theme Toggle & Get Quote CTA */}
            <ThemeToggle />

            <Link
              href="/quote"
              className="gradient-teal hover:opacity-95 text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-md transition-all btn-dynamic"
            >
              Get Quote
            </Link>
          </div>

          {/* Mobile Right Controls: Theme Toggle & Hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 max-h-[85vh] overflow-y-auto px-4 py-6 space-y-4 shadow-2xl">
          {/* Authenticated User Status in Mobile */}
          {user ? (
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs text-teal-400 font-semibold uppercase">{role || 'User'} Profile</div>
                <div className="text-sm font-bold text-white truncate max-w-[180px]">{user.email}</div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={role === 'driver' ? '/portal/driver' : '/portal/client'}
                  onClick={closeAll}
                  className="text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg"
                >
                  Portal
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2 py-1.5"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-2">
              <Link
                href="/login/client"
                onClick={closeAll}
                className="bg-slate-800 hover:bg-slate-700 text-center py-2.5 px-3 rounded-lg text-sm font-medium text-slate-100 border border-slate-700"
              >
                Client Login
              </Link>
              <Link
                href="/login/careers"
                onClick={closeAll}
                className="bg-slate-800 hover:bg-slate-700 text-center py-2.5 px-3 rounded-lg text-sm font-medium text-slate-100 border border-slate-700"
              >
                Careers Login
              </Link>
            </div>
          )}

          {/* Mobile Client Services Accordion */}
          <div className="border-b border-slate-800 pb-3">
            <button
              onClick={() => toggleMobileMenu('services')}
              className="w-full flex items-center justify-between py-2 text-base font-semibold text-white"
            >
              <span>Client Services</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeMobileMenu === 'services' ? 'rotate-180' : ''}`} />
            </button>
            {activeMobileMenu === 'services' && (
              <div className="pl-3 pt-2 space-y-2 border-l-2 border-teal-500/50 my-2">
                <Link href="/services/truckload" onClick={closeAll} className="block text-sm text-slate-300 hover:text-white py-1">
                  Full Truckload (FTL)
                </Link>
                <Link href="/services/intermodal" onClick={closeAll} className="block text-sm text-slate-300 hover:text-white py-1">
                  Intermodal Logistics
                </Link>
                <Link href="/services/ltl" onClick={closeAll} className="block text-sm text-slate-300 hover:text-white py-1">
                  Less Than Truckload (LTL)
                </Link>
                <Link href="/services/warehousing" onClick={closeAll} className="block text-sm text-slate-300 hover:text-white py-1">
                  Warehousing & Storage
                </Link>
                <Link href="/services/port-services" onClick={closeAll} className="block text-sm text-slate-300 hover:text-white py-1">
                  Port & Drayage Services
                </Link>
                <Link href="/services/technology" onClick={closeAll} className="block text-sm text-slate-300 hover:text-white py-1">
                  Logistics Technology
                </Link>
              </div>
            )}
          </div>

          {/* Mobile About Accordion */}
          <div className="border-b border-slate-800 pb-3">
            <button
              onClick={() => toggleMobileMenu('about')}
              className="w-full flex items-center justify-between py-2 text-base font-semibold text-white"
            >
              <span>About</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeMobileMenu === 'about' ? 'rotate-180' : ''}`} />
            </button>
            {activeMobileMenu === 'about' && (
              <div className="pl-3 pt-2 space-y-2 border-l-2 border-teal-500/50 my-2">
                <Link href="/about" onClick={closeAll} className="block text-sm text-slate-300 hover:text-white py-1">
                  About Us
                </Link>
                <Link href="/about/leadership" onClick={closeAll} className="block text-sm text-slate-300 hover:text-white py-1">
                  Leadership & Team
                </Link>
              </div>
            )}
          </div>

          <Link href="/carriers" onClick={closeAll} className="block py-2 text-base font-semibold text-white border-b border-slate-800">
            Careers & Carriers
          </Link>

          <Link href="/contact" onClick={closeAll} className="block py-2 text-base font-semibold text-white border-b border-slate-800">
            Contact Us
          </Link>

          <div className="pt-4">
            <Link
              href="/quote"
              onClick={closeAll}
              className="block w-full text-center gradient-teal text-white font-bold py-3.5 rounded-xl shadow-lg"
            >
              Request a Freight Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
