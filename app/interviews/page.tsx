'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Eye, AlertTriangle, Download, Share2, Trash2 } from 'lucide-react';
import { useRole } from '@/components/context/RoleContext';

export default function InterviewsPage() {
  const router = useRouter();
  const { role } = useRole();

  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews || []);
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSurvey = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/surveys/${deleteModalId}`, {
        method: 'DELETE',
        headers: { 'x-user-role': role || 'GUEST' },
      });
      if (res.ok) {
        setDeleteModalId(null);
        await loadInterviews();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete survey record');
      }
    } catch (e) {
      alert('Error deleting survey record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-dark-600 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">My Survey Records</h2>
          <p className="text-xs text-slate-400 mt-0.5">All completed field interviews — view report, download PDF or share via WhatsApp</p>
        </div>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-600 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              <span>Submitted Surveys ({interviews.length})</span>
            </h3>
            <p className="text-xs text-slate-400">Click Report to view, download PDF, or share with client via WhatsApp</p>
          </div>
          <button
            onClick={() => router.push('/survey')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <span>+ Conduct New Survey</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-dark-600 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-900 border-b border-dark-600">
              <tr>
                <th className="p-3 font-extrabold text-white">Code / Date</th>
                <th className="p-3 font-extrabold text-white">Shop & Client</th>
                <th className="p-3 font-extrabold text-slate-300">Location</th>
                <th className="p-3 font-extrabold text-slate-300">Contact</th>
                <th className="p-3 font-extrabold text-slate-300">Score & Verdict</th>
                <th className="p-3 font-extrabold text-center text-indigo-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    Loading survey records...
                  </td>
                </tr>
              ) : interviews.length > 0 ? (
                interviews.map((inv) => {
                  const shop = inv.shop || {};
                  const origin = typeof window !== 'undefined' ? window.location.origin : '';
                  const reportUrl = `${origin}/reports/shop?id=${inv.id}`;
                  const shareText = `🛍️ *GROVASTRA SHOP DISCOVERY REPORT*\nShop: ${shop.shop_name || 'Saree Store'} (${shop.location || 'AP'})\nClient: ${shop.client_name || 'Valued Client'}\nVerdict: ${inv.verdict || 'Moderate Opportunity'} (${inv.overall_score || 0}%)\n🔗 Full Report: ${reportUrl}`;

                  return (
                    <tr key={inv.id} className="hover:bg-dark-700/50 transition-all">
                      <td className="p-3">
                        <div className="font-mono font-bold text-indigo-300">{inv.interview_code}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(inv.started_at || inv.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-extrabold text-white text-sm">{shop.shop_name || 'Saree Store'}</div>
                        <div className="text-[11px] text-slate-400">Owner: {shop.client_name || 'Client'}</div>
                      </td>

                      <td className="p-3 text-slate-200 font-semibold">{shop.location || '—'}</td>

                      <td className="p-3 font-mono text-slate-400 text-[11px]">{shop.contact_number || '—'}</td>

                      <td className="p-3">
                        <div className="font-mono font-extrabold text-indigo-300">{inv.overall_score || 0}%</div>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.verdict === 'Significant Opportunity'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : inv.verdict === 'Strong Current Process'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}>
                          {inv.verdict || 'Moderate Opportunity'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => router.push(`/reports/shop?id=${inv.id}`)}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow cursor-pointer"
                            title="View Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>

                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-500/30 cursor-pointer"
                            title="Share via WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </a>

                          {role === 'ADMIN' && (
                            <button
                              onClick={() => setDeleteModalId(inv.id)}
                              className="p-1.5 bg-rose-950 text-rose-300 border border-rose-500/30 hover:bg-rose-900 rounded-lg cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    No completed survey records yet. Conduct your first survey to see it here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIN DELETE CONFIRMATION MODAL */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-white text-base">Confirm Survey Deletion</h4>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete this survey record?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSurvey}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
