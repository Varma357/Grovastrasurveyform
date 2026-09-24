'use client';

import React from 'react';
import { Download, FileSpreadsheet, Database } from 'lucide-react';
import { generateCSV } from '@/lib/export';
import { localStore, getAllShops, getAllInterviews, getAllResponses } from '@/lib/db/db';

export default function ExportsPage() {
  const handleExportShops = async () => {
    const data = await getAllShops();
    generateCSV(data.length > 0 ? data : localStore.shops, 'Grovastra_Shops_Export');
  };

  const handleExportInterviews = async () => {
    const data = await getAllInterviews();
    generateCSV(data.length > 0 ? data : localStore.interviews, 'Grovastra_Interviews_Export');
  };

  const handleExportResponses = async () => {
    const data = await getAllResponses();
    generateCSV(data.length > 0 ? data : localStore.responses, 'Grovastra_Responses_Export');
  };

  const handleExportCompleteDataset = async () => {
    const interviews = await getAllInterviews();
    const shops = await getAllShops();
    const dataset = (interviews.length > 0 ? interviews : localStore.interviews).map((inv) => {
      const s = (shops.length > 0 ? shops : localStore.shops).find((shop) => shop.id === inv.shop_id);
      const pi = localStore.purchaseIntent.find((intent) => intent.interview_id === inv.id);

      return {
        Interview_ID: inv.id,
        Interview_Code: inv.interview_code,
        Shop_Code: s?.shop_code,
        Shop_Name: s?.shop_name,
        Client_Name: s?.client_name,
        Location: s?.location,
        Shop_Type: s?.shop_type,
        Staff_Count: s?.staff_count,
        Years_In_Business: s?.years_in_business,
        Interest_Level: pi?.interest_level,
        Readiness_Level: pi?.readiness_level,
        Price_Range: pi?.price_range,
        Started_At: inv.started_at,
        Completed_At: inv.completed_at,
      };
    });

    generateCSV(dataset, 'Grovastra_Complete_Survey_Dataset');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">CSV Export Center</h2>
        <p className="text-xs text-slate-400">Download survey datasets with UTF-8 Excel compatibility</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Complete Survey Dataset</h3>
            <p className="text-xs text-slate-400 mt-1">Full relational dataset including shops, scores, intent & pricing</p>
          </div>
          <button
            onClick={handleExportCompleteDataset}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download Complete Dataset</span>
          </button>
        </div>

        <div className="glass-panel p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Shops Master CSV</h3>
            <p className="text-xs text-slate-400 mt-1">Shop profiles, locations, staff count & online presence</p>
          </div>
          <button
            onClick={handleExportShops}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download Shops CSV</span>
          </button>
        </div>

        <div className="glass-panel p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Raw Responses CSV</h3>
            <p className="text-xs text-slate-400 mt-1">All raw question responses and 0/1/2 score logs</p>
          </div>
          <button
            onClick={handleExportResponses}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download Responses CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
