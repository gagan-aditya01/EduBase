import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShieldAlert, Key, Search, ChevronRight, Shield, Building, Globe, Clock } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface DBUser {
  _id: string;
  username: string;
  role: 'admin' | 'guest' | 'faculty';
  assignedDepartment?: string;
  authProvider?: 'local' | 'google' | 'github';
  createdAt?: string;
  updatedAt?: string;
}

interface UserManageSidebarProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty' };
  onClose: () => void;
  theme?: 'light' | 'dark';
  onAddNotification?: (type: 'info' | 'success' | 'warning', message: string) => void;
  addToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

const COMMON_DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'ADSE',
  'Astrophysics',
  'Mathematics',
  'Political Science',
  'Robotics',
  'Social Work',
];

export function UserManageSidebar({ currentUser, onClose, theme = 'dark', onAddNotification, addToast }: UserManageSidebarProps) {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState<'guest' | 'faculty' | 'admin'>('guest');
  const [deptInput, setDeptInput] = useState('Computer Science');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<DBUser | null>(null);

  const isDark = theme === 'dark';

  // Prevent background page body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5050/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      setUsers(data);
      
      // Auto-select first non-super user if none selected
      const nonSuper = data.filter((u: DBUser) => u.username !== 'yashureddy4044@gmail.com');
      if (nonSuper.length > 0) {
        handleUserSelect(nonSuper[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelect = (u: DBUser) => {
    setSelectedUser(u);
    setPasswordInput('');
    setRoleInput(u.role || 'guest');
    setDeptInput(u.assignedDepartment || 'Computer Science');
  };

  const handleRoleDeptUpdate = async () => {
    if (!selectedUser) return;
    try {
      setUpdatingRole(true);
      setError('');
      const res = await fetch(`http://localhost:5050/api/auth/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          role: roleInput,
          assignedDepartment: roleInput === 'faculty' ? deptInput : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user role');
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? { ...u, role: data.role, assignedDepartment: data.assignedDepartment } : u))
      );
      setSelectedUser((prev) => (prev ? { ...prev, role: data.role, assignedDepartment: data.assignedDepartment } : null));

      onAddNotification?.('info', `Updated user ${selectedUser.username} to ${data.role.toUpperCase()}`);
      if (addToast) {
        addToast('success', `User role updated to ${data.role.toUpperCase()}!`);
      }
    } catch (err: any) {
      setError(err.message);
      if (addToast) {
        addToast('error', err.message);
      }
    } finally {
      setUpdatingRole(false);
    }
  };

  const handlePasswordReset = async (userId: string) => {
    if (!passwordInput || passwordInput.trim().length < 4) {
      if (addToast) {
        addToast('error', 'Password must be at least 4 characters long');
      } else {
        setError('Password must be at least 4 characters long');
      }
      return;
    }

    try {
      setError('');
      const res = await fetch(`http://localhost:5050/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reset password');
      }

      setPasswordInput('');
      onAddNotification?.('info', `Reset password for user: ${selectedUser?.username}`);
      if (addToast) {
        addToast('success', 'Password updated successfully!');
      }
    } catch (err: any) {
      setError(err.message);
      if (addToast) {
        addToast('error', err.message);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    try {
      setError('');
      const res = await fetch(`http://localhost:5050/api/auth/users/${confirmDeleteUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      onAddNotification?.('warning', `Deleted account: ${confirmDeleteUser.username}`);
      const updatedList = users.filter((u) => u._id !== confirmDeleteUser._id);
      setUsers(updatedList);
      setConfirmDeleteUser(null);

      const remainingNonSuper = updatedList.filter((u) => u.username !== 'yashureddy4044@gmail.com');
      if (remainingNonSuper.length > 0) {
        handleUserSelect(remainingNonSuper[0]);
      } else {
        setSelectedUser(null);
      }
    } catch (err: any) {
      setError(err.message);
      setConfirmDeleteUser(null);
    }
  };

  // Filter accounts for display
  const nonSuperUsers = users.filter((u) => u.username !== 'yashureddy4044@gmail.com');

  // Search safely matching username, ID, role, or department
  const filteredUsers = nonSuperUsers.filter((u) => {
    const usernameMatch = u.username ? u.username.toLowerCase() : '';
    const idMatch = u._id ? u._id.toString().toLowerCase() : '';
    const roleMatch = u.role ? u.role.toLowerCase() : '';
    const deptMatch = u.assignedDepartment ? u.assignedDepartment.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return usernameMatch.includes(query) || idMatch.includes(query) || roleMatch.includes(query) || deptMatch.includes(query);
  });

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'faculty':
        return 'bg-[#cc5a37]/10 border-[#cc5a37]/30 text-[#cc5a37] dark:text-[#e05a47]';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400';
    }
  };

  return (
    <>
      {/* Fullscreen blur backdrop */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          onClick={onClose}
        />

        {/* Centered 3D Console Card Overlay */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className={`w-full max-w-5xl h-[85vh] max-h-[720px] min-h-[520px] p-6 md:p-8 rounded-[36px] border shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 z-10 relative ${
            isDark
              ? 'bg-zinc-950/85 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] text-zinc-100 backdrop-blur-3xl'
              : 'bg-[#fbfaf7]/90 border-[#e5e2d9]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] text-[#191919] backdrop-blur-3xl'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Column: User Directory List (5 cols) */}
          <div className={`md:col-span-5 flex flex-col h-full min-h-0 pr-0 md:pr-4 border-b md:border-b-0 md:border-r ${
            isDark ? 'border-zinc-850/80' : 'border-[#e5e2d9]'
          }`}>
            {/* Title Bar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/40 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} size={20} />
                <h4 className="font-bold tracking-tight text-base">User Directory</h4>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-400' : 'bg-[#f5f2eb] border-[#e5e2d9] text-zinc-650'
              }`}>
                {nonSuperUsers.length} Users
              </span>
            </div>

            {/* Search filter input */}
            <div className="my-3 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter User, Role, or Dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none border transition-colors ${
                    isDark
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-zinc-700'
                      : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-[#cc5a37]/50'
                  }`}
                />
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2.5 pr-1">
              {loading ? (
                <div className="text-center p-12 text-zinc-500 text-xs">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500 inline-block mr-2 align-middle" />
                  Loading accounts...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center p-12 text-zinc-500 text-xs font-mono">
                  No matching user accounts.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUser?._id === u._id;
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleUserSelect(u)}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border select-none ${
                        isSelected
                          ? isDark
                            ? 'bg-zinc-900 border-zinc-700 shadow-md text-white'
                            : 'bg-[#f5f2eb] border-[#cc5a37] text-[#cc5a37]'
                          : isDark
                          ? 'bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/60'
                          : 'bg-white border-[#e5e2d9] hover:bg-[#fbfaf7]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                          isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-[#f5f2eb] border-[#e5e2d9] text-[#cc5a37]'
                        }`}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold truncate">
                            {u.username}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold border ${getRoleBadgeStyle(u.role)}`}>
                              {u.role}
                            </span>
                            {u.role === 'faculty' && u.assignedDepartment && (
                              <span className="text-[9px] text-zinc-400 font-medium truncate max-w-[100px]">
                                {u.assignedDepartment}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight size={14} className={isSelected ? 'text-zinc-200' : 'text-zinc-600'} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: User details console (7 cols) */}
          <div className="md:col-span-7 flex flex-col h-full min-h-0 pl-0 md:pl-2 overflow-y-auto">
            {/* Top Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40 shrink-0 mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Account Inspector</span>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-full border cursor-pointer transition-colors ${
                  isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-[#e5e2d9] hover:bg-[#e5e2d9] text-zinc-650'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!selectedUser ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-[#f5f2eb] border-[#e5e2d9] text-zinc-400'}`}>
                    <User size={32} />
                  </div>
                  <span className="text-sm font-bold">No User Selected</span>
                  <span className="text-xs text-zinc-500 max-w-[220px]">Select a user from the directory to inspect details or update roles.</span>
                </div>
              ) : (
                <motion.div
                  key={selectedUser._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 flex flex-col space-y-5"
                >
                  {/* Account Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl border bg-gradient-to-tr from-[#cc5a37] to-[#e05a47] text-white flex items-center justify-center font-bold text-lg shadow-md">
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-base tracking-tight truncate max-w-[240px]">{selectedUser.username}</h3>
                        <p className="text-[11px] text-zinc-500 font-mono">ID: {selectedUser._id}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono uppercase font-bold border ${getRoleBadgeStyle(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs">
                      {error}
                    </div>
                  )}

                  {/* Metadata Info Card */}
                  <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/30">
                      <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                        <Globe size={13} /> Authentication Method
                      </span>
                      <span className="font-mono text-zinc-300 font-medium">
                        {selectedUser.authProvider ? `${selectedUser.authProvider.toUpperCase()} OAuth` : 'Local Password'}
                      </span>
                    </div>

                    {selectedUser.assignedDepartment && (
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/30">
                        <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                          <Building size={13} /> Assigned Department
                        </span>
                        <span className="font-bold text-[#cc5a37] dark:text-[#e05a47]">
                          {selectedUser.assignedDepartment}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                        <Clock size={13} /> Registered Date
                      </span>
                      <span className="text-zinc-400 font-medium">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Role & Department Editor Panel */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-[#f5f2eb]/60 border-[#e5e2d9]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                        <Shield size={14} /> Change Role
                      </span>
                      <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                        {(['guest', 'faculty', 'admin'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRoleInput(r)}
                            className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer ${
                              roleInput === r
                                ? 'bg-[#cc5a37] text-white shadow-md'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {roleInput === 'faculty' && (
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/30">
                        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                          <Building size={14} /> Target Department
                        </span>
                        <select
                          value={deptInput}
                          onChange={(e) => setDeptInput(e.target.value)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none border transition-colors cursor-pointer ${
                            isDark
                              ? 'bg-zinc-950 border-zinc-800 text-zinc-200'
                              : 'bg-white border-[#e5e2d9] text-[#191919]'
                          }`}
                        >
                          {COMMON_DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <LiquidMetalButton
                        label={updatingRole ? 'Saving...' : 'Update Role & Dept'}
                        onClick={handleRoleDeptUpdate}
                        theme={theme}
                      />
                    </div>
                  </div>

                  {/* Password Reset Section */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Reset Password
                    </label>
                    {selectedUser.authProvider && selectedUser.authProvider !== 'local' ? (
                      <div className="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400">
                        Password reset is disabled for OAuth accounts ({selectedUser.authProvider.toUpperCase()}).
                      </div>
                    ) : (
                      <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                          <Key size={14} className="absolute left-3 top-3 text-zinc-500" />
                          <input
                            type="password"
                            placeholder="New password..."
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className={`w-full rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none border transition-colors ${
                              isDark
                                ? 'bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-700'
                                : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400'
                            }`}
                          />
                        </div>
                        <div className="shrink-0">
                          <LiquidMetalButton
                            label="Save Password"
                            onClick={() => handlePasswordReset(selectedUser._id)}
                            theme={theme}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete Account Footer */}
                  <div className="border-t pt-4 border-zinc-800/40 flex justify-end">
                    <LiquidMetalButton
                      label="Delete User"
                      onClick={() => setConfirmDeleteUser(selectedUser)}
                      theme={theme}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {confirmDeleteUser && (
        <ConfirmDialog
          isOpen={true}
          title="Delete User Account?"
          message={`Are you sure you want to permanently delete user "${confirmDeleteUser.username}"?`}
          confirmLabel="Delete User"
          onConfirm={handleDeleteUser}
          onCancel={() => setConfirmDeleteUser(null)}
          theme={theme}
        />
      )}
    </>
  );
}
