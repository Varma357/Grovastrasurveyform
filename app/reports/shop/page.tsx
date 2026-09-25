'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Printer,
  Share2,
  Download,
  Camera,
  X,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  User,
  Phone,
} from 'lucide-react';
import { exportElementToPDF, sharePDFReport } from '@/lib/pdfExport';
import { SEED_CATEGORIES } from '@/lib/seed/data';

// Category-based recommendation map — shown when category is WEAK (high opportunity %)
const CATEGORY_RECOMMENDATIONS: Record<string, string> = {
  VERIFY: 'Set up a verified digital shop identity (GST/FSSAI badge) to build trust with first-time UPI buyers and reduce payment hesitation.',
  SHOP: 'Create a digital catalogue with WhatsApp-shareable product links so remote buyers can browse and purchase without visiting the store.',
  RECEPTIONIST: 'Implement automated customer follow-up reminders and a simple CRM to track past buyers and reduce missed follow-up sales.',
  GROW: 'Use demand analytics and targeted promotions to identify your best-selling categories and convert browsing customers to buyers.',
  NETWORK: 'Connect with supplier networks and trusted business partners to widen product range and reduce procurement costs.',
  MONEY: 'Adopt an order and advance-payment tracking system to eliminate manual bank reconciliation and reduce payment disputes.',
  MARKET: 'Monitor competitor pricing and regional demand trends to position your saree collection more competitively.',
  PROVENANCE: 'Add fabric sourcing transparency and weave-origin details to justify premium pricing and attract conscious buyers.',
  OPERATIONS: 'Streamline inventory management and staff coordination to reduce stockouts and improve day-to-day operational efficiency.',
};

function ShopReportContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

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
          if (data.interviews?.length > 0) setReportData(data.interviews[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 text-sm">
        Loading Shop Discovery Report...
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 text-sm">
        No shop survey record found. Please select a completed survey.
      </div>
    );
  }

  const interview = reportData.interview || reportData;
  const shop = reportData.shop || interview.shop || {};
  const interviewer = reportData.interviewer || interview.interviewer || {};
  const categoryScores: any[] = reportData.categoryScores || interview.categoryScores || [];
  const photo = reportData.photo || interview.photo || (interview.photo_url ? { photo_url: interview.photo_url } : null);
  const purchaseIntent = reportData.purchaseIntent || interview.purchaseIntent;

  const duration = interview?.duration_minutes || 15;
  const overallScore = interview?.overall_score ?? 0;
  const verdict = interview?.verdict || 'Moderate Opportunity';
  const reportId = interview?.id || id || '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareableUrl = `${origin}/reports/shop?id=${reportId}`;

  const getCategoryName = (catId: string) => {
    const catCode = catId.replace('cat-', '').toUpperCase();
    const found = SEED_CATEGORIES.find(
      (c: any) => c.category_code.toUpperCase() === catCode || c.id === catId
    );
    return found ? found.category_name : catCode;
  };

  const getCategoryCode = (catId: string) => catId.replace('cat-', '').toUpperCase();

  // Build recommendations: pick categories with HIGH opportunity (percentage >= 50 means weak)
  const weakCategories = categoryScores
    .filter((cs: any) => cs.percentage >= 34)
    .sort((a: any, b: any) => b.percentage - a.percentage);

  const recommendations = weakCategories
    .map((cs: any) => {
      const code = getCategoryCode(cs.category_id);
      return CATEGORY_RECOMMENDATIONS[code];
    })
    .filter(Boolean)
    .slice(0, 5);

  // If no weak categories, show generic
  if (recommendations.length === 0) {
    recommendations.push(
      'Maintain current strong operational processes.',
      'Explore digital cataloguing for remote buyers.',
      'Consider verified digital identity to boost online trust.'
    );
  }

  const categoryLines = categoryScores
    .map((cs: any) => `• *${getCategoryName(cs.category_id)}:* ${cs.percentage}% — ${cs.status}`)
    .join('\n');

  const recLines = recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');

  const shareText = `🛍️ *GROVASTRA SHOP DISCOVERY REPORT*
──────────────────────
*Shop:* ${shop?.shop_name || 'Saree Store'} | *Location:* ${shop?.location || 'AP'}
*Interviewer:* ${interviewer?.name || 'Navadeep'} | *Date:* ${new Date(interview?.started_at || Date.now()).toLocaleDateString('en-IN')}

📊 *OVERALL SCORE:* ${overallScore}% — ${verdict}

📋 *CATEGORY BREAKDOWN:*
${categoryLines}

💡 *RECOMMENDED AREAS TO EXPLORE:*
${recLines}

🔗 Full Report: ${shareableUrl}
──────────────────────
*GROVASTRA — Shop Discovery & Market Intelligence*`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const verdictColor =
    verdict === 'Significant Opportunity'
      ? 'border-rose-500/40 bg-rose-950/30'
      : verdict === 'Strong Current Process'
      ? 'border-emerald-500/40 bg-emerald-950/30'
      : 'border-amber-500/40 bg-amber-950/30';

  const verdictTextColor =
    verdict === 'Significant Opportunity'
      ? 'text-rose-300'
      : verdict === 'Strong Current Process'
      ? 'text-emerald-300'
      : 'text-amber-300';

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* Action Bar */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-dark-800 p-4 rounded-xl border border-dark-600 shadow">
        <div>
          <h2 className="text-lg font-extrabold text-white">Shop Discovery Report</h2>
          <p className="text-xs text-slate-400">Client-facing operational capability report</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-indigo-300 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer border border-indigo-500/30"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer border border-dark-600"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print</span>
          </button>

          <button
            onClick={() => exportElementToPDF('printable-shop-report', `Grovastra_Report_${shop?.shop_name || 'Store'}`)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => sharePDFReport('printable-shop-report', `Grovastra_Report_${shop?.shop_name || 'Store'}`, shareText)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div
        id="printable-shop-report"
        className="bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* ── REPORT HEADER ── */}
        <div className="px-8 pt-7 pb-5 border-b border-dark-600 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                Grovastra Discovery Intelligence
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight leading-tight">
              Shop Discovery & Capability Report
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Structured Saree Retail Operational Process Summary
            </p>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-400 shrink-0">
            <div>Code: <span className="text-indigo-300 font-bold">{interview?.interview_code}</span></div>
            <div>Date: {new Date(interview?.started_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div>Duration: <span className="text-slate-200">{duration} min</span></div>
          </div>
        </div>

        {/* ── SHOP INFO GRID ── */}
        <div className="px-8 py-5 border-b border-dark-600">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px]">
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Shop Name</span>
              <span className="font-extrabold text-white text-sm">{shop?.shop_name || 'Saree Store'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Client / Owner</span>
              <span className="font-bold text-slate-200">{shop?.client_name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Location</span>
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />{shop?.location || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Contact</span>
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500 shrink-0" />{shop?.contact_number || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Interviewer</span>
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500 shrink-0" />{interviewer?.name || 'Navadeep'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Shop Type</span>
              <span className="font-bold text-slate-200">{shop?.shop_type || 'Saree Retail'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Staff Count</span>
              <span className="font-bold text-slate-200">{shop?.staff_count || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Years in Business</span>
              <span className="font-bold text-slate-200">{shop?.years_in_business || '—'}</span>
            </div>
          </div>
        </div>

        {/* ── OVERALL SCORE ── */}
        <div className="px-8 py-5 border-b border-dark-600">
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${verdictColor}`}>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Overall Process Opportunity Score
              </div>
              <div className={`text-xl font-black ${verdictTextColor}`}>{verdict}</div>
              <p className="text-[11px] text-slate-300 mt-1 max-w-md">
                Based on {categoryScores.length} category assessments. Higher score = more room for process improvement & automation.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-4xl font-mono font-extrabold ${verdictTextColor}`}>{overallScore}%</span>
              <div className="text-[10px] text-slate-400 mt-0.5">Opportunity Signal</div>
            </div>
          </div>
        </div>

        {/* ── CATEGORY CAPABILITY ASSESSMENT ── */}
        <div className="px-8 py-5 border-b border-dark-600">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 mb-3">
            Category Capability Assessment
          </h3>
          <div className="border border-dark-600 rounded-xl overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-dark-900 border-b border-dark-600">
                <tr>
                  <th className="px-4 py-2.5 font-extrabold text-white">Category</th>
                  <th className="px-4 py-2.5 font-extrabold text-slate-300 text-center">Score</th>
                  <th className="px-4 py-2.5 font-extrabold text-slate-300">Opportunity Level</th>
                  <th className="px-4 py-2.5 font-extrabold text-slate-300">Field Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {categoryScores.length > 0 ? categoryScores.map((cs: any) => {
                  const isHigh = cs.percentage >= 67;
                  const isMod = cs.percentage >= 34 && cs.percentage < 67;
                  return (
                    <tr key={cs.id || cs.category_id} className="hover:bg-dark-700/30">
                      <td className="px-4 py-2.5 font-extrabold text-white uppercase tracking-wide">
                        {getCategoryName(cs.category_id)}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-indigo-300 text-center">
                        {cs.percentage}%
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHigh
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : isMod
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {cs.status || (isHigh ? 'Significant Opportunity' : isMod ? 'Moderate Opportunity' : 'Strong Current Process')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-300 text-[11px]">
                        {isHigh
                          ? 'Significant gap identified — high priority area for improvement.'
                          : isMod
                          ? 'Moderate gap — potential for targeted process optimization.'
                          : 'Strong existing process — maintain and monitor.'}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-slate-400 italic">
                      No category scores recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RECOMMENDED AREAS (based on weak categories) ── */}
        <div className="px-8 py-5 border-b border-dark-600">
          <div className="flex items-center space-x-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">
              Recommended Areas Worth Exploring
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Based on your category scores, the following areas show the most potential for process improvement:
          </p>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start space-x-2.5 p-3 bg-dark-900 rounded-xl border border-dark-600">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[10px] font-extrabold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-[11px] text-slate-200 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── PURCHASE INTENT ── */}
        {purchaseIntent && (
          <div className="px-8 py-5 border-b border-dark-600">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 mb-3">
              Purchase Intent & Pricing
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-dark-900 rounded-xl border border-dark-600">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Interest Level</div>
                <div className="text-[12px] font-bold text-emerald-300">{purchaseIntent.interest_level || '—'}</div>
              </div>
              <div className="p-3 bg-dark-900 rounded-xl border border-dark-600">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Readiness</div>
                <div className="text-[12px] font-bold text-amber-300">{purchaseIntent.readiness_level || '—'}</div>
              </div>
              <div className="p-3 bg-dark-900 rounded-xl border border-dark-600">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Price Range</div>
                <div className="text-[12px] font-bold text-indigo-300">{purchaseIntent.price_range || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── SHOP PHOTO ── */}
        {photo?.photo_url && (
          <div className="px-8 py-5 border-b border-dark-600">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 mb-3 flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Storefront Reference Photograph</span>
            </h3>
            <div
              className="relative inline-block group cursor-pointer"
              onClick={() => setPreviewPhotoUrl(photo.photo_url)}
            >
              <img
                src={photo.photo_url}
                alt="Storefront"
                className="max-h-52 rounded-xl border border-dark-600 object-cover shadow group-hover:opacity-90 transition-all"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">Expand</span>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="px-8 py-4 flex items-center justify-between text-[10px] text-slate-500">
          <span>GROVASTRA — Product Discovery & Market Intelligence System</span>
          <span className="font-mono">{new Date().toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      {/* PHOTO LIGHTBOX */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-600 pb-3">
              <h4 className="font-extrabold text-white text-sm flex items-center space-x-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Storefront Photograph</span>
              </h4>
              <button onClick={() => setPreviewPhotoUrl(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={previewPhotoUrl} alt="Shop Preview" className="w-full max-h-96 object-cover rounded-xl border border-dark-600" />
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl cursor-pointer"
            >
              Close
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
