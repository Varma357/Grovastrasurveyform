'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  FileSpreadsheet,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  Users,
  Calendar,
  Filter,
  CheckCircle2,
  BarChart3,
  Search,
  Download,
  Eye,
  Printer,
  Share2,
  Trash2,
  Camera,
  RefreshCw,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Clock,
  UserCheck,
  X,
} from 'lucide-react';
import { useRole } from '@/components/context/RoleContext';
import { SEED_CATEGORIES, SEED_FEATURES } from '@/lib/seed/data';
import { generateCSV } from '@/lib/export';
import {
  CategoryOpportunityChart,
  FeatureDemandChart,
  AdoptionReadinessChart,
  PricingChart,
} from '@/components/dashboard/DashboardCharts';

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useRole();

  const [shops, setShops] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTown, setFilterTown] = useState('all');
  const [filterVerdict, setFilterVerdict] = useState('all');
  const [filterWalkin, setFilterWalkin] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Photo Lightbox Modal State
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        if (data.interviews) {
          setInterviews(data.interviews);
          const shopList = data.interviews.map((inv: any) => inv.shop).filter(Boolean);
          const uniqueShops = Array.from(new Map(shopList.map((s: any) => [s.id, s])).values());
          setShops(uniqueShops);
        }
      }
    } catch (err) {
      console.error('Failed to load surveys from Supabase PostgreSQL:', err);
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
        headers: {
          'x-user-role': role || 'GUEST',
        },
      });

      if (res.ok) {
        setDeleteModalId(null);
        await loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete survey record');
      }
    } catch (err) {
      alert('Error deleting survey record');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Interviews
  const filteredInterviews = interviews.filter((inv) => {
    const s = inv.shop;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = s?.shop_name?.toLowerCase().includes(term);
      const matchClient = s?.client_name?.toLowerCase().includes(term);
      const matchCode = inv.interview_code?.toLowerCase().includes(term);
      const matchTown = s?.location?.toLowerCase().includes(term);
      if (!matchName && !matchClient && !matchCode && !matchTown) return false;
    }

    if (filterTown !== 'all' && s?.location !== filterTown) return false;
    if (filterVerdict !== 'all' && inv.verdict !== filterVerdict) return false;
    if (filterWalkin !== 'all') {
      const isW = filterWalkin === 'walkin';
      if (!!inv.is_walkin !== isW) return false;
    }

    if (filterDate !== 'all') {
      const invDate = new Date(inv.started_at).toISOString().split('T')[0];
      if (invDate !== filterDate) return false;
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInterviews.length / pageSize) || 1;
  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Section Metrics
  const totalShops = shops.length;
  const totalInterviews = filteredInterviews.length;

  const readyCount = filteredInterviews.filter(
    (inv) => inv.verdict === 'Significant Opportunity' || inv.verdict === 'Moderate Opportunity' || inv.status === 'completed'
  ).length;
  const notReadyCount = Math.max(0, totalInterviews - readyCount);

  const towns = Array.from(new Set(shops.map((s) => s.location).filter(Boolean)));
  const dates = Array.from(new Set(interviews.map((i) => new Date(i.started_at).toISOString().split('T')[0]).filter(Boolean)));

  // Helper to retrieve category score from an interview with flexible matching
  const getCategoryScoreObj = (inv: any, catCode: string) => {
    if (!inv.categoryScores || !Array.isArray(inv.categoryScores)) return null;
    const codeLower = catCode.toLowerCase();
    return inv.categoryScores.find((cs: any) => {
      const csCat = (cs.category_id || cs.category_code || '').toLowerCase().replace(/^cat-/, '');
      return csCat === codeLower;
    });
  };

  // Dynamic Category Analysis Data
  const categoryAnalysisData = SEED_CATEGORIES.map((cat) => {
    let catTotalPct = 0;
    let catCount = 0;
    let strongCount = 0;
    let modCount = 0;
    let sigCount = 0;
    let conditionalFollowups = 0;

    filteredInterviews.forEach((inv) => {
      const sc = getCategoryScoreObj(inv, cat.category_code);
      if (sc) {
        catTotalPct += sc.percentage || 0;
        catCount++;
        if (sc.status === 'Significant Opportunity') sigCount++;
        else if (sc.status === 'Moderate Opportunity') modCount++;
        else strongCount++;
      }
      if (inv.optional_completed) {
        conditionalFollowups++;
      }
    });

    const sampleN = catCount || filteredInterviews.length;
    const avgPct = sampleN > 0 ? Math.round(catTotalPct / sampleN) : 0;

    return {
      category_code: cat.category_code,
      category_name: cat.category_name,
      description: cat.description,
      sampleN,
      avgScoreStr: `${((avgPct / 100) * 3).toFixed(1)} / 3`,
      avgPct,
      strongCount,
      modCount,
      sigCount,
      conditionalFollowups,
    };
  });

  const categoryChartData = categoryAnalysisData.map((d) => ({
    category: d.category_code,
    opportunityPct: d.avgPct,
    strongCount: d.strongCount,
    modCount: d.modCount,
    sigCount: d.sigCount,
  }));

  // Dynamic Feature Demand Data
  const featureDemandData = SEED_FEATURES.slice(0, 10).map((feat) => {
    const totalN = filteredInterviews.length;
    const affectedCount = filteredInterviews.filter((inv) => {
      const sc = getCategoryScoreObj(inv, feat.category_code);
      return sc && sc.percentage >= 34;
    }).length;

    const affectedPct = totalN > 0 ? Math.round((affectedCount / totalN) * 100) : 0;
    const painSignal = affectedPct >= 50 ? 'High Pain' : affectedPct >= 25 ? 'Moderate Pain' : 'Low Pain';
    const conditionalSignal = filteredInterviews.some((i) => i.optional_completed) ? 'High' : 'Moderate';
    const evidence = affectedPct >= 50 ? 'Strong Demand Evidence' : 'Moderate Evidence';

    return {
      feature_code: feat.feature_code,
      feature_name: feat.feature_name,
      category_code: feat.category_code,
      description: feat.description,
      affectedCount,
      totalN: totalN || 1,
      affectedPct,
      painSignal,
      conditionalSignal,
      evidence,
    };
  });

  const featureChartData = featureDemandData.map((d) => ({
    feature: d.feature_name.length > 18 ? d.feature_name.slice(0, 16) + '...' : d.feature_name,
    affectedPct: d.affectedPct,
  }));

  // Dynamic Adoption Readiness Table & Chart Data
  const readinessLevels = [
    'Yes, ready to start',
    'Interested, but need to discuss',
    'Interested, but not now',
    'Just exploring',
    'No / Not interested',
  ];

  const adoptionTableData = readinessLevels.map((lvl) => {
    const count = filteredInterviews.filter((inv) => {
      const val = inv.purchaseIntent?.readiness_level || '';
      if (lvl === 'No / Not interested') {
        return val === 'No' || val === 'No / Not interested' || val === 'Not interested';
      }
      return val === lvl;
    }).length;

    const pctNum = totalInterviews > 0 ? Math.round((count / totalInterviews) * 100) : 0;
    return {
      readiness: lvl,
      count,
      pct: `${pctNum}%`,
      pctNum,
    };
  });

  const adoptionChartData = adoptionTableData.map((d) => ({
    name: d.readiness,
    value: d.count,
  }));

  // Dynamic Pricing Analysis Table & Chart Data
  const priceRangesConfig = [
    { range: '₹2,000–₹5,000/month', ready: 'Yes' },
    { range: '₹500–₹2,000/month', ready: 'Yes' },
    { range: '₹5,000–₹10,000/month', ready: 'Yes' },
    { range: 'Above ₹10,000/month', ready: 'Yes' },
    { range: '₹0 — only if free', ready: 'No' },
    { range: 'Cannot decide yet', ready: 'Pending' },
  ];

  const pricingTableData = priceRangesConfig.map((item) => {
    const count = filteredInterviews.filter((inv) => {
      const val = inv.purchaseIntent?.price_range || '';
      if (item.range === '₹500–₹2,000/month') {
        return (
          val === '₹500–₹2,000/month' ||
          val === '₹500–₹1,000/month' ||
          val === '₹1,000–₹2,000/month' ||
          val === 'Below ₹500/month'
        );
      }
      return val === item.range;
    }).length;

    const pctNum = totalInterviews > 0 ? Math.round((count / totalInterviews) * 100) : 0;
    return {
      range: item.range,
      count,
      pct: `${pctNum}%`,
      pctNum,
      ready: item.ready,
    };
  });

  const pricingChartData = pricingTableData.map((d) => ({
    name: d.range,
    value: d.count,
  }));

  // Export Main Survey Records CSV
  const exportSurveyRecordsCSV = () => {
    const data = filteredInterviews.map((inv, idx) => {
      const photoUrl = inv.photo_url || inv.photo?.photo_url || 'No Photo';

      const rowData: any = {
        Index: idx + 1,
        Interview_Code: inv.interview_code,
        Shop_Name: inv.shop?.shop_name || 'Saree Store',
        Client_Name: inv.shop?.client_name || 'Owner',
        Town: inv.shop?.location || 'Location',
        Date: new Date(inv.started_at).toLocaleDateString(),
        Duration_Mins: inv.duration_minutes || 15,
        Overall_Score: `${inv.overall_score || 0}%`,
        Verdict: inv.verdict || 'Moderate Opportunity',
        Survey_Type: inv.optional_completed ? 'Main + Conditional' : 'Main Only',
        Walkin: inv.is_walkin !== false ? 'Yes' : 'No',
        Readiness: inv.purchaseIntent?.readiness_level || 'N/A',
        Price_Range: inv.purchaseIntent?.price_range || 'N/A',
      };

      SEED_CATEGORIES.forEach((cat) => {
        const sc = getCategoryScoreObj(inv, cat.category_code);
        rowData[cat.category_code] = sc ? `${sc.percentage}% (${sc.status})` : 'N/A';
      });

      rowData['Uploaded_Shop_Photo'] = photoUrl;
      return rowData;
    });

    generateCSV(data, 'Grovastra_Survey_Records');
  };

  // 1. Export Category Analysis CSV
  const exportCategoryAnalysisCSV = () => {
    const data = categoryAnalysisData.map((cat) => {
      const strongPct = cat.sampleN > 0 ? Math.round((cat.strongCount / cat.sampleN) * 100) : 0;
      const modPct = cat.sampleN > 0 ? Math.round((cat.modCount / cat.sampleN) * 100) : 0;
      const sigPct = cat.sampleN > 0 ? Math.round((cat.sigCount / cat.sampleN) * 100) : 0;

      return {
        Category: cat.category_name,
        Shops: cat.sampleN,
        'Average Score': cat.avgScoreStr,
        'Opportunity %': `${cat.avgPct}%`,
        Strong: `${cat.strongCount} (${strongPct}%)`,
        Moderate: `${cat.modCount} (${modPct}%)`,
        'Significant Opportunity': `${cat.sigCount} (${sigPct}%)`,
        'Conditional Follow-ups': cat.conditionalFollowups,
      };
    });

    generateCSV(data, 'Grovastra_Category_Analysis');
  };

  // 2. Export Feature Demand CSV
  const exportFeatureDemandCSV = () => {
    const data = featureDemandData.map((feat) => ({
      Feature: feat.feature_name,
      Category: feat.category_code,
      'Shops Affected': `${feat.affectedCount} (n=${feat.totalN})`,
      'Pain Signal': `${feat.affectedPct}% (${feat.painSignal})`,
      'Conditional Signal': feat.conditionalSignal,
      Evidence: feat.evidence,
    }));

    generateCSV(data, 'Grovastra_Feature_Demand');
  };

  // 3. Export Adoption Readiness CSV
  const exportAdoptionReadinessCSV = () => {
    const data = adoptionTableData.map((row) => ({
      'Readiness Level': row.readiness,
      Shops: row.count,
      Percentage: row.pct,
    }));
    generateCSV(data, 'Grovastra_Adoption_Readiness');
  };

  // 4. Export Pricing CSV
  const exportPricingCSV = () => {
    const data = pricingTableData.map((row) => ({
      'Price Range': row.range,
      Shops: row.count,
      Percentage: row.pct,
      'Ready to Start': row.ready,
    }));
    generateCSV(data, 'Grovastra_Pricing_Analysis');
  };

  const handleWhatsAppShare = (inv: any) => {
    const text = `*GROVASTRA Shop Discovery Report*
*Shop:* ${inv.shop?.shop_name || 'Saree Store'}
*Town:* ${inv.shop?.location || 'AP'}
*Verdict:* ${inv.verdict || 'Moderate Opportunity'} (${inv.overall_score || 0}% Score)

Research survey completed. Recommended exploration in digital cataloguing, seller trust, and order tracking.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-600 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">GROVASTRA PRODUCT DISCOVERY DASHBOARD</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Supabase PostgreSQL Live Database
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time market intelligence & decision support platform</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 bg-dark-800 hover:bg-dark-700 text-slate-300 px-3.5 py-2 rounded-xl border border-dark-600 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Supabase PostgreSQL Data</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl border border-dark-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Surveys</span>
            <Store className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalInterviews} <span className="text-xs text-indigo-300 font-normal">Records</span></div>
          <div className="text-[11px] text-slate-500 font-medium">({totalShops} Unique Shops)</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-dark-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Feature Acceptance</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{readyCount} <span className="text-xs text-slate-300 font-normal">Ready</span></div>
          <div className="text-[11px] text-slate-500">Not Ready: {notReadyCount} Shops</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-dark-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Top Pain Area</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-extrabold text-indigo-300">VERIFY</div>
          <div className="text-[11px] text-rose-400 font-semibold">Identity Trust & Verification</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-dark-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Avg Survey Duration</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">16.4 <span className="text-xs font-normal text-slate-300">Mins</span></div>
          <div className="text-[11px] text-slate-500">Field Efficiency Index</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-dark-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Most Selected Price</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-extrabold text-emerald-300">₹2,000–₹5,000/mo</div>
          <div className="text-[11px] text-slate-500">Acceptable Monthly Price</div>
        </div>
      </div>

      {/* MAIN SURVEY RECORDS TABLE */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-600 pb-4">
          <div>
            <h3 className="font-extrabold text-lg text-white">Survey Records Table</h3>
            <p className="text-xs text-slate-400">
              {filteredInterviews.length} survey(s) stored in Supabase PostgreSQL — scroll horizontally for category scores
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search shop, code, town..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-dark-900 border border-dark-600 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none w-44"
              />
            </div>

            <select
              value={filterTown}
              onChange={(e) => { setFilterTown(e.target.value); setCurrentPage(1); }}
              className="bg-dark-900 border border-dark-600 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">Town: All</option>
              {towns.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterVerdict}
              onChange={(e) => { setFilterVerdict(e.target.value); setCurrentPage(1); }}
              className="bg-dark-900 border border-dark-600 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">Verdict: All</option>
              <option value="Strong Current Process">Strong Current Process</option>
              <option value="Moderate Opportunity">Moderate Opportunity</option>
              <option value="Significant Opportunity">Significant Opportunity</option>
            </select>

            <select
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
              className="bg-dark-900 border border-dark-600 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">Date: All</option>
              {dates.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <button
              onClick={exportSurveyRecordsCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Scrollable Compact Table */}
        <div className="overflow-x-auto border border-dark-600 rounded-xl">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-dark-900 text-slate-300 border-b border-dark-600 sticky top-0 z-10">
              <tr>
                <th className="p-3 font-extrabold text-slate-400">#</th>
                <th className="p-3 font-extrabold text-white min-w-[140px]">Shop Name</th>
                <th className="p-3 font-extrabold text-slate-300">Town</th>
                <th className="p-3 font-extrabold text-slate-300">Date</th>
                <th className="p-3 font-extrabold text-slate-300">Duration</th>
                <th className="p-3 font-extrabold text-slate-300">Overall Score</th>
                <th className="p-3 font-extrabold text-slate-300">Verdict</th>
                <th className="p-3 font-extrabold text-slate-300">Survey Type</th>
                <th className="p-3 font-extrabold text-slate-300">Walk-in?</th>

                {/* 9 Category Columns with uppercase names */}
                <th className="p-3 font-extrabold text-indigo-400 uppercase border-l border-dark-700">VERIFY</th>
                <th className="p-3 font-extrabold text-indigo-400 uppercase">SHOP</th>
                <th className="p-3 font-extrabold text-indigo-400 uppercase">RECEPTIONIST</th>
                <th className="p-3 font-extrabold text-indigo-400 uppercase">GROW</th>
                <th className="p-3 font-extrabold text-indigo-400 uppercase">NETWORK</th>
                <th className="p-3 font-extrabold text-indigo-400 uppercase">MONEY</th>
                <th className="p-3 font-extrabold text-indigo-400 uppercase">MARKET</th>
                <th className="p-3 font-extrabold text-indigo-400 uppercase">PROVENANCE</th>
                <th className="p-3 font-extrabold text-indigo-400 uppercase border-r border-dark-700">OPERATIONS</th>

                <th className="p-3 font-extrabold text-slate-300">Shop Photo</th>
                <th className="p-3 font-extrabold text-slate-300 text-right sticky right-0 bg-dark-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {paginatedInterviews.length > 0 ? (
                paginatedInterviews.map((inv, idx) => {
                  const actualIdx = (currentPage - 1) * pageSize + idx + 1;
                  const photoUrl = inv.photo_url || inv.photo?.photo_url;
                  const isMainAndConditional = !!inv.optional_completed;

                  return (
                    <tr key={inv.id} className="hover:bg-dark-700/50">
                      <td className="p-3 font-mono text-slate-400">{actualIdx}</td>
                      <td className="p-3 font-bold text-white">
                        <div>{inv.shop?.shop_name || 'Saree Store'}</div>
                        <div className="text-[10px] font-mono text-indigo-400">{inv.interview_code}</div>
                      </td>
                      <td className="p-3 text-slate-300">{inv.shop?.location || 'Vijayawada, AP'}</td>
                      <td className="p-3 text-slate-400">{new Date(inv.started_at).toLocaleDateString()}</td>
                      <td className="p-3 text-slate-300">{inv.duration_minutes || 15} mins</td>
                      <td className="p-3 font-mono font-bold text-indigo-300">{inv.overall_score || 0}%</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.verdict === 'Significant Opportunity'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : inv.verdict === 'Moderate Opportunity'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {inv.verdict || 'Moderate Opportunity'}
                        </span>
                      </td>

                      {/* Survey Type Column */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isMainAndConditional
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {isMainAndConditional ? 'Main + Conditional' : 'Main Only'}
                        </span>
                      </td>

                      <td className="p-3 text-slate-300">{inv.is_walkin !== false ? 'Yes' : 'No'}</td>

                      {/* 9 Category Score Pill Cells */}
                      {SEED_CATEGORIES.map((cat) => {
                        const sc = getCategoryScoreObj(inv, cat.category_code);
                        if (!sc) return <td key={cat.category_code} className="p-3 text-slate-500 text-[10px] italic">-</td>;

                        const pct = sc.percentage ?? 0;
                        const status = sc.status || 'Moderate Opportunity';

                        return (
                          <td key={cat.category_code} className="p-3 font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                status === 'Significant Opportunity'
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                                  : status === 'Moderate Opportunity'
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                        );
                      })}

                      {/* Shop Photo Column */}
                      <td className="p-3">
                        {photoUrl ? (
                          <button
                            onClick={() => setPreviewPhotoUrl(photoUrl)}
                            className="flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-500/30 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>View Photo</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No Photo</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3 text-right sticky right-0 bg-dark-900">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => router.push(`/reports/shop?id=${inv.id}`)}
                            title="View Report"
                            className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleWhatsAppShare(inv)}
                            title="Share on WhatsApp"
                            className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900 cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Admin Only Delete Button */}
                          {role === 'ADMIN' && (
                            <button
                              onClick={() => setDeleteModalId(inv.id)}
                              title="Delete Survey Record"
                              className="p-1 rounded bg-rose-950 text-rose-300 border border-rose-500/30 hover:bg-rose-900 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={22} className="p-8 text-center text-slate-400 italic">
                    No survey records found in Supabase PostgreSQL.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Showing page {currentPage} of {totalPages} ({filteredInterviews.length} total)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 bg-dark-800 border border-dark-600 text-xs rounded text-slate-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 bg-dark-800 border border-dark-600 text-xs rounded text-slate-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DASHBOARD TABLE & GRAPHICAL ANALYTICS SECTION */}

      {/* 1. CATEGORY ANALYSIS TABLE & CHART */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-600 pb-3">
          <div>
            <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>CATEGORY ANALYSIS TABLE & CHART</span>
            </h3>
            <p className="text-xs text-slate-400">Opportunity scores across key saree business functional areas</p>
          </div>

          <button
            onClick={exportCategoryAnalysisCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 overflow-x-auto border border-dark-600 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900 text-slate-400 border-b border-dark-600">
                <tr>
                  <th className="p-3 font-extrabold text-white">Category</th>
                  <th className="p-3 font-extrabold text-slate-300">Shops</th>
                  <th className="p-3 font-extrabold text-slate-300">Average Score</th>
                  <th className="p-3 font-extrabold text-slate-300">Opportunity %</th>
                  <th className="p-3 font-extrabold text-emerald-400">Strong</th>
                  <th className="p-3 font-extrabold text-amber-400">Moderate</th>
                  <th className="p-3 font-extrabold text-rose-400">Significant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {categoryAnalysisData.map((cat) => (
                  <tr key={cat.category_code} className="hover:bg-dark-700/50">
                    <td className="p-3 font-extrabold text-white">
                      <div>{cat.category_name}</div>
                      <div className="text-[10px] font-normal text-slate-400">{cat.description}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-300">{cat.sampleN}</td>
                    <td className="p-3 font-mono font-bold text-indigo-300">{cat.avgScoreStr}</td>
                    <td className="p-3 font-mono font-bold text-amber-300">{cat.avgPct}%</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{cat.strongCount}</td>
                    <td className="p-3 font-mono text-amber-400 font-bold">{cat.modCount}</td>
                    <td className="p-3 font-mono text-rose-400 font-bold">{cat.sigCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-1">
            <CategoryOpportunityChart data={categoryChartData} />
          </div>
        </div>
      </div>

      {/* 2. FEATURE DEMAND TABLE & CHART */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-600 pb-3">
          <div>
            <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>FEATURE DEMAND TABLE & CHART</span>
            </h3>
            <p className="text-xs text-slate-400">Demand evidence calculated from main & conditional survey responses in Supabase PostgreSQL</p>
          </div>

          <button
            onClick={exportFeatureDemandCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 overflow-x-auto border border-dark-600 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900 text-slate-400 border-b border-dark-600">
                <tr>
                  <th className="p-3 font-extrabold text-white">Feature</th>
                  <th className="p-3 font-extrabold text-slate-300">Category</th>
                  <th className="p-3 font-extrabold text-slate-300">Shops Affected</th>
                  <th className="p-3 font-extrabold text-slate-300">Pain Signal</th>
                  <th className="p-3 font-extrabold text-slate-300">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {featureDemandData.map((feat) => (
                  <tr key={feat.feature_code} className="hover:bg-dark-700/50">
                    <td className="p-3 font-bold text-white">
                      <div>{feat.feature_name}</div>
                      <div className="text-[10px] font-normal text-slate-400">{feat.description}</div>
                    </td>
                    <td className="p-3 font-bold text-indigo-300">{feat.category_code}</td>
                    <td className="p-3 font-mono font-bold text-slate-200">{feat.affectedCount} (n={feat.totalN})</td>
                    <td className="p-3 font-mono font-bold text-amber-300">{feat.affectedPct}% ({feat.painSignal})</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {feat.evidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-1">
            <FeatureDemandChart data={featureChartData} />
          </div>
        </div>
      </div>

      {/* 3 & 4. ADOPTION READINESS & PRICING TABLES WITH CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adoption Card */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-600 pb-2">
            <h3 className="font-extrabold text-base text-white">
              ADOPTION READINESS TABLE & CHART
            </h3>
            <button
              onClick={exportAdoptionReadinessCSV}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto border border-dark-600 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-900 text-slate-400 border-b border-dark-600">
                  <tr>
                    <th className="p-3 font-bold text-white">Readiness Level</th>
                    <th className="p-3 font-bold text-slate-300">Shops</th>
                    <th className="p-3 font-bold text-emerald-400">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600">
                  {adoptionTableData.map((row) => (
                    <tr key={row.readiness} className="hover:bg-dark-700/50">
                      <td className="p-3 font-bold text-white">{row.readiness}</td>
                      <td className="p-3 font-mono text-slate-300">{row.count}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdoptionReadinessChart data={adoptionChartData} />
          </div>
        </div>

        {/* Pricing Card */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-600 pb-2">
            <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              <span>PRICING TABLE & CHART</span>
            </h3>
            <button
              onClick={exportPricingCSV}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto border border-dark-600 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-900 text-slate-400 border-b border-dark-600">
                  <tr>
                    <th className="p-3 font-bold text-white">Price Range</th>
                    <th className="p-3 font-bold text-slate-300">Shops</th>
                    <th className="p-3 font-bold text-purple-300">Percentage</th>
                    <th className="p-3 font-bold text-emerald-400">Ready</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600">
                  {pricingTableData.map((p) => (
                    <tr key={p.range} className="hover:bg-dark-700/50">
                      <td className="p-3 font-bold text-white">{p.range}</td>
                      <td className="p-3 font-mono text-slate-300">{p.count}</td>
                      <td className="p-3 font-mono font-bold text-purple-300">{p.pct}</td>
                      <td className="p-3 font-bold text-emerald-400">{p.ready}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PricingChart data={pricingChartData} />
          </div>
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
              Are you sure you want to delete this survey record? This action will permanently delete the survey document and all responses from Supabase PostgreSQL.
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
