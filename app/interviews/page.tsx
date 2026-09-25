'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Eye, FileText, CheckCircle2, AlertTriangle, Calendar, Store, Download, Printer, Share2, Trash2, Camera, X } from 'lucide-react';
import { useRole } from '@/components/context/RoleContext';
import { exportElementToPDF, sharePDFReport } from '@/lib/pdfExport';
import { SEED_CATEGORIES } from '@/lib/seed/data';

import { localStore } from '@/lib/db/db';

export default function InterviewsPage() {
  const router = useRouter();
  const { role } = useRole();

  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    if (localStore.interviews.length > 0) {
      setInterviews(localStore.interviews);
      if (!selectedId) {
        handleSelectInterview(localStore.interviews[0].id);
      }
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        if (data.interviews && data.interviews.length > 0) {
          setInterviews(data.interviews);
          const targetId = selectedId || data.interviews[0].id;
          handleSelectInterview(targetId);
        } else if (localStore.interviews.length === 0) {
          setInterviews([]);
          setReportData(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch interviews from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectInterview = async (id: string) => {
    setSelectedId(id);
    const localMatch = localStore.interviews.find((i) => i.id === id);
    if (localMatch) {
      setReportData(localMatch);
    }

    try {
      const res = await fetch(`/api/surveys/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else if (!localMatch) {
        const fallback = interviews.find((i) => i.id === id);
        setReportData(fallback);
      }
    } catch (e) {
      if (!localMatch) {
        const fallback = interviews.find((i) => i.id === id);
        setReportData(fallback);
      }
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

  const getCategoryName = (catId: string) => {
    const catCode = catId.replace('cat-', '').toUpperCase();
    const found = SEED_CATEGORIES.find(
      (c: any) => c.category_code.toUpperCase() === catCode || c.id === catId
    );
    return found ? found.category_name : catCode;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-dark-600 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Completed Survey Records</h2>
          <p className="text-xs text-slate-400">View individual field interview responses, category scores & shop report</p>
        </div>
      </div>

      {/* SURVEYS MAIN TABLE & DETAILS VIEW */}
      <div className="space-y-6">
        {/* TOP INTERVIEW TABLE */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-600 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                <span>My Survey Submissions ({interviews.length})</span>
              </h3>
              <p className="text-xs text-slate-400">Complete list of shop discovery interviews with shop & client details</p>
            </div>
            <button
              onClick={() => router.push('/survey')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30"
            >
              <span>+ Conduct New Survey</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-dark-600 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900 text-slate-400 border-b border-dark-600">
                <tr>
                  <th className="p-3 font-extrabold text-white">Code / Date</th>
                  <th className="p-3 font-extrabold text-white">Shop & Client Details</th>
                  <th className="p-3 font-extrabold text-slate-300">Location & Contact</th>
                  <th className="p-3 font-extrabold text-slate-300">Score & Verdict</th>
                  <th className="p-3 font-extrabold text-slate-300">Photo</th>
                  <th className="p-3 font-extrabold text-center text-indigo-300">Report Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {interviews.length > 0 ? (
                  interviews.map((inv) => {
                    const shop = inv.shop || {};
                    const isSelected = selectedId === inv.id;
                    const photoUrl = inv.photo_url || inv.photo?.photo_url;

                    const shareText = `🛍️ *GROVASTRA SHOP DISCOVERY REPORT*
Shop: ${shop.shop_name || 'Saree Store'} (${shop.location || 'AP'})
Client: ${shop.client_name || 'Valued Client'}
Verdict: ${inv.verdict || 'Moderate Opportunity'} (${inv.overall_score || 0}% Score)
Report Link: ${typeof window !== 'undefined' ? `${window.location.origin}/reports/shop?id=${inv.id}` : ''}`;

                    return (
                      <tr
                        key={inv.id}
                        className={`transition-all ${
                          isSelected ? 'bg-indigo-950/40 font-medium' : 'hover:bg-dark-700/50'
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-mono font-bold text-indigo-300 text-xs">{inv.interview_code}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(inv.started_at || inv.created_at || Date.now()).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-extrabold text-white text-sm">{shop.shop_name || 'Saree Store'}</div>
                          <div className="text-[11px] text-slate-300">Owner: {shop.client_name || 'Client'}</div>
                        </td>

                        <td className="p-3">
                          <div className="text-slate-200 font-semibold">{shop.location || 'Vijayawada, AP'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{shop.contact_number || 'No contact'}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-mono font-extrabold text-indigo-300 text-sm">{inv.overall_score || 0}%</div>
                          <span
                            className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.verdict === 'Significant Opportunity'
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {inv.verdict || 'Moderate Opportunity'}
                          </span>
                        </td>

                        <td className="p-3">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt="Shop Photo"
                              onClick={() => setPreviewPhotoUrl(photoUrl)}
                              className="w-10 h-10 object-cover rounded-lg border border-dark-600 cursor-pointer hover:scale-105 transition-all"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">No Photo</span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => router.push(`/reports/shop?id=${inv.id}`)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow"
                              title="View Interactive Report"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Report</span>
                            </button>

                            <button
                              onClick={() => router.push(`/reports/shop?id=${inv.id}`)}
                              className="p-1.5 bg-dark-700 hover:bg-dark-600 text-indigo-300 rounded-lg border border-indigo-500/30 cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
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
                      {isLoading ? 'Loading survey records from Supabase...' : 'No completed survey records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SELECTED INTERVIEW PREVIEW PANEL */}
        {reportData && (
          <div className="glass-panel p-6 space-y-6 bg-dark-800 border border-dark-600 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-600 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold">
                  {reportData.interview?.interview_code || reportData.interview_code}
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {reportData.shop?.shop_name || 'Saree Store'}
                </h3>
                <p className="text-xs text-slate-400">
                  Client Owner: {reportData.shop?.client_name || 'Valued Client'} | Location: {reportData.shop?.location || 'Vijayawada, AP'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push(`/reports/shop?id=${reportData.interview?.id || selectedId}`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open Full Shop Discovery Report</span>
                </button>
              </div>
            </div>

            {/* Category Opportunity Cards */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-white">Category Capability Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {(reportData.categoryScores || []).map((cs: any) => (
                  <div key={cs.id || cs.category_id} className="p-3 rounded-xl bg-dark-900 border border-dark-600 space-y-1">
                    <div className="flex justify-between font-bold text-white uppercase">
                      <span>{getCategoryName(cs.category_id)}</span>
                      <span className="font-mono text-indigo-400">{cs.percentage}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{cs.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shop Photograph */}
            {(reportData.photo?.photo_url || reportData.photo_url) && (
              <div className="space-y-2 border-t border-dark-600 pt-4">
                <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span>Storefront Reference Photograph</span>
                </h4>
                <img
                  src={reportData.photo?.photo_url || reportData.photo_url}
                  alt="Shop Photo Reference"
                  className="max-h-56 rounded-xl border border-dark-600 object-cover cursor-pointer"
                  onClick={() => setPreviewPhotoUrl(reportData.photo?.photo_url || reportData.photo_url)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* SAME-PAGE PHOTO LIGHTBOX MODAL */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-600 pb-3">
              <h4 className="font-extrabold text-white text-base flex items-center space-x-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <span>Storefront Reference Photograph</span>
              </h4>
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewPhotoUrl}
              alt="Shop Preview"
              className="w-full max-h-96 object-cover rounded-xl border border-dark-600 shadow-md"
            />
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer"
            >
              Close Photo Preview
            </button>
          </div>
        </div>
      )}

      {/* ADMIN DELETE CONFIRMATION MODAL */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-white text-base">Confirm Survey Deletion</h4>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this survey record?
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
                <span>{isDeleting ? 'Deleting...' : 'Delete Survey Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
