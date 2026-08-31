import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Building, Search, Globe } from 'lucide-react';

interface DBUser {
  _id: string;
  username: string;
  role: 'admin' | 'guest' | 'faculty';
  assignedDepartment?: string;
  authProvider?: 'local' | 'google' | 'github';
  createdAt?: string;
}

interface FacultyDirectoryProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty' };
  theme?: 'light' | 'dark';
}

export function FacultyDirectory({ currentUser, theme = 'dark' }: FacultyDirectoryProps) {
  const [facultyUsers, setFacultyUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isDark = theme === 'dark';

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5050/api/auth/users', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch directory');
      }
      const facultyOnly = data.filter((u: DBUser) => u.role === 'faculty' || u.role === 'admin');
      setFacultyUsers(facultyOnly);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const filteredFaculty = facultyUsers.filter((f) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = f.username.toLowerCase().includes(query);
    const deptMatch = f.assignedDepartment ? f.assignedDepartment.toLowerCase().includes(query) : false;
    const roleMatch = f.role.toLowerCase().includes(query);
    return nameMatch || deptMatch || roleMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Faculty Member, Department, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none border transition-colors ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-zinc-700'
                : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-[#cc5a37]/50'
            }`}
          />
        </div>

        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-[#f0ede6] border-[#e5e2d9] text-zinc-700'
        }`}>
          {filteredFaculty.length} Academic Staff Members
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Grid of Faculty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center p-12 text-zinc-500 text-xs">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500 inline-block mr-2 align-middle" />
            Fetching faculty directory...
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="col-span-full text-center p-12 text-zinc-500 text-xs font-mono">
            No matching faculty members found.
          </div>
        ) : (
          filteredFaculty.map((f, index) => (
            <motion.div
              key={f._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition-all shadow-sm ${
                isDark
                  ? 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700'
                  : 'bg-white border-[#e5e2d9] hover:bg-[#fbfaf7] hover:border-[#cc5a37]/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold text-sm shadow-sm ${
                    isDark ? 'bg-zinc-850 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'
                  }`}>
                    {f.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm truncate">{f.username}</span>
                    <span className="text-[10px] font-mono text-zinc-500">ID: {f._id}</span>
                  </div>
                </div>

                <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold border ${
                  f.role === 'admin'
                    ? isDark ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'
                    : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-zinc-800'
                }`}>
                  {f.role}
                </span>
              </div>

              <div className={`p-3 rounded-2xl border space-y-2 text-xs ${
                isDark ? 'bg-zinc-950/60 border-zinc-850' : 'bg-[#f8f6f0] border-[#e5e2d9]'
              }`}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                    <Building size={12} /> Assigned Dept
                  </span>
                  <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {f.assignedDepartment || 'All Departments (Super Admin)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                    <Globe size={12} /> Auth Provider
                  </span>
                  <span className="font-mono text-zinc-400">
                    {f.authProvider ? `${f.authProvider.toUpperCase()} OAuth` : 'Local Password'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <UserCheck size={12} className="text-emerald-500" /> Active Teaching Staff
                </span>
                <span className="font-mono">
                  {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
