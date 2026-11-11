import React from 'react';
import { Link } from '../context/RouterContext';
import { Truck, Globe, Shield, ArrowRight, CheckCircle2, Clock, MapPin, Building2, UserPlus, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION WITH OFFICIAL BACKGROUND IMAGE */}
      <section
        className="relative text-white py-28 lg:py-36 px-6 lg:px-20 min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900"
        style={{
          backgroundImage: `url('/assets/aistudio/image_66b0d385.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/65 backdrop-brightness-95"></div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center section-fade">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md">
            
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white drop-shadow-md">
            Moving Freight Forward.<br />
            
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-3xl text-slate-100 leading-relaxed font-normal drop-shadow">
            We provide dedicated cross-border capacity, real-time load tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/quote"
              className="gradient-teal text-white font-bold py-4 px-9 rounded-xl shadow-[0_0_25px_rgba(13,148,136,0.5)] text-center text-base flex items-center justify-center gap-2 btn-dynamic"
            >
              Request a Freight Quote
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/login/client"
              className="bg-slate-900/85 hover:bg-slate-800 text-white border border-white/20 font-bold py-4 px-8 rounded-xl backdrop-blur-md text-base flex items-center justify-center gap-2 shadow-lg btn-dynamic"
            >
              <Lock className="w-4 h-4 text-teal-400" />
              Client Portal Login
            </Link>

            <Link
              href="/carriers"
              className="bg-slate-900/60 border-2 border-white/80 hover:bg-white hover:text-slate-900 text-white font-bold py-4 px-8 rounded-xl backdrop-blur-sm text-base flex items-center justify-center gap-2 shadow-lg btn-dynamic"
            >
              Carrier Network
            </Link>
          </div>
        </div>
      </section>

      
      {/* 2. DEDICATED PORTAL ENTRY POINTS */}
      <section className="py-16 px-6 lg:px-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold text-teal-700 tracking-widest uppercase mb-2">Self-Service Portals</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dedicated Access for Clients & Drivers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Client Shipper Portal Card */}
            <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Client & Shipper Portal
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-100 text-teal-800">
                    Live Tracking
                  </span>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                  Track full truckloads in real time, view cross-border customs clearance statuses, request instant spot quotes, and download Bills of Lading and Proof of Delivery documents.
                </p>
                <ul className="space-y-2 mb-8 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Real-time GPS milestone tracking (Departed, Border, Delivered)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Instant quote history and rate confirmation downloads</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <Link
                  href="/login/client"
                  className="gradient-teal text-white font-bold py-2.5 px-6 rounded-lg text-sm hover:opacity-95 transition-opacity btn-dynamic cursor-pointer"
                >
                  Client Login
                </Link>
                <Link
                  href="/login/client?mode=signup"
                  className="text-teal-700 font-semibold text-sm hover:underline"
                >
                  Create Client Account →
                </Link>
              </div>
            </div>

            {/* Driver & Careers Portal Card */}
            <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-6">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Driver & Careers Portal
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                    Driver Hub
                  </span>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                  Access your dispatch runs, upload CDL and FAST clearance documents, submit driver onboarding applications, and inspect settlements with Gallant Line Haul Corp.
                </p>
                <ul className="space-y-2 mb-8 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Active dispatch assignments & run status updater</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Secure document upload (CDL-A, Medical, FAST card)</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <Link
                  href="/login/careers"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors btn-dynamic cursor-pointer"
                >
                  Driver Sign In
                </Link>
                <Link
                  href="/careers/apply"
                  className="text-slate-700 font-semibold text-sm hover:underline"
                >
                  Apply as Driver →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPREHENSIVE TRANSPORTATION SOLUTIONS */}
      <section className="py-24 px-6 lg:px-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 section-fade">
            <h2 className="text-3xl md:text-5xl font-extrabold text-navy mb-4 tracking-tight">
              Comprehensive Transportation Solutions
            </h2>
            <div className="w-20 h-1 gradient-teal mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              More than just trucking — we manage your entire logistical puzzle with precision and care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: FTL */}
            <div className="card-hover p-9 bg-white border border-slate-200 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="w-14 h-14 gradient-teal text-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-md">
                🚛
              </div>
              <h3 className="text-2xl font-bold mb-3 text-navy group-hover:text-teal-700 transition-colors">
                Full Truckload (FTL)
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                Dedicated capacity for your large shipments. Safe, secure, and expedited across North America with real-time GPS tracking.
              </p>
              <Link
                href="/services/truckload"
                className="inline-flex items-center text-teal-600 font-bold hover:text-teal-800 transition-colors text-sm group/link"
              >
                Learn more
                <ArrowRight className="w-4 h-4 ml-1.5 transform transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>

            {/* Card 2: Cross-Border */}
            <div className="card-hover p-9 bg-white border border-slate-200 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="w-14 h-14 gradient-teal text-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-md">
                🌐
              </div>
              <h3 className="text-2xl font-bold mb-3 text-navy group-hover:text-teal-700 transition-colors">
                Cross-Border Freight
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                Seamless USA/Canada border crossings handled by our C-TPAT certified compliance experts to eliminate costly delays.
              </p>
              <Link
                href="/services/intermodal"
                className="inline-flex items-center text-teal-600 font-bold hover:text-teal-800 transition-colors text-sm group/link"
              >
                Learn more
                <ArrowRight className="w-4 h-4 ml-1.5 transform transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>

            {/* Card 3: Carrier Logistics */}
            <div className="card-hover p-9 bg-white border border-slate-200 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="w-14 h-14 gradient-teal text-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-md">
                🤝
              </div>
              <h3 className="text-2xl font-bold mb-3 text-navy group-hover:text-teal-700 transition-colors">
                Carrier Logistics
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                We treat our carriers like family. Enjoy quick pay options, reliable dedicated cross-border lanes, and true 24/7 dispatch support.
              </p>
              <Link
                href="/carriers"
                className="inline-flex items-center text-teal-600 font-bold hover:text-teal-800 transition-colors text-sm group/link"
              >
                View benefits
                <ArrowRight className="w-4 h-4 ml-1.5 transform transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA SECTION */}
      <section
        className="relative py-24 px-6 lg:px-20 overflow-hidden bg-slate-900"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center section-fade">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to optimize your supply chain?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of satisfied enterprise customers who trust Gallant Line Haul Corp with their most critical freight.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="inline-block bg-white text-teal-800 font-extrabold py-4 px-10 rounded-xl shadow-xl transition-all duration-300 hover:bg-slate-100 hover:scale-105"
            >
              Get Started Today
            </Link>
            <Link
              href="/contact"
              className="inline-block bg-teal-700/80 hover:bg-teal-700 text-white font-bold py-4 px-10 rounded-xl border border-teal-500/50 transition-all duration-300 hover:scale-105"
            >
              Contact 24/7 Dispatch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
