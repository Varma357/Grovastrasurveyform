'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Download, Database, ShieldAlert, Check } from 'lucide-react';
import { useRole } from '@/components/context/RoleContext';
import { generateCSV } from '@/lib/export';
import { localStore, getAdminSetting, saveAdminSetting, getAllResponses } from '@/lib/db/db';

export default function AdminSettingsPage() {
  const { role } = useRole();
  const [moderate, setModerate] = useState(34);
  const [significant, setSignificant] = useState(67);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const thresholds = await getAdminSetting('category_thresholds');
      if (thresholds) {
        setModerate(thresholds.moderate ?? 34);
        setSignificant(thresholds.significant ?? 67);
      }
    }
    loadSettings();
  }, []);

  if (role !== 'ADMIN') {
    return (
      <div className="glass-panel p-8 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Admin Access Restricted</h3>
        <p className="text-xs text-slate-400">Switch your active role to ADMIN in the top bar to configure settings.</p>
      </div>
    );
  }

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAdminSetting('category_thresholds', { moderate: Number(moderate), significant: Number(significant) });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFullBackup = async () => {
    const responses = await getAllResponses();
    generateCSV(responses.length > 0 ? responses : localStore.responses, 'Grovastra_Full_Raw_Backup');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Admin System Settings & Backup</h2>
        <p className="text-xs text-slate-400">Configure pain threshold triggers, scoring rules and download raw backup exports</p>
      </div>

      <div className="glass-panel p-6 space-y-6 max-w-3xl">
        <form onSubmit={handleSaveThresholds} className="space-y-4">
          <div className="flex items-center justify-between border-b border-dark-600 pb-2">
            <h3 className="font-bold text-base text-white">Category Opportunity Thresholds</h3>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Threshold Settings Saved!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Moderate Opportunity Threshold (%)</label>
              <input
                type="number"
                value={moderate}
                onChange={(e) => setModerate(Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Significant Opportunity Threshold (%)</label>
              <input
                type="number"
                value={significant}
                onChange={(e) => setSignificant(Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow"
            >
              <Save className="w-4 h-4" />
              <span>Save Threshold Rules</span>
            </button>
          </div>
        </form>

        <div className="border-t border-dark-600 pt-6 space-y-3">
          <h3 className="font-bold text-base text-white">Full Raw Data Backup System</h3>
          <p className="text-xs text-slate-400">
            Export complete un-aggregated raw interview responses directly from MongoDB. Historical raw responses are preserved permanently regardless of rule updates.
          </p>
          <button
            onClick={handleFullBackup}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Export Full CSV Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
