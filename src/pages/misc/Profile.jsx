import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Mail, Phone, LogOut, KeyRound, Eye, EyeOff, Check, Pencil, X } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

const Profile = () => {
  const navigate = useNavigate();

  // Profile info state
  const [profile, setProfile] = useState({
    ownerName: 'Abdikaliq Abdi',
    email: 'contact@bistro.co.za',
    phone: '+27 12 345 6789',
  });
  const [editMode, setEditMode]   = useState(false);
  const [draft, setDraft]         = useState({ ...profile });
  const [profileSaved, setProfileSaved] = useState(false);

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showCurrent, setShowCurrent]           = useState(false);
  const [showNew, setShowNew]                   = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [saved, setSaved]                       = useState(false);

  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const canSave        = currentPassword && newPassword && passwordsMatch;

  const handlePasswordSave = () => {
    setSaved(true);
    setTimeout(() => {
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(false);
    }, 1500);
  };

  const handleEditSave = () => {
    setProfile({ ...draft });
    setProfileSaved(true);
    setTimeout(() => {
      setEditMode(false);
      setProfileSaved(false);
    }, 1200);
  };

  const handleEditCancel = () => {
    setDraft({ ...profile });
    setEditMode(false);
  };

  const fields = [
    { label: 'Owner Name',     key: 'ownerName', icon: <Store size={18} />, type: 'text',  placeholder: 'Enter owner name' },
    { label: 'Email Address',  key: 'email',     icon: <Mail  size={18} />, type: 'email', placeholder: 'Enter email address' },
    { label: 'Contact Number', key: 'phone',     icon: <Phone size={18} />, type: 'tel',   placeholder: 'Enter contact number' },
  ];

  return (
    <MainLayout title="Business Profile" showBack>
      <div className="max-w-2xl">

        {/* Avatar */}
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 bg-gray-900 rounded-[2.5rem] flex items-center justify-center text-white mb-4 shadow-xl">
            <Store size={40} />
          </div>
          <h2 className="text-xl font-black text-gray-900">{profile.ownerName}</h2>
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mt-1">Active Vendor</p>

          {/* Edit toggle */}
          {!editMode ? (
            <button
              onClick={() => { setDraft({ ...profile }); setEditMode(true); }}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
            >
              <Pencil size={13} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleEditCancel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition-colors"
              >
                <X size={13} /> Cancel
              </button>
              <button
                onClick={handleEditSave}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all
                  ${profileSaved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
              >
                <Check size={13} /> {profileSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Info Fields */}
        <div className="space-y-3 mb-4">
          {fields.map((item) => (
            <div
              key={item.key}
              className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm"
            >
              <div className="text-gray-400 flex-shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                {editMode ? (
                  <input
                    type={item.type}
                    value={draft[item.key]}
                    onChange={e => setDraft(prev => ({ ...prev, [item.key]: e.target.value }))}
                    placeholder={item.placeholder}
                    className="w-full mt-1 text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-500/5 transition-all"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{profile[item.key]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <button
            onClick={() => setShowPasswordForm(prev => !prev)}
            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="text-gray-400"><KeyRound size={18} /></div>
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security</p>
                <p className="text-sm font-bold text-gray-900">Change Password</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${showPasswordForm ? 'border-green-500 bg-green-500' : 'border-gray-200'}`}>
              {showPasswordForm && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
          </button>

          {showPasswordForm && (
            <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-3">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Current Password</label>
                <div className="relative">
                  <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password"
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-green-400 focus:ring-4 focus:ring-green-500/5 transition-all pr-12" />
                  <button onClick={() => setShowCurrent(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">New Password</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-green-400 focus:ring-4 focus:ring-green-500/5 transition-all pr-12" />
                  <button onClick={() => setShowNew(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
                    className={`w-full px-4 py-3 bg-gray-50 rounded-2xl border outline-none text-sm font-semibold text-gray-700 focus:ring-4 transition-all pr-12
                      ${confirmPassword && !passwordsMatch ? 'border-red-300 focus:border-red-400 focus:ring-red-500/5' : 'border-gray-100 focus:border-green-400 focus:ring-green-500/5'}`} />
                  <button onClick={() => setShowConfirm(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">Passwords don't match</p>
                )}
              </div>
              <button onClick={handlePasswordSave} disabled={!canSave}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] mt-2
                  ${canSave ? saved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                {saved ? '✓ Password Updated' : 'Save New Password'}
              </button>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button onClick={() => navigate('/')}
          className="w-full py-4 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-colors">
          <LogOut size={18} /> Sign Out
        </button>

      </div>
    </MainLayout>
  );
};

export default Profile;