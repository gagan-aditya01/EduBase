import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, User, Key, Search, ChevronRight, Shield, Building, Globe, Clock } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/interfaces-select';

interface DBUser {
  _id: string;
  username: string;
  role: 'admin' | 'guest' | 'faculty';
  assignedDepartment?: string;
  authProvider?: 'local' | 'google' | 'github';
  createdAt?: string;
}

interface UserManagePageProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty' };
  theme?: 'light' | 'dark';
  addToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

const COMMON_DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'ADSE',
  'Mathematics',
  'Robotics',
];

export function UserManagePage({ currentUser, theme = 'dark', addToast }: UserManagePageProps) {
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

  const nonSuperUsers = users.filter((u) => u.username !== 'yashureddy4044@gmail.com');
  const filteredUsers = nonSuperUsers.filter((u) => {
    const usernameMatch = u.username ? u.username.toLowerCase() : '';
    const idMatch = u._id ? u._id.toString().toLowerCase() : '';
    const roleMatch = u.role ? u.role.toLowerCase() : '';
    const deptMatch = u.assignedDepartment ? u.assignedDepartment.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return usernameMatch.includes(query) || idMatch.includes(query) || roleMatch.includes(query) || deptMatch.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-zinc-900' : 'border-[#e5e2d9]'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'}`}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
              User Role & Department Administration
            </h1>
            <p className="text-xs text-zinc-500">Manage user permissions, role upgrades, and department scoping</p>
          </div>
        </div>
      </div>

      {/* Main Console Card Layout */}
      <div className={`p-6 md:p-8 rounded-[36px] border shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        {/* Left Column: User Directory List (5 cols) */}
        <div className={`md:col-span-5 flex flex-col space-y-4 pr-0 md:pr-4 border-b md:border-b-0 md:border-r ${
          isDark ? 'border-zinc-800' : 'border-[#e5e2d9]'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
            <h4 className="font-bold text-sm">Account Directory</h4>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-[#f0ede6] border-[#e5e2d9] text-zinc-700'
            }`}>
              {nonSuperUsers.length} Users
            </span>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search User, Role, or Dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none border transition-colors ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-zinc-700'
                  : 'bg-[#f8f6f0] border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-[#cc5a37]/50'
              }`}
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
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
                    className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border select-none ${
                      isSelected
                        ? isDark
                          ? 'bg-zinc-800 border-zinc-700 text-white shadow-md'
                          : 'bg-[#f0ede6] border-[#cc5a37] text-[#cc5a37]'
                        : isDark
                        ? 'bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-950/80 text-zinc-300'
                        : 'bg-white border-[#e5e2d9] hover:bg-[#fbfaf7] text-[#191919]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? isDark ? 'bg-zinc-800 border-zinc-600 text-zinc-100' : 'bg-[#cc5a37] border-[#cc5a37] text-white'
                          : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'
                      }`}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{u.username}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold border ${
                            isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-[#f0ede6] border-[#e5e2d9] text-zinc-800'
                          }`}>
                            {u.role}
                          </span>
                          {u.role === 'faculty' && u.assignedDepartment && (
                            <span className="text-[9px] font-medium truncate max-w-[100px] text-zinc-400">
                              {u.assignedDepartment}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={14} className={isSelected ? (isDark ? 'text-zinc-200' : 'text-[#cc5a37]') : 'text-zinc-500'} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Inspector Console (7 cols) */}
        <div className="md:col-span-7 flex flex-col space-y-5">
          <div className="pb-2 border-b border-zinc-800/40">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Account Inspector & Scoping</span>
          </div>

          <AnimatePresence mode="wait">
            {!selectedUser ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-3">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-[#f0ede6] border-[#e5e2d9] text-zinc-400'}`}>
                  <User size={32} />
                </div>
                <span className="text-sm font-bold">No User Selected</span>
                <span className="text-xs text-zinc-500 max-w-[220px]">Select an account from the directory list to update roles or departments.</span>
              </div>
            ) : (
              <motion.div
                key={selectedUser._id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* Account Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-lg shadow-md ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-[#cc5a37] border-[#cc5a37] text-white'
                    }`}>
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-base tracking-tight truncate max-w-[240px]">{selectedUser.username}</h3>
                      <p className="text-[11px] text-zinc-500 font-mono">ID: {selectedUser._id}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono uppercase font-bold border ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-zinc-800'
                  }`}>
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
                  isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-[#f8f6f0] border-[#e5e2d9]'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/30">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                      <Globe size={13} /> Auth Method
                    </span>
                    <span className="font-mono text-zinc-400 font-medium">
                      {selectedUser.authProvider ? `${selectedUser.authProvider.toUpperCase()} OAuth` : 'Local Password'}
                    </span>
                  </div>

                  {selectedUser.assignedDepartment && (
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/30">
                      <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                        <Building size={13} /> Assigned Department
                      </span>
                      <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                        {selectedUser.assignedDepartment}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                      <Clock size={13} /> Registered Date
                    </span>
                    <span className="text-zinc-400 font-medium">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Role & Department Editor */}
                <div className={`p-4 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-[#f8f6f0] border-[#e5e2d9]'
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      <Shield size={14} /> Change Role
                    </span>
                    <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-[#e5e2d9]'
                    }`}>
                      {(['guest', 'faculty', 'admin'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRoleInput(r)}
                          className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer ${
                            roleInput === r
                              ? isDark ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-sm' : 'bg-[#cc5a37] text-white shadow-md'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {roleInput === 'faculty' && (
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40 flex-wrap gap-3">
                      <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                        <Building size={14} /> Target Department
                      </span>

                      <Select value={deptInput} onValueChange={(val) => setDeptInput(val)}>
                        <SelectTrigger className={`w-52 rounded-xl text-xs font-semibold ${
                          isDark
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-850'
                            : 'bg-white border-[#e5e2d9] text-[#191919] hover:bg-[#f0ede6]'
                        }`}>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                          {COMMON_DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept} className="text-xs font-medium cursor-pointer">
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleRoleDeptUpdate}
                      disabled={updatingRole}
                      className={`font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                        isDark
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 shadow-sm'
                          : 'bg-[#cc5a37] hover:bg-[#e05a47] text-white shadow-md'
                      }`}
                    >
                      {updatingRole ? 'Saving...' : 'Update Role & Dept'}
                    </button>
                  </div>
                </div>

                {/* Password Reset */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Reset Password
                  </label>
                  {selectedUser.authProvider && selectedUser.authProvider !== 'local' ? (
                    <div className={`p-3 rounded-2xl border text-xs text-zinc-400 ${
                      isDark ? 'border-zinc-800 bg-zinc-950/60' : 'border-[#e5e2d9] bg-white'
                    }`}>
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
                        <button
                          type="button"
                          onClick={() => handlePasswordReset(selectedUser._id)}
                          className={`font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                            isDark
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 shadow-sm'
                              : 'bg-[#cc5a37] hover:bg-[#e05a47] text-white shadow-md'
                          }`}
                        >
                          Save Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete Account Footer */}
                <div className={`border-t pt-4 flex justify-end ${isDark ? 'border-zinc-800/40' : 'border-[#e5e2d9]'}`}>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteUser(selectedUser)}
                    className={`font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer border ${
                      isDark
                        ? 'bg-red-950/40 hover:bg-red-900/50 text-red-400 border-red-800/50'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                    }`}
                  >
                    Delete User
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
    </div>
  );
}
