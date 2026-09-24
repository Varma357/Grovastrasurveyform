'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, Share2, Store, CheckCircle2, ShieldCheck, MapPin, Calendar, Clock, Sparkles, Download } from 'lucide-react';
import { getInterviewById, getAllInterviews, localStore } from '@/lib/db/db';
import { exportElementToPDF, sharePDFReport } from '@/lib/pdfExport';

function ShopReportContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (id) {
      const data = await getInterviewById(id);
      setReportData(data);
    } else {
      const list = await getAllInterviews();
      if (list.length > 0) {
        const data = await getInterviewById(list[0].id);
        setReportData(data);
      }
    }
  };

  if (!reportData) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 text-sm">
        Loading Shop Discovery Report...
      </div>
    );
  }

  const { interview, shop, interviewer, categoryScores, photo } = reportData;

  const duration = interview?.duration_minutes || 19;
  const overallScore = interview?.overall_score ?? 76;
  const verdict = interview?.verdict || 'Significant Opportunity';

  // Helper to map category_id (e.g. 'cat-verify') to clean uppercase name
  const getCategoryName = (catId: string) => {
    const found = localStore.categories.find(
      (c) => c.id === catId || c.category_code.toLowerCase() === catId.replace('cat-', '').toLowerCase()
    );
    if (found) return found.category_name;
    // Fallback cleanup
    return catId.replace('cat-', '').toUpperCase();
  };

  // Build complete rich WhatsApp text report message
  const categoryLines = categoryScores
    .map((cs: any) => `• *${getCategoryName(cs.category_id)}:* ${cs.percentage}% — ${cs.status}`)
    .join('\n');

  const shareText = `🛍️ *GROVASTRA SHOP DISCOVERY REPORT*
──────────────────────────
*Shop Name:* ${shop?.shop_name || 'Saree Store'}
*Location:* ${shop?.location || 'Vijayawada, AP'}
*Interviewer:* ${interviewer?.name || 'Field Lead Interviewer'}
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

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-dark-800 p-4 rounded-xl border border-dark-600">
        <div>
          <h2 className="text-xl font-extrabold text-white">Individual Shop Discovery Report</h2>
          <p className="text-xs text-slate-400">Client-facing operational report & exploration summary</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportElementToPDF('printable-shop-report', `Grovastra_Shop_Report_${shop?.shop_name || 'Store'}`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Shop PDF</span>
          </button>

          <button
            onClick={() => sharePDFReport('printable-shop-report', `Grovastra_Shop_Report_${shop?.shop_name || 'Store'}`, shareText)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share PDF on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document (Only this section prints!) */}
      <div id="printable-shop-report" className="glass-panel p-8 space-y-8 bg-dark-800 border border-dark-600 text-slate-200 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="border-b border-dark-600 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">GROVASTRA</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">SHOP DISCOVERY & CAPABILITY REPORT</h1>
            <p className="text-xs text-slate-400 mt-1">Saree Retail Operational Process Summary</p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <div>Code: <span className="text-indigo-300 font-bold">{interview?.interview_code}</span></div>
            <div>Date: {new Date(interview?.started_at || Date.now()).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-dark-900 border border-dark-600 text-xs">
          <div>
            <span className="text-slate-400 block">Shop Name</span>
            <span className="font-extrabold text-white text-sm">{shop?.shop_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Town / Location</span>
            <span className="font-bold text-slate-200">{shop?.location}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Interviewer</span>
            <span className="font-bold text-slate-200">{interviewer?.name || 'Field Lead Interviewer'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Interview Duration</span>
            <span className="font-bold text-indigo-300">{duration} Minutes</span>
          </div>
        </div>

        {/* Overall Score & Verdict */}
        <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">OVERALL PROCESS SCORE</span>
            <div className="text-3xl font-black text-white mt-1">{verdict}</div>
            <p className="text-xs text-slate-300 mt-1">
              Polite assessment indicates areas where process automation can save staff time and improve conversions.
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <span className="text-3xl font-mono font-extrabold text-indigo-400">{overallScore}%</span>
            <span className="block text-[11px] text-slate-400">Opportunity Signal</span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-white border-b border-dark-600 pb-2">Category Capability Assessment</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900 text-slate-400 border-b border-dark-600">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Score %</th>
                  <th className="p-3">Opportunity Level</th>
                  <th className="p-3">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {categoryScores.map((cs: any) => (
                  <tr key={cs.id} className="hover:bg-dark-700/50">
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

        {/* Areas Worth Exploring */}
        <div className="space-y-3 p-5 rounded-xl bg-dark-900 border border-dark-600">
          <h3 className="font-bold text-base text-indigo-300 flex items-center space-x-2">
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

        {/* Shop Reference Photo */}
        {photo && (
          <div className="space-y-2 border-t border-dark-600 pt-4">
            <h4 className="font-bold text-sm text-white">Storefront Reference Photograph</h4>
            <img
              src={photo.photo_url}
              alt="Storefront"
              className="max-h-56 rounded-xl border border-dark-600 object-cover"
            />
          </div>
        )}
      </div>
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
