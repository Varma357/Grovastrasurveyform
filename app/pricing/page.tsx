'use client';

import React from 'react';
import { IndianRupee, PieChart, BarChart3, Info } from 'lucide-react';
import { localStore } from '@/lib/db/db';

export default function PricingPage() {
  const priceBands = [
    { range: '₹500–₹2,000/month', count: 0, percentage: '0%' },
    { range: '₹2,000–₹5,000/month', count: localStore.purchaseIntent.length || 1, percentage: '100%' },
    { range: '₹5,000–₹10,000/month', count: 0, percentage: '0%' },
    { range: 'Above ₹10,000/month', count: 0, percentage: '0%' },
    { range: '₹0 — only if free', count: 0, percentage: '0%' },
    { range: 'Cannot decide yet', count: 0, percentage: '0%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Price Sensitivity Analytics</h2>
        <p className="text-xs text-slate-400">Monthly pricing acceptance bands & willingness to pay across saree shop segments</p>
      </div>

      <div className="glass-panel p-6 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between border-b border-dark-600 pb-3">
          <h3 className="font-bold text-base text-white">Price Range Distribution</h3>
          <span className="text-xs font-mono text-slate-400">Sample Size (n={localStore.shops.length || 1})</span>
        </div>

        <div className="space-y-4">
          {priceBands.map((band) => (
            <div key={band.range} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">{band.range}</span>
                <span className="text-indigo-400 font-mono">{band.percentage} ({band.count} shop)</span>
              </div>
              <div className="w-full bg-dark-900 h-3 rounded-full overflow-hidden border border-dark-600">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all"
                  style={{ width: band.percentage }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
