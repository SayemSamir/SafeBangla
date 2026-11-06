import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  AlertTriangle,
  Building,
  CheckCircle,
  Truck,
  Heart,
  Droplets,
  Plus,
  Search,
  ShieldCheck
} from 'lucide-react';

export const ReliefManagement: React.FC = () => {
  const { resources, requestReliefStock, language, t } = useApp();

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [requisitionQty, setRequisitionQty] = useState<{ [id: string]: number }>({});
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Donation form state
  const [donorName, setDonorName] = useState('');
  const [donationItem, setDonationItem] = useState('Drinking Water (Liters)');
  const [donationAmount, setDonationAmount] = useState('500');
  const [donationSubmitted, setDonationSubmitted] = useState(false);

  const filteredResources = resources.filter((res) => {
    if (selectedWarehouse !== 'All' && res.warehouseLocation !== selectedWarehouse) return false;
    if (selectedCategory !== 'All' && res.category !== selectedCategory) return false;
    return true;
  });

  const warehouses = Array.from(new Set(resources.map((r) => r.warehouseLocation)));
  const categories = Array.from(new Set(resources.map((r) => r.category)));

  const handleDispatch = (resId: string, name: string) => {
    const qty = requisitionQty[resId] || 100;
    requestReliefStock(resId, qty);
    setDispatchSuccess(`Dispatched ${qty} units of "${name}" to regional forward distribution camp.`);
    setTimeout(() => setDispatchSuccess(null), 4000);
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    setDonationSubmitted(true);
    setTimeout(() => {
      setDonationSubmitted(false);
      setDonorName('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white font-mono">
              {t('RELIEF INVENTORY & STRATEGIC WAREHOUSES', 'ত্রাণ সামগ্রী ও লজিস্টিকস ব্যবস্থাপনা')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'Real-time stockpile tracking for emergency food, potable water, halogen tablets, life vests, and inflatable rescue rafts across national depots.',
              'বন্যা ও ঘূর্ণিঝড় এলাকায় ত্রাণ বণ্টন, জরুরি নৌযান ও চিকিৎসা সামগ্রীর মজুদ ট্র্যাকিং।'
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:outline-none"
          >
            <option value="All">{t('All Warehouses (সকল ডিপো)', 'সকল ডিপো')}</option>
            {warehouses.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:outline-none"
          >
            <option value="All">{t('All Categories (সকল ক্যাটাগরি)', 'সকল ক্যাটাগরি')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const isCritical = res.status === 'Critical Shortage';
          const isLow = res.status === 'Low Stock';
          return (
            <div
              key={res.id}
              className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {res.id} • {res.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-red-600 text-white animate-pulse'
                        : isLow
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">
                  {language === 'bn' ? res.nameBn : res.name}
                </h3>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Depot: <span className="text-slate-200 font-medium">{res.warehouseLocation}</span>
                </div>
              </div>

              {/* Quantity */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Stock Available</span>
                  <span className="text-lg font-bold text-white">
                    {res.quantity.toLocaleString()} {res.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Min Threshold</span>
                  <span className="text-xs text-amber-400">{res.minimumThreshold.toLocaleString()}</span>
                </div>
              </div>

              {/* Dispatch Action */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                <input
                  type="number"
                  min={1}
                  max={res.quantity}
                  value={requisitionQty[res.id] || 100}
                  onChange={(e) =>
                    setRequisitionQty({
                      ...requisitionQty,
                      [res.id]: Number(e.target.value)
                    })
                  }
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-center text-white text-xs font-mono"
                />
                <button
                  onClick={() => handleDispatch(res.id, res.name)}
                  disabled={res.quantity === 0}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{t('Dispatch to Field', 'মাঠে পাঠান')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Donation Portal Box */}
      <div className="bg-[#0F172A] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl text-xs space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <h3 className="text-base font-bold text-white">
            {t('Emergency Citizen & NGO Relief Donation Intake', 'নাগরিক ও বেসরকারি ত্রাণ সহায়তা পোর্টাল')}
          </h3>
        </div>
        <p className="text-slate-300">
          {t(
            'Support marooned flood victims and displaced cyclone families by pledging relief provisions directly to verified warehouses.',
            'বন্যা ও ঘূর্ণিঝড় দুর্গতদের সাহায্যে শুকনো খাবার, পানি বা উদ্ধার সরঞ্জাম সহায়তায় অংশ নিন।'
          )}
        </p>

        {donationSubmitted ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <strong className="block text-sm">{t('Pledge Logged to Relief Registry!', 'ত্রাণ সহায়তা গ্রহণ সফল হয়েছে!')}</strong>
              <span>Our logistics team will verify pickup at the designated regional warehouse.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDonate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{t('Donor / Organization', 'দাতা বা সংস্থা')}</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. Bangladesh Youth Foundation"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{t('Item Category', 'ত্রাণ সামগ্রী')}</label>
              <select
                value={donationItem}
                onChange={(e) => setDonationItem(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="Drinking Water (Liters)">Drinking Water (Liters)</option>
                <option value="High Energy Biscuits">High Energy Biscuits (Packs)</option>
                <option value="Water Halazone Tablets">Water Halazone Tablets</option>
                <option value="Life Jackets">Life Jackets</option>
                <option value="Tarpaulin Family Tents">Tarpaulin Family Tents</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{t('Quantity / Amount', 'পরিমাণ')}</label>
              <input
                type="text"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold p-2 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>{t('Pledge Relief Aid', 'ত্রাণ অনুদান নিশ্চিত করুন')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
