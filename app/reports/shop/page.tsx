'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, Share2, Store, CheckCircle2, ShieldCheck, MapPin, Calendar, Clock, Sparkles, Download, Camera, X } from 'lucide-react';
import { exportElementToPDF, sharePDFReport } from '@/lib/pdfExport';
import { SEED_CATEGORIES } from '@/lib/seed/data';

function ShopReportContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      if (id) {
        const res = await fetch(`/api/surveys/${id}`);
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
        }
      } else {
        const res = await fetch('/api/surveys');
        if (res.ok) {
          const data = await res.json();
          if (data.interviews && data.interviews.length > 0) {
            setReportData(data.interviews[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load report from MongoDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 text-sm">
        Loading Shop Discovery Report from MongoDB...
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 text-sm">
        No shop survey record found. Please select a completed survey from the records table.
      </div>
    );
  }

  const interview = reportData.interview || reportData;
  const shop = reportData.shop || interview.shop;
  const interviewer = reportData.interviewer || interview.interviewer;
  const categoryScores = reportData.categoryScores || interview.categoryScores || [];
  const photo = reportData.photo || interview.photo || (interview.photo_url ? { photo_url: interview.photo_url } : null);

  const duration = interview?.duration_minutes || 15;
  const overallScore = interview?.overall_score ?? 65;
  const verdict = interview?.verdict || 'Moderate Opportunity';

  const getCategoryName = (catId: string) => {
    const catCode = catId.replace('cat-', '').toUpperCase();
    const found = SEED_CATEGORIES.find(
      (c: any) => c.category_code.toUpperCase() === catCode || c.id === catId
    );
    return found ? found.category_name : catCode;
  };

  const categoryLines = categoryScores
    .map((cs: any) => `• *${getCategoryName(cs.category_id)}:* ${cs.percentage}% — ${cs.status}`)
    .join('\n');

  const shareText = `🛍️ *GROVASTRA SHOP DISCOVERY REPORT*
──────────────────────────
*Shop Name:* ${shop?.shop_name || 'Saree Store'}
*Location:* ${shop?.location || 'AP'}
*Interviewer:* ${interviewer?.name || 'Navadeep'}
*Date:* ${new Date(interview?.started_at || Date.now()).toLocaleDateString()} | *Duration:* ${duration} Mins

📊 *OVERALL PROCESS SCORE:*
*Verdict:* ${verdict} (${overallScore}% Opportunity Score)

📋 *CATEGORY CAPABILITY BREAKDOWN:*
${categoryLines}

💡 *RECOMMENDED AREAS WORTH EXPLORING:*
1. Digital Cataloguing & WhatsApp shareable product links for remote buyers.
2. Verified Shop Identity Badge to establish trust with first-time UPI buyers.
3. Automated customer follow-up reminders during peak store hours.
4. Order & advance payment tracking to eliminate manual bank reconciliation.

──────────────────────────
*GROVASTRA — Product Discovery & Market Intelligence System*`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-dark-800 p-4 rounded-xl border border-dark-600 shadow-lg">
        <div>
          <h2 className="text-xl font-extrabold text-white">Individual Shop Discovery Report</h2>
          <p className="text-xs text-slate-400">Client-facing operational report & exploration summary</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-dark-700 hover:bg-dark-600 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer border border-dark-600"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => exportElementToPDF('printable-shop-report', `Grovastra_Shop_Report_${shop?.shop_name || 'Store'}`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => sharePDFReport('printable-shop-report', `Grovastra_Shop_Report_${shop?.shop_name || 'Store'}`, shareText)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Printable Professional Report Document */}
      <div id="printable-shop-report" className="glass-panel p-8 space-y-6 bg-dark-800 border border-dark-600 text-slate-200 rounded-2xl shadow-2xl">
        {/* Document Header */}
        <div className="border-b border-dark-600 pb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">GROVASTRA DISCOVERY</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">SHOP DISCOVERY & CAPABILITY REPORT</h1>
            <p className="text-xs text-slate-400 mt-0.5">Structured Saree Retail Operational Process Summary</p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <div>Code: <span className="text-indigo-300 font-bold">{interview?.interview_code}</span></div>
            <div>Date: {new Date(interview?.started_at || Date.now()).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-dark-900 border border-dark-600 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Shop Name</span>
            <span className="font-extrabold text-white text-sm">{shop?.shop_name || 'Saree Store'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Town / Location</span>
            <span className="font-bold text-slate-200">{shop?.location || 'Vijayawada, AP'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Interviewer</span>
            <span className="font-bold text-slate-200">{interviewer?.name || 'Navadeep'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Interview Duration</span>
            <span className="font-bold text-indigo-300">{duration} Minutes</span>
          </div>
        </div>

        {/* Overall Score & Verdict Card */}
        <div className="p-6 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">OVERALL PROCESS SCORE</span>
            <div className="text-2xl font-black text-white mt-0.5">{verdict}</div>
            <p className="text-xs text-slate-300 mt-1">
              Polite assessment indicates operational areas where capability automation can save staff time and improve customer trust.
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <span className="text-3xl font-mono font-extrabold text-indigo-400">{overallScore}%</span>
            <span className="block text-[11px] text-slate-400">Opportunity Signal</span>
          </div>
        </div>

        {/* Category Capability Assessment Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-white border-b border-dark-600 pb-2 uppercase tracking-wider">
            Category Capability Assessment
          </h3>

          <div className="overflow-x-auto border border-dark-600 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900 text-slate-400 border-b border-dark-600">
                <tr>
                  <th className="p-3 font-extrabold text-white">Category</th>
                  <th className="p-3 font-extrabold text-slate-300">Score %</th>
                  <th className="p-3 font-extrabold text-slate-300">Opportunity Level</th>
                  <th className="p-3 font-extrabold text-slate-300">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {categoryScores.map((cs: any) => (
                  <tr key={cs.id || cs.category_id} className="hover:bg-dark-700/50">
                    <td className="p-3 font-extrabold text-white uppercase tracking-wider">
                      {getCategoryName(cs.category_id)}
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-300">{cs.percentage}%</td>
                    <td className="p-3 font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cs.status === 'Significant Opportunity'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : cs.status === 'Moderate Opportunity'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {cs.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {cs.percentage >= 67
                        ? 'Area worth exploring for process improvement.'
                        : cs.percentage >= 34
                        ? 'Potential for process optimization.'
                        : 'Strong current process capability.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Areas Worth Exploring */}
        <div className="space-y-3 p-5 rounded-xl bg-dark-900 border border-dark-600">
          <h3 className="font-extrabold text-sm text-indigo-300 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Recommended Areas Worth Exploring</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            <li>Digital Cataloguing & WhatsApp shareable product links for remote buyers.</li>
            <li>Verified Shop Identity Badge to establish trust with first-time buyers before UPI payment.</li>
            <li>Automated customer follow-up reminders to prevent missed saree sales during peak store hours.</li>
            <li>Order and advance payment tracking to eliminate manual bank reconciliation effort.</li>
          </ul>
        </div>

        {/* Shop Reference Photo Section with Lightbox Trigger */}
        {photo && photo.photo_url && (
          <div className="space-y-3 border-t border-dark-600 pt-4">
            <h4 className="font-extrabold text-sm text-white flex items-center space-x-2">
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>Storefront Reference Photograph</span>
            </h4>
            <div className="relative inline-block group cursor-pointer" onClick={() => setPreviewPhotoUrl(photo.photo_url)}>
              <img
                src={photo.photo_url}
                alt="Storefront"
                className="max-h-60 rounded-xl border border-dark-600 object-cover shadow-lg group-hover:opacity-90 transition-all"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">Click to Expand</span>
              </div>
            </div>
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
              alt="Shop Lightbox Preview"
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
    </div>
  );
}

export default function ShopReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm text-center">Loading Report...</div>}>
      <ShopReportContent />
    </Suspense>
  );
}
