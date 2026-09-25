'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

export function CategoryOpportunityChart({
  data,
}: {
  data: { category: string; opportunityPct: number; strongCount: number; modCount: number; sigCount: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600">
        Loading Category Chart...
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-dark-900/40 p-3 rounded-xl border border-dark-600/80 flex flex-col justify-between">
      <div className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-dark-700 pb-2 mb-1">
        <span>Opportunity Score by Category (%)</span>
        <span className="text-[10px] font-normal text-slate-400">Higher % = Greater Needs</span>
      </div>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
            <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              formatter={(value: any) => [`${value}%`, 'Opportunity Score']}
            />
            <Bar dataKey="opportunityPct" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => {
                const color = entry.opportunityPct >= 50 ? '#f43f5e' : entry.opportunityPct >= 34 ? '#f59e0b' : '#10b981';
                return <Cell key={`cell-cat-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FeatureDemandChart({
  data,
}: {
  data: { feature: string; affectedPct: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600">
        Loading Feature Demand Chart...
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-dark-900/40 p-3 rounded-xl border border-dark-600/80 flex flex-col justify-between">
      <div className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-dark-700 pb-2 mb-1">
        <span>Top Features Demand & Pain Level (%)</span>
        <span className="text-[10px] font-normal text-indigo-400">Shop Pain Evidence</span>
      </div>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" tickLine={false} />
            <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={85} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              formatter={(value: any) => [`${value}%`, 'Shops Affected']}
            />
            <Bar dataKey="affectedPct" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => {
                const color = entry.affectedPct >= 50 ? '#f43f5e' : entry.affectedPct >= 25 ? '#6366f1' : '#3b82f6';
                return <Cell key={`cell-feat-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AdoptionReadinessChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600">
        Loading Adoption Chart...
      </div>
    );
  }

  const COLORS = ['#10b981', '#6366f1', '#8b5cf6', '#f59e0b', '#f43f5e'];

  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="h-60 w-full bg-dark-900/40 p-3 rounded-xl border border-dark-600/80 flex flex-col items-center justify-center">
      {!hasData ? (
        <div className="text-xs text-slate-500 italic">No survey responses recorded yet</div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-adopt-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '4px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function PricingChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600">
        Loading Pricing Chart...
      </div>
    );
  }

  const COLORS = ['#10b981', '#8b5cf6', '#6366f1', '#3b82f6', '#f59e0b', '#f43f5e', '#64748b'];

  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="h-60 w-full bg-dark-900/40 p-3 rounded-xl border border-dark-600/80 flex flex-col items-center justify-center">
      {!hasData ? (
        <div className="text-xs text-slate-500 italic">No price selections recorded yet</div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-price-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '4px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
