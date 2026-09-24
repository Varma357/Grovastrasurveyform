'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Eye, FileText, CheckCircle2, AlertTriangle, Calendar, Store, Download, Printer, Share2, Trash2, Camera, X } from 'lucide-react';
import { useRole } from '@/components/context/RoleContext';
import { exportElementToPDF, sharePDFReport } from '@/lib/pdfExport';
import { SEED_CATEGORIES } from '@/lib/seed/data';

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
    setIsLoading(true);
    try {
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        if (data.interviews && data.interviews.length > 0) {
          setInterviews(data.interviews);
          handleSelectInterview(data.interviews[0].id);
        } else {
          setInterviews([]);
          setReportData(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch interviews from MongoDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectInterview = async (id: string) => {
    setSelectedId(id);
    try {
      const res = await fetch(`/api/surveys/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        const fallback = interviews.find((i) => i.id === id);
        setReportData(fallback);
      }
    } catch (e) {
      const fallback = interviews.find((i) => i.id === id);
      setReportData(fallback);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="lg:col-span-1 glass-panel p-4 space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">
          <h3 className="font-bold text-sm text-white border-b border-dark-600 pb-2">Completed Surveys ({interviews.length})</h3>
          {interviews.length > 0 ? (
            interviews.map((inv) => (
              <div
                key={inv.id}
                onClick={() => handleSelectInterview(inv.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedId === inv.id
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-lg'
                    : 'bg-dark-800 border-dark-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-300">{inv.interview_code}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    {inv.status || 'completed'}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-1.5">{inv.shop?.shop_name || 'Saree Shop'}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{inv.shop?.location || 'Location'}</span>
                  <span className="font-mono font-bold text-indigo-400">{inv.overall_score || 0}% Score</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs italic">
              {isLoading ? 'Loading records from MongoDB...' : 'No completed survey records found.'}
            </div>
          )}
        </div>

        {/* Right Detailed Preview Report */}
        <div className="lg:col-span-2">
          {reportData ? (
            <div className="glass-panel p-6 space-y-6 bg-dark-800 border border-dark-600 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-600 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{reportData.interview?.interview_code || reportData.interview_code}</span>
                  <h3 className="text-2xl font-extrabold text-white">{reportData.shop?.shop_name || 'Saree Store'}</h3>
                  <p className="text-xs text-slate-400">
                    Interviewer: {reportData.interviewer?.name || 'Navadeep'} | Location: {reportData.shop?.location || 'Vijayawada, AP'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/reports/shop?id=${selectedId}`)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full Report</span>
                  </button>

                  <button
                    onClick={() => router.push(`/reports/shop?id=${selectedId}`)}
                    className="p-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 rounded-lg cursor-pointer"
                    title="Print Report"
                  >
                    <Printer className="w-4 h-4 text-slate-300" />
                  </button>

                  {role === 'ADMIN' && (
                    <button
                      onClick={() => setDeleteModalId(selectedId)}
                      className="p-1.5 bg-rose-950 text-rose-300 border border-rose-500/30 hover:bg-rose-900 rounded-lg cursor-pointer"
                      title="Delete Survey Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Opportunity Cards */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-white">Category Opportunity Breakdown</h4>
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
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400 text-sm">
              Select an interview from the left panel to view its breakdown.
            </div>
          )}
        </div>
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
