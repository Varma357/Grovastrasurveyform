'use client';

import React from 'react';
import { TrendingUp, Sparkles, CheckCircle2, IndianRupee, Layers } from 'lucide-react';
import { SEED_FEATURES } from '@/lib/seed/data';

export default function FeaturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Feature Demand & Opportunity Matrix</h2>
        <p className="text-xs text-slate-400">Evaluate product features based on underlying operational pain evidence and shop willingness</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SEED_FEATURES.slice(0, 12).map((feat) => (
          <div key={feat.feature_code} className="glass-panel p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                  {feat.category_code}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">100% Demand</span>
              </div>
              <h3 className="font-extrabold text-base text-white">{feat.feature_name}</h3>
              <p className="text-xs text-slate-300">{feat.description}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-dark-600 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Shops Affected:</span>
                <span className="font-bold text-white">100% (n=1)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Willingness to Pay:</span>
                <span className="font-bold text-purple-300">₹2,000–₹5,000/mo</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
