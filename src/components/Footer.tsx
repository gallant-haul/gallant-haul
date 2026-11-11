import React from 'react';
import { Link } from '../context/RouterContext';
import { Truck, Mail, Phone, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 w-full">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* 1. Brand Section */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-slate-700/60">
                <img
                  src="/assets/aistudio/image_341d9178.png"
                  alt="Gallant Line Haul Corp Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-tight leading-tight">
                  Gallant Line Haul
                </span>
                <span className="text-xs text-teal-400 font-semibold uppercase tracking-wider">
                  CORP
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              More than trucking — we are a family on the road. Trusted cross-border supply chain security, C-TPAT & CARB Certified Canadian Bonded Carrier.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>C-TPAT Security Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>CARB California Compliant Fleet</span>
              </div>
            </div>
          </div>

          {/* 2. Transportation Solutions */}
          <div>
            <h3 className="text-white text-base font-bold mb-4 tracking-tight uppercase text-xs text-teal-400">
              Solutions
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services/truckload" className="hover:text-teal-400 transition-colors">
                  Full Truckload (FTL)
                </Link>
              </li>
              <li>
                <Link href="/services/intermodal" className="hover:text-teal-400 transition-colors">
                  Intermodal Freight
                </Link>
              </li>
              <li>
                <Link href="/services/ltl" className="hover:text-teal-400 transition-colors">
                  Less Than Truckload (LTL)
                </Link>
              </li>
              <li>
                <Link href="/services/warehousing" className="hover:text-teal-400 transition-colors">
                  Warehousing & Cross-Dock
                </Link>
              </li>
              <li>
                <Link href="/services/port-services" className="hover:text-teal-400 transition-colors">
                  Port & Terminal Drayage
                </Link>
              </li>
              <li>
                <Link href="/services/technology" className="hover:text-teal-400 transition-colors">
                  Real-time Tracking Tech
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Portals & Company */}
          <div>
            <h3 className="text-white text-base font-bold mb-4 tracking-tight uppercase text-xs text-teal-400">
              Portals & Careers
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login/client" className="hover:text-teal-400 transition-colors font-medium text-slate-300">
                  Client Shipper Portal
                </Link>
              </li>
              <li>
                <Link href="/login/careers" className="hover:text-teal-400 transition-colors font-medium text-slate-300">
                  Driver & Careers Portal
                </Link>
              </li>
              <li>
                <Link href="/carriers" className="hover:text-teal-400 transition-colors">
                  Join Carrier Network
                </Link>
              </li>
              <li>
                <Link href="/careers/apply" className="hover:text-teal-400 transition-colors">
                  Driver Fast Application
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-teal-400 transition-colors">
                  About Our Company
                </Link>
              </li>
              <li>
                <Link href="/about/leadership" className="hover:text-teal-400 transition-colors">
                  Executive Leadership
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact & Headquarters */}
          <div>
            <h3 className="text-white text-base font-bold mb-4 tracking-tight uppercase text-xs text-teal-400">
              24/7 Operations
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <a href="mailto:info@gallant-corp.com" className="hover:text-teal-400 transition-colors break-all">
                  info@gallant-corp.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <a href="tel:+14167355356" className="hover:text-teal-400 transition-colors font-mono">
                  +1 (416) 735-5356
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Toronto / Montreal / Vancouver & Cross-Border USA Corridors</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/quote"
                className="inline-block text-xs font-bold gradient-teal text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Instant Freight Quote →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Gallant Line Haul Corp. All rights reserved. Canadian Bonded Carrier.</p>
          <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Dispatch Support</Link>
            <span className="text-slate-700">|</span>
            <Link href="/login/admin" className="text-slate-400 hover:text-teal-400 transition-colors font-mono flex items-center gap-1">
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
