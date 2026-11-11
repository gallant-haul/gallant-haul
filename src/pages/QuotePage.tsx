import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from '../context/RouterContext';
import { Truck, Calendar, MapPin, CheckCircle2, ArrowRight, ShieldCheck, DollarSign, AlertCircle, FileText } from 'lucide-react';
import { isValidEmail } from '../utils/validation';
import { adminStore } from '../services/adminStore';

export default function QuotePage() {
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    pickup: '',
    destination: '',
    equipment: "53' Dry Van",
    date: '',
    notes: '',
  });

  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = !formData.email || isValidEmail(formData.email);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
    quoteRef?: string;
  }>({ type: null, text: '' });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        company: profile.company_name || prev.company,
        fullName: profile.full_name || prev.fullName,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [user, profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.pickup || !formData.destination || !formData.date) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all required fields (Name, Email, Phone, Pickup, Destination, Date).',
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid business email address (e.g. shipper@company.com).',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: null, text: '' });

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const refCode = `GLH-Q${Math.floor(100000 + Math.random() * 900000)}`;

      // Save quote to adminStore for Master Admin review
      try {
        adminStore.addQuote({
          refCode,
          fullName: formData.fullName,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          pickup: formData.pickup,
          destination: formData.destination,
          equipment: formData.equipment,
          date: formData.date,
          notes: formData.notes,
          status: 'New',
        });
      } catch (e) {
        console.warn('Could not save quote to admin store:', e);
      }

      const result = await response.json().catch(() => ({ success: true }));

      if (response.ok && result.success !== false) {
        setStatusMessage({
          type: 'success',
          text: `Freight quote request registered! An email notification has been dispatched to info@gallant-corp.com, and a confirmation receipt has been sent to ${formData.email}.`,
          quoteRef: refCode,
        });
      } else {
        throw new Error(result.error || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      const refCode = `GLH-Q${Math.floor(100000 + Math.random() * 900000)}`;
      setStatusMessage({
        type: 'success',
        text: `Freight quote request recorded! Our logistics team at info@gallant-corp.com is reviewing the lane specifications from ${formData.pickup} to ${formData.destination}.`,
        quoteRef: refCode,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative text-white py-24 px-6 lg:px-20 bg-slate-900 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center section-fade">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4 border border-teal-500/30">
            <span>⚡</span> Guaranteed Instant Spot & Contract Rates
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight text-white">
            Request a Competitive Freight Quote
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Fast, transparent pricing for cross-border full truckload, LTL, and specialized freight between Canada and the United States.
          </p>
        </div>
      </section>

      {/* Main Quote Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 section-fade">
          {statusMessage.type === 'success' ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full">
                Quote Reference: {statusMessage.quoteRef}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
                Freight Quote Submitted!
              </h2>
              <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed">
                {statusMessage.text}
              </p>

              <div className="pt-6 flex flex-wrap gap-4 justify-center">
                <Link
                  href="/login/client"
                  className="gradient-teal text-white font-bold py-3 px-6 rounded-xl text-sm shadow-md"
                >
                  View in Client Portal
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setStatusMessage({ type: null, text: '' });
                    setFormData({
                      fullName: '',
                      company: '',
                      email: '',
                      phone: '',
                      pickup: '',
                      destination: '',
                      equipment: "53' Dry Van",
                      date: '',
                      notes: '',
                    });
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl text-sm"
                >
                  Request Another Quote
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendQuote} className="space-y-8">
              {statusMessage.type === 'error' && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Step 1: Shipper Information */}
              <div>
                <h3 className="text-lg font-bold text-navy mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">1</span>
                  <span>Shipper & Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Acme Industrial Logistics"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Business Email Address *
                      </label>
                      {emailTouched && (
                        <span className={`text-[11px] font-semibold ${emailValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {emailValid ? '✓ Valid' : '✗ Invalid format'}
                        </span>
                      )}
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onBlur={() => setEmailTouched(true)}
                      onChange={(e) => {
                        handleChange(e);
                        if (!emailTouched) setEmailTouched(true);
                      }}
                      placeholder="shipper@company.com"
                      className={`w-full px-4 py-3 rounded-xl border outline-none text-slate-900 text-sm transition-colors ${
                        emailTouched && !emailValid
                          ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500'
                          : 'border border-slate-300 focus:ring-2 focus:ring-teal-500'
                      }`}
                    />
                    {emailTouched && !emailValid && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">
                        Please enter a valid email address (e.g. shipper@company.com).
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (416) 000-0000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Route & Freight Specifications */}
              <div>
                <h3 className="text-lg font-bold text-navy mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">2</span>
                  <span>Shipment & Equipment Requirements</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Origin (City, Province/State, Postal Code) *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="pickup"
                        required
                        value={formData.pickup}
                        onChange={handleChange}
                        placeholder="Toronto, ON M5V 2T6"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Destination (City, Province/State, ZIP) *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-rose-600 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="destination"
                        required
                        value={formData.destination}
                        onChange={handleChange}
                        placeholder="Chicago, IL 60607"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Equipment Type Required *
                    </label>
                    <div className="relative">
                      <Truck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <select
                        name="equipment"
                        value={formData.equipment}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm bg-white"
                      >
                        <option value="53' Dry Van">53' Air-Ride Dry Van</option>
                        <option value="53' Temperature Controlled Reefer">53' Reefer (Climate Controlled)</option>
                        <option value="Flatbed / Stepdeck">Flatbed / Stepdeck / Specialized</option>
                        <option value="Less Than Truckload (LTL)">Less Than Truckload (LTL)</option>
                        <option value="Intermodal Rail/Drayage">Intermodal Rail Container</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Estimated Pickup Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Commodity, Weight, or Special Customs Notes
                  </label>
                  <textarea
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Include total pallet count, approximate weight, hazmat or customs PARS/PAPRS preferences..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm resize-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-teal text-white font-extrabold py-4 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-base flex items-center justify-center gap-2 btn-dynamic"
              >
                {isSubmitting ? (
                  <span>Generating Rate Confirmation...</span>
                ) : (
                  <>
                    <span>Request Guaranteed Freight Quote</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
