'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, UserPlus, Trash2, Mail, Phone, Lock, Sparkles, Store, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  active: boolean;
  created_at: string;
}

export default function AdminTeamPage() {
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Add Employee Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<UserRole>('INTERVIEWER');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Load team from Supabase API
      const [teamRes, surveyRes] = await Promise.all([
        fetch('/api/team'),
        fetch('/api/surveys'),
      ]);

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setEmployees(teamData.team || []);
      } else {
        setErrorMsg('Could not load team members from Supabase.');
      }

      if (surveyRes.ok) {
        const surveyData = await surveyRes.json();
        const invs = surveyData.interviews || [];
        setInterviews(invs);
        const shopList = invs.map((inv: any) => inv.shop).filter(Boolean);
        const uniqueShops = Array.from(new Map(shopList.map((s: any) => [s.id, s])).values());
        setShops(uniqueShops);
      }
    } catch (err) {
      setErrorMsg('Network error loading team data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !mobile.trim() || !password.trim()) return;
    setIsCreating(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, role, password }),
      });

      const data = await res.json();

      if (res.ok && data.member) {
        setSuccessMsg(`✅ Team member "${data.member.name}" created! They can now log in with their email/mobile + password.`);
        setName(''); setEmail(''); setMobile(''); setPassword('');
        await loadData();
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        setErrorMsg(data.error || 'Failed to create team member.');
      }
    } catch (err) {
      setErrorMsg('Network error creating team member.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEmployee = async (id: string, empName: string) => {
    if (!confirm(`Remove team member "${empName}"? They will no longer be able to log in.`)) return;

    try {
      const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        await loadData();
      } else {
        setErrorMsg(data.error || 'Failed to delete team member.');
      }
    } catch (err) {
      setErrorMsg('Network error deleting team member.');
    }
  };

  // Helper to calculate total interviews completed by an employee
  const getWorkStats = (emp: TeamMember) => {
    const empInvs = interviews.filter(
      (inv) =>
        inv.interviewer_id === emp.id ||
        inv.interviewer?.email?.toLowerCase() === emp.email.toLowerCase() ||
        inv.interviewer?.name?.toLowerCase() === emp.name.toLowerCase()
    );
    const shopsCovered = new Set(empInvs.map((inv) => inv.shop_id)).size;
    return { interviewsCount: empInvs.length, shopsCount: shopsCovered };
  };


  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-600 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">TEAM & EMPLOYEE MANAGEMENT</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Supabase Persisted
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Team members saved to Supabase — they can login from any device, any session.</p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-2 bg-dark-800 border border-dark-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{isLoading ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}


      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-xl border border-dark-600 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Team Members</div>
          <div className="text-3xl font-black text-white">{employees.length}</div>
          <div className="text-xs text-indigo-400 font-bold">Admins & Interviewers</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-dark-600 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Field Interviewers</div>
          <div className="text-3xl font-black text-emerald-400">
            {employees.filter((e) => e.role === 'INTERVIEWER').length}
          </div>
          <div className="text-xs text-slate-400">Active Field Leads</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-dark-600 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Surveys Logged</div>
          <div className="text-3xl font-black text-purple-400">{interviews.length}</div>
          <div className="text-xs text-slate-400">Across {shops.length} Shops</div>
        </div>
      </div>

      {/* Form: Add New Employee */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-600 space-y-4">
        <div className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-indigo-400" />
          <h3 className="font-extrabold text-lg text-white">Create New Team Member / Employee</h3>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email / Gmail Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@grovastra.com"
              className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Assign Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="INTERVIEWER">INTERVIEWER (Field Lead)</option>
              <option value="ADMIN">ADMIN (Full Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Set Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="lg:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isCreating ? 'Saving to Supabase…' : 'Register Team Member'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Employee Table & Work Tracked */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-600 space-y-4">
        <h3 className="font-extrabold text-lg text-white">Registered Team Members & Work Performance</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-900 text-slate-400 border-b border-dark-600">
              <tr>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Contact (Email & Mobile)</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Shops Covered</th>
                <th className="p-3">Interviews Completed</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {employees.map((emp) => {
                const stats = getWorkStats(emp);
                return (
                  <tr key={emp.id} className="hover:bg-dark-700/50">
                    <td className="p-3 font-extrabold text-white">
                      <div className="flex items-center space-x-2">
                        {emp.role === 'ADMIN' ? (
                          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span>{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300">
                      <div>{emp.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{emp.mobile}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          emp.role === 'ADMIN'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-200">
                      <div className="flex items-center space-x-1">
                        <Store className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{stats.shopsCount} Shops</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-300">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <span>{stats.interviewsCount} Interviews</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remove Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
