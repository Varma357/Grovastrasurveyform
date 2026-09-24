'use client';

import React from 'react';
import { AlertTriangle, Shield, Layers, TrendingUp } from 'lucide-react';
import { SEED_CATEGORIES } from '@/lib/seed/data';

export default function PainPointsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Pain Point & Opportunity Analytics</h2>
        <p className="text-xs text-slate-400">Detailed category pain prevalence, opportunity levels & operational friction analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SEED_CATEGORIES.map((cat) => (
          <div key={cat.category_code} className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-dark-600 pb-2">
              <span className="font-extrabold text-sm text-indigo-300">{cat.category_name}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">
                High Priority
              </span>
            </div>
            <p className="text-xs text-slate-300">{cat.description}</p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Shops Affected:</span>
                <span className="font-bold text-white">100% (n=1)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="font-bold text-amber-300">Moderate / Significant Opportunity</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
