import React, { useState } from 'react';
import { 
  Check, 
  Shield, 
  Sparkles, 
  CreditCard, 
  Zap, 
  Users, 
  Building2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function PricingView({ user }) {
  const [currency, setCurrency] = useState('INR'); // INR or USD
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const plans = [
    {
      id: 'free',
      name: 'Community Defense',
      tagline: 'Basic exposure discovery for individuals',
      priceINR: '₹0',
      priceUSD: '$0',
      period: 'forever',
      features: [
        '1 Monitored Identifier (Email or Phone)',
        'Live Breach & Directory Scan',
        'Basic Exposure Report & Risk Score',
        'Standard Opt-Out Links Directory',
        'Manual Removal Instructions'
      ],
      current: user?.plan === 'free' || !user?.plan,
      buttonText: 'Current Plan',
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Pro Privacy Shield',
      tagline: 'Continuous monitoring & automated statutory erasure',
      priceINR: '₹499',
      priceUSD: '$9',
      period: 'per month',
      features: [
        'Up to 5 Monitored Identifiers (Emails, Phones, Usernames)',
        'Automated DPDP Act 2023 & GDPR Legal Notice Generator',
        'Direct One-Click DPO Mailto Dispatch',
        'Continuous Weekly Re-scanning & Recurrence Alerts',
        'Removal Status Tracking & Verification History',
        'Priority Truecaller & Telecom DND Guidance'
      ],
      current: user?.plan === 'pro',
      buttonText: 'Upgrade to Pro Shield',
      isPopular: true
    },
    {
      id: 'family',
      name: 'Family Guard',
      tagline: 'Multi-member privacy protection for households',
      priceINR: '₹1,299',
      priceUSD: '$19',
      period: 'per month',
      features: [
        'Covers up to 5 Family Members (25 Identifiers total)',
        'Individual Consent & Authorization Workflows',
        'Family Privacy Exposure Dashboard',
        'Automated Removal Requests for All Members',
        'Robocall & Telecom Spam Suppression Guide',
        'Emergency Leak Alerts via Email & SMS'
      ],
      current: user?.plan === 'family',
      buttonText: 'Get Family Guard',
      isPopular: false
    },
    {
      id: 'enterprise',
      name: 'Executive & Enterprise',
      tagline: 'B2B executive protection & DPO remediation support',
      priceINR: '₹4,999',
      priceUSD: '$59',
      period: 'per seat / mo',
      features: [
        'Unlimited Monitored Corporate Identifiers',
        'Dedicated Privacy Specialist / Concierge Removal Support',
        'Custom Legal Notice Drafting & Follow-up with Brokers',
        'Executive Attack Surface Monitoring',
        'Enterprise Audit Export & Compliance Reports',
        'Direct SLA & Priority Ticket Handling'
      ],
      current: user?.plan === 'enterprise',
      buttonText: 'Contact Enterprise Sales',
      isPopular: false
    }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setSuccessMsg(`Simulated subscription order created for ${plan.name}. You are on the live testing sandbox.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60 mb-2">
            <CreditCard className="h-3 w-3" />
            <span>Commercial Business Plans</span>
          </div>
          <h2 className="text-xl font-bold text-white">Privacy Protection Tiers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent pricing based on actual verified outcomes and continuous monitoring. No fear-based marketing.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setCurrency('INR')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              currency === 'INR' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            INR (₹) India
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              currency === 'USD' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            USD ($) Global
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const price = currency === 'INR' ? p.priceINR : p.priceUSD;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                p.isPopular
                  ? 'border-cyan-500/60 bg-gradient-to-b from-slate-900 to-slate-950 shadow-xl shadow-cyan-500/10'
                  : 'border-slate-800 bg-slate-900/80 shadow-sm'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-0.5 text-[10px] font-bold text-slate-950 uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="mt-1 text-xs text-slate-400 min-h-[32px]">{p.tagline}</p>

                <div className="mt-4 flex items-baseline gap-1 border-b border-slate-800 pb-4">
                  <span className="text-3xl font-extrabold text-white font-mono">{price}</span>
                  <span className="text-xs text-slate-500">/{p.period}</span>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleSelectPlan(p)}
                  disabled={p.current}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    p.current
                      ? 'border border-slate-700 bg-slate-800 text-slate-400 cursor-default'
                      : p.isPopular
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400'
                      : 'border border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  <span>{p.buttonText}</span>
                  {!p.current && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
