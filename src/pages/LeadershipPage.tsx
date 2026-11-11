import React from 'react';
import { Link } from '../context/RouterContext';
import { Shield, Clock, Award, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LeadershipPage() {
  const leadershipPillars = [
    {
      code: "01",
      title: "Executive Direction & Strategy",
      focus: "Long-Term Fleet Scalability & Cross-Border Expansion",
      description: "Our executive framework focuses on sustainable growth, building robust multi-modal transport corridors across Canada and the United States, and maintaining an agile response to global supply chain shifts.",
      metric: "100% Bonded & Certified",
      icon: "🌐",
    },
    {
      code: "02",
      title: "Operational & Terminal Excellence",
      focus: "Day-to-Day Dispatch, Routing, & Real-Time Logistics",
      description: "Driven by automated dispatch protocols and expert terminal controllers, our operations ensure that every shipment moves through optimized routes with zero unnecessary dwell time.",
      metric: "24/7 Live Monitoring",
      icon: "⚡",
    },
    {
      code: "03",
      title: "Safety, Compliance & Security",
      focus: "C-TPAT, CARB Standards, & Highway Risk Mitigation",
      description: "Security is non-negotiable. Our compliance committees enforce rigorous safety audits, low-emissions standards, and strict cargo protection protocols to safeguard every mile.",
      metric: "Zero-Incident Benchmark",
      icon: "🛡️",
    },
    {
      code: "04",
      title: "Financial Governance & Treasury",
      focus: "Capital Optimization & Transparent Shipper/Carrier Accounting",
      description: "We maintain bulletproof fiscal management, providing independent carriers with rapid payment options and offering enterprise shippers predictable, transparent freight billing.",
      metric: "Fast Pay Guarantee",
      icon: "📊",
    },
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <section
        className="relative text-white py-32 px-6 lg:px-20 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[60vh]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center section-fade">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
            <span>🍁</span> Corporate Governance & Architecture
          </div>
          <h1 className="text-4xl lg:text-7xl font-extrabold mb-6 tracking-tight text-white leading-tight">
            Leadership Rooted in <br /><span className="text-gradient">Systemic Reliability.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            At Gallant Line Haul Corp, leadership is structured into core operational pillars, rigorous safety benchmarks, and transparent technological accountability.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="gradient-teal text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:scale-105 transition-all text-sm">
              Connect With Management
            </Link>
            <Link href="/services/services" className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold py-3.5 px-8 rounded-xl transition-all text-sm">
              Explore Our Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CORE PILLARS GRID */}
      <section className="py-20 px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center mb-16 section-fade">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy mb-3">The Four Pillars of Our Command Structure</h2>
          <div className="w-20 h-1 gradient-teal mx-auto rounded-full mb-4"></div>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">
            How our management framework guarantees top-tier performance across every shipping lane.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {leadershipPillars.map((pillar, index) => (
            <div
              key={index}
              className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="w-12 h-12 gradient-teal text-white rounded-2xl flex items-center justify-center text-xl shadow-md">
                  {pillar.icon}
                </span>
                <span className="text-3xl font-black text-slate-200 group-hover:text-teal-600/30 transition-colors font-mono">
                  {pillar.code}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-2">{pillar.title}</h3>
              <p className="text-teal-600 font-semibold text-xs tracking-wider uppercase mb-3">{pillar.focus}</p>
              <p className="text-slate-600 leading-relaxed mb-6 text-sm">{pillar.description}</p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benchmark Standard</span>
                <span className="bg-slate-100 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg">{pillar.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
