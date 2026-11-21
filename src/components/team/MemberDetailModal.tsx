import React from 'react';

import { TeamMember } from '../../types/team';

import { getInitialsAvatar } from '../../utils/teamValidation';

import {

  X,

  Github,

  Linkedin,

  GraduationCap,

  Briefcase,

  Code2,

  FileText,

  CheckCircle2,

  Edit3,

  Building,

  UserCheck

} from 'lucide-react';



interface MemberDetailModalProps {

  member: TeamMember | null;

  isOpen: boolean;

  onClose: () => void;

  isAdmin: boolean;

  onEdit: (member: TeamMember) => void;

  t: (en: string, bn: string) => string;

}



export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({

  member,

  isOpen,

  onClose,

  isAdmin,

  onEdit,

  t

}) => {

  if (!isOpen || !member) return null;



  const { initials, bgColor } = getInitialsAvatar(member.name);



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">

      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">

        {/* Modal Header */}

        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-slate-800">

          <div className="flex items-center gap-2">

            <UserCheck className="w-5 h-5 text-cyan-400" />

            <h3 className="text-base font-bold font-mono text-white">

              {t('Team Member Profile', 'টিম মেম্বার প্রোফাইল')}

            </h3>

          </div>

          <button

            onClick={onClose}

            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"

          >

            <X className="w-5 h-5" />

          </button>

        </div>



        {/* Modal Body */}

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Top Profile Hero */}

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">

            {member.photoUrl ? (

              <img

                src={member.photoUrl}

                alt={member.name}

                className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-xl"

              />

            ) : (

              <div

                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${bgColor} flex items-center justify-center text-3xl font-black text-white font-mono shadow-xl border border-white/10`}

              >

                {initials}

              </div>

            )}



            <div className="space-y-1.5 text-center sm:text-left flex-1">

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">

                <h2 className="text-xl font-bold text-white font-mono">{member.name}</h2>

                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">

                  {member.projectRole && member.projectRole !== 'To be updated'

                    ? member.projectRole

                    : t('Role: To be updated', 'দায়িত্ব: শীঘ্রই আপডেট হবে')}

                </span>

              </div>



              <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1.5 font-medium">

                <GraduationCap className="w-4 h-4 text-cyan-400" />

                <span>{member.academicRole || 'Undergraduate Student, Dept. of CSE'}</span>

              </p>

              <p className="text-xs text-teal-400 flex items-center justify-center sm:justify-start gap-1.5">

                <Building className="w-3.5 h-3.5" />

                <span>BGC Trust University Bangladesh</span>

              </p>



              {/* Social profile buttons */}

              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">

                {member.githubUrl ? (

                  <a

                    href={member.githubUrl}

                    target="_blank"

                    rel="noreferrer"

                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"

                  >

                    <Github className="w-3.5 h-3.5" />

                    <span>GitHub</span>

                  </a>

                ) : (

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-slate-600 text-xs rounded-lg border border-slate-800 cursor-not-allowed">

                    <Github className="w-3.5 h-3.5" />

                    <span>GitHub (To be updated)</span>

                  </span>

                )}



                {member.linkedinUrl ? (

                  <a

                    href={member.linkedinUrl}

                    target="_blank"

                    rel="noreferrer"

                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-blue-900/40 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"

                  >

                    <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />

                    <span>LinkedIn</span>

                  </a>

                ) : (

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-slate-600 text-xs rounded-lg border border-slate-800 cursor-not-allowed">

                    <Linkedin className="w-3.5 h-3.5" />

                    <span>LinkedIn (To be updated)</span>

                  </span>

                )}

              </div>

            </div>

          </div>



          {/* Short Biography */}

          <div className="space-y-2">

            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">

              <FileText className="w-3.5 h-3.5" />

              {t('About Member', 'মেম্বার পরিচিতি')}

            </h4>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">

              {member.shortBio && member.shortBio !== 'To be updated'

                ? member.shortBio

                : t(

                    'Biography and profile details will be updated with confirmed student information.',

                    'প্রয়োজনীয় তথ্য নিশ্চিতকরণের পর জীবনবৃত্তান্ত ও বিবরণ এখানে যুক্ত হবে।'

                  )}

            </div>

          </div>



          {/* Technical Skills */}

          <div className="space-y-2">

            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">

              <Code2 className="w-3.5 h-3.5" />

              {t('Skills & Tech Competencies', 'টেকনিক্যাল দক্ষতা')}

            </h4>

            {member.skills && member.skills.length > 0 ? (

              <div className="flex flex-wrap gap-2">

                {member.skills.map((skill, index) => (

                  <span

                    key={index}

                    className="px-2.5 py-1 text-xs bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 rounded-lg font-mono"

                  >

                    {skill}

                  </span>

                ))}

              </div>

            ) : (

              <p className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">

                {t(

                  'No individual technical skills entered yet (To be updated).',

                  'কোনো ব্যক্তিগত টেকনিক্যাল স্কিল এখনও যুক্ত করা হয়নি (শীঘ্রই আপডেট হবে)।'

                )}

              </p>

            )}

          </div>



          {/* Assigned Responsibilities */}

          <div className="space-y-2">

            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">

              <Briefcase className="w-3.5 h-3.5" />

              {t('Assigned Project Responsibilities', 'প্রজেক্ট দায়িত্বসমূহ')}

            </h4>

            {member.responsibilities && member.responsibilities.length > 0 ? (

              <ul className="space-y-1.5">

                {member.responsibilities.map((resp, idx) => (

                  <li

                    key={idx}

                    className="flex items-start gap-2 text-xs text-slate-300 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800"

                  >

                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />

                    <span>{resp}</span>

                  </li>

                ))}

              </ul>

            ) : (

              <p className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">

                {t(

                  'Responsibilities to be assigned and confirmed by academic supervisor.',

                  'দায়িত্বসমূহ প্রজেক্ট সুপারভাইজার ও টিম কর্তৃক নির্ধারিত হওয়ার পর প্রদর্শিত হবে।'

                )}

              </p>

            )}

          </div>



          {/* Project Contribution Summary */}

          <div className="space-y-2">

            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono flex items-center gap-1.5">

              <CheckCircle2 className="w-3.5 h-3.5" />

              {t('Project Contributions & Modules', 'প্রজেক্টে অবদান')}

            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">

              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">

                <span className="font-bold text-cyan-300 block mb-0.5">Frontend / UI</span>

                <span className="text-slate-400 text-[11px]">

                  {member.contributions?.frontend || t('To be updated', 'শীঘ্রই আপডেট হবে')}

                </span>

              </div>

              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">

                <span className="font-bold text-teal-300 block mb-0.5">Backend & API</span>

                <span className="text-slate-400 text-[11px]">

                  {member.contributions?.backend || t('To be updated', 'শীঘ্রই আপডেট হবে')}

                </span>

              </div>

              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">

                <span className="font-bold text-indigo-300 block mb-0.5">Research & Literature</span>

                <span className="text-slate-400 text-[11px]">

                  {member.contributions?.research || t('To be updated', 'শীঘ্রই আপডেট হবে')}

                </span>

              </div>

              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">

                <span className="font-bold text-purple-300 block mb-0.5">Testing & Documentation</span>

                <span className="text-slate-400 text-[11px]">

                  {member.contributions?.testing || member.contributions?.documentation || t('To be updated', 'শীঘ্রই আপডেট হবে')}

                </span>

              </div>

            </div>

          </div>

        </div>



        {/* Modal Footer */}

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">

          {isAdmin ? (

            <button

              onClick={() => {

                onClose();

                onEdit(member);

              }}

              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono transition-colors"

            >

              <Edit3 className="w-3.5 h-3.5" />

              <span>{t('Edit Profile (Admin)', 'প্রোফাইল এডিট করুন')}</span>

            </button>

          ) : (

            <span className="text-[11px] text-slate-500 font-mono">

              {t('Verified Member • RESQ Bangladesh', 'ভেরিফাইড মেম্বার • রেসকিউ বাংলাদেশ')}

            </span>

          )}



          <button

            onClick={onClose}

            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"

          >

            {t('Close', 'বন্ধ করুন')}

          </button>

        </div>

      </div>

    </div>

  );

};