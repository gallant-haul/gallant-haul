import React from 'react';
import { Link } from '../context/RouterContext';
import { Truck, DollarSign, Clock, ShieldCheck, CheckCircle2, ArrowRight, Phone, MapPin, Award } from 'lucide-react';

export default function CarriersPage() {
  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative text-white py-28 lg:py-36 px-6 lg:px-20 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[65vh]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center section-fade">
          <span className="bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 inline-block backdrop-blur-md">
            Carrier & Owner-Operator Network
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight text-white leading-tight">
            More Than Freight.<br />
            <span className="text-gradient">We Treat Carriers Like Family.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            Join thousands of trusted owner-operators and fleet owners who enjoy dedicated cross-border lanes, fast payment schedules, and 24/7 live dispatch backing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/careers/apply"
              className="gradient-teal text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:scale-105 transition-all text-base"
            >
              Apply to Join Network
            </Link>
            <Link
              href="/login/careers"
              className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold py-4 px-10 rounded-xl transition-all text-base flex items-center justify-center gap-2"
            >
              <Truck className="w-5 h-5 text-teal-400" />
              <span>Driver Portal Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CARRIER ADVANTAGES */}
      <section className="py-20 px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-teal-700 tracking-widest uppercase mb-2">Why Drive With Gallant</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">The Carrier Experience You Deserve</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-hover p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-xl gradient-teal text-white flex items-center justify-center mb-6 shadow-md">
              <DollarSign className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-navy mb-3">Quick Pay & Flexible Terms</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Get paid in as fast as 24 hours via direct deposit (EFT/ACH) or choose standard Net 7/14 options. No hidden factoring deductions.
            </p>
            <div className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">
              24-Hour QuickPay Available
            </div>
          </div>

          <div className="card-hover p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-xl gradient-teal text-white flex items-center justify-center mb-6 shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-navy mb-3">24/7 Real Dispatch Support</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              No endless automated phone menus. When you call Gallant, you talk to an experienced Canadian dispatcher who knows your route and load.
            </p>
            <div className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">
              Direct Phone: +1 (416) 735-5356
            </div>
          </div>

          <div className="card-hover p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-xl gradient-teal text-white flex items-center justify-center mb-6 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-navy mb-3">C-TPAT FAST Border Lanes</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              As a certified Canadian Bonded carrier, we provide pre-filed PAPRS & PARS manifests so you cruise through border inspection booths.
            </p>
            <div className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">
              Pre-Arrival Processing (ACE/ACI)
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEDICATED HIGHWAY LANES */}
      <section className="py-16 px-6 lg:px-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">High-Volume Dedicated Cross-Border Corridors</h3>
            <p className="text-slate-400 text-sm">Consistent year-round freight with balanced return headhauls.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { lane: 'Toronto, ON ⇄ Chicago, IL', equipment: "53' Dry Van & Reefer", frequency: 'Daily High Frequency' },
              { lane: 'Montreal, QC ⇄ New York, NY', equipment: "53' Air-Ride Logistics", frequency: '3x Weekly Dedicated' },
              { lane: 'Vancouver, BC ⇄ Seattle / Portland', equipment: 'Port & Terminal Drayage', frequency: 'Daily Continuous' },
              { lane: 'Windsor, ON ⇄ Detroit, MI', equipment: 'Automotive Just-in-Time', frequency: 'Hourly Crossings' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="text-sm font-extrabold text-teal-300 mb-2">{item.lane}</div>
                <div className="text-xs text-slate-300 mb-1">{item.equipment}</div>
                <div className="text-[11px] font-mono text-slate-400">{item.frequency}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DRIVER ONBOARDING CTA */}
      <section className="py-20 px-6 lg:px-20 max-w-4xl mx-auto text-center">
        <h3 className="text-3xl font-extrabold text-navy mb-4">Ready to Roll with Gallant?</h3>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
          Complete our quick digital application or sign in with your driver portal credentials to inspect manifests and settlements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/careers/apply"
            className="gradient-teal text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:scale-105 transition-all text-sm"
          >
            Start Driver Application
          </Link>
          <Link
            href="/login/careers"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-colors"
          >
            Access Driver Portal
          </Link>
        </div>
      </section>
    </div>
  );
}
