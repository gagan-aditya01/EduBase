import React, { useState } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface CsvImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
  userToken: string;
  userRole?: string;
  assignedDepartment?: string;
  theme?: 'light' | 'dark';
}

interface ParsedRecord {
  id: string;
  studentId: string;
  name: string;
  age: number;
  department: string;
  year?: string;
  section?: string;
  isValid: boolean;
  errorReason?: string;
}

export function CsvImporterModal({
  isOpen,
  onClose,
  onSuccess,
  userToken,
  userRole,
  assignedDepartment,
  theme = 'dark',
}: CsvImporterModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [records, setRecords] = useState<ParsedRecord[]>([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDark = theme === 'dark';
  const isFaculty = userRole === 'faculty';

  if (!isOpen) return null;

  const parseCsvText = (csvText: string) => {
    setErrorMsg('');
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      setErrorMsg('CSV file is empty or missing data rows.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    const idIdx = headers.findIndex((h) => h.includes('studentid') || h === 'id' || h.includes('reg'));
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const ageIdx = headers.findIndex((h) => h.includes('age'));
    const deptIdx = headers.findIndex((h) => h.includes('department') || h.includes('dept'));
    const yearIdx = headers.findIndex((h) => h.includes('year'));
    const secIdx = headers.findIndex((h) => h.includes('section') || h.includes('sec'));

    if (idIdx === -1 || nameIdx === -1 || deptIdx === -1) {
      setErrorMsg('CSV header must contain studentId, name, and department columns.');
      return;
    }

    const parsed: ParsedRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 3) continue;

      const rawId = cols[idIdx] || '';
      const rawName = cols[nameIdx] || '';
      const rawAge = parseInt(cols[ageIdx] || '20', 10);
      const rawDept = cols[deptIdx] || '';
      const rawYear = yearIdx !== -1 ? cols[yearIdx] : '3rd Year';
      const rawSec = secIdx !== -1 ? cols[secIdx] : '3CS';

      let isValid = true;
      let errorReason = '';

      if (!rawId) {
        isValid = false;
        errorReason = 'Missing Student Registration ID';
      } else if (!rawName) {
        isValid = false;
        errorReason = 'Missing Student Name';
      } else if (isNaN(rawAge) || rawAge < 16 || rawAge > 90) {
        isValid = false;
        errorReason = 'Age must be a number between 16 and 90';
      } else if (!rawDept) {
        isValid = false;
        errorReason = 'Missing Department';
      } else if (isFaculty && assignedDepartment && rawDept.toLowerCase() !== assignedDepartment.toLowerCase()) {
        isValid = false;
        errorReason = `Faculty can only import for assigned department (${assignedDepartment})`;
      }

      parsed.push({
        id: `row-${i}`,
        studentId: rawId,
        name: rawName,
        age: isNaN(rawAge) ? 20 : rawAge,
        department: rawDept,
        year: rawYear,
        section: rawSec,
        isValid,
        errorReason,
      });
    }

    setRecords(parsed);
  };

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid CSV (.csv) file.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = () => {
    const sampleDept = isFaculty && assignedDepartment ? assignedDepartment : 'Computer Science';
    const sampleCsv = `studentId,name,age,department,year,section
2462101,Aarav Sharma,21,${sampleDept},3rd Year,3CS
2462102,Priya Patel,20,${sampleDept},3rd Year,3CS
2563103,Rohan Verma,19,${sampleDept},2nd Year,2CS`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edubase_sample_import.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validRecords = records.filter((r) => r.isValid);

  const handleImportSubmit = async () => {
    if (validRecords.length === 0) return;

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await fetch('http://localhost:5050/api/v1/students/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ students: validRecords }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process CSV batch import');
      }

      onSuccess(data.importedCount || validRecords.length);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className={`relative z-[120] w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-[#e5e2d9] text-[#191919]'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-800/80 bg-zinc-900/30' : 'border-[#e5e2d9] bg-[#f8f6f0]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UploadCloud size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Bulk CSV Drag-and-Drop Importer</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Upload, validate, and batch import student records into database</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-2xl border transition-colors cursor-pointer ${
              isDark ? 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'border-[#e5e2d9] text-zinc-650 hover:bg-[#f0ede6]'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : isDark
                ? 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                : 'border-[#e5e2d9] bg-[#f8f6f0]/60 hover:border-zinc-400'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                <FileText size={28} />
              </div>
              <span className="font-bold text-sm">
                {fileName ? fileName : 'Drag and drop your CSV file here, or click to browse'}
              </span>
              <span className="text-xs text-zinc-500 mt-1">Supports standard .csv file format up to 5MB</span>
            </label>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadSample();
              }}
              className={`mt-4 px-3.5 py-1.5 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark ? 'border-zinc-800 text-zinc-400 hover:text-zinc-200 bg-zinc-900' : 'border-[#e5e2d9] text-zinc-700 hover:bg-white'
              }`}
            >
              <Download size={13} />
              Download Sample CSV Template
            </button>
          </div>

          {/* Validation Preview Section */}
          {records.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-400">
                  Parsed Records ({records.length} Rows):
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-mono">
                    {validRecords.length} Valid
                  </span>
                  <span className="text-red-400 font-mono">
                    {records.length - validRecords.length} Invalid
                  </span>
                </div>
              </div>

              {/* Table Preview */}
              <div className={`rounded-2xl border overflow-hidden max-h-60 overflow-y-auto ${
                isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-[#e5e2d9] bg-white'
              }`}>
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-[#e5e2d9] bg-[#f8f6f0]'}`}>
                    <tr>
                      <th className="p-3">Status</th>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Sec</th>
                      <th className="p-3">Validation Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {records.map((r) => (
                      <tr key={r.id} className={r.isValid ? '' : 'bg-red-500/5'}>
                        <td className="p-3">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 size={10} /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                              <AlertCircle size={10} /> Invalid
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold">{r.studentId || '—'}</td>
                        <td className="p-3 font-bold">{r.name || '—'}</td>
                        <td className="p-3">{r.department || '—'}</td>
                        <td className="p-3 font-mono">{r.section || '3CS'}</td>
                        <td className="p-3 text-[11px] text-zinc-400">{r.isValid ? 'Ready for import' : r.errorReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-zinc-800/80 bg-zinc-900/30' : 'border-[#e5e2d9] bg-[#f8f6f0]'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-2xl border text-xs font-bold cursor-pointer transition-colors ${
              isDark ? 'border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'border-[#e5e2d9] text-zinc-650'
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleImportSubmit}
            disabled={loading || validRecords.length === 0}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
              validRecords.length > 0 && !loading
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800'
            }`}
          >
            {loading ? 'Importing Batch...' : `Import ${validRecords.length} Valid Records`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
