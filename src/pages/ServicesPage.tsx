import React from 'react';
import { Link } from '../context/RouterContext';
import { Truck, Globe, Package, Warehouse, Anchor, Cpu, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      title: "Full Truckload (FTL)",
      slug: "truckload",
      description: "Dedicated 53' air-ride dry vans and reefers providing secure, direct point-to-point transit across North America with real-time GPS geofencing.",
      icon: "🚛",
      badge: "High Capacity",
      stats: "Over 50,000+ Annual Crossings",
    },
    {
      title: "Intermodal Logistics",
      slug: "intermodal",
      description: "Cost-effective, environmentally sustainable long-haul shipping combining rail efficiency with seamless highway drayage and transfers.",
      icon: "🌐",
      badge: "Eco-Friendly",
      stats: "Reduced Carbon Footprint by 30%",
    },
    {
      title: "Less Than Truckload (LTL)",
      slug: "ltl",
      description: "Flexible, economical consolidation for smaller freight loads across North America without compromising transit speeds or reliability.",
      icon: "📦",
      badge: "Cost-Effective",
      stats: "Daily Scheduled Departures",
    },
    {
      title: "Warehousing & Storage",
      slug: "warehousing",
      description: "Secure, climate-controlled storage facilities with real-time inventory tracking, pick-and-pack fulfillment, and cross-docking services.",
      icon: "🏭",
      badge: "Secure Facility",
      stats: "24/7 Monitored Cross-Docks",
    },
    {
      title: "Port & Drayage Services",
      slug: "port-services",
      description: "Swift container drayage, customs clearance coordination (PARS/PAPRS), and port terminal logistics management to eliminate demurrage delays.",
      icon: "⚓",
      badge: "Customs Bonded",
      stats: "Major Port Terminal Access",
    },
    {
      title: "Logistics Technology",
      slug: "technology",
      description: "Proprietary dispatch algorithms, EDI integration, digital document portals, and automated satellite tracking giving total visibility to shippers.",
      icon: "⚡",
      badge: "Smart Visibility",
      stats: "100% Digital Document Vault",
    },
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <section
        className="relative text-white py-32 px-6 lg:px-20 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[60vh]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center section-fade">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4 border border-teal-500/30">
            Canadian & US Freight Solutions
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white leading-tight">
            Comprehensive <br />
            <span className="text-gradient">Transportation Solutions.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Engineered for reliability, velocity, and customs compliance across North America’s vital trade corridors.
          </p>
          <Link
            href="/quote"
            className="gradient-teal text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:scale-105 transition-all text-sm inline-block"
          >
            Request Instant Quote
          </Link>
        </div>
      </section>

      {/* 2. SERVICES LIST */}
      <section className="py-20 px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl p-3 bg-teal-50 rounded-2xl group-hover:scale-110 transition-transform">
                    {srv.icon}
                  </span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full">
                    {srv.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-navy mb-3 group-hover:text-teal-700 transition-colors">
                  {srv.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {srv.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{srv.stats}</span>
                <Link
                  href={`/services/${srv.slug}`}
                  className="text-teal-600 font-bold hover:text-teal-800 text-xs inline-flex items-center gap-1 group/link"
                >
                  <span>Explore Service</span>
                  <ArrowRight className="w-3.5 h-3.5 transform transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
