import React, { useState } from 'react';
import { Mail, Phone, MapPin, Shield, CheckCircle2, Send, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from '../context/RouterContext';
import { isValidEmail } from '../utils/validation';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    inquiryType: 'General Freight Inquiry',
    message: '',
  });

  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = !formData.email || isValidEmail(formData.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isValidEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address (e.g. name@company.com).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative text-white py-28 px-6 lg:px-20 bg-slate-950 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2074&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center section-fade">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-6">
            <span>🍁</span> 24/7 Canadian Dispatch Operations
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white">
            Get in Touch With Our Team
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Have questions about cross-border shipping, carrier onboarding, or freight quotes? Our logistics experts are available 24/7.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-20 px-6 lg:px-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Information Column */}
          <div className="lg:col-span-1 space-y-6 section-fade">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-2xl font-bold text-navy mb-4">Direct Contacts</h3>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-navy text-sm">24/7 Dispatch Desk</h4>
                  <a href="tel:+14167355356" className="text-slate-700 text-sm font-semibold hover:text-teal-600">
                    +1 (416) 735-5356
                  </a>
                  <p className="text-xs text-teal-600 font-semibold mt-1">Direct Driver & Load Assistance</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-navy text-sm">Corporate Email</h4>
                  <a href="mailto:info@gallant-corp.com" className="text-slate-700 text-sm font-semibold hover:text-teal-600 break-all">
                    info@gallant-corp.com
                  </a>
                  <p className="text-xs text-slate-400 mt-1">Average response &lt;15 mins</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-navy text-sm">Corporate Headquarters</h4>
                  <p className="text-slate-600 text-sm">Brampton, Ontario, Canada</p>
                  <p className="text-xs text-slate-400 mt-1">C-TPAT & Canadian Bonded Facilities</p>
                </div>
              </div>
            </div>

            {/* Certifications Badge Card */}
            <div className="gradient-navy p-8 rounded-3xl text-white shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-base">Compliance Standards</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Operating strictly under Canadian Bonded, C-TPAT, and CARB California environmental requirements to ensure smooth North American trade corridors.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-2 section-fade">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
              {submitted ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                    ✓
                  </div>
                  <h3 className="text-3xl font-bold text-navy">Message Sent Successfully!</h3>
                  <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                    Thank you for reaching out to Gallant Line Haul Corp. A dedicated logistics specialist will review your inquiry and connect with you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 gradient-teal text-white font-bold py-3 px-8 rounded-xl shadow-md text-sm cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-navy mb-1">Send Us a Message</h3>
                    <p className="text-xs text-slate-500">
                      Fill out the form below or email <code className="text-teal-700">info@gallant-corp.com</code>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                        placeholder="Acme Logistics Inc."
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Email Address *
                        </label>
                        {emailTouched && (
                          <span className={`text-[11px] font-semibold ${emailValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {emailValid ? '✓ Valid' : '✗ Invalid format'}
                          </span>
                        )}
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onBlur={() => setEmailTouched(true)}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (!emailTouched) setEmailTouched(true);
                        }}
                        className={`w-full px-4 py-3 rounded-xl border outline-none text-slate-900 text-sm transition-colors ${
                          emailTouched && !emailValid
                            ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-teal-500'
                        }`}
                        placeholder="john@company.com"
                      />
                      {emailTouched && !emailValid && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">
                          Please enter a valid email format (e.g. name@company.com).
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm"
                        placeholder="+1 (416) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Inquiry Type
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm bg-white"
                    >
                      <option>General Freight Inquiry</option>
                      <option>Cross-Border Customs & PARS/PAPRS Question</option>
                      <option>Carrier Network Partnership</option>
                      <option>Billing & Rate Confirmation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 text-sm resize-none"
                      placeholder="Provide shipment details, lane preferences, or specific questions..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gradient-teal text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Connecting & Sending...</span>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
