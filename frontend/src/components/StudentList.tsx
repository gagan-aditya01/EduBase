import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Filter, X, CheckSquare, Square, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
  studentId: string;
  name: string;
  age: number;
  department: string;
  createdBy?: string;
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
  const [page, setPage] = useState(1);
  const [dir, setDir] = useState(1); // 1 = Next, -1 = Prev
  const isDark = theme === 'dark';

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const paginatedStudents = students.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedStudents.map((s) => s.studentId));
    }
  };

  const handleBulkDeleteClick = () => {
    onBulkDelete(selectedIds);
    setSelectedIds([]);
  };

  const allSelected = paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length;

  // 3D Deck Card Shuffle animation variants
  const cardShuffleVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 120 : -120,
      rotateY: direction > 0 ? 45 : -45,
      scale: 0.9,
      opacity: 0,
    }),
    animate: {
      x: 0,
      rotateY: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 140,
        damping: 16,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -120 : 120,
      rotateY: direction > 0 ? -45 : 45,
      scale: 0.9,
      opacity: 0,
      transition: {
        duration: 0.22,
      },
    }),
  };

  return (
    <div className="flex-1 space-y-6 relative">
      {/* Filter panel */}
      <div className={`border p-5 rounded-2xl space-y-4 backdrop-blur-sm transition-colors duration-300 ${
        isDark ? 'bg-zinc-900/30 border-zinc-800/80' : 'bg-[#f5f2eb] border-[#e5e2d9]'
      }`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 font-medium transition-colors ${isDark ? 'text-zinc-300' : 'text-[#191919]'}`}>
            <Filter size={16} />
            <span className="tracking-tight text-sm">Filter Students</span>
            {isLoading && (
              <span className={`animate-spin rounded-full h-3 w-3 border-b-2 ml-1.5 inline-block ${isDark ? 'border-zinc-400' : 'border-zinc-700'}`}></span>
            )}
          </div>
          {(filters.studentId || filters.name || filters.department || filters.minAge || filters.maxAge) && (
            <button
              onClick={onClearFilters}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X size={12} /> Clear all filters
            </button>
          )}
          <button
            onClick={() => {
              if (!students || students.length === 0) return;
              const headers = ['Student ID', 'Name', 'Age', 'Department', 'Created By'];
              const rows = students.map((s) => [
                `"${s.studentId}"`,
                `"${s.name.replace(/"/g, '""')}"`,
                s.age,
                `"${s.department.replace(/"/g, '""')}"`,
                `"${s.createdBy || 'Admin'}"`,
              ]);
              const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `edubase_students_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer font-medium ml-auto ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-300 shadow-xs'
            }`}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Filter by ID..."
            value={filters.studentId}
            onChange={(e) => setFilters((prev) => ({ ...prev, studentId: e.target.value }))}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors focus:outline-none ${
              isDark
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-700'
                : 'bg-white border border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-zinc-400'
            }`}
          />

          <input
            type="text"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors focus:outline-none ${
              isDark
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-700'
                : 'bg-white border border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-zinc-400'
            }`}
          />

          <input
            type="text"
            placeholder="Filter by department..."
            value={filters.department}
            onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors focus:outline-none ${
              isDark
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-700'
                : 'bg-white border border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-zinc-400'
            }`}
          />

          <input
            type="number"
            placeholder="Min age"
            value={filters.minAge}
            onChange={(e) => setFilters((prev) => ({ ...prev, minAge: e.target.value }))}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors focus:outline-none ${
              isDark
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-700'
                : 'bg-white border border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-zinc-400'
            }`}
          />

          <input
            type="number"
            placeholder="Max age"
            value={filters.maxAge}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxAge: e.target.value }))}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors focus:outline-none ${
              isDark
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-700'
                : 'bg-white border border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-zinc-400'
            }`}
          />
        </div>
      </div>

      {/* List / Table Wrapper with AnimatePresence */}
      <div style={{ perspective: 1200 }}>
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={page}
            custom={dir}
            variants={cardShuffleVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ transformStyle: 'preserve-3d' }}
            className={`border rounded-2xl overflow-hidden backdrop-blur-sm transition-colors duration-300 ${
              isDark ? 'bg-zinc-900/30 border-zinc-800/80' : 'bg-white border-[#e5e2d9] shadow-sm'
            }`}
          >
            {students.length === 0 && !isLoading ? (
              <div className="p-12 text-center text-zinc-500">
                No students found matching current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'border-zinc-800 text-zinc-400 bg-zinc-950/20' : 'border-[#e5e2d9] text-zinc-500 bg-[#f5f2eb]'
                    }`}>
                      {isAdmin && (
                        <th className="p-4 pl-6 w-12 text-center">
                          <button
                            onClick={handleSelectAll}
                            className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                          >
                            {allSelected ? (
                              <CheckSquare size={16} className={isDark ? 'text-zinc-300' : 'text-zinc-700'} />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </th>
                      )}
                      <th className="p-4">ID</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Age</th>
                      <th className="p-4">Department</th>
                      {isAdmin && <th className="p-4 pr-6 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-zinc-800/50' : 'divide-[#e5e2d9]/50'}`}>
                    {isLoading
                      ? Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={`skeleton-${idx}`} className="animate-shimmer">
                            {isAdmin && (
                              <td className="p-4 text-center">
                                <div className={`h-4 w-4 rounded mx-auto ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-300/50'}`}></div>
                              </td>
                            )}
                            <td className="p-4">
                              <div className={`h-4 rounded w-16 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-300/50'}`}></div>
                            </td>
                            <td className="p-4">
                              <div className={`h-4 rounded w-32 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-300/50'}`}></div>
                            </td>
                            <td className="p-4">
                              <div className={`h-4 rounded w-8 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-300/50'}`}></div>
                            </td>
                            <td className="p-4">
                              <div className={`h-5 border rounded w-24 ${isDark ? 'bg-zinc-800/30 border-zinc-800/60' : 'bg-zinc-200/40 border-zinc-300/40'}`}></div>
                            </td>
                            {isAdmin && (
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <div className={`h-7 w-7 rounded ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-300/50'}`}></div>
                                  <div className={`h-7 w-7 rounded ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-300/50'}`}></div>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      : paginatedStudents.map((student, index) => (
                          <motion.tr
                            key={student.studentId}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.035 }}
                            className={`transition-colors text-sm border-b ${
                              isDark
                                ? 'border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/10'
                                : 'border-[#e5e2d9]/50 text-[#191919] hover:bg-[#f5f2eb]/45'
                            } ${
                              isAdmin && selectedIds.includes(student.studentId)
                                ? isDark
                                  ? 'bg-zinc-800/20'
                                  : 'bg-amber-100/30'
                                : ''
                            }`}
                          >
                            {isAdmin && (
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleSelectRow(student.studentId)}
                                  className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                                >
                                  {selectedIds.includes(student.studentId) ? (
                                    <CheckSquare size={16} className={isDark ? 'text-zinc-300' : 'text-zinc-700'} />
                                  ) : (
                                    <Square size={16} />
                                  )}
                                </button>
                              </td>
                            )}
                            <td className="p-4 font-mono text-zinc-500">
                              <HighlightMatch text={student.studentId} query={filters.studentId} />
                            </td>
                            <td className={`p-4 font-medium ${isDark ? 'text-zinc-200' : 'text-[#191919]'}`}>
                              <HighlightMatch text={student.name} query={filters.name} />
                            </td>
                            <td className="p-4">{student.age}</td>
                             <td className="p-4">
                               <div className="flex flex-col gap-1 items-start">
                                 <span className={`border px-2 py-0.5 rounded text-xs ${
                                   isDark
                                     ? 'bg-zinc-800/40 text-zinc-400 border-zinc-800'
                                     : 'bg-[#f5f2eb] text-zinc-600 border-[#e5e2d9]'
                                 }`}>
                                   <HighlightMatch text={student.department} query={filters.department} />
                                 </span>
                                 {student.createdBy && (
                                   <span className="text-[10px] text-zinc-500 font-mono">
                                     by @{student.createdBy}
                                   </span>
                                 )}
                               </div>
                             </td>
                            {isAdmin && (
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => onEdit(student)}
                                    className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40 rounded transition-all cursor-pointer"
                                    title="Edit student"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    onClick={() => onDelete(student.studentId)}
                                    className="p-1.5 text-zinc-500 hover:text-red-450 hover:bg-red-950/20 rounded transition-all cursor-pointer"
                                    title="Delete student"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </motion.tr>
                        ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Navigation Panel */}
            {totalPages > 1 && (
              <div className={`p-4 border-t flex items-center justify-between transition-colors duration-300 ${
                isDark ? 'border-zinc-800 bg-zinc-950/10' : 'border-[#e5e2d9] bg-[#f5f2eb]/40'
              }`}>
                <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, students.length)} of {students.length} students
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => {
                      setDir(-1);
                      setPage((p) => Math.max(p - 1, 1));
                    }}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                      isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-[#e5e2d9] hover:bg-[#e5e2d9]/45 text-zinc-600'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className={`text-xs font-semibold px-2 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => {
                      setDir(1);
                      setPage((p) => Math.min(p + 1, totalPages));
                    }}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                      isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-[#e5e2d9] hover:bg-[#e5e2d9]/45 text-zinc-600'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Action Banner for Bulk Actions */}
      <AnimatePresence>
        {isAdmin && selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 border py-3 px-6 rounded-full shadow-2xl z-30 flex items-center gap-6 transition-colors duration-300 ${
              isDark ? 'bg-zinc-950 border-zinc-850' : 'bg-white border-[#e5e2d9]'
            }`}
          >
            <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {selectedIds.length} Selected
            </span>
            <button
              onClick={handleBulkDeleteClick}
              className="flex items-center gap-2 bg-red-650 hover:bg-red-750 text-white font-semibold text-xs py-1.5 px-4 rounded-full border border-red-500/20 shadow-lg transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              Delete Selected
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
