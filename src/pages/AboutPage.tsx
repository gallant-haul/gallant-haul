import React from 'react';
import { Link } from '../context/RouterContext';
import { ShieldCheck, Truck, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <section
        className="relative text-white py-32 px-6 lg:px-20 bg-slate-900 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center section-fade">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4 border border-teal-500/30">
            Canadian Bonded Carrier Excellence
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white leading-tight">
            Driven by Safety. <br />
            <span className="text-gradient">Defined by Reliability.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Gallant Line Haul Corp is a premier Canadian freight brokerage and bonded carrier delivering exceptional cross-border logistics solutions across North America.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY & MISSION */}
      <section className="py-20 px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy tracking-tight">Our Corporate Story</h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Established with a clear vision to bridge the gap in North American supply chain security and efficiency, Gallant Line Haul Corp has grown into a trusted industry leader. We specialize in complex cross-border logistics, full truckload (FTL), intermodal distribution, and specialized freight handling.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Our culture is built around treating our clients and independent carrier networks like family. By combining advanced dispatch technology with personalized customer care, we ensure your freight moves securely and on schedule every single time.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/quote" className="gradient-teal text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:scale-105 transition-all text-sm">
                Request a Quote
              </Link>
              <Link href="/about/leadership" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-colors">
                View Leadership
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-extrabold text-navy font-mono mb-1">100%</div>
              <div className="text-xs font-bold text-teal-700 uppercase">Bonded & Certified</div>
              <p className="text-xs text-slate-500 mt-2">C-TPAT, FAST & CARB compliant operations.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-extrabold text-navy font-mono mb-1">24/7</div>
              <div className="text-xs font-bold text-teal-700 uppercase">Live Dispatch</div>
              <p className="text-xs text-slate-500 mt-2">Satellite tracking and direct driver comms.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-extrabold text-navy font-mono mb-1">99.4%</div>
              <div className="text-xs font-bold text-teal-700 uppercase">On-Time Delivery</div>
              <p className="text-xs text-slate-500 mt-2">Cross-border customs pre-clearance.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-extrabold text-navy font-mono mb-1">24-Hr</div>
              <div className="text-xs font-bold text-teal-700 uppercase">QuickPay Program</div>
              <p className="text-xs text-slate-500 mt-2">Empowering independent owner-operators.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
