import React from 'react';
import { Link } from '../context/RouterContext';
import { Truck, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface ServiceDetailProps {
  slug: string;
}

interface ServiceData {
  title: string;
  tagline: string;
  heroImage: string;
  overview: string;
  features: string[];
  specs: { label: string; value: string }[];
}

const serviceCatalog: Record<string, ServiceData> = {
  truckload: {
    title: 'Full Truckload (FTL)',
    tagline: 'Dedicated Capacity & High-Security Cross-Border Freight',
    heroImage: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop',
    overview:
      "When your shipment demands an entire trailer, Gallant Line Haul Corp delivers unmatched reliability. Our fleet consists of late-model 53' air-ride dry vans and climate-controlled reefers equipped with real-time satellite GPS tracking. Whether you are moving automotive components, consumer packaged goods, or high-value freight across the US-Canada border, we provide end-to-end chain of custody with pre-filed PARS/PAPRS customs manifests.",
    features: [
      "Dedicated 53' Air-Ride Dry Vans & Multi-Temp Reefers",
      'C-TPAT and Canadian Bonded Carrier status for expedited customs border clearance',
      'Real-time temperature telemetry and live door-opening sensors',
      '24/7 dedicated satellite dispatch monitoring every mile',
    ],
    specs: [
      { label: 'Trailer Length', value: "53 Feet (Air-Ride Suspension)" },
      { label: 'Weight Capacity', value: 'Up to 45,000 lbs (US) / 48,000 lbs (Canada)' },
      { label: 'Border Clearance', value: 'Pre-Arrival Processing (PARS & PAPRS)' },
      { label: 'Tracking Tech', value: 'Live Satellite GPS & Geofencing' },
    ],
  },
  intermodal: {
    title: 'Intermodal Logistics',
    tagline: 'Cost-Effective, Sustainable Rail & Highway Synergy',
    heroImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
    overview:
      'Optimize your shipping spend and reduce your environmental footprint by combining the high fuel efficiency of rail with our premier regional trucking network. Gallant coordinates seamless intermodal transitions across major Canadian and US rail networks (CN, CPKC, BNSF, Norfolk Southern), providing door-to-door transit visibility.',
    features: [
      'Significant cost savings on hauls exceeding 750 miles',
      'Up to 30% reduction in carbon emissions compared to pure over-the-road freight',
      'Dedicated drayage fleets operating out of major Canadian and US intermodal ramps',
      'Guaranteed container capacity during peak seasonal volume surges',
    ],
    specs: [
      { label: 'Container Types', value: "53' Domestic & 20'/40' Marine Containers" },
      { label: 'Corridors', value: 'Trans-Canada (Toronto-Vancouver) & Cross-Border' },
      { label: 'Ramp Access', value: 'All Major CN & CPKC Rail Terminals' },
      { label: 'Tracking', value: 'Integrated Ramp & Highway Telemetry' },
    ],
  },
  ltl: {
    title: 'Less Than Truckload (LTL)',
    tagline: 'Flexible Consolidation with Guaranteed Transit Schedules',
    heroImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop',
    overview:
      'Ship smaller palletized consignments without paying for unused trailer space. Gallant Line Haul Corp operates strategic cross-dock hubs that consolidate freight from multiple shippers, providing expedited cross-border transit times comparable to dedicated truckload service.',
    features: [
      'Direct scheduled departures across Ontario, Quebec, and US Midwest',
      'Pallet-level barcode scanning and digital proof-of-delivery receipts',
      'Liftgate service and inside delivery options for facilities without loading docks',
      'Comprehensive cargo insurance with minimal handling damage rates',
    ],
    specs: [
      { label: 'Shipment Size', value: '1 to 12 Pallets (up to 15,000 lbs)' },
      { label: 'Transit Frequency', value: 'Daily Scheduled Cross-Dock Runs' },
      { label: 'Special Services', value: 'Liftgate, Inside Delivery, White Glove' },
      { label: 'Customs', value: 'Consolidated PARS & Single e-Manifest' },
    ],
  },
  warehousing: {
    title: 'Warehousing & Cross-Docking',
    tagline: 'Secure, Climate-Controlled Facilities at Prime Trade Gateways',
    heroImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
    overview:
      'Position your inventory directly alongside major transport arteries. Our modern Canadian cross-dock facilities in the Greater Toronto Area and Montreal provide rapid freight transloading, short-term and long-term pallet storage, and real-time inventory management.',
    features: [
      '24/7 CCTV surveillance, biometric access, and secure trailer staging yards',
      'High-velocity cross-docking for immediate load reconsolidation',
      'Order fulfillment, pick-and-pack, and reverse logistics handling',
      'Cloud-connected warehouse management system (WMS) with API integration',
    ],
    specs: [
      { label: 'Facility Security', value: '24/7 Gated & Guarded Compound' },
      { label: 'Dock Doors', value: '30+ Hydraulic Leveler Bays' },
      { label: 'Storage Options', value: 'Ambient, Temperature-Monitored, Yard Staging' },
      { label: 'Turnaround Time', value: '<2 Hours Average Cross-Dock Transload' },
    ],
  },
  'port-services': {
    title: 'Port & Drayage Services',
    tagline: 'Accelerated Harbor Drayage & Demurrage Prevention',
    heroImage: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2074&auto=format&fit=crop',
    overview:
      'Avoid demurrage fees and container per-diem penalties. Gallant’s dedicated port drayage division coordinates ocean container pickups directly from marine terminals in Montreal, Vancouver, Halifax, and US ports, transloading freight to domestic trailers or executing immediate highway delivery.',
    features: [
      'Pre-scheduled terminal gate appointments to eliminate driver dwell times',
      'Bonded container transport under Canadian customs seal',
      'Overweight container permits and tri-axle chassis availability',
      'Direct customs coordination for customs inspection holds',
    ],
    specs: [
      { label: 'Harbor Access', value: 'Port of Montreal, Vancouver & US Coastal Terminals' },
      { label: 'Chassis Fleet', value: "20', 40', and 53' Tri-Axle Chassis" },
      { label: 'Customs Status', value: 'Customs Bonded Carrier Code' },
      { label: 'Hazardous Cargo', value: 'Hazmat & Dangerous Goods Certified' },
    ],
  },
  technology: {
    title: 'Logistics Technology',
    tagline: 'End-to-End Visibility & Digital Freight Infrastructure',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    overview:
      'We replace outdated logistics blind spots with real-time digital transparency. Through our integrated client portal and driver dispatch network, shippers access live satellite GPS telematics, instant automated e-Manifests, temperature logs, and cloud document vaults.',
    features: [
      'Real-time satellite GPS tracking with live geofence entry/exit alerts',
      'Direct EDI (204, 214, 210) and REST API integration for enterprise ERPs',
      'Digital document repository: instant Bill of Lading and Proof of Delivery access',
      'Automated customs clearance tracking syncing directly with CBSA and US CBP',
    ],
    specs: [
      { label: 'EDI Standards', value: 'EDI 204, 214, 210, 990 Compliant' },
      { label: 'GPS Refresh Rate', value: 'Every 3 Minutes Under Way' },
      { label: 'Document Vault', value: 'Instant Signed POD & BOL PDF Export' },
      { label: 'Security', value: 'Encrypted Cloud Architecture & Supabase Auth' },
    ],
  },
};

export default function ServiceDetailPage({ slug }: ServiceDetailProps) {
  const data = serviceCatalog[slug] || serviceCatalog['truckload'];

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      {/* 1. HERO */}
      <section
        className="relative text-white py-28 px-6 lg:px-20 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[55vh]"
        style={{
          backgroundImage: `url('${data.heroImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center section-fade">
          <Link
            href="/services/services"
            className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-white font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Solutions</span>
          </Link>

          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight text-white leading-tight">
            {data.title}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            {data.tagline}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/quote"
              className="gradient-teal text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:scale-105 transition-all text-sm"
            >
              Request Quote for {data.title}
            </Link>
            <Link
              href="/contact"
              className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold py-3.5 px-8 rounded-xl text-sm transition-colors"
            >
              Contact Dispatch
            </Link>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW & SPECIFICATIONS */}
      <section className="py-20 px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-4">
                Service Overview
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">
                {data.overview}
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-xl font-bold text-navy mb-4">Key Capabilities & Security</h3>
              <div className="space-y-3">
                {data.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-800">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Specifications Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-navy pb-3 border-b border-slate-100">
                Operating Specifications
              </h3>
              <div className="space-y-4">
                {data.specs.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900 block font-mono">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/quote"
                  className="w-full gradient-teal text-white font-bold py-3 rounded-xl text-center block text-sm shadow-md"
                >
                  Book This Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
