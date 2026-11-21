import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, HeartHandshake, Search, CheckCircle, UserCheck, Shield } from 'lucide-react';

export const MarkSafeModal: React.FC = () => {
  const { markSafeModalOpen, setMarkSafeModalOpen, safePeople, markPersonSafe, t, language } =
    useApp();

  const [activeTab, setActiveTab] = useState<'register' | 'search'>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!markSafeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    markPersonSafe({
      name,
      phone,
      location: location || 'Current Safe Location',
      notes: notes || 'Marked safe during disaster event'
    });

    setSubmitted(true);
  };

  const filteredSafeList = safePeople.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-500/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-500/60 text-emerald-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{t('Disaster Safety & Family Registry', 'নিরাপদ আছি ও স্বজন সন্ধান')}</span>
                <span className="text-[10px] bg-emerald-700 text-white font-mono uppercase px-2 py-0.5 rounded-full">
                  {t('PUBLIC REGISTRY', 'পাবলিক তথ্য')}
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">
                {t(
                  'Mark yourself safe or search for relatives in disaster zones',
                  'নিজে নিরাপদ আছেন জানান অথবা দুর্যোগ কবলিত স্বজনকে খুঁজুন'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setMarkSafeModalOpen(false);
              setSubmitted(false);
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
              activeTab === 'register'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('Mark Myself / Family Safe', 'নিজে নিরাপদ আছি জানান')}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
              activeTab === 'search'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('Search Loved Ones Registry', 'স্বজন অনুসন্ধান করুন')} ({safePeople.length})
          </button>
        </div>

        {activeTab === 'register' ? (
          submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">
                {t('Status Recorded Successfully!', 'আপনার নিরাপত্তা তথ্য সংরক্ষিত হয়েছে!')}
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {t(
                  'Relatives searching for your phone number or name can now verify your safety and location.',
                  'আপনার স্বজনরা মোবাইল নম্বর বা নাম দিয়ে সন্ধান করলে দেখতে পাবেন যে আপনি নিরাপদ আছেন।'
                )}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setActiveTab('search');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                {t('View Public Safety Directory', 'নিরাপদ ব্যক্তিদের তালিকা দেখুন')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t('Full Name (পুরো নাম)', 'পুরো নাম')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Hasan"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t('Phone Number (মোবাইল নম্বর)', 'মোবাইল নম্বর')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {t('Current Shelter or Safe Location (আশ্রয়কেন্দ্র বা অবস্থান)', 'বর্তমান অবস্থান')}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Teknaf Cyclone Shelter Room 3, or Relatives home in Cox's Bazar"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {t('Message for Family & Friends (স্বজনদের জন্য বার্তা)', 'স্বজনদের জন্য বার্তা')}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Family is safe, phone battery low, do not worry."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMarkSafeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-700/30"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t('Confirm I Am Safe', 'নিরাপদ আছি নিশ্চিত করুন')}</span>
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="p-5 space-y-4 text-xs">
            {/* Search query */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'Search by name, phone number, or shelter location...',
                  'নাম, ফোন নম্বর বা আশ্রয়কেন্দ্র দিয়ে খুঁজুন...'
                )}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredSafeList.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  {t('No safe records found for this query.', 'এই অনুসন্ধানে কোনো তথ্য পাওয়া যায়নি।')}
                </div>
              ) : (
                filteredSafeList.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-800/80 border border-slate-700/70 rounded-xl flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.2 rounded font-medium">
                          {t('Verified Safe', 'নিরাপদ')}
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px] mt-0.5 font-mono">
                        Phone: {p.phone}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        Location: {p.location}
                      </div>
                      {p.notes && (
                        <div className="text-emerald-200/90 text-[11px] mt-1 italic">
                          "{p.notes}"
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(p.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
