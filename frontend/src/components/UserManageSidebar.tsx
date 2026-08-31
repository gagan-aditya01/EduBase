import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShieldAlert, Key, Search, ChevronRight, Shield, Building } from 'lucide-react';
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
      setUsers((prev) => prev.filter((u) => u._id !== confirmDeleteUser._id));
      setConfirmDeleteUser(null);
      setSelectedUser(null);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/65 backdrop-blur-md pointer-events-auto cursor-pointer"
          onClick={onClose}
        />

        {/* Centered 3D Console Card Overlay */}
        <motion.div
          initial={{ scale: 0.85, rotateX: -15, y: 50, opacity: 0 }}
          animate={{ scale: 1, rotateX: 0, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, rotateX: -15, y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
          className={`pointer-events-auto w-full max-w-4xl p-10 rounded-[44px] border shadow-2xl overflow-hidden flex flex-col md:grid md:grid-cols-5 min-h-[660px] max-h-[88vh] relative ${
            isDark
              ? 'bg-zinc-950/70 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] text-zinc-100 backdrop-blur-3xl'
              : 'bg-[#fbfaf7]/85 border-[#e5e2d9]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] text-[#191919] backdrop-blur-3xl'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Rotating active background blobs */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
              className={`absolute -top-24 -left-24 w-80 h-80 rounded-full filter blur-[95px] opacity-25 ${
                isDark ? 'bg-zinc-800' : 'bg-[#e05a47]/20'
              }`}
              animate={{
                x: [0, 40, -10, 0],
                y: [0, -30, 30, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Left Column: User Stack List */}
          <div className={`md:col-span-2 border-b md:border-b-0 md:border-r flex flex-col pr-6 md:pb-0 pb-6 z-10 relative overflow-hidden h-full min-h-0 ${
            isDark ? 'border-zinc-850/85' : 'border-[#e5e2d9]'
          }`}>
            {/* Header Title */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-850/10 dark:border-zinc-850/40 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} size={20} />
                <h4 className="font-bold tracking-tight text-base">User Directory</h4>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-400' : 'bg-[#f5f2eb] border-[#e5e2d9] text-zinc-650'
              }`}>
                {nonSuperUsers.length} Users
              </span>
            </div>

            {/* Search inputs */}
            <div className="my-5 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter User, Role, or Department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-2xl pl-9.5 pr-4 py-3 text-xs focus:outline-none border transition-colors ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-850 text-zinc-200 placeholder-zinc-700 focus:border-zinc-750'
                      : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-450 focus:border-[#cc5a37]/50'
                  }`}
                />
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 pr-1.5 custom-scrollbar">
              {loading ? (
                <div className="text-center p-12 text-zinc-500 text-xs">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500 inline-block mr-2 align-middle" />
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center p-12 text-zinc-500 text-xs font-mono">
                  No matching user accounts.
                </div>
              ) : (
                filteredUsers.map((u, index) => {
                  const isSelected = selectedUser?._id === u._id;
                  return (
                    <motion.div
                      key={u._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 25, delay: index * 0.035 }}
                      onClick={() => handleUserSelect(u)}
                      className={`flex items-center justify-between p-4 rounded-[24px] cursor-pointer transition-all duration-150 border select-none ${
                        isSelected
                          ? isDark
                            ? 'bg-zinc-900 border-zinc-800 shadow-md text-white'
                            : 'bg-[#f5f2eb] border-[#cc5a37] shadow-sm text-[#cc5a37]'
                          : isDark
                          ? 'bg-zinc-900/20 border-zinc-900/40 hover:bg-zinc-900/40'
                          : 'bg-white border-[#e5e2d9]/60 hover:bg-[#fbfaf7]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-md bg-gradient-to-tr ${
                            isDark
                              ? 'from-zinc-800 to-zinc-700 border-zinc-850 text-zinc-300'
                              : 'from-[#f5f2eb] to-[#e5e2d9] border-[#e5e2d9] text-[#cc5a37]'
                          }`}>
                            <User size={16} />
                          </div>
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-zinc-950 bg-[#3fa267]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold truncate tracking-tight">
                            {u.username}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold border ${getRoleBadgeStyle(u.role)}`}>
                              {u.role}
                            </span>
                            {u.role === 'faculty' && u.assignedDepartment && (
                              <span className="text-[9px] text-zinc-400 font-semibold truncate max-w-[100px]">
                                {u.assignedDepartment}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-500 shrink-0" />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: User details workspace */}
          <div className="md:col-span-3 flex flex-col pl-6 md:pt-0 pt-6 z-10 relative justify-between overflow-y-auto">
            <button
              onClick={onClose}
              className={`absolute top-0 right-0 p-2 rounded-full border cursor-pointer transition-colors focus:outline-none z-20 ${
                isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-500' : 'border-[#e5e2d9] hover:bg-[#e5e2d9] text-zinc-650'
              }`}
            >
              <X size={18} />
            </button>

            <AnimatePresence mode="wait">
              {!selectedUser ? (
                /* Empty state panel */
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4"
                >
                  <div className={`p-5 rounded-3xl border shadow-lg ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500' : 'bg-[#f5f2eb]/60 border-[#e5e2d9] text-zinc-400'
                  }`}>
                    <User size={40} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-bold tracking-tight">No User Selected</span>
                    <span className="text-xs text-zinc-500 max-w-[240px]">Select a user from the directory to configure roles, assigned departments, or passwords.</span>
                  </div>
                </motion.div>
              ) : (
                /* Detailed active user profile console */
                <motion.div
                  key={selectedUser._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex-1 flex flex-col justify-between space-y-6"
                >
                  {/* Header info */}
                  <div className="flex items-center gap-4 border-b pb-4 border-zinc-850/10 dark:border-zinc-850/40">
                    <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center shadow-lg ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-[#cc5a37]/5 border-[#cc5a37]/20 text-[#cc5a37]'
                    }`}>
                      <User size={22} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold truncate max-w-[250px]">
                        {selectedUser.username}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium font-semibold">User Role & Permission Console</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs text-center">
                      {error}
                    </div>
                  )}

                  {/* Role & Department Scoping Configuration Panel */}
                  <div className={`p-5 border rounded-[24px] space-y-4 text-xs ${
                    isDark
                      ? 'bg-zinc-900/20 border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                      : 'bg-[#f5f2eb]/60 border-[#e5e2d9]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-zinc-400">
                        <Shield size={14} /> Assign Role
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
                        <span className="font-bold flex items-center gap-1.5 text-zinc-400">
                          <Building size={14} /> Faculty Department
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

                    <div className="flex justify-end pt-2">
                      <LiquidMetalButton
                        label={updatingRole ? 'Updating...' : 'Save Role & Dept'}
                        onClick={handleRoleDeptUpdate}
                        theme={theme}
                      />
                    </div>
                  </div>

                  {/* Password Reset form */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Reset Password
                    </label>
                    {selectedUser.authProvider && selectedUser.authProvider !== 'local' ? (
                      <div className="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 flex items-center gap-3">
                        <span className="text-base">🌐</span>
                        <span>OAuth account ({selectedUser.authProvider.toUpperCase()}). Password managed externally.</span>
                      </div>
                    ) : (
                      <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                          <Key size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
                          <input
                            type="password"
                            placeholder="Type new password..."
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none border transition-colors ${
                              isDark
                                ? 'bg-zinc-950 border-zinc-850 text-zinc-200 placeholder-zinc-700'
                                : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-450'
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

                  {/* Account Deletion */}
                  <div className="border-t pt-4 border-zinc-850/10 dark:border-zinc-850/50 flex justify-end">
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
