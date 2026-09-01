import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckSquare, Square, ChevronLeft, ChevronRight, Edit2, Trash2, Key, Lock, Filter, X, CheckCircle2, ArrowUpDown, Users, UserCheck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/interfaces-select';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface DBUser {
  _id: string;
  username: string;
  role: 'admin' | 'guest' | 'faculty';
  facultyId?: string;
  status?: 'Active' | 'Inactive';
  assignedDepartment?: string;
  assignedSubjects?: string[];
  authProvider?: 'local' | 'google' | 'github';
  createdAt?: string;
}

interface FacultyDirectoryProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty' };
  theme?: 'light' | 'dark';
  addToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

type FacultySortOption = 'name_asc' | 'name_desc' | 'id_asc' | 'id_desc' | 'dept_asc' | 'status_active' | 'status_inactive';

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

export function FacultyDirectory({ currentUser, theme = 'dark', addToast }: FacultyDirectoryProps) {
  const [facultyUsers, setFacultyUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState<FacultySortOption>('name_asc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Add Faculty Drawer State
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyDept, setNewFacultyDept] = useState('Computer Science');
  const [newFacultyId, setNewFacultyId] = useState('');
  const [addSuccessMsg, setAddSuccessMsg] = useState('');
  const [addError, setAddError] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Modal State
  const [editingFaculty, setEditingFaculty] = useState<DBUser | null>(null);
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editDept, setEditDept] = useState('');
  const [updating, setUpdating] = useState(false);

  // Password-Protected Delete Modal State
  const [deletingFaculty, setDeletingFaculty] = useState<DBUser | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [newFacultySubjects, setNewFacultySubjects] = useState<string[]>([]);
  const [editFacultySubjects, setEditFacultySubjects] = useState<string[]>([]);

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
      const facultyOnly = data.filter((u: DBUser) => u.role === 'faculty');
      setFacultyUsers(facultyOnly);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:5050/api/v1/courses', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setAvailableCourses(data);
    } catch (err) {
      // Ignore fallback
    }
  };

  useEffect(() => {
    fetchFaculty();
    fetchCourses();
  }, []);

  const handleOpenAddDrawer = () => {
    setShowAddDrawer(true);
    setNewFacultyName('');
    setNewFacultyDept('Computer Science');
    setNewFacultySubjects([]);
    const random4 = Math.floor(1000 + Math.random() * 9000).toString();
    setNewFacultyId(random4);
    setAddSuccessMsg('');
    setAddError('');
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim()) {
      setAddError('Faculty member name is required');
      return;
    }
    if (!newFacultyId.trim() || newFacultyId.trim().length !== 4) {
      setAddError('Faculty ID must be exactly a 4-digit number');
      return;
    }

    try {
      setCreating(true);
      setAddError('');
      setAddSuccessMsg('');
      const res = await fetch('http://localhost:5050/api/auth/faculty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          username: newFacultyName.trim(),
          assignedDepartment: newFacultyDept,
          assignedSubjects: newFacultySubjects,
          facultyId: newFacultyId.trim(),
          status: 'Active',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add faculty member');
      }

      setFacultyUsers((prev) => [data, ...prev]);
      const reversedPass = newFacultyId.trim().split('').reverse().join('');
      setShowAddDrawer(false);
      if (addToast) {
        addToast('success', `Faculty ${newFacultyName.trim()} created! ID: ${newFacultyId.trim()} | Password: ${reversedPass}`);
      }
      setNewFacultyName('');
      const nextRandom = Math.floor(1000 + Math.random() * 9000).toString();
      setNewFacultyId(nextRandom);
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (faculty: DBUser) => {
    setEditingFaculty(faculty);
    setEditDept(faculty.assignedDepartment || 'Computer Science');
    setEditStatus(faculty.status || 'Active');
    setEditFacultySubjects(faculty.assignedSubjects || []);
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editingFaculty) return;
    try {
      setUpdating(true);
      setError('');
      const res = await fetch(`http://localhost:5050/api/auth/users/${editingFaculty._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          assignedDepartment: editDept,
          assignedSubjects: editFacultySubjects,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update faculty member');
      }

      setFacultyUsers((prev) =>
        prev.map((u) => (u._id === editingFaculty._id ? { ...u, status: editStatus, assignedDepartment: editDept } : u))
      );
      setEditingFaculty(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDelete = (f: DBUser) => {
    setDeletingFaculty(f);
    setAdminPasswordInput('');
    setDeleteError('');
  };

  const handleConfirmDeleteWithPassword = async () => {
    if (!deletingFaculty) return;
    if (!adminPasswordInput) {
      setDeleteError('Admin password verification is required');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');
      const res = await fetch(`http://localhost:5050/api/auth/users/${deletingFaculty._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ adminPassword: adminPasswordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete faculty member');
      }

      setFacultyUsers((prev) => prev.filter((u) => u._id !== deletingFaculty._id));
      setDeletingFaculty(null);
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Client-Side Filtering
  const filteredFaculty = facultyUsers.filter((f) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = f.username.toLowerCase().includes(query) || (f.facultyId || '').includes(query);
    const deptMatch = deptFilter && deptFilter !== 'ALL'
      ? (f.assignedDepartment || '').toLowerCase() === deptFilter.toLowerCase()
      : true;
    const statusMatch = statusFilter && statusFilter !== 'ALL'
      ? (f.status || 'Active').toLowerCase() === statusFilter.toLowerCase()
      : true;

    return nameMatch && deptMatch && statusMatch;
  });

  // Client-Side Sorting
  const sortedFaculty = [...filteredFaculty].sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return a.username.localeCompare(b.username);
      case 'name_desc':
        return b.username.localeCompare(a.username);
      case 'id_asc':
        return (a.facultyId || '').localeCompare(b.facultyId || '');
      case 'id_desc':
        return (b.facultyId || '').localeCompare(a.facultyId || '');
      case 'dept_asc':
        return (a.assignedDepartment || '').localeCompare(b.assignedDepartment || '');
      case 'status_active':
        return (a.status || 'Active') === 'Active' ? -1 : 1;
      case 'status_inactive':
        return (a.status || 'Active') === 'Inactive' ? -1 : 1;
      default:
        return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedFaculty.length / itemsPerPage));
  const paginatedFaculty = sortedFaculty.slice(
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setDeptFilter('ALL');
    setStatusFilter('ALL');
    setSortOption('name_asc');
    setCurrentPage(1);
  };

  const canManageFaculty = currentUser.role === 'admin' || currentUser.role === 'faculty';

  return (
    <div className="space-y-6">
      {/* Header Bar with Add Faculty Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Faculty Directory</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Manage academic staff profiles, departments, and login access</p>
        </div>

        {canManageFaculty && (
          <LiquidMetalButton
            label="Add Faculty"
            theme={theme}
            onClick={handleOpenAddDrawer}
          />
        )}
      </div>

      {/* Top Faculty KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total Faculty Staff Card */}
        <div className={`border p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm transition-all duration-300 ${
          isDark ? 'bg-zinc-900/30 border-zinc-800/80' : 'bg-[#f5f2eb] border-[#e5e2d9] shadow-sm'
        }`}>
          <div className={`border p-3 rounded-xl ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <Users size={20} />
          </div>
          <div>
            <span className={`block text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-zinc-500' : 'text-[#cc5a37]'
            }`}>
              Total Staff
            </span>
            <span className={`text-2xl font-bold tracking-tight ${
              isDark ? 'text-zinc-100' : 'text-[#191919]'
            }`}>
              {facultyUsers.length}
            </span>
          </div>
        </div>

        {/* Active Faculty Staff Card */}
        <div className={`border p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm transition-all duration-300 ${
          isDark ? 'bg-zinc-900/30 border-zinc-800/80' : 'bg-[#f5f2eb] border-[#e5e2d9] shadow-sm'
        }`}>
          <div className={`border p-3 rounded-xl ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            <UserCheck size={20} />
          </div>
          <div>
            <span className={`block text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-zinc-500' : 'text-[#cc5a37]'
            }`}>
              Active Staff
            </span>
            <span className={`text-2xl font-bold tracking-tight ${
              isDark ? 'text-zinc-100' : 'text-[#191919]'
            }`}>
              {facultyUsers.filter((f) => (f.status || 'Active') === 'Active').length}
            </span>
          </div>
        </div>
      </div>

      {/* Radix UI Filter & Sort Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col space-y-3 ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search Faculty Name or 4-Digit ID (e.g., 7538)..."
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

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            {/* Sort Combo Radix UI Select */}
            <div className="relative">
              <Select value={sortOption} onValueChange={(val: any) => setSortOption(val)}>
                <SelectTrigger className={`rounded-2xl text-xs font-bold px-3 py-2 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-700'
                }`}>
                  <ArrowUpDown size={12} className="mr-1.5 text-zinc-500" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                  <SelectItem value="name_asc" className="text-xs font-medium cursor-pointer">Alphabetical (A → Z)</SelectItem>
                  <SelectItem value="name_desc" className="text-xs font-medium cursor-pointer">Alphabetical (Z → A)</SelectItem>
                  <SelectItem value="id_asc" className="text-xs font-medium cursor-pointer">Faculty ID (Low → High)</SelectItem>
                  <SelectItem value="id_desc" className="text-xs font-medium cursor-pointer">Faculty ID (High → Low)</SelectItem>
                  <SelectItem value="dept_asc" className="text-xs font-medium cursor-pointer">Department Name (A → Z)</SelectItem>
                  <SelectItem value="status_active" className="text-xs font-medium cursor-pointer">Status (Active First)</SelectItem>
                  <SelectItem value="status_inactive" className="text-xs font-medium cursor-pointer">Status (Inactive First)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                showAdvancedFilters || (deptFilter && deptFilter !== 'ALL') || (statusFilter && statusFilter !== 'ALL')
                  ? isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-[#cc5a37] text-white border-[#cc5a37]'
                  : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-650 hover:bg-[#f0ede6]'
              }`}
            >
              <Filter size={13} />
              <span>Filters</span>
            </button>

            {(searchQuery || (deptFilter && deptFilter !== 'ALL') || (statusFilter && statusFilter !== 'ALL')) && (
              <button
                onClick={handleClearFilters}
                className={`text-xs font-bold px-3 py-2 rounded-2xl border transition-colors flex items-center gap-1 cursor-pointer ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-650 hover:bg-[#f0ede6]'
                }`}
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel matching StudentList */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pt-3 border-t border-zinc-800/40 flex items-center gap-4 flex-wrap"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Target Department:</span>
                <Select
                  value={deptFilter}
                  onValueChange={(val) => {
                    setDeptFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className={`w-52 rounded-2xl text-xs font-semibold ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-700'
                  }`}>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                    <SelectItem value="ALL" className="text-xs font-medium cursor-pointer">All Departments</SelectItem>
                    {COMMON_DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d} className="text-xs font-medium cursor-pointer">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Account Status:</span>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className={`w-40 rounded-2xl text-xs font-semibold ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-700'
                  }`}>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                    <SelectItem value="ALL" className="text-xs font-medium cursor-pointer">All Statuses</SelectItem>
                    <SelectItem value="Active" className="text-xs font-medium cursor-pointer">Active Only</SelectItem>
                    <SelectItem value="Inactive" className="text-xs font-medium cursor-pointer">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Main Table with 3D Page Flip Deck Animation */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div style={{ perspective: 1200 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              initial={{ rotateY: 75, opacity: 0, scale: 0.96 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: -75, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
              className="overflow-x-auto"
            >
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
                    <th className="p-4">Faculty ID</th>
                    <th className="p-4">Faculty Name</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Teaching Subjects</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
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
                      const facultyIdDisplay = f.facultyId || Math.floor(1000 + Math.random() * 9000).toString();
                      const isFacultyActive = (f.status || 'Active') === 'Active';

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

                          <td className={`p-4 font-mono font-bold text-xs ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                            <HighlightMatch text={facultyIdDisplay} query={searchQuery} />
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                                isDark ? 'bg-zinc-850 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'
                              }`}>
                                {f.username.charAt(0).toUpperCase()}
                              </div>
                              <span className={`font-bold ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
                                <HighlightMatch text={f.username} query={searchQuery} />
                              </span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
                              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-[#f8f6f0] border-[#e5e2d9] text-zinc-700'
                            }`}>
                              {f.assignedDepartment || 'Computer Science'}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap items-center gap-1.5 max-w-[220px]">
                              {f.assignedSubjects && f.assignedSubjects.length > 0 ? (
                                f.assignedSubjects.map((subCode) => {
                                  const matchedCourse = availableCourses.find((c) => c.courseCode === subCode);
                                  return (
                                    <span
                                      key={subCode}
                                      title={matchedCourse ? `${matchedCourse.title} (${matchedCourse.credits} Credits, ${matchedCourse.year})` : subCode}
                                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 cursor-help"
                                    >
                                      {subCode}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-[11px] text-zinc-500 italic">No subjects assigned</span>
                              )}
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isFacultyActive
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                            }`}>
                              {isFacultyActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(f)}
                                className={`p-1.5 rounded-xl border cursor-pointer transition-colors ${
                                  isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'border-[#e5e2d9] hover:bg-[#f0ede6] text-zinc-650'
                                }`}
                                title="Edit Status & Department"
                              >
                                <Edit2 size={13} />
                              </button>

                              {currentUser.role === 'admin' && (
                                <button
                                  onClick={() => handleOpenDelete(f)}
                                  className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                                  title="Delete Faculty Account (Requires Admin Password)"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Pagination */}
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

      {/* Add Faculty Member Right Side-Sheet Drawer */}
      <AnimatePresence>
        {showAddDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDrawer(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[90] cursor-pointer"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className={`fixed right-0 top-0 bottom-0 w-full max-w-md border-l z-[100] shadow-2xl p-6 overflow-y-auto ${
                isDark ? 'bg-zinc-950 border-zinc-900 text-zinc-100' : 'bg-[#fbfaf7] border-[#e5e2d9] text-[#191919]'
              }`}
            >
              <form onSubmit={handleCreateFaculty} className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Add New Faculty Member</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Enter the details below to create a faculty record.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddDrawer(false)}
                    className="p-1.5 rounded-full border border-zinc-800 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {addError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs">
                    {addError}
                  </div>
                )}

                {addSuccessMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl text-xs flex items-start gap-2">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <span>{addSuccessMsg}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Faculty Full Name / Academic Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. Evelyn Wright"
                      value={newFacultyName}
                      onChange={(e) => setNewFacultyName(e.target.value)}
                      className={`w-full rounded-2xl px-4 py-2.5 text-xs focus:outline-none border ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-600' : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Assigned Department
                    </label>
                    <Select value={newFacultyDept} onValueChange={(val) => setNewFacultyDept(val)}>
                      <SelectTrigger className={`w-full rounded-2xl text-xs font-semibold py-2.5 ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
                      }`}>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                        {COMMON_DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d} className="text-xs font-medium cursor-pointer">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      4-Digit Faculty ID
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g., 4921"
                      value={newFacultyId}
                      onChange={(e) => setNewFacultyId(e.target.value)}
                      className={`w-full rounded-2xl px-4 py-2.5 text-xs font-mono font-bold focus:outline-none border ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-600' : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Assign Teaching Subjects ({newFacultyDept})
                    </label>
                    <div className={`p-3 rounded-2xl border max-h-44 overflow-y-auto space-y-1.5 ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-[#f8f6f0] border-[#e5e2d9]'
                    }`}>
                      {availableCourses
                        .filter((c) => c.department.toLowerCase() === newFacultyDept.toLowerCase())
                        .map((course) => {
                          const isChecked = newFacultySubjects.includes(course.courseCode);
                          return (
                            <label
                              key={course.courseCode}
                              className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                                isChecked
                                  ? isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                                  : isDark ? 'hover:bg-zinc-800/60 text-zinc-300' : 'hover:bg-white text-zinc-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewFacultySubjects((prev) => [...prev, course.courseCode]);
                                    } else {
                                      setNewFacultySubjects((prev) => prev.filter((code) => code !== course.courseCode));
                                    }
                                  }}
                                  className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="font-mono font-bold text-indigo-400">{course.courseCode}</span>
                                <span className="truncate max-w-[180px]">{course.title}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500">{course.year} ({course.credits} Cr)</span>
                            </label>
                          );
                        })}
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border text-[11px] leading-relaxed ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400' : 'bg-[#f8f6f0] border-[#e5e2d9] text-zinc-600'
                  }`}>
                    💡 <strong>Instant Database Login Enabled:</strong> Password will be automatically set to the reversed 4-digit ID (e.g. for ID <code>{newFacultyId || '4921'}</code>, login password will be <code>{newFacultyId ? newFacultyId.split('').reverse().join('') : '1294'}</code>).
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <LiquidMetalButton
                    label={creating ? 'Saving...' : 'Add Faculty'}
                    theme={theme}
                    type="submit"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddDrawer(false)}
                    className={`px-4 py-2.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                      isDark
                        ? 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        : 'border-[#e5e2d9] text-zinc-600 hover:text-zinc-900 hover:border-zinc-400'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Status & Dept Right Side-Sheet Drawer */}
      <AnimatePresence>
        {editingFaculty && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingFaculty(null)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[90] cursor-pointer"
            />

            {/* Sliding panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className={`fixed right-0 top-0 bottom-0 w-full max-w-md border-l z-[100] shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between ${
                isDark ? 'bg-zinc-950 border-zinc-900 text-zinc-100' : 'bg-[#fbfaf7] border-[#e5e2d9] text-[#191919]'
              }`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Edit Faculty Member</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Update status and assigned department for {editingFaculty.username}</p>
                  </div>
                  <button
                    onClick={() => setEditingFaculty(null)}
                    className="p-1.5 rounded-full border border-zinc-800 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Faculty ID</label>
                    <div className={`p-3 rounded-2xl border font-mono font-bold text-xs ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-[#e5e2d9] text-zinc-800'
                    }`}>
                      {editingFaculty.facultyId || '4821'}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Account Status</label>
                    <div className="flex gap-2">
                      {(['Active', 'Inactive'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setEditStatus(st)}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                            editStatus === st
                              ? isDark ? 'bg-zinc-800 border-zinc-700 text-white shadow-sm' : 'bg-[#cc5a37] text-white border-[#cc5a37] shadow-md'
                              : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-white border-[#e5e2d9] text-zinc-650'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Assigned Department</label>
                    <Select value={editDept} onValueChange={(val) => setEditDept(val)}>
                      <SelectTrigger className={`w-full rounded-2xl text-xs font-semibold py-2.5 ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
                      }`}>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                        {COMMON_DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d} className="text-xs font-medium cursor-pointer">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Assign Teaching Subjects ({editDept})
                    </label>
                    <div className={`p-3 rounded-2xl border max-h-44 overflow-y-auto space-y-1.5 ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-[#f8f6f0] border-[#e5e2d9]'
                    }`}>
                      {availableCourses
                        .filter((c) => c.department.toLowerCase() === editDept.toLowerCase())
                        .map((course) => {
                          const isChecked = editFacultySubjects.includes(course.courseCode);
                          return (
                            <label
                              key={course.courseCode}
                              className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                                isChecked
                                  ? isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                                  : isDark ? 'hover:bg-zinc-800/60 text-zinc-300' : 'hover:bg-white text-zinc-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditFacultySubjects((prev) => [...prev, course.courseCode]);
                                    } else {
                                      setEditFacultySubjects((prev) => prev.filter((code) => code !== course.courseCode));
                                    }
                                  }}
                                  className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="font-mono font-bold text-indigo-400">{course.courseCode}</span>
                                <span className="truncate max-w-[180px]">{course.title}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500">{course.year} ({course.credits} Cr)</span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/40">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={updating}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-md ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700' : 'bg-[#cc5a37] hover:bg-[#e05a47] text-white'
                  }`}
                >
                  {updating ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFaculty(null)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'border-[#e5e2d9] text-zinc-650 hover:bg-[#f0ede6]'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Password Protected Deletion Modal */}
      <AnimatePresence>
        {deletingFaculty && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingFaculty(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative z-10 w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-[#e5e2d9] text-[#191919]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Admin Password Authentication Required</h3>
                  <p className="text-xs text-zinc-500">Confirm deletion of faculty member "{deletingFaculty.username}"</p>
                </div>
              </div>

              {deleteError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs">
                  {deleteError}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400 block">Enter Admin Password</label>
                <div className="relative">
                  <Key size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
                  <input
                    type="password"
                    placeholder="Enter your admin password to confirm..."
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className={`w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none border ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-600' : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/40">
                <button
                  type="button"
                  onClick={() => setDeletingFaculty(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    isDark ? 'border-zinc-800 text-zinc-400' : 'border-[#e5e2d9] text-zinc-650'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteWithPassword}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all"
                >
                  {deleting ? 'Deleting...' : 'Verify & Delete Faculty'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
