import React from 'react';
import { TeamMember } from '../../types/team';
import { getInitialsAvatar } from '../../utils/teamValidation';
import { Github, Linkedin, ExternalLink, Edit3, Shield, User } from 'lucide-react';

interface MemberCardProps {
  member: TeamMember;
  isAdmin: boolean;
  onViewDetails: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  t: (en: string, bn: string) => string;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isAdmin,
  onViewDetails,
  onEdit,
  t
}) => {
  const { initials, bgColor } = getInitialsAvatar(member.name);

  return (
    <div className="relative group bg-[#0F172A] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl hover:shadow-cyan-950/30 transition-all duration-300 flex flex-col justify-between">
      {/* Top action / Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Status / Role pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
            {member.projectRole && member.projectRole !== 'To be updated'
              ? member.projectRole
              : t('Role: To be updated', 'দায়িত্ব: শীঘ্রই আপডেট হবে')}
          </span>
          {!member.isPublic && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60">
              {t('Private', 'অপ্রকাশিত')}
            </span>
          )}
        </div>

        {/* Admin quick edit button */}
        {isAdmin && (
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
            title={t('Edit member profile (Admin)', 'মেম্বার প্রোফাইল এডিট করুন')}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Profile Photo / Avatar */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="relative mb-3">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-500/30 shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${bgColor} flex items-center justify-center text-2xl font-black text-white font-mono shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300`}
            >
              {initials}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 border border-slate-700 rounded-lg text-cyan-400">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
          {member.name}
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          {member.academicRole || 'Undergraduate Student, Dept. of CSE'}
        </p>
        <p className="text-[11px] text-teal-400 mt-0.5 font-medium">
          BGC Trust University Bangladesh
        </p>
      </div>

      {/* Bio / Summary */}
      <div className="mb-4">
        <p className="text-xs text-slate-300 line-clamp-2 italic text-center">
          {member.shortBio && member.shortBio !== 'To be updated'
            ? `"${member.shortBio}"`
            : t('Biography and responsibilities to be updated.', 'জীবনবৃত্তান্ত ও দায়িত্ব শীঘ্রই আপডেট করা হবে।')}
        </p>
      </div>

      {/* Skills Pill List */}
      <div className="mb-5">
        <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5 font-semibold">
          {t('Technical Skills', 'টেকনিক্যাল স্কিলসমূহ')}
        </span>
        {member.skills && member.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {member.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 4 && (
              <span className="text-[10px] bg-slate-800/80 text-cyan-400 px-1.5 py-0.5 rounded-md border border-slate-700">
                +{member.skills.length - 4}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 italic">
            {t('To be updated', 'শীঘ্রই আপডেট হবে')}
          </span>
        )}
      </div>

      {/* Card Footer: Links and View Profile button */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {member.githubUrl ? (
            <a
              href={member.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
          ) : (
            <span
              className="p-2 rounded-lg bg-slate-900 text-slate-600 cursor-not-allowed"
              title="GitHub: To be updated"
            >
              <Github className="w-4 h-4" />
            </span>
          )}

          {member.linkedinUrl ? (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-[#0A66C2]/30 text-slate-300 hover:text-[#0A66C2] transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          ) : (
            <span
              className="p-2 rounded-lg bg-slate-900 text-slate-600 cursor-not-allowed"
              title="LinkedIn: To be updated"
            >
              <Linkedin className="w-4 h-4" />
            </span>
          )}
        </div>

        <button
          onClick={() => onViewDetails(member)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md transition-all font-mono"
        >
          <span>{t('View Profile', 'প্রোফাইল দেখুন')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
