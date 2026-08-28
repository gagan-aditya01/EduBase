import React, { useState, useEffect } from 'react';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface Student {
  studentId: string;
  name: string;
  age: number;
  department: string;
}

interface StudentFormProps {
  onSubmit: (student: Omit<Student, '_id'>) => void;
  initialData?: Student | null;
  onCancel?: () => void;
  theme?: 'light' | 'dark';
}

export function StudentForm({ onSubmit, initialData, onCancel, theme = 'dark' }: StudentFormProps) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (initialData) {
      setStudentId(initialData.studentId);
      setName(initialData.name);
      setAge(String(initialData.age));
      setDepartment(initialData.department);
    } else {
      setStudentId('');
      setName('');
      setAge('');
      setDepartment('');
    }
    setError('');
  }, [initialData]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check empty fields
    if (!studentId.trim() || !name.trim() || !age.trim() || !department.trim()) {
      setError('All fields are required');
      triggerShake();
      return;
    }

    // Validate studentId format (alphanumeric, dashes, underscores)
    const idRegex = /^[a-zA-Z0-9_-]+$/;
    if (!idRegex.test(studentId)) {
      setError('Student ID must be alphanumeric (letters, numbers, -, _)');
      triggerShake();
      return;
    }

    // Validate age range
    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 90) {
      setError('Age must be a number between 16 and 90');
      triggerShake();
      return;
    }

    onSubmit({
      studentId: studentId.trim(),
      name: name.trim(),
      age: parsedAge,
      department: department.trim(),
    });
    
    // Reset if adding new
    if (!initialData) {
      setStudentId('');
      setName('');
      setAge('');
      setDepartment('');
    }
    setError('');
  };

  const inputClass = `w-full rounded-lg px-3.5 py-2 focus:outline-none transition-colors ${
    isDark
      ? 'bg-zinc-950 border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 placeholder-zinc-600 focus:border-zinc-500'
      : 'bg-white border border-[#e5e2d9] disabled:opacity-50 disabled:cursor-not-allowed text-[#191919] placeholder-zinc-400 focus:border-zinc-400'
  }`;

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1 ${
    isDark ? 'text-zinc-400' : 'text-zinc-500'
  }`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 moving-gradient-card backdrop-blur-md border p-6 rounded-2xl max-w-md w-full transition-all ${
        isDark ? 'border-zinc-800' : 'border-[#e5e2d9] shadow-md'
      } ${
        shake ? 'animate-shake border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''
      }`}
    >
      <h2 className={`text-xl font-semibold mb-2 tracking-tight ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
        {initialData ? 'Edit Student Details' : 'Add New Student'}
      </h2>
      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        Enter the details below. {initialData && 'Student ID cannot be changed.'}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg animate-fade-in">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className={labelClass}>
            Student ID
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={!!initialData}
            placeholder="e.g., S101"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jane Doe"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g., 20"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Computer Science"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <LiquidMetalButton
          label={initialData ? 'Save Changes' : 'Add Student'}
          theme={theme}
          type="submit"
        />
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2.5 rounded-full border text-sm transition-colors cursor-pointer ${
              isDark
                ? 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                : 'border-[#e5e2d9] text-zinc-600 hover:text-zinc-900 hover:border-zinc-400'
            }`}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
