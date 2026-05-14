import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, KeyRound, Eye, EyeOff, Check, Store, Pencil, X } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';

const CUSTOMER_RESTAURANTS = [
  { id: '1', name: 'The Corner Bistro', code: 'TCB-001' },
  { id: '2', name: 'The Green Bistro',  code: 'TGB-002' },
];

const CustomerProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john@email.com',
    phone: '+27 82 345 6789',
  });
  const [editMode, setEditMode]         = useState(false);
  const [draft, setDraft]               = useState({ ...profile });
  const [profileSaved, setProfileSaved] = useState(false);

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
    { label: 'Full Name',      key: 'fullName', icon: <User  size={18} />, type: 'text',  placeholder: 'Enter full name' },
    { label: 'Email Address',  key: 'email',    icon: <Mail  size={18} />, type: 'email', placeholder: 'Enter email address' },
    { label: 'Contact Number', key: 'phone',    icon: <Phone size={18} />, type: 'tel',   placeholder: 'Enter contact number' },
  ];

  return (
    <CustomerLayout title="My Profile" showBack>

      {/* Avatar */}
      <div className="flex flex-col items-center py-6">
        <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white mb-4"
          style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)', boxShadow: '0 8px 24px rgba(13,33,55,0.2)' }}>
          <User size={40} />
        </div>
        <h2 className="text-xl font-black text-gray-900">{profile.fullName}</h2>
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Active Customer</p>

        {!editMode ? (
          <button onClick={() => { setDraft({ ...profile }); setEditMode(true); }}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors">
            <Pencil size={13} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2 mt-4">
            <button onClick={handleEditCancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition-colors">
              <X size={13} /> Cancel
            </button>
            <button onClick={handleEditSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all
                ${profileSaved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
              <Check size={13} /> {profileSaved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Info Fields */}
      <div className="space-y-3 mb-4">
        {fields.map((item) => (
          <div key={item.key} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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

      {/* Linked Restaurants — unchanged, paste your existing block here */}

      {/* Change Password — unchanged, paste your existing block here */}

      {/* Sign Out */}
      <button onClick={() => navigate('/')}
        className="w-full py-4 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-colors mb-6">
        <LogOut size={18} /> Sign Out
      </button>

    </CustomerLayout>
  );
};

export default CustomerProfile;