'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Eye, FileText, CheckCircle2, AlertTriangle, Calendar, Store } from 'lucide-react';
import { getAllInterviews, getInterviewById } from '@/lib/db/db';
import { Interview } from '@/lib/types';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    const list = await getAllInterviews();
    setInterviews(list);
    if (list.length > 0 && !selectedId) {
      handleSelectInterview(list[0].id);
    }
  };

  const handleSelectInterview = async (id: string) => {
    setSelectedId(id);
    const data = await getInterviewById(id);
    setReportData(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Interview Records & Reports</h2>
        <p className="text-xs text-slate-400">View individual field interview responses, scores, intent & photo reference</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table / List */}
        <div className="lg:col-span-1 glass-panel p-4 space-y-3">
          <h3 className="font-bold text-sm text-white border-b border-dark-600 pb-2">All Completed Interviews</h3>
          {interviews.map((inv) => (
            <div
              key={inv.id}
              onClick={() => handleSelectInterview(inv.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedId === inv.id
                  ? 'bg-indigo-950/70 border-indigo-500 shadow'
                  : 'bg-dark-800 border-dark-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-300">{inv.interview_code}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {inv.status}
                </span>
              </div>
              <div className="text-xs font-bold text-white mt-1">{inv.shop?.shop_name || 'Saree Shop'}</div>
              <div className="text-[11px] text-slate-400 mt-1">{inv.shop?.location}</div>
            </div>
          ))}
        </div>

        {/* Detailed Report View */}
        <div className="lg:col-span-2">
          {reportData ? (
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-dark-600 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{reportData.interview?.interview_code}</span>
                  <h3 className="text-2xl font-extrabold text-white">{reportData.shop?.shop_name}</h3>
                  <p className="text-xs text-slate-400">
                    Interviewer: {reportData.interviewer?.name || 'Lead Interviewer'} | Location: {reportData.shop?.location}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Report PDF</span>
                </button>
              </div>

              {/* Purchase Intent Summary */}
              {reportData.purchaseIntent && (
                <div className="p-4 rounded-xl bg-dark-800 border border-dark-600 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Interest Level</span>
                    <span className="font-bold text-emerald-300">{reportData.purchaseIntent.interest_level}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Purchase Readiness</span>
                    <span className="font-bold text-indigo-300">{reportData.purchaseIntent.readiness_level}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Price Range</span>
                    <span className="font-bold text-purple-300">{reportData.purchaseIntent.price_range}</span>
                  </div>
                </div>
              )}

              {/* Category Scores */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-white">Category Opportunity Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {reportData.categoryScores.map((cs: any) => (
                    <div key={cs.id} className="p-3 rounded-lg bg-dark-800 border border-dark-600 text-xs">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>Category ID</span>
                        <span className="font-mono text-indigo-300">{cs.percentage}% Pain</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{cs.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shop Photo */}
              {reportData.photo && (
                <div className="space-y-2 border-t border-dark-600 pt-4">
                  <h4 className="font-bold text-sm text-white">Shop Reference Photograph</h4>
                  <img
                    src={reportData.photo.photo_url}
                    alt="Shop Reference"
                    className="max-h-56 rounded-xl border border-dark-600 object-cover"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400 text-sm">
              Select an interview to view its full breakdown and report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
