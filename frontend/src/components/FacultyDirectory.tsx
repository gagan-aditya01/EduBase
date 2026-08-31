import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Building, Globe, CheckSquare, Square, ChevronLeft, ChevronRight, Award, UserCheck, Shield } from 'lucide-react';

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

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-500/20 text-[#cc5a37] dark:bg-amber-500/20 dark:text-[#e05a47] px-0.5 rounded font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

const COMMON_DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'ADSE',
  'Mathematics',
  'Robotics',
];

export function FacultyDirectory({ currentUser, theme = 'dark' }: FacultyDirectoryProps) {
  const [facultyUsers, setFacultyUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const isDark = theme === 'dark';
  const itemsPerPage = 8;

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
        throw new Error(data.error || 'Failed to fetch faculty directory');
      }
      // Filter active faculty and admin staff
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

  // Filtering
  const filteredFaculty = facultyUsers.filter((f) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = f.username.toLowerCase().includes(query) || f._id.toLowerCase().includes(query);
    const deptMatch = deptFilter ? (f.assignedDepartment || '').toLowerCase() === deptFilter.toLowerCase() : true;
    return nameMatch && deptMatch;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredFaculty.length / itemsPerPage));
  const paginatedFaculty = filteredFaculty.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedFaculty.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedFaculty.map((f) => f._id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-850 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'}`}>
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Total Academic Staff</span>
            <span className="text-2xl font-extrabold tracking-tight">{facultyUsers.length}</span>
          </div>
        </div>

        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-850 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'}`}>
            <Award size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Active Departments</span>
            <span className="text-2xl font-extrabold tracking-tight">{COMMON_DEPARTMENTS.length}</span>
          </div>
        </div>

        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-850 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'}`}>
            <Shield size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Super Admin</span>
            <span className="text-xs font-bold font-mono text-zinc-400 truncate block max-w-[150px]">yashureddy4044</span>
          </div>
        </div>
      </div>

      {/* Filter Control Bar matching StudentList */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="relative flex-1 w-full max-w-md">
          <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter by Faculty Member Name or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none border transition-colors ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-zinc-700'
                : 'bg-[#f8f6f0] border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-[#cc5a37]/50'
            }`}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Building size={14} className="absolute left-3.5 top-3.5 text-zinc-500 pointer-events-none" />
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none border appearance-none transition-colors cursor-pointer ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700'
                  : 'bg-[#f8f6f0] border-[#e5e2d9] text-[#191919] focus:border-[#cc5a37]/50'
              }`}
            >
              <option value="">All Departments</option>
              {COMMON_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Main Table Matching StudentList */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'border-zinc-800/80 bg-zinc-950/60 text-zinc-500' : 'border-[#e5e2d9] bg-[#f8f6f0] text-zinc-650'
              }`}>
                <th className="p-4 w-10">
                  <button onClick={handleSelectAll} className="cursor-pointer text-zinc-500 hover:text-zinc-300">
                    {selectedIds.length === paginatedFaculty.length && paginatedFaculty.length > 0 ? (
                      <CheckSquare size={16} className={isDark ? 'text-zinc-200' : 'text-[#cc5a37]'} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Assigned Department</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Authentication Method</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/20 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-zinc-500">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500 inline-block mr-2 align-middle" />
                    Loading faculty directory...
                  </td>
                </tr>
              ) : paginatedFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-zinc-500 font-mono">
                    No matching faculty records found.
                  </td>
                </tr>
              ) : (
                paginatedFaculty.map((f) => {
                  const isSelected = selectedIds.includes(f._id);
                  return (
                    <motion.tr
                      key={f._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-colors ${
                        isSelected
                          ? isDark ? 'bg-zinc-800/50' : 'bg-[#f0ede6]'
                          : isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-[#fbfaf7]'
                      }`}
                    >
                      <td className="p-4">
                        <button onClick={() => handleSelectOne(f._id)} className="cursor-pointer text-zinc-500">
                          {isSelected ? (
                            <CheckSquare size={16} className={isDark ? 'text-zinc-200' : 'text-[#cc5a37]'} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                            isDark ? 'bg-zinc-850 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'
                          }`}>
                            {f.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-bold ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
                              <HighlightMatch text={f.username} query={searchQuery} />
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">ID: {f._id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-[#f8f6f0] border-[#e5e2d9] text-zinc-700'
                        }`}>
                          {f.assignedDepartment || 'All Departments (Super Admin)'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase font-bold border ${
                          f.role === 'admin'
                            ? isDark ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'
                            : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-zinc-800'
                        }`}>
                          {f.role}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Globe size={12} className="text-zinc-500" />
                          {f.authProvider ? `${f.authProvider.toUpperCase()} OAuth` : 'Local Password'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10">
                          Active Faculty
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          isDark ? 'border-zinc-800/80 text-zinc-400' : 'border-[#e5e2d9] text-zinc-650'
        }`}>
          <span>
            Showing <strong className="text-zinc-200">{paginatedFaculty.length}</strong> of{' '}
            <strong className="text-zinc-200">{filteredFaculty.length}</strong> faculty staff members
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-[#e5e2d9] hover:bg-[#f0ede6]'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-[#e5e2d9] hover:bg-[#f0ede6]'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
