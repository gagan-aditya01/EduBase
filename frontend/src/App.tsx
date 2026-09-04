import { useState, useEffect } from 'react';
import { StudentForm } from './components/StudentForm';
import { StudentList } from './components/StudentList';
import { Sparkles, Database, GraduationCap, LogOut, Key, LayoutDashboard, BarChart3, ShieldAlert, Users, UserCheck, UploadCloud, CheckSquare, CalendarCheck, BookOpen } from 'lucide-react';
import { Sidebar, SidebarBody, SidebarLink } from './components/ui/sidebar';
import { LiquidMetalButton } from './components/ui/liquid-metal-button';
import { FloatingPathsBackground } from './components/ui/floating-paths';
import { NotFound } from './components/NotFound';
import { AnimatePresence, motion } from 'framer-motion';
import { StatsPanel } from './components/StatsPanel';
import { ToastContainer, type ToastMessage } from './components/ui/toast';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { AuthPage } from './components/AuthPage';
import { FacultyDirectory } from './components/FacultyDirectory';
import { AnalyticsPage } from './components/AnalyticsPage';
import { AuditLogPage } from './components/AuditLogPage';
import { UserManagePage } from './components/UserManagePage';
import { Logos3 } from './components/ui/logos3';
import { WelcomeSplash } from './components/ui/WelcomeSplash';
import TeamSection from './components/ui/team';
import { CsvImporterModal } from './components/CsvImporterModal';
import { GradebookPage } from './components/GradebookPage';
import { StudentHome } from './components/StudentHome';
import { StudentMarksPage } from './components/StudentMarksPage';
import { FacultyAttendancePage } from './components/FacultyAttendancePage';
import { StudentAttendancePage } from './components/StudentAttendancePage';
import { Home, Award } from 'lucide-react';

interface Student {
  studentId: string;
  name: string;
  age: number;
  department: string;
  year?: string;
  section?: string;
  createdBy?: string;
}

interface User {
  token: string;
  username: string;
  name?: string;
  role: 'admin' | 'guest' | 'faculty' | 'student';
  assignedDepartment?: string;
  assignedSubjects?: string[];
  facultyId?: string;
  studentId?: string;
  department?: string;
  year?: string;
  section?: string;
}

const API_BASE_URL = 'http://localhost:5050/api/students';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>(user?.role === 'student' ? 'student-home' : 'dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [newProfilePassword, setNewProfilePassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);

  const addNotification = (_type: 'info' | 'success' | 'warning', _message: string) => {
    // Audit logs track all system actions
  };

  // Check for OAuth URL Callback redirect or stored user on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');
    const role = params.get('role') as 'admin' | 'guest';

    if (token && username && role) {
      const newUser = { token, username, role };
      setUser(newUser);
      localStorage.setItem('edubase_user', JSON.stringify(newUser));
      setShowWelcomeSplash(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const storedUser = localStorage.getItem('edubase_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'student') {
          setCurrentPage('student-home');
        }
      } catch (e) {
        localStorage.removeItem('edubase_user');
      }
    }
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Filters state
  const [filters, setFilters] = useState({
    studentId: '',
    name: '',
    department: '',
    minAge: '',
    maxAge: '',
  });

  // Debounced/Effect-based search & filter fetch
  useEffect(() => {
    if (!user || user.role === 'student') return; // Only fetch if logged in as Admin or Faculty

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.studentId) queryParams.append('studentId', filters.studentId);
        if (filters.name) queryParams.append('name', filters.name);
        if (filters.department) queryParams.append('department', filters.department);
        if (filters.minAge) queryParams.append('minAge', filters.minAge);
        if (filters.maxAge) queryParams.append('maxAge', filters.maxAge);

        const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        const studentArray = Array.isArray(data) ? data : (data.data || []);
        setStudents(studentArray);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, user]);

  // Phase 5: Real-Time Multi-Admin SSE Collaboration Stream Subscriber
  useEffect(() => {
    if (!user) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('http://localhost:5050/api/v1/students/stream');

      eventSource.addEventListener('student_mutation', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.performedBy !== user.username) {
            addToast('info', `📡 Real-Time Update: ${data.details} (by ${data.performedBy})`);
            setFilters((prev) => ({ ...prev }));
          }
        } catch (err) {
          // Ignore parse errors
        }
      });
    } catch (err) {
      // SSE connection fallback
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user]);

  const handleAuthSuccess = (
    token: string,
    username: string,
    role: 'admin' | 'guest' | 'faculty' | 'student',
    assignedDepartment?: string,
    facultyId?: string,
    assignedSubjects?: string[],
    name?: string,
    studentId?: string,
    department?: string,
    year?: string,
    section?: string
  ) => {
    const newUser: User = {
      token,
      username,
      role,
      assignedDepartment,
      facultyId,
      assignedSubjects,
      name,
      studentId,
      department,
      year,
      section,
    };
    setUser(newUser);
    localStorage.setItem('edubase_user', JSON.stringify(newUser));
    if (role === 'student') {
      setCurrentPage('student-home');
    } else {
      setCurrentPage('dashboard');
    }
    setShowWelcomeSplash(true);
    addToast('success', `Welcome, ${name || username}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edubase_user');
    setStudents([]);
    setShowChangePasswordForm(false);
    setNewProfilePassword('');
    addToast('info', 'Logged out successfully');
  };

  const handleChangeProfilePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfilePassword || newProfilePassword.trim().length < 4) {
      addToast('error', 'Password must be at least 4 characters long');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await fetch('http://localhost:5050/api/auth/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ password: newProfilePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      addToast('success', 'Your password was updated successfully!');
      setShowChangePasswordForm(false);
      setNewProfilePassword('');
      addNotification('info', 'Changed profile password');
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleCreateOrUpdate = async (studentData: Omit<Student, '_id'>) => {
    if (!user) return;
    try {
      const isEdit = !!editingStudent;
      const url = isEdit
        ? `${API_BASE_URL}/${editingStudent.studentId}`
        : API_BASE_URL;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || 'Failed to save student record');
      }

      const saved = await response.json();

      if (isEdit) {
        setStudents((prev) => prev.map((s) => (s.studentId === editingStudent.studentId ? saved : s)));
        setEditingStudent(null);
        addToast('success', 'Student record updated successfully!');
        addNotification('success', `Updated student: ${studentData.name}`);
      } else {
        setStudents((prev) => [saved, ...prev]);
        addToast('success', 'Student record created successfully!');
        addNotification('success', `Added student: ${studentData.name}`);
      }
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.message);
      addToast('error', err.message);
    }
  };

  const handleDelete = (studentId: string) => {
    if (!user) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Student Record',
      message: `Are you sure you want to delete student ID ${studentId}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          setError('');
          const response = await fetch(`${API_BASE_URL}/${studentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${user.token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to delete student');
          }

          setStudents((prev) => prev.filter((s) => s.studentId !== studentId));
          addToast('success', 'Student record deleted successfully!');
          addNotification('warning', `Deleted student ID: ${studentId}`);
        } catch (err: any) {
          setError(err.message);
          addToast('error', err.message);
        }
      },
    });
  };

  const handleBulkDelete = (studentIds: string[]) => {
    if (!user) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Multiple Records',
      message: `Are you sure you want to delete ${studentIds.length} selected student records? This action cannot be undone.`,
      confirmLabel: 'Delete All',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          setError('');
          await Promise.all(
            studentIds.map((id) =>
              fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                },
              }).then((res) => {
                if (!res.ok) throw new Error(`Failed to delete student ${id}`);
              })
            )
          );
          setStudents((prev) => prev.filter((s) => !studentIds.includes(s.studentId)));
          addToast('success', `Successfully deleted ${studentIds.length} records!`);
          addNotification('warning', `Bulk deleted ${studentIds.length} records`);
        } catch (err: any) {
          setError(err.message);
          addToast('error', err.message);
        }
      },
    });
  };

  const handleClearFilters = () => {
    setFilters({
      studentId: '',
      name: '',
      department: '',
      minAge: '',
      maxAge: '',
    });
  };

  // If not logged in, render authentication page
  if (!user) {
    return (
      <FloatingPathsBackground position={1}>
        <header className={`border-b sticky top-0 z-50 transition-colors duration-300 ${
          theme === 'dark' ? 'border-zinc-900 bg-zinc-950/80 backdrop-blur-md' : 'border-[#e5e2d9] bg-[#fbfaf7]/85 backdrop-blur-md'
        }`}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GraduationCap className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'} size={24} />
              <span className="font-semibold tracking-tight text-lg gradient-text">
                EduBase Portal
              </span>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>
        <AuthPage onAuthSuccess={handleAuthSuccess} theme={theme} />
        <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      </FloatingPathsBackground>
    );
  }

  // 404 test page handler
  if (currentPage === '404') {
    return <NotFound onGoHome={() => setCurrentPage('dashboard')} theme={theme} />;
  }

  return (
    <FloatingPathsBackground position={1}>
      <div className="flex min-h-screen w-full relative z-10">
        {/* Animated Left Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
          <SidebarBody className={`justify-between gap-6 ${
            theme === 'dark' ? 'bg-zinc-950/90 border-zinc-850/80' : 'bg-[#fbfaf7]/90 border-[#e5e2d9]'
          }`}>
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {/* Brand Header */}
              <div className="flex items-center gap-3 py-1 px-0.5 shrink-0 min-h-[40px]">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#cc5a37]'
                }`}>
                  <GraduationCap size={20} />
                </div>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-bold tracking-tight text-base gradient-text whitespace-nowrap"
                    >
                      EduBase Portal
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Links */}
              <div className="mt-6 flex flex-col gap-1.5">
                {user.role === 'student' ? (
                  <>
                    <SidebarLink
                      link={{
                        label: 'Home',
                        icon: <Home size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'} />,
                        onClick: () => setCurrentPage('student-home'),
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: 'Academic Marks',
                        icon: <Award size={18} className={theme === 'dark' ? 'text-amber-400' : 'text-[#cc5a37]'} />,
                        onClick: () => setCurrentPage('student-marks'),
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: 'My Attendance',
                        icon: <CalendarCheck size={18} className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} />,
                        onClick: () => setCurrentPage('student-attendance'),
                      }}
                    />
                  </>
                ) : (
                  <>
                    <SidebarLink
                      link={{
                        label: 'Student Directory',
                        icon: <LayoutDashboard size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'} />,
                        onClick: () => setCurrentPage('dashboard'),
                      }}
                    />

                    {user.role === 'admin' && (
                      <SidebarLink
                        link={{
                          label: 'Faculty Directory',
                          icon: <UserCheck size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'} />,
                          onClick: () => setCurrentPage('faculty-directory'),
                        }}
                      />
                    )}

                    {(user.role === 'admin' || user.role === 'faculty') && (
                      <>
                        <SidebarLink
                          link={{
                            label: 'Gradebook Console',
                            icon: <BookOpen size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'} />,
                            onClick: () => setCurrentPage('gradebook'),
                          }}
                        />
                        <SidebarLink
                          link={{
                            label: user.role === 'admin' ? 'Attendance' : 'Mark Attendance',
                            icon: <CheckSquare size={18} className={theme === 'dark' ? 'text-[#cc5a37]' : 'text-[#cc5a37]'} />,
                            onClick: () => setCurrentPage('faculty-attendance'),
                          }}
                        />
                      </>
                    )}

                    {user.role === 'guest' && (
                      <SidebarLink
                        link={{
                          label: 'My Attendance',
                          icon: <CalendarCheck size={18} className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} />,
                          onClick: () => setCurrentPage('student-attendance'),
                        }}
                      />
                    )}

                    <SidebarLink
                      link={{
                        label: 'Analytics Engine',
                        icon: <BarChart3 size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'} />,
                        onClick: () => setCurrentPage('analytics'),
                      }}
                    />

                    {user.role === 'admin' && (
                      <>
                        <SidebarLink
                          link={{
                            label: 'Audit Log Trail',
                            icon: <ShieldAlert size={18} className={theme === 'dark' ? 'text-amber-500' : 'text-[#cc5a37]'} />,
                            onClick: () => setCurrentPage('audit-logs'),
                          }}
                        />
                        <SidebarLink
                          link={{
                            label: 'Manage Users',
                            icon: <Users size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'} />,
                            onClick: () => setCurrentPage('users'),
                          }}
                        />
                      </>
                    )}
                  </>
                )}

                <SidebarLink
                  link={{
                    label: 'Change Password',
                    icon: <Key size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'} />,
                    onClick: () => setShowChangePasswordForm(!showChangePasswordForm),
                  }}
                />

                <SidebarLink
                  link={{
                    label: 'Logout',
                    icon: <LogOut size={18} className="text-red-400" />,
                    danger: true,
                    onClick: handleLogout,
                  }}
                />
              </div>

              {/* Password Change Subform in Sidebar */}
              <AnimatePresence>
                {showChangePasswordForm && sidebarOpen && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleChangeProfilePassword}
                    className={`flex flex-col gap-2 p-3 mt-2 rounded-2xl border ${
                      theme === 'dark' ? 'border-zinc-800 bg-zinc-900/40' : 'border-[#e5e2d9] bg-white'
                    }`}
                  >
                    <input
                      type="password"
                      placeholder="New password..."
                      value={newProfilePassword}
                      onChange={(e) => setNewProfilePassword(e.target.value)}
                      className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:outline-none border ${
                        theme === 'dark' ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-[#f5f2eb] border-[#e5e2d9] text-[#191919]'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className={`w-full py-1.5 rounded-xl font-bold text-[10px] cursor-pointer ${
                        theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700' : 'bg-[#cc5a37] hover:bg-[#e05a47] text-white'
                      }`}
                    >
                      {updatingPassword ? 'Saving...' : 'Save Password'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar User Profile Footer */}
            <div className={`pt-4 border-t flex items-center justify-between gap-2 ${
              theme === 'dark' ? 'border-zinc-800/40' : 'border-[#e5e2d9]'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                  theme === 'dark'
                    ? 'bg-zinc-850 border-zinc-700 text-zinc-200'
                    : 'bg-[#f0ede6] border-[#e5e2d9] text-[#cc5a37]'
                }`}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                {sidebarOpen && (
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-zinc-200' : 'text-[#191919]'}`}>
                      {user.username}
                    </span>
                    <span className={`text-[9px] font-mono uppercase truncate ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'}`}>
                      {user.role} {user.assignedDepartment ? `(${user.assignedDepartment})` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>

        {/* Main Workspace Area */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {/* Main top bar */}
          <header className={`border-b sticky top-0 z-30 transition-colors duration-300 ${
            theme === 'dark' ? 'border-zinc-900 bg-zinc-950/80 backdrop-blur-md' : 'border-[#e5e2d9] bg-[#fbfaf7]/85 backdrop-blur-md'
          }`}>
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
              <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors duration-300 ${
                theme === 'dark' ? 'text-[#3fa267] bg-[#102a18]/30 border-[#1b4324]/50' : 'text-[#2a593e] bg-[#eef6f0] border-[#d2e7d7]'
              }`}>
                <Database size={12} className="text-[#3fa267]" />
                <span>MongoDB Connected</span>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                <button
                  onClick={() => setCurrentPage('404')}
                  className={`text-xs border px-3 py-1 rounded-full transition-all cursor-pointer ${
                    theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200 border-zinc-800' : 'text-[#cc5a37] hover:text-[#e05a47] border-[#e5e2d9] hover:border-[#cc5a37]'
                  }`}
                >
                  Test 404 Page
                </button>
              </div>
            </div>
          </header>

          {/* 3D Workspace Scaling Deck Flip Wrapper */}
          <motion.div
            animate={{
              scale: 1,
              rotateX: 0,
              y: 0,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
          >
        {/* Main workspace content routing */}
        <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
          {currentPage === 'student-home' ? (
            <StudentHome user={user} theme={theme} />
          ) : currentPage === 'student-marks' ? (
            <StudentMarksPage user={user} theme={theme} />
          ) : currentPage === 'student-attendance' ? (
            <StudentAttendancePage user={user} theme={theme} />
          ) : currentPage === 'faculty-attendance' ? (
            <FacultyAttendancePage user={user} theme={theme} addToast={addToast} />
          ) : currentPage === 'analytics' ? (
            <AnalyticsPage currentUser={user} theme={theme} />
          ) : currentPage === 'gradebook' ? (
            <GradebookPage currentUser={user} theme={theme} addToast={addToast} />
          ) : currentPage === 'audit-logs' ? (
            <AuditLogPage currentUser={user} theme={theme} />
          ) : currentPage === 'users' ? (
            <UserManagePage currentUser={user} theme={theme} addToast={addToast} />
          ) : currentPage === 'faculty-directory' ? (
            <FacultyDirectory currentUser={user} theme={theme} addToast={addToast} />
          ) : (
            <>
              {/* Banner area */}
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b transition-colors duration-300 ${
                theme === 'dark' ? 'border-zinc-900' : 'border-[#e5e2d9]'
              }`}>
                <div>
                  <h1 className={`text-3xl font-bold tracking-tight flex items-center gap-2 ${
                    theme === 'dark' ? 'text-zinc-100' : 'text-[#191919]'
                  }`}>
                    {user.role === 'faculty' ? `${user.assignedDepartment || 'Faculty'} Department Portal` : 'Student Directory'}
                    <Sparkles size={20} className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} />
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {/* Show admin actions conditionally */}
                  {(user.role === 'admin' || user.role === 'faculty') && (
                    <>
                      <button
                        onClick={() => setShowCsvModal(true)}
                        className={`px-4 py-2 rounded-2xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                            : 'bg-white border-[#e5e2d9] hover:bg-[#f5f2eb] text-[#191919]'
                        }`}
                      >
                        <UploadCloud size={14} className="text-indigo-400" />
                        Import CSV
                      </button>

                      {!showForm && !editingStudent && (
                        <LiquidMetalButton
                          label="Add Student"
                          theme={theme}
                          onClick={() => setShowForm(true)}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Dashboard Analytics Section */}
              <div className="mt-6">
                <StatsPanel students={students} theme={theme} />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mt-8">
                  {error}
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-8 items-start mt-8">
                {/* Main List */}
                <div className="flex-1 w-full order-2 lg:order-1">
                  <StudentList
                    students={students}
                    isLoading={loading}
                    theme={theme}
                    isAdmin={user.role === 'admin'}
                    onEdit={(student) => {
                      setEditingStudent(student);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}
                    filters={filters}
                    setFilters={setFilters}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </div>
            </>
          )}
          {/* Form Side-Sheet with backdrop */}
          <AnimatePresence>
            {showForm && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setEditingStudent(null);
                    setShowForm(false);
                  }}
                  className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[90] cursor-pointer"
                />

                {/* Sliding panel */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                  className={`fixed right-0 top-0 bottom-0 w-full max-w-md border-l z-[100] shadow-2xl overflow-y-auto ${
                    theme === 'dark' ? 'bg-zinc-950 border-zinc-900 text-zinc-100' : 'bg-[#fbfaf7] border-[#e5e2d9] text-[#191919]'
                  }`}
                >
                  {/* Glowing background circles for Form panel */}
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <motion.div
                      className={`absolute -top-24 -right-24 w-64 h-64 rounded-full filter blur-[80px] opacity-25 ${
                        theme === 'dark' ? 'bg-zinc-800' : 'bg-[#e05a47]/30'
                      }`}
                      animate={{
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>

                  <div className="relative z-10 w-full flex items-center justify-center">
                    <StudentForm
                      onSubmit={handleCreateOrUpdate}
                      initialData={editingStudent}
                      theme={theme}
                      onCancel={() => {
                        setEditingStudent(null);
                        setShowForm(false);
                      }}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Tech Stack Marquee Section */}
          <Logos3 heading="Powered by Modern Tech Stack" theme={theme} />

        {/* Team Section */}
        <TeamSection theme={theme} />
        </main>
      </motion.div>

      <footer className={`border-t py-6 mt-12 backdrop-blur-sm transition-colors duration-300 ${
        theme === 'dark' ? 'border-zinc-900 bg-zinc-950/50' : 'border-[#e5e2d9] bg-[#f5f2eb]/50'
      }`}>
        <div className={`max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs gap-4 ${
          theme === 'dark' ? 'text-zinc-600' : 'text-zinc-500'
        }`}>
          <span>&copy; 2026 EduBase Portal. All rights reserved.</span>
        </div>
      </footer>
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      
      {showCsvModal && user && (
        <CsvImporterModal
          isOpen={showCsvModal}
          onClose={() => setShowCsvModal(false)}
          userToken={user.token}
          userRole={user.role}
          assignedDepartment={user.assignedDepartment}
          theme={theme}
          onSuccess={(count) => {
            setFilters((prev) => ({ ...prev }));
            addToast('success', `Successfully batch imported ${count} student records!`);
          }}
        />
      )}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          theme={theme}
        />
      )}
      <AnimatePresence>
        {showWelcomeSplash && user && (
          <WelcomeSplash
            username={user.username}
            name={user.name || user.username}
            role={user.role}
            onComplete={() => setShowWelcomeSplash(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>
        </div>
      </div>
    </FloatingPathsBackground>
  );
}
