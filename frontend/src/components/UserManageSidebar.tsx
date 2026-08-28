import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShieldAlert, Key, Search, Calendar, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface DBUser {
  _id: string;
  username: string;
  role: 'admin' | 'guest';
  authProvider?: 'local' | 'google' | 'github';
  createdAt?: string;
  updatedAt?: string;
}

interface UserManageSidebarProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' };
  onClose: () => void;
  theme?: 'light' | 'dark';
  onAddNotification?: (type: 'info' | 'success' | 'warning', message: string) => void;
  addToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export function UserManageSidebar({ currentUser, onClose, theme = 'dark', onAddNotification, addToast }: UserManageSidebarProps) {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
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

  // Filter ONLY Guest accounts
  const guestUsers = users.filter((u) => u.role === 'guest');

  // Search safely matching both ID and username
  const filteredUsers = guestUsers.filter((u) => {
    const usernameMatch = u.username ? u.username.toLowerCase() : '';
    const idMatch = u._id ? u._id.toString().toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return usernameMatch.includes(query) || idMatch.includes(query);
  });

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

        {/* Centered 3D Console Card Overlay - Overhauled for Liquid Glass & Metal */}
        <motion.div
          initial={{ scale: 0.85, rotateX: -15, y: 50, opacity: 0 }}
          animate={{ scale: 1, rotateX: 0, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, rotateX: -15, y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
          className={`pointer-events-auto w-full max-w-4xl p-10 rounded-[44px] border shadow-2xl overflow-hidden flex flex-col md:grid md:grid-cols-5 min-h-[640px] max-h-[85vh] relative ${
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
            <motion.div
              className={`absolute -bottom-24 -right-24 w-80 h-80 rounded-full filter blur-[95px] opacity-15 ${
                isDark ? 'bg-zinc-900' : 'bg-amber-500/15'
              }`}
              animate={{
                x: [0, -30, 40, 0],
                y: [0, 30, -30, 0],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Left Column: Astryx Avatar Stack List */}
          <div className={`md:col-span-2 border-b md:border-b-0 md:border-r flex flex-col pr-6 md:pb-0 pb-6 z-10 relative overflow-hidden ${
            isDark ? 'border-zinc-850/85' : 'border-[#e5e2d9]'
          }`}>
            {/* Header Title */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-850/10 dark:border-zinc-850/40">
              <div className="flex items-center gap-2">
                <ShieldAlert className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} size={20} />
                <h4 className="font-bold tracking-tight text-base">Guest Accounts</h4>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-400' : 'bg-[#f5f2eb] border-[#e5e2d9] text-zinc-650'
              }`}>
                {guestUsers.length} Users
              </span>
            </div>

            {/* Search inputs */}
            <div className="my-5">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter Guest ID or Name..."
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

            {/* Scrollable list - Made bigger and more spacious */}
            <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[300px] md:max-h-none pr-1">
              {loading ? (
                <div className="text-center p-12 text-zinc-500 text-xs">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500 inline-block mr-2 align-middle"></span>
                  Loading...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center p-12 text-zinc-500 text-xs font-mono">
                  No matching guests.
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
                      onClick={() => {
                        setSelectedUser(u);
                        setPasswordInput('');
                      }}
                      className={`flex items-center justify-between p-4.5 rounded-[24px] cursor-pointer transition-all duration-150 border select-none ${
                        isSelected
                          ? isDark
                            ? 'bg-zinc-900 border-zinc-800 shadow-md text-white'
                            : 'bg-[#f5f2eb] border-[#cc5a37] shadow-sm text-[#cc5a37]'
                          : isDark
                          ? 'bg-zinc-900/20 border-zinc-900/40 hover:bg-zinc-900/40'
                          : 'bg-white border-[#e5e2d9]/60 hover:bg-[#fbfaf7]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-md bg-gradient-to-tr ${
                            isDark
                              ? 'from-zinc-800 to-zinc-700 border-zinc-850 text-zinc-300'
                              : 'from-[#f5f2eb] to-[#e5e2d9] border-[#e5e2d9] text-[#cc5a37]'
                          }`}>
                            <User size={16} />
                          </div>
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-zinc-950 bg-[#3fa267]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold truncate max-w-[130px] tracking-tight">
                            {u.username}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-zinc-500 font-semibold">
                              Guest
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold border ${
                              u.authProvider === 'google'
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                : u.authProvider === 'github'
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}>
                              {u.authProvider || 'local'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-500" />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: User details workspace */}
          <div className="md:col-span-3 flex flex-col pl-6 md:pt-0 pt-6 z-10 relative justify-between">
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
                    <span className="text-base font-bold tracking-tight">No Guest Selected</span>
                    <span className="text-xs text-zinc-500 max-w-[240px]">Select a guest record from the left stack to review details or update passwords.</span>
                  </div>
                </motion.div>
              ) : (
                /* Detailed active guest profile console - Overhauled for spacious inputs and Liquid Glass */
                <motion.div
                  key={selectedUser._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex-1 flex flex-col justify-between space-y-8"
                >
                  {/* Header info */}
                  <div className="flex items-center gap-4 border-b pb-5 border-zinc-850/10 dark:border-zinc-850/40">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-lg ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-[#cc5a37]/5 border-[#cc5a37]/20 text-[#cc5a37]'
                    }`}>
                      <User size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold truncate max-w-[250px]">
                        {selectedUser.username}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium font-semibold">Guest Account Workspace</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs text-center">
                      {error}
                    </div>
                  )}

                  {/* Metadata fields - Liquid Glass Effect */}
                  <div className={`p-6 border rounded-[24px] space-y-4 text-xs transition-colors ${
                    isDark 
                      ? 'bg-zinc-900/15 border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]' 
                      : 'bg-[#f5f2eb]/60 border-[#e5e2d9] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-3 border-zinc-850/10 dark:border-zinc-850/30">
                      <span className="text-zinc-500 font-bold">User ID</span>
                      <span className="font-mono text-xs text-zinc-400 select-all">{selectedUser._id}</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3 border-zinc-850/10 dark:border-zinc-850/30">
                      <span className="text-zinc-500 font-bold">Auth Provider</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold border ${
                        selectedUser.authProvider === 'google'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : selectedUser.authProvider === 'github'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}>
                        {selectedUser.authProvider ? `${selectedUser.authProvider.toUpperCase()} OAuth` : 'Local Password'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Calendar size={14} />
                        <span className="font-semibold">Created At</span>
                      </div>
                      <span className="font-medium text-xs">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Password Reset form - Spacious input with Liquid Metal Button component */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Reset Account Password
                    </label>
                    {selectedUser.authProvider && selectedUser.authProvider !== 'local' ? (
                      <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 flex items-center gap-3">
                        <span className="text-lg">🌐</span>
                        <span>
                          Password modification is disabled for <b>{selectedUser.authProvider.toUpperCase()}</b> OAuth accounts. Passwords for this user are managed directly by their OAuth provider.
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                          <Key size={16} className="absolute left-4 top-4.5 text-zinc-500" />
                          <input
                            type="password"
                            placeholder="Type new password..."
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className={`w-full rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none border transition-colors ${
                              isDark
                                ? 'bg-zinc-950 border-zinc-850 text-zinc-200 placeholder-zinc-700 focus:border-zinc-750'
                                : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-450 focus:border-[#cc5a37]/50'
                            }`}
                          />
                        </div>
                        
                        <div className="shrink-0">
                          <LiquidMetalButton 
                            label="Save" 
                            onClick={() => handlePasswordReset(selectedUser._id)} 
                            theme={theme} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Deletion - Native Liquid Metal Button */}
                  <div className="border-t pt-5 border-zinc-850/10 dark:border-zinc-850/50 flex justify-end">
                    <LiquidMetalButton 
                      label="Delete" 
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
          title="Delete Guest Account?"
          message={`Are you sure you want to permanently delete the guest account "${confirmDeleteUser.username}"? They will lose all directory login permissions.`}
          confirmLabel="Delete User"
          onConfirm={handleDeleteUser}
          onCancel={() => setConfirmDeleteUser(null)}
          theme={theme}
        />
      )}
    </>
  );
}
