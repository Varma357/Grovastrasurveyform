'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useRole } from '@/components/context/RoleContext';
import { getSurveyVersions, getQuestions } from '@/lib/db/db';
import { SurveyVersion } from '@/lib/types';

export default function AdminVersionsPage() {
  const { role } = useRole();
  const [versions, setVersions] = useState<SurveyVersion[]>([]);
  const [mainCount, setMainCount] = useState(25);
  const [optCount, setOptCount] = useState(32);

  useEffect(() => {
    async function loadData() {
      const vers = await getSurveyVersions();
      const qs = await getQuestions();
      setVersions(vers);
      setMainCount(qs.filter((q) => q.question_type === 'Main').length);
      setOptCount(qs.filter((q) => q.question_type === 'Optional').length);
    }
    loadData();
  }, []);

  if (role !== 'ADMIN') {
    return (
      <div className="glass-panel p-8 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Admin Access Restricted</h3>
        <p className="text-xs text-slate-400">Switch your active role to ADMIN in the top bar to manage survey versions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Survey Versioning Manager</h2>
        <p className="text-xs text-slate-400">Track survey versions and ensure historical interviews preserve active question definitions</p>
      </div>

      <div className="glass-panel p-6 space-y-4 max-w-2xl">
        {versions.map((ver) => (
          <div key={ver.id} className="p-4 rounded-xl bg-dark-800 border border-indigo-500/40 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">{ver.version_name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  ver.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-dark-700 text-slate-400'
                }`}>
                  {ver.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Version Number: {ver.version_number} | {mainCount} Main Questions | {optCount} Conditional Questions
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
