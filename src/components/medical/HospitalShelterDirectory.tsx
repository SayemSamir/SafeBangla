import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BANGLADESH_DISTRICTS } from '../../data/bangladeshData';
import {
  Building2,
  Home,
  Search,
  Activity,
  Ambulance,
  PhoneCall,
  CheckCircle,
  AlertTriangle,
  Droplet,
  Sun,
  ShieldAlert,
  Users
} from 'lucide-react';

export const HospitalShelterDirectory: React.FC = () => {
  const { hospitals, shelters, language, t } = useApp();

  const [activeTab, setActiveTab] = useState<'shelters' | 'hospitals'>('shelters');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredShelters = shelters.filter((s) => {
    if (selectedDistrict !== 'All' && s.district !== selectedDistrict) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.upazila.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredHospitals = hospitals.filter((h) => {
    if (selectedDistrict !== 'All' && h.district !== selectedDistrict) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        h.name.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white font-mono">
              {t('EMERGENCY HOSPITALS & CYCLONE SHELTER DIRECTORY', 'হাসপাতাল ও বহুমুখী ঘূর্ণিঝড় আশ্রয়কেন্দ্র')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'Real-time bed availability, ICU readiness, safe shelter capacities, drinking water provisions, and direct emergency hotlines across Bangladesh.',
              'সারাদেশে আইসিইউ ও সাধারণ বেড, অ্যাম্বুলেন্স এবং আশ্রয়কেন্দ্রের ধারণক্ষমতার লাইভ তথ্য।'
            )}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('shelters')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'shelters'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{t('Cyclone Shelters', 'সাইক্লোন শেল্টার')} ({shelters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'hospitals'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t('Hospitals & Trauma Centers', 'হাসপাতাল ও আইসিইউ')} ({hospitals.length})</span>
          </button>
        </div>
      </div>

      {/* Search and District Filter */}
      <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search by name, upazila, or facility...', 'নাম বা উপজেলা দিয়ে খুঁজুন...')}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-400 shrink-0">{t('Filter District:', 'জেলা ফিল্টার:')}</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs focus:outline-none"
          >
            <option value="All">{t('All Districts (সকল জেলা)', 'সকল জেলা')}</option>
            {BANGLADESH_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.nameBn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTENT: SHELTERS TAB */}
      {activeTab === 'shelters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShelters.map((shelter) => {
            const pct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
            const isFull = pct >= 90;
            return (
              <div
                key={shelter.id}
                className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {shelter.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFull
                          ? 'bg-red-600 text-white'
                          : pct > 60
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {pct}% Occupied
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm">{shelter.name}</h3>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {shelter.upazila}, {shelter.district} ({shelter.division} Division)
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Current Occupancy</span>
                    <strong className="text-white">
                      {shelter.currentOccupancy} / {shelter.capacity}
                    </strong>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {shelter.hasDrinkingWater && (
                    <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-cyan-400" /> Potable Water
                    </span>
                  )}
                  {shelter.hasElectricityOrSolar && (
                    <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-400" /> Solar Power
                    </span>
                  )}
                  {shelter.hasFemaleSafeSpace && (
                    <span className="bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                      <Users className="w-3 h-3 text-rose-400" /> Female Safe Space
                    </span>
                  )}
                  {shelter.hasMedicalPost && (
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-400" /> First Aid Post
                    </span>
                  )}
                </div>

                {/* Direct Contact */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <a
                    href={`tel:${shelter.contactNumber}`}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Shelter Hotline: {shelter.contactNumber}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONTENT: HOSPITALS TAB */}
      {activeTab === 'hospitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {hosp.id} • {hosp.type}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    24/7 ER ACTIVE
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{hosp.name}</h3>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  District: <strong className="text-slate-200">{hosp.district}</strong> ({hosp.division} Division)
                </div>
              </div>

              {/* Bed Status Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">ICU Beds</span>
                  <span className="text-base font-bold text-red-400">
                    {hosp.availableIcuBeds} Free
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">General Beds</span>
                  <span className="text-base font-bold text-emerald-400">
                    {hosp.availableGeneralBeds} Free
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Ambulances</span>
                  <span className="text-base font-bold text-cyan-400">
                    {hosp.ambulanceAvailable} Ready
                  </span>
                </div>
              </div>

              {/* Call Hotline */}
              <div className="pt-2 border-t border-slate-800">
                <a
                  href={`tel:${hosp.contactPhone}`}
                  className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-mono text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 border border-emerald-500/40 font-bold transition-colors shadow"
                >
                  <Ambulance className="w-4 h-4 text-emerald-400" />
                  <span>Call Hospital ER: {hosp.contactPhone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
