import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Mail, Phone, LogOut, KeyRound, Eye, EyeOff, Check, Pencil, X } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile]           = useState({ ownerName: '', email: '', phone: '' });
  const [loading, setLoading]           = useState(true);
  const [editMode, setEditMode]         = useState(false);
  const [draft, setDraft]               = useState({ ...profile });
  const [profileSaved, setProfileSaved] = useState(false);
  const [saveError, setSaveError]       = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showCurrent, setShowCurrent]           = useState(false);
  const [showNew, setShowNew]                   = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [saved, setSaved]                       = useState(false);
  const [pwError, setPwError]                   = useState('');
  const [signingOut, setSigningOut]             = useState(false);

  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const canSave        = currentPassword && newPassword && passwordsMatch;

  // ── Fetch profile from Supabase ───────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('profiles')
      .select('owner_name, email, phone')
      .eq('id', user.id)
      .single();

    if (error) { console.error('fetchProfile:', error); setLoading(false); return; }

    const loaded = {
      ownerName: data.owner_name || '',
      email:     data.email      || user.email || '',
      phone:     data.phone      || '',
    };

    setProfile(loaded);
    setDraft(loaded);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Save profile edits ────────────────────────────────────────────────────
  const handleEditSave = async () => {
    setSaveError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        owner_name: draft.ownerName,
        email:      draft.email,
        phone:      draft.phone,
      })
      .eq('id', user.id);

    if (error) {
      console.error('handleEditSave:', error);
      setSaveError('Failed to save. Please try again.');
      return;
    }

    setProfile({ ...draft });
    setProfileSaved(true);
    setTimeout(() => { setEditMode(false); setProfileSaved(false); }, 1200);
  };

  const handleEditCancel = () => { setDraft({ ...profile }); setEditMode(false); setSaveError(''); };

  // ── Change password ───────────────────────────────────────────────────────
  const handlePasswordSave = async () => {
    if (!canSave) return;
    setPwError('');

    // Re-authenticate with current password first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email:    user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPwError('Current password is incorrect.');
      return;
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setPwError(updateError.message);
      return;
    }

    setSaved(true);
    setTimeout(() => {
      setShowPasswordForm(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setSaved(false);
    }, 1500);
  };

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    navigate('/');
  };

  const fields = [
    { label: 'Owner Name',     key: 'ownerName', icon: <Store size={18} />, type: 'text',  placeholder: 'Enter owner name'     },
    { label: 'Email Address',  key: 'email',     icon: <Mail  size={18} />, type: 'email', placeholder: 'Enter email address'  },
    { label: 'Contact Number', key: 'phone',     icon: <Phone size={18} />, type: 'tel',   placeholder: 'Enter contact number' },
  ];

  return (
    <MainLayout title="Business Profile" showBack>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

        {/* Left col */}
        <div>
          {/* Avatar card */}
          <div className="flex flex-col items-center py-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 mb-5">
            <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white mb-4 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>
              <Store size={40} />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              {loading ? '—' : profile.ownerName || 'Your Business'}
            </h2>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Active Vendor</p>

            {!editMode ? (
              <button
                onClick={() => { setDraft({ ...profile }); setEditMode(true); }}
                disabled={loading}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-white/60 text-xs font-bold transition-colors disabled:opacity-40"
              >
                <Pencil size={13} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2 mt-4">
                <button onClick={handleEditCancel}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/40 text-xs font-bold transition-colors">
                  <X size={13} /> Cancel
                </button>
                <button onClick={handleEditSave}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    profileSaved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-900 dark:bg-white/10 text-white dark:text-white hover:bg-gray-800 dark:hover:bg-white/15'
                  }`}>
                  <Check size={13} /> {profileSaved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            )}
            {saveError && <p className="text-xs text-red-500 font-bold mt-2">{saveError}</p>}
          </div>

          {/* Info Fields */}
          <div className="space-y-3">
            {fields.map((item) => (
              <div key={item.key} className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center gap-4">
                <div className="text-gray-400 dark:text-white/30 flex-shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">{item.label}</p>
                  {editMode ? (
                    <input
                      type={item.type}
                      value={draft[item.key]}
                      onChange={e => setDraft(prev => ({ ...prev, [item.key]: e.target.value }))}
                      placeholder={item.placeholder}
                      className="w-full mt-1 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  ) : (
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                      {loading ? '—' : profile[item.key] || '—'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-4">

          {/* Change Password */}
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
            <button
              onClick={() => { setShowPasswordForm(prev => !prev); setPwError(''); }}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-gray-400 dark:text-white/30"><KeyRound size={18} /></div>
                <div className="text-left">
                  <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">Security</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">Change Password</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                showPasswordForm ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200 dark:border-white/20'
              }`}>
                {showPasswordForm && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </button>

            {showPasswordForm && (
              <div className="px-5 pb-5 border-t border-gray-50 dark:border-white/5 pt-4 space-y-3">
                {[
                  { label: 'Current Password',     val: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(p => !p), placeholder: 'Enter current password',  error: false },
                  { label: 'New Password',          val: newPassword,     set: setNewPassword,     show: showNew,     toggle: () => setShowNew(p => !p),     placeholder: 'Enter new password',      error: false },
                  { label: 'Confirm New Password',  val: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(p => !p), placeholder: 'Repeat new password',     error: !!(confirmPassword && !passwordsMatch) },
                ].map(({ label, val, set, show, toggle, placeholder, error }) => (
                  <div key={label}>
                    <label className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest block mb-1 ml-1">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={val}
                        onChange={e => set(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border outline-none text-sm font-semibold text-gray-700 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:ring-4 transition-all pr-12 ${
                          error
                            ? 'border-red-300 dark:border-red-500/30 focus:border-red-400 focus:ring-red-500/5'
                            : 'border-gray-100 dark:border-white/10 focus:border-emerald-400 focus:ring-emerald-500/10'
                        }`}
                      />
                      <button onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30">
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {error && <p className="text-xs text-red-500 dark:text-red-400 font-bold mt-1 ml-1">Passwords don't match</p>}
                  </div>
                ))}

                {pwError && <p className="text-xs text-red-500 dark:text-red-400 font-bold ml-1">{pwError}</p>}

                <button
                  onClick={handlePasswordSave}
                  disabled={!canSave}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] mt-2 ${
                    canSave
                      ? saved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-900 dark:bg-white/10 text-white hover:bg-gray-800 dark:hover:bg-white/15'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed'
                  }`}
                >
                  {saved ? '✓ Password Updated' : 'Save New Password'}
                </button>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full py-4 text-red-500 dark:text-red-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl transition-colors disabled:opacity-50"
          >
            <LogOut size={18} /> {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>

          <p className="text-xs text-gray-400 dark:text-white/20 text-center mt-2">
            Navoq v1.0 — Nidaam Labs (Pty) Ltd
          </p>
        </div>

      </div>
    </MainLayout>
  );
};

export default Profile;