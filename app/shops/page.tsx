'use client';

import React, { useState, useEffect } from 'react';
import { Store, User, MapPin, Phone, Calendar, ArrowRight, Eye, Printer, FileText } from 'lucide-react';
import { getAllShops, getAllInterviews, localStore } from '@/lib/db/db';
import { Shop, Interview } from '@/lib/types';

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sList = await getAllShops();
    const iList = await getAllInterviews();
    setShops(sList);
    setInterviews(iList);
  };

  const getShopInterviews = (shopId: string) => interviews.filter((i) => i.shop_id === shopId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Saree Shops Directory</h2>
          <p className="text-xs text-slate-400">Complete listing of surveyed saree retailers, wholesalers & boutiques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shops List */}
        <div className="md:col-span-1 space-y-3">
          {shops.map((shop) => {
            const count = getShopInterviews(shop.id).length;
            const isSelected = selectedShop?.id === shop.id;

            return (
              <div
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-md'
                    : 'bg-dark-800 border-dark-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{shop.shop_name}</span>
                  <span className="text-[10px] font-mono text-indigo-300 font-bold">{shop.shop_code}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{shop.location}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-dark-600">
                  <span>Owner: {shop.client_name}</span>
                  <span className="text-indigo-400 font-semibold">{count} Interview(s)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Individual Shop Profile View */}
        <div className="md:col-span-2">
          {selectedShop ? (
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-dark-600 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{selectedShop.shop_code}</span>
                  <h3 className="text-2xl font-extrabold text-white">{selectedShop.shop_name}</h3>
                  <p className="text-xs text-slate-400">Client: {selectedShop.client_name} | {selectedShop.location}</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Profile</span>
                </button>
              </div>

              {/* Shop Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-dark-800 border border-dark-600 text-xs">
                <div>
                  <span className="text-slate-400 block">Shop Type</span>
                  <span className="font-bold text-white">{selectedShop.shop_type || 'Retail'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Staff Count</span>
                  <span className="font-bold text-white">{selectedShop.staff_count || 3} Staff</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Years in Business</span>
                  <span className="font-bold text-white">{selectedShop.years_in_business || 5} Years</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Number</span>
                  <span className="font-bold text-white">{selectedShop.contact_number || 'N/A'}</span>
                </div>
              </div>

              {/* Interview History */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-white">Interview History</h4>
                {getShopInterviews(selectedShop.id).map((inv) => (
                  <div key={inv.id} className="p-4 rounded-xl bg-dark-800 border border-dark-600 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-indigo-300">{inv.interview_code}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Status: <span className="text-emerald-400 font-semibold">{inv.status}</span> | Started: {new Date(inv.started_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400 text-sm">
              Select a shop from the left list to view its complete profile and interview history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
