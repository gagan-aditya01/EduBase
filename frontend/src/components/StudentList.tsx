import React, { useState } from 'react';
import { Trash2, Edit2, Search, CheckSquare, Square, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, User, Calendar, Award, Filter, X, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/interfaces-select';

interface Student {
  studentId: string;
  name: string;
  age: number;
  department: string;
  year?: string;
  section?: string;
  createdBy?: string;
  createdAt?: string;
}

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onBulkDelete: (studentIds: string[]) => void;
  filters: {
    studentId: string;
    name: string;
    department: string;
    minAge: string;
    maxAge: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      studentId: string;
      name: string;
      department: string;
      minAge: string;
      maxAge: string;
    }>
  >;
  onClearFilters: () => void;
  isLoading?: boolean;
  theme?: 'light' | 'dark';
  isAdmin?: boolean;
}

type SortOption = 'name_asc' | 'name_desc' | 'id_asc' | 'id_desc' | 'year_asc' | 'age_asc' | 'age_desc';

const COMMON_DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'ADSE',
  'Mathematics',
  'Robotics',
];

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

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

export function StudentList({
  students,
  onEdit,
  onDelete,
  onBulkDelete,
  filters,
  setFilters,
  onClearFilters,
  isLoading = false,
  theme = 'dark',
  isAdmin = false,
}: StudentListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const isDark = theme === 'dark';

  // Client-side filtering logic
  const filteredStudents = students.filter((student) => {
    const query = (filters.name || filters.studentId).toLowerCase();
    const matchesId = student.studentId.toLowerCase().includes(query);
    const matchesName = student.name.toLowerCase().includes(query);
    const matchesDept = filters.department && filters.department !== 'ALL'
      ? student.department.toLowerCase() === filters.department.toLowerCase()
      : true;
    const matchesYear = yearFilter && yearFilter !== 'ALL'
      ? (student.year || '').toLowerCase() === yearFilter.toLowerCase()
      : true;

    return (matchesId || matchesName) && matchesDept && matchesYear;
  });

  // Client-side sorting logic
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'id_asc':
        return a.studentId.localeCompare(b.studentId);
      case 'id_desc':
        return b.studentId.localeCompare(a.studentId);
      case 'year_asc':
        return (a.year || '').localeCompare(b.year || '');
      case 'age_asc':
        return a.age - b.age;
      case 'age_desc':
        return b.age - a.age;
      default:
        return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / itemsPerPage));
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedStudents.map((s) => s.studentId));
    }
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleExpand = (studentId: string) => {
    setExpandedStudentId((prev) => (prev === studentId ? null : studentId));
  };

  return (
    <div className="space-y-4">
      {/* Search & Radix UI Filter Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col space-y-3 ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search Student Name or Registration Number (e.g., 2462236)..."
              value={filters.name || filters.studentId}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, name: e.target.value, studentId: e.target.value }));
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
            {/* Professional Sort Combo Radix UI Select */}
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
                  <SelectItem value="id_asc" className="text-xs font-medium cursor-pointer">Reg Number (Oldest → Newest)</SelectItem>
                  <SelectItem value="id_desc" className="text-xs font-medium cursor-pointer">Reg Number (Newest → Oldest)</SelectItem>
                  <SelectItem value="year_asc" className="text-xs font-medium cursor-pointer">Academic Year (1st → 4th)</SelectItem>
                  <SelectItem value="age_asc" className="text-xs font-medium cursor-pointer">Age (Youngest First)</SelectItem>
                  <SelectItem value="age_desc" className="text-xs font-medium cursor-pointer">Age (Oldest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                showAdvancedFilters || (filters.department && filters.department !== 'ALL') || (yearFilter && yearFilter !== 'ALL')
                  ? isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-[#cc5a37] text-white border-[#cc5a37]'
                  : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-650 hover:bg-[#f0ede6]'
              }`}
            >
              <Filter size={13} />
              <span>Filters</span>
            </button>

            {(filters.name || filters.studentId || (filters.department && filters.department !== 'ALL') || (yearFilter && yearFilter !== 'ALL')) && (
              <button
                onClick={() => {
                  onClearFilters();
                  setYearFilter('ALL');
                }}
                className={`text-xs font-bold px-3 py-2 rounded-2xl border transition-colors flex items-center gap-1 cursor-pointer ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-650 hover:bg-[#f0ede6]'
                }`}
              >
                <X size={13} /> Clear
              </button>
            )}

            {selectedIds.length > 0 && isAdmin && (
              <button
                onClick={() => onBulkDelete(selectedIds)}
                className="text-xs font-bold px-4 py-2 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} /> Delete ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Radix UI Filter Panel matching Manage Users */}
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
                  value={filters.department || 'ALL'}
                  onValueChange={(val) => {
                    setFilters((prev) => ({ ...prev, department: val }));
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
                    {COMMON_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-xs font-medium cursor-pointer">{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Academic Year:</span>
                <Select
                  value={yearFilter}
                  onValueChange={(val) => {
                    setYearFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className={`w-44 rounded-2xl text-xs font-semibold ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-700'
                  }`}>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                    <SelectItem value="ALL" className="text-xs font-medium cursor-pointer">All Academic Years</SelectItem>
                    {ACADEMIC_YEARS.map((yr) => (
                      <SelectItem key={yr} value={yr} className="text-xs font-medium cursor-pointer">{yr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Table Container with 3D Page Flip Deck Animation */}
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
                        {selectedIds.length === paginatedStudents.length && paginatedStudents.length > 0 ? (
                          <CheckSquare size={16} className={isDark ? 'text-zinc-200' : 'text-[#cc5a37]'} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="p-4">Reg Number</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Section</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800/20 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-zinc-500">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500 inline-block mr-2 align-middle" />
                        Loading student directory...
                      </td>
                    </tr>
                  ) : paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-zinc-500 font-mono">
                        No matching student records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => {
                      const isSelected = selectedIds.includes(student.studentId);
                      const isExpanded = expandedStudentId === student.studentId;

                      return (
                        <React.Fragment key={student.studentId}>
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => toggleExpand(student.studentId)}
                            className={`transition-colors cursor-pointer select-none ${
                              isSelected
                                ? isDark ? 'bg-zinc-800/50' : 'bg-[#f0ede6]'
                                : isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-[#fbfaf7]'
                            }`}
                          >
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <button onClick={(e) => handleSelectOne(student.studentId, e)} className="cursor-pointer text-zinc-500">
                                {isSelected ? (
                                  <CheckSquare size={16} className={isDark ? 'text-zinc-200' : 'text-[#cc5a37]'} />
                                ) : (
                                  <Square size={16} />
                                )}
                              </button>
                            </td>

                            <td className={`p-4 font-mono font-bold text-xs ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                              <HighlightMatch text={student.studentId} query={filters.studentId} />
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isDark ? 'bg-zinc-850 border-zinc-700 text-zinc-200' : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'
                                }`}>
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                                <span className={`font-bold ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
                                  <HighlightMatch text={student.name} query={filters.name} />
                                </span>
                              </div>
                            </td>

                            <td className="p-4">
                              <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
                                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-[#f8f6f0] border-[#e5e2d9] text-zinc-700'
                              }`}>
                                <HighlightMatch text={student.department} query={filters.department} />
                              </span>
                            </td>

                            <td className={`p-4 font-bold text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                              {student.section || '3CS'}
                            </td>

                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                {isAdmin && (
                                  <>
                                    <button
                                      onClick={() => onEdit(student)}
                                      className={`p-1.5 rounded-xl border cursor-pointer transition-colors ${
                                        isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'border-[#e5e2d9] hover:bg-[#f0ede6] text-zinc-650'
                                      }`}
                                      title="Edit Record"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => onDelete(student.studentId)}
                                      className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                                      title="Delete Record"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => toggleExpand(student.studentId)}
                                  className={`p-1.5 rounded-xl border cursor-pointer ${
                                    isDark ? 'border-zinc-800 text-zinc-500' : 'border-[#e5e2d9] text-zinc-650'
                                  }`}
                                >
                                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                </button>
                              </div>
                            </td>
                          </motion.tr>

                          {/* Expandable Details Accordion Row */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={isDark ? 'bg-zinc-950/80' : 'bg-[#f8f6f0]'}
                              >
                                <td colSpan={6} className="p-5">
                                  <div className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs ${
                                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-[#e5e2d9]'
                                  }`}>
                                    <div className="flex items-center gap-2.5">
                                      <User size={15} className="text-zinc-500" />
                                      <div>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase block">Student Age</span>
                                        <span className="font-bold text-sm">{student.age} years old</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                      <Award size={15} className="text-zinc-500" />
                                      <div>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase block">Added By Staff</span>
                                        <span className="font-bold text-xs truncate block max-w-[180px]">{student.createdBy || 'dr.sarah.jenkins@edubase.edu'}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                      <Calendar size={15} className="text-zinc-500" />
                                      <div>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase block">Enrollment Status</span>
                                        <span className="font-bold text-xs text-emerald-500">Active Student Record ({student.year || '3rd Year'})</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
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
            Showing <strong className="text-zinc-200">{paginatedStudents.length}</strong> of{' '}
            <strong className="text-zinc-200">{filteredStudents.length}</strong> enrolled students
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
