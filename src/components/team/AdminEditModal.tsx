import React, { useState, useEffect } from 'react';
import { TeamMember } from '../../types/team';
import { validateImageUpload, isValidUrl } from '../../utils/teamValidation';
import {
  X,
  Save,
  Upload,
  Link,
  Github,
  Linkedin,
  ShieldAlert,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';

interface AdminEditModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: TeamMember) => void;
  t: (en: string, bn: string) => string;
}

export const AdminEditModal: React.FC<AdminEditModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
  t
}) => {
  const [formData, setFormData] = useState<TeamMember | null>(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [respInput, setRespInput] = useState('');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
      setSkillsInput(member.skills ? member.skills.join(', ') : '');
      setRespInput(member.responsibilities ? member.responsibilities.join('\n') : '');
      setPhotoError(null);
      setUrlError(null);
    }
  }, [member]);

  if (!isOpen || !formData) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageUpload(file);
    if (!validation.valid) {
      setPhotoError(validation.error || 'Invalid photo');
      return;
    }

    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData({ ...formData, photoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photoUrl: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URLs if provided
    if (formData.githubUrl && formData.githubUrl.trim() && !isValidUrl(formData.githubUrl)) {
      setUrlError('GitHub URL must be a valid http/https address');
      return;
    }
    if (formData.linkedinUrl && formData.linkedinUrl.trim() && !isValidUrl(formData.linkedinUrl)) {
      setUrlError('LinkedIn URL must be a valid http/https address');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const responsibilities = respInput
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const updated: TeamMember = {
      ...formData,
      skills,
      responsibilities
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-cyan-500/50 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold font-mono text-white">
              {t('Admin: Edit Team Member Profile', 'অ্যাডমিন: মেম্বার তথ্য সম্পাদনা')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {urlError && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          {/* Member Name (Verified) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                {t('Full Name (Verified)', 'পূর্ণ নাম (যাচাইকৃত)')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                {t('Project Role', 'প্রজেক্ট রোল / পদবি')}
              </label>
              <input
                type="text"
                placeholder="e.g. Project Lead & Full-Stack Developer"
                value={formData.projectRole || ''}
                onChange={e => setFormData({ ...formData, projectRole: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Academic Role & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                {t('Academic Role / Affiliation', 'একাডেমিক পদবী')}
              </label>
              <input
                type="text"
                value={formData.academicRole || ''}
                onChange={e => setFormData({ ...formData, academicRole: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                {t('Display Order', 'প্রদর্শনের ক্রম')}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.displayOrder}
                onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-[11px] font-mono uppercase text-cyan-400">
              {t('Profile Photograph', 'প্রোফাইল ছবি')}
            </label>
            <div className="flex items-center gap-4">
              {formData.photoUrl ? (
                <div className="relative">
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-cyan-400/60"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-slate-500 font-mono text-[10px]">
                  No Photo
                </div>
              )}

              <div className="space-y-1 flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoUpload}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-900/60 file:text-cyan-300 hover:file:bg-cyan-800"
                />
                <span className="text-[10px] text-slate-500 block">
                  JPG, PNG or WEBP, max 2MB. Leaves neutral avatar if empty.
                </span>
                {photoError && <p className="text-[11px] text-red-400">{photoError}</p>}
              </div>
            </div>
          </div>

          {/* Biography */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              {t('Short Biography', 'সংক্ষিপ্ত পরিচিতি')}
            </label>
            <textarea
              rows={2}
              value={formData.shortBio || ''}
              onChange={e => setFormData({ ...formData, shortBio: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              placeholder="e.g. Passionate about software architecture and geospatial disaster intelligence."
            />
          </div>

          {/* Skills (comma separated) */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              {t('Technical Skills (comma separated)', 'টেকনিক্যাল স্কিলসমূহ (কমা দিয়ে লিখুন)')}
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Tailwind CSS, Python, FastAPI, PostgreSQL"
              value={skillsInput}
              onChange={e => setSkillsInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Responsibilities (newline separated) */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              {t('Assigned Responsibilities (one per line)', 'দায়িত্বসমূহ (প্রতি লাইনে একটি)')}
            </label>
            <textarea
              rows={3}
              placeholder="Designed GIS duplicate clustering engine&#10;Integrated Emergency SOS modal&#10;Lead author on Software Requirements Specification"
              value={respInput}
              onChange={e => setRespInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Contributions Grid */}
          <div className="space-y-2">
            <span className="block text-[11px] font-mono uppercase text-teal-400 font-semibold">
              {t('Specific Module Contributions', 'নির্দিষ্ট মডিউলে অবদান')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Frontend</label>
                <input
                  type="text"
                  placeholder="e.g. SOS modal, GIS map"
                  value={formData.contributions?.frontend || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      contributions: { ...formData.contributions, frontend: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Backend & API</label>
                <input
                  type="text"
                  placeholder="e.g. WebSocket gateway, dispatch"
                  value={formData.contributions?.backend || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      contributions: { ...formData.contributions, backend: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Research</label>
                <input
                  type="text"
                  placeholder="e.g. IEEE 8538356 analysis"
                  value={formData.contributions?.research || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      contributions: { ...formData.contributions, research: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Testing & Docs</label>
                <input
                  type="text"
                  placeholder="e.g. Unit tests, PRD"
                  value={formData.contributions?.testing || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      contributions: { ...formData.contributions, testing: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
                <Github className="w-3.5 h-3.5" />
                <span>GitHub URL</span>
              </label>
              <input
                type="url"
                placeholder="https://github.com/username"
                value={formData.githubUrl || ''}
                onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>LinkedIn URL</span>
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedinUrl || ''}
                onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          {/* Visibility Checkbox */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
                formData.isPublic
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
              }`}
            >
              {formData.isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{formData.isPublic ? 'Publicly Visible' : 'Hidden / Private'}</span>
            </button>
            <span className="text-[11px] text-slate-500">
              {formData.isPublic
                ? 'Appears on the live team roster.'
                : 'Hidden from public visitors.'}
            </span>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              {t('Cancel', 'বাতিল')}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-semibold font-mono shadow-lg transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('Save Changes', 'সংরক্ষণ করুন')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};