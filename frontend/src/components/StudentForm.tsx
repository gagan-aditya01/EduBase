import React, { useState, useEffect } from 'react';
import { LiquidMetalButton } from './ui/liquid-metal-button';
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
}

interface StudentFormProps {
  onSubmit: (student: Omit<Student, '_id'>) => void;
  initialData?: Student | null;
  onCancel?: () => void;
  theme?: 'light' | 'dark';
}

const COMMON_DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'ADSE',
  'Mathematics',
  'Robotics',
];

const DEPT_SHORT_CODES: Record<string, string> = {
  'Computer Science': 'CS',
  'Electrical Engineering': 'EE',
  'Mechanical Engineering': 'ME',
  'ADSE': 'ADSE',
  'Mathematics': 'MATH',
  'Robotics': 'ROB',
};

function deriveYearAndSection(id: string, dept: string) {
  let derivedYear = '3rd Year';
  let yearNum = '3';

  if (id && id.length >= 2) {
    const prefix = id.substring(0, 2);
    if (prefix === '26') {
      derivedYear = '1st Year';
      yearNum = '1';
    } else if (prefix === '25') {
      derivedYear = '2nd Year';
      yearNum = '2';
    } else if (prefix === '24') {
      derivedYear = '3rd Year';
      yearNum = '3';
    } else if (prefix === '23') {
      derivedYear = '4th Year';
      yearNum = '4';
    }
  }

  const shortCode = DEPT_SHORT_CODES[dept] || (dept ? dept.substring(0, 2).toUpperCase() : 'CS');
  const derivedSection = `${yearNum}${shortCode}`;

  return { derivedYear, derivedSection };
}

export function StudentForm({ onSubmit, initialData, onCancel, theme = 'dark' }: StudentFormProps) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3rd Year');
  const [section, setSection] = useState('3CS');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (initialData) {
      setStudentId(initialData.studentId);
      setName(initialData.name);
      setAge(String(initialData.age));
      setDepartment(initialData.department);
      setYear(initialData.year || '3rd Year');
      setSection(initialData.section || '3CS');
    } else {
      const defaultId = '24' + Math.floor(10000 + Math.random() * 90000).toString();
      setStudentId(defaultId);
      setName('');
      setAge('');
      setDepartment('Computer Science');
      const { derivedYear, derivedSection } = deriveYearAndSection(defaultId, 'Computer Science');
      setYear(derivedYear);
      setSection(derivedSection);
    }
    setError('');
  }, [initialData]);

  const handleIdChange = (newId: string) => {
    setStudentId(newId);
    if (!initialData) {
      const { derivedYear, derivedSection } = deriveYearAndSection(newId, department);
      setYear(derivedYear);
      setSection(derivedSection);
    }
  };

  const handleDeptChange = (newDept: string) => {
    setDepartment(newDept);
    if (!initialData) {
      const { derivedYear, derivedSection } = deriveYearAndSection(studentId, newDept);
      setYear(derivedYear);
      setSection(derivedSection);
    }
  };

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

    // Validate studentId format (numbers, alphanumeric)
    const idRegex = /^[a-zA-Z0-9_-]+$/;
    if (!idRegex.test(studentId)) {
      setError('Student ID must be numeric (e.g., 2462128)');
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
      year: year.trim(),
      section: section.trim(),
    });
    
    // Reset if adding new
    if (!initialData) {
      const nextId = '24' + Math.floor(10000 + Math.random() * 90000).toString();
      setStudentId(nextId);
      setName('');
      setAge('');
      setDepartment('Computer Science');
      const { derivedYear, derivedSection } = deriveYearAndSection(nextId, 'Computer Science');
      setYear(derivedYear);
      setSection(derivedSection);
    }
    setError('');
  };

  const inputClass = `w-full rounded-lg px-3.5 py-2 text-xs focus:outline-none transition-colors ${
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
      className={`space-y-5 moving-gradient-card backdrop-blur-md border p-6 rounded-2xl max-w-md w-full transition-all ${
        isDark ? 'border-zinc-800' : 'border-[#e5e2d9] shadow-md'
      } ${
        shake ? 'animate-shake border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''
      }`}
    >
      <h2 className={`text-xl font-semibold mb-1 tracking-tight ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
        {initialData ? 'Edit Student Record' : 'Add New Student'}
      </h2>
      <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        Enter the details below. {initialData && 'Student ID cannot be changed.'}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg animate-fade-in">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className={labelClass}>
            Student Registration No / ID
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => handleIdChange(e.target.value)}
            disabled={!!initialData}
            placeholder="e.g., 2462128"
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
            placeholder="e.g., Eleanor Vance"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
            <Select value={department} onValueChange={handleDeptChange}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                {COMMON_DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d} className="text-xs font-medium cursor-pointer">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              Academic Year
            </label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 3rd Year"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Section Code
            </label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., 3CS"
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
            className={`px-4 py-2.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
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
