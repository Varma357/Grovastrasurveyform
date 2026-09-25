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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  CartesianGrid,
  LabelList,
} from 'recharts';

// ─── Shared custom tooltip ────────────────────────────────────────────────────
const SharedTooltip = ({ active, payload, label, unit = '%' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,23,42,0.97)',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '12px',
        color: '#e2e8f0',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: '#a5b4fc' }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color || '#10b981' }}>
            {p.name}: <strong>{p.value}{unit}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Custom pie label ─────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Category Opportunity Bar Chart (enhanced with CartesianGrid + data labels)
// ─────────────────────────────────────────────────────────────────────────────
export function CategoryOpportunityChart({
  data,
}: {
  data: { category: string; opportunityPct: number; strongCount: number; modCount: number; sigCount: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600 animate-pulse">
        Loading Chart…
      </div>
    );
  }

  return (
    <div className="h-72 w-full bg-dark-900/50 p-3 rounded-xl border border-indigo-500/20 flex flex-col">
      <div className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-dark-700 pb-2 mb-2">
        <span>Opportunity Score by Category</span>
        <span className="text-[10px] font-normal text-rose-400">High % = Bigger Need</span>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 24 }} barSize={22}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" vertical={false} />
            <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} angle={-25} textAnchor="end" />
            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" tickLine={false} />
            <Tooltip content={<SharedTooltip unit="%" />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Bar dataKey="opportunityPct" radius={[6, 6, 0, 0]} name="Opportunity" animationDuration={600}>
              {data.map((entry, index) => {
                const color = entry.opportunityPct >= 67 ? '#f43f5e' : entry.opportunityPct >= 34 ? '#f59e0b' : '#10b981';
                return <Cell key={`cell-cat-${index}`} fill={color} fillOpacity={0.9} />;
              })}
              <LabelList dataKey="opportunityPct" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Feature Demand Horizontal Bar Chart (with data labels)
// ─────────────────────────────────────────────────────────────────────────────
export function FeatureDemandChart({
  data,
}: {
  data: { feature: string; affectedPct: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600 animate-pulse">
        Loading Chart…
      </div>
    );
  }

  return (
    <div className="h-72 w-full bg-dark-900/50 p-3 rounded-xl border border-indigo-500/20 flex flex-col">
      <div className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-dark-700 pb-2 mb-2">
        <span>Feature Demand & Pain Level</span>
        <span className="text-[10px] font-normal text-indigo-400">Shops Affected %</span>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 32, left: 10, bottom: 5 }} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" horizontal={false} />
            <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" tickLine={false} />
            <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={9} tickLine={false} width={90} />
            <Tooltip content={<SharedTooltip unit="%" />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Bar dataKey="affectedPct" radius={[0, 6, 6, 0]} name="Affected" animationDuration={600}>
              {data.map((entry, index) => {
                const color = entry.affectedPct >= 50 ? '#f43f5e' : entry.affectedPct >= 25 ? '#6366f1' : '#3b82f6';
                return <Cell key={`cell-feat-${index}`} fill={color} fillOpacity={0.85} />;
              })}
              <LabelList dataKey="affectedPct" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Adoption Readiness Donut Pie (with in-slice labels)
// ─────────────────────────────────────────────────────────────────────────────
export function AdoptionReadinessChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const COLORS = ['#10b981', '#6366f1', '#8b5cf6', '#f59e0b', '#f43f5e'];
  const hasData = data.some((d) => d.value > 0);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600 animate-pulse">
        Loading Chart…
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-dark-900/50 p-3 rounded-xl border border-indigo-500/20 flex flex-col items-center justify-center">
      <div className="text-xs font-bold text-slate-300 w-full border-b border-dark-700 pb-2 mb-2 text-center">
        Adoption Readiness Distribution
      </div>
      {!hasData ? (
        <div className="text-xs text-slate-500 italic mt-6">No survey responses recorded yet</div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={38}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderPieLabel}
                animationBegin={0}
                animationDuration={700}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-adopt-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(15,23,42,0.5)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.97)', borderColor: 'rgba(99,102,241,0.3)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '4px' }} formatter={(v: string) => v.length > 22 ? v.slice(0, 20) + '…' : v} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Pricing Bar Chart (with data labels — more readable than pie)
// ─────────────────────────────────────────────────────────────────────────────
export function PricingChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const COLORS = ['#10b981', '#8b5cf6', '#6366f1', '#3b82f6', '#f59e0b', '#f43f5e', '#64748b'];
  const hasData = data.some((d) => d.value > 0);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600 animate-pulse">
        Loading Chart…
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-dark-900/50 p-3 rounded-xl border border-indigo-500/20 flex flex-col">
      <div className="text-xs font-bold text-slate-300 w-full border-b border-dark-700 pb-2 mb-2 text-center">
        Price Range Preference
      </div>
      {!hasData ? (
        <div className="text-xs text-slate-500 italic mt-6 text-center">No price selections recorded yet</div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 30 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} angle={-28} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.97)', borderColor: 'rgba(99,102,241,0.3)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(v: any) => [`${v} shops`, 'Count']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Shops" animationDuration={700}>
                {data.map((entry, index) => (
                  <Cell key={`cell-price-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                ))}
                <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NEW: Category Radar Spider Chart
// ─────────────────────────────────────────────────────────────────────────────
export function CategoryRadarChart({
  data,
}: {
  data: { category: string; score: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600 animate-pulse">
        Loading Radar…
      </div>
    );
  }

  const hasData = data.some((d) => d.score > 0);

  return (
    <div className="h-72 w-full bg-dark-900/50 p-3 rounded-xl border border-indigo-500/20 flex flex-col">
      <div className="text-xs font-bold text-slate-300 border-b border-dark-700 pb-2 mb-2 flex justify-between items-center">
        <span>Category Opportunity Radar</span>
        <span className="text-[10px] text-indigo-400 font-normal">Spider Chart</span>
      </div>
      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic">No category scores yet</div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(99,102,241,0.2)" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#64748b' }} tickCount={4} />
              <Radar
                name="Opportunity %"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.22}
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 3 }}
                animationDuration={600}
              />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.97)', borderColor: 'rgba(99,102,241,0.3)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(v: any) => [`${v}%`, 'Opportunity']} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. NEW: Survey Timeline Area Chart
// ─────────────────────────────────────────────────────────────────────────────
export function SurveyTimelineChart({
  data,
}: {
  data: { date: string; count: number; avgScore: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600 animate-pulse">
        Loading Timeline…
      </div>
    );
  }

  const hasData = data.length > 0;

  return (
    <div className="h-56 w-full bg-dark-900/50 p-3 rounded-xl border border-indigo-500/20 flex flex-col">
      <div className="text-xs font-bold text-slate-300 border-b border-dark-700 pb-2 mb-2 flex items-center justify-between">
        <span>Survey Activity Timeline</span>
        <span className="text-[10px] text-emerald-400 font-normal">Surveys Per Day</span>
      </div>
      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic">No timeline data</div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.97)', borderColor: 'rgba(99,102,241,0.3)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#countGrad)" name="Surveys" dot={{ fill: '#6366f1', r: 3 }} animationDuration={600} />
              <Area type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={2} fill="url(#scoreGrad)" name="Avg Score %" dot={{ fill: '#10b981', r: 3 }} animationDuration={600} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. NEW: Verdict Distribution Donut Chart
// ─────────────────────────────────────────────────────────────────────────────
export function VerdictDistributionChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];
  const hasData = data.some((d) => d.value > 0);

  if (!mounted) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-500 bg-dark-900/50 rounded-xl border border-dark-600 animate-pulse">
        Loading Chart…
      </div>
    );
  }

  return (
    <div className="h-56 w-full bg-dark-900/50 p-3 rounded-xl border border-indigo-500/20 flex flex-col">
      <div className="text-xs font-bold text-slate-300 border-b border-dark-700 pb-2 mb-2 text-center">
        Verdict Distribution
      </div>
      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic">No verdicts recorded yet</div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={40}
                outerRadius={62}
                paddingAngle={4}
                dataKey="value"
                labelLine={false}
                label={renderPieLabel}
                animationDuration={600}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-vd-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(15,23,42,0.5)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.97)', borderColor: 'rgba(99,102,241,0.3)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} formatter={(v: string) => v.length > 20 ? v.slice(0, 18) + '…' : v} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
