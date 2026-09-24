'use client';

import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Store, Calendar } from 'lucide-react';
import { localStore } from '@/lib/db/db';
import { ShopPhoto } from '@/lib/types';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<ShopPhoto[]>([]);

  useEffect(() => {
    setPhotos(localStore.shopPhotos);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Shop Reference Photographs</h2>
        <p className="text-xs text-slate-400">Captured store photographs associated with completed research interviews</p>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo) => {
            const shop = localStore.shops.find((s) => s.id === photo.shop_id);
            return (
              <div key={photo.id} className="glass-panel overflow-hidden space-y-3 p-3">
                <img
                  src={photo.photo_url}
                  alt={shop?.shop_name || 'Shop Reference'}
                  className="w-full h-48 object-cover rounded-lg border border-dark-600"
                />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">{shop?.shop_name || 'Saree Store'}</div>
                  <div className="text-xs text-slate-400 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{shop?.location || 'Andhra Pradesh'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Captured: {new Date(photo.captured_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-slate-400 text-sm">
          No shop reference photos captured yet. Complete a survey in Field Survey mode to attach photos.
        </div>
      )}
    </div>
  );
}
