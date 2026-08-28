import { useState, useEffect } from 'react';
import { StudentForm } from './components/StudentForm';
import { StudentList } from './components/StudentList';
import { Sparkles, Database, GraduationCap, LogOut, Key, ChevronDown, Shield, ChevronRight, Bell } from 'lucide-react';
import { LiquidMetalButton } from './components/ui/liquid-metal-button';
import { FloatingPathsBackground } from './components/ui/floating-paths';
import { NotFound } from './components/NotFound';
import { AnimatePresence, motion } from 'framer-motion';
import { StatsPanel } from './components/StatsPanel';
import { ToastContainer, type ToastMessage } from './components/ui/toast';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { DepartmentChart } from './components/DepartmentChart';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { AuthPage } from './components/AuthPage';
import { UserManageSidebar } from './components/UserManageSidebar';
import { Logos3 } from './components/ui/logos3';
import { WelcomeSplash } from './components/ui/WelcomeSplash';
import TeamSection from './components/ui/team';

interface Student {
  studentId: string;
  name: string;
  age: number;
  department: string;
  createdBy?: string;
}

interface User {
  token: string;
  username: string;
  role: 'admin' | 'guest';
}

interface NotificationItem {
  id: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning';
}

const API_BASE_URL = 'http://localhost:5050/api/students';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | '404'>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const [showUserSidebar, setShowUserSidebar] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [newProfilePassword, setNewProfilePassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);

  const addNotification = (type: 'info' | 'success' | 'warning', message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [{ id, message, timestamp: new Date(), type }, ...prev]);
  };

  // Click outside listener for profile menu dropdown
  useEffect(() => {
    if (!showProfileMenu) return;
    const handleOutsideClick = () => {
      setShowProfileMenu(false);
      setShowChangePasswordForm(false);
      setNewProfilePassword('');
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showProfileMenu]);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('edubase_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
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
    if (!user) return; // Only fetch if logged in

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
        setStudents(data);
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

  const handleAuthSuccess = (token: string, username: string, role: 'admin' | 'guest') => {
    const newUser: User = { token, username, role };
    setUser(newUser);
    localStorage.setItem('edubase_user', JSON.stringify(newUser));
    setShowWelcomeSplash(true);
    addToast('success', `Welcome back, ${username}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edubase_user');
    setStudents([]);
    setShowProfileMenu(false);
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

  const handleSeedData = async () => {
    if (!user) return;
    const mockStudents = [
      { studentId: '2462128', name: 'Arthur Dent', age: 30, department: 'Philosophy' },
      { studentId: '2463140', name: 'Ford Prefect', age: 28, department: 'Astrophysics' },
      { studentId: '2464195', name: 'Tricia McMillan', age: 26, department: 'Mathematics' },
      { studentId: '2465220', name: 'Zaphod Beeblebrox', age: 34, department: 'Political Science' },
      { studentId: '2466085', name: 'Marvin Android', age: 90, department: 'Robotics' },
      { studentId: '2561102', name: 'Fiona Gallagher', age: 22, department: 'Social Work' },
      { studentId: '2562130', name: 'Lip Gallagher', age: 23, department: 'Engineering' },
      { studentId: '2563145', name: 'Ian Gallagher', age: 21, department: 'Military Science' },
    ];

    try {
      setError('');
      setLoading(true);
      await Promise.all(
        mockStudents.map((student) =>
          fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify(student),
          }).then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              if (res.status === 400 && data.error?.includes('already exists')) {
                return null;
              }
              throw new Error(data.error || 'Failed to seed record');
            }
            return res.json();
          })
        )
      );
      setFilters((prev) => ({ ...prev }));
      addToast('success', 'Mock data successfully seeded (existing records skipped)!');
      addNotification('success', 'Seeded mock student directory database');
    } catch (err: any) {
      setError(err.message);
      addToast('error', err.message);
    } finally {
      setLoading(false);
    }
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
      {/* Header bar */}
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
          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              onClick={() => setCurrentPage('404')}
              className={`text-xs border px-3 py-1 rounded-full transition-all cursor-pointer ${
                theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200 border-zinc-800' : 'text-[#cc5a37] hover:text-[#e05a47] border-[#e5e2d9] hover:border-[#cc5a37]'
              }`}
            >
              Test 404 Page
            </button>
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors duration-300 ${
              theme === 'dark' ? 'text-[#3fa267] bg-[#102a18]/30 border-[#1b4324]/50' : 'text-[#2a593e] bg-[#eef6f0] border-[#d2e7d7]'
            }`}>
              <Database size={12} className="text-[#3fa267]" />
              <span>MongoDB Connected</span>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm select-none transition-all cursor-pointer border shadow-md relative overflow-hidden focus:outline-none focus:ring-0 ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                    : 'bg-[#f5f2eb] border-[#e5e2d9] text-[#cc5a37] hover:border-[#cc5a37]'
                }`}
              >
                {user.username.charAt(0).toUpperCase()}
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 25 }}
                    className={`absolute right-0 mt-2.5 w-64 p-3 rounded-[28px] border shadow-2xl z-50 flex flex-col gap-2 backdrop-blur-xl transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'bg-zinc-950/90 border-zinc-850/80 text-zinc-200'
                        : 'bg-white/95 border-[#e5e2d9]/60 text-[#191919]'
                    }`}
                  >
                    {/* Header Row (iOS Style) */}
                    <div className="flex items-center gap-3 px-2 py-2 border-b border-zinc-800/10 dark:border-zinc-850/50">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base select-none bg-gradient-to-tr from-[#cc5a37] to-[#e05a47] text-white shadow-md">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate">
                          {user.username}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium truncate">
                          {user.username.toLowerCase()}@nucleus-ui.com
                        </span>
                      </div>
                    </div>

                    {/* Menu Items (iOS List style) */}
                    <div className="flex flex-col gap-1">
                      {/* Row 1: Change Password */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-colors text-xs font-semibold select-none cursor-pointer focus:outline-none focus:ring-0 ${
                            theme === 'dark' ? 'hover:bg-zinc-900/55 text-zinc-200' : 'hover:bg-[#f5f2eb]/60 text-[#191919]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Key size={14} className="text-zinc-500" />
                            <span>Change Password</span>
                          </div>
                          <ChevronDown size={12} className={`text-zinc-500 transition-transform ${showChangePasswordForm ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {showChangePasswordForm && (
                            <motion.form
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                              onSubmit={handleChangeProfilePassword}
                              className="flex flex-col gap-2 px-3 pb-3 pt-1.5 overflow-hidden"
                            >
                              <input
                                type="password"
                                placeholder="New password..."
                                value={newProfilePassword}
                                onChange={(e) => setNewProfilePassword(e.target.value)}
                                className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:outline-none border transition-colors ${
                                  theme === 'dark'
                                    ? 'bg-zinc-950 border-zinc-850 text-zinc-200 placeholder-zinc-750'
                                    : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400'
                                }`}
                              />
                              <button
                                type="submit"
                                disabled={updatingPassword}
                                className={`w-full py-1.5 rounded-xl font-bold text-[10px] text-white flex items-center justify-center gap-1 cursor-pointer transition-colors focus:outline-none ${
                                  theme === 'dark' ? 'bg-zinc-850 hover:bg-zinc-800 border border-zinc-750' : 'bg-[#cc5a37] hover:bg-[#e05a47]'
                                }`}
                              >
                                {updatingPassword ? 'Saving...' : 'Save Password'}
                              </button>
                            </motion.form>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Row 2: Manage Users (Admins only) */}
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setShowUserSidebar(true);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-colors text-xs font-semibold select-none cursor-pointer focus:outline-none focus:ring-0 ${
                            theme === 'dark' ? 'hover:bg-zinc-900/55 text-zinc-200' : 'hover:bg-[#f5f2eb]/60 text-[#191919]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Shield size={14} className="text-zinc-500" />
                            <span>Manage Users</span>
                          </div>
                          <ChevronRight size={12} className="text-zinc-500" />
                        </button>
                      )}

                      {/* Row 2.5: Activity Log */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => setShowNotifications(!showNotifications)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-colors text-xs font-semibold select-none cursor-pointer focus:outline-none focus:ring-0 ${
                            theme === 'dark' ? 'hover:bg-zinc-900/55 text-zinc-200' : 'hover:bg-[#f5f2eb]/60 text-[#191919]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Bell size={14} className="text-zinc-500" />
                            <span>Activity Log</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {notifications.length > 0 && (
                              <span className="w-4.5 h-4.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold">
                                {notifications.length}
                              </span>
                            )}
                            <ChevronDown size={12} className={`text-zinc-500 transition-transform ${showNotifications ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {showNotifications && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                              className="flex flex-col gap-2.5 px-3 pb-3 pt-1.5 max-h-40 overflow-y-auto"
                            >
                              {notifications.length === 0 ? (
                                <span className="text-[10px] text-zinc-500 text-center font-mono py-2">No recent database actions.</span>
                              ) : (
                                <>
                                  <div className="flex flex-col gap-2">
                                    {notifications.map((n) => (
                                      <div key={n.id} className="flex items-start gap-2 text-[10px]">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                          n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                                        }`} />
                                        <div className="flex flex-col min-w-0">
                                          <span className={`leading-snug break-words ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>{n.message}</span>
                                          <span className="text-[8px] text-zinc-500 mt-0.5">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    onClick={() => setNotifications([])}
                                    className={`w-full py-1 rounded-xl text-[9px] font-bold cursor-pointer transition-colors border mt-1 ${
                                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-650 hover:text-[#cc5a37]'
                                    }`}
                                  >
                                    Clear Logs
                                  </button>
                                </>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Divider */}
                      <div className="border-t my-1 border-zinc-800/10 dark:border-zinc-850/50" />

                      {/* Row 3: Logout */}
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors text-xs font-bold select-none cursor-pointer focus:outline-none focus:ring-0 text-red-500 ${
                          theme === 'dark' ? 'hover:bg-red-500/10' : 'hover:bg-red-500/5'
                        }`}
                      >
                        <LogOut size={14} />
                        <span>Log out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* 3D Workspace Scaling Deck Flip Wrapper */}
      <motion.div
        animate={{
          scale: showUserSidebar ? 0.94 : 1,
          rotateX: showUserSidebar ? 8 : 0,
          y: showUserSidebar ? -10 : 0,
          opacity: showUserSidebar ? 0.35 : 1,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
      >
        {/* Main dashboard content */}
        <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Banner area */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b transition-colors duration-300 ${
          theme === 'dark' ? 'border-zinc-900' : 'border-[#e5e2d9]'
        }`}>
          <div>
            <h1 className={`text-3xl font-bold tracking-tight flex items-center gap-2 ${
              theme === 'dark' ? 'text-zinc-100' : 'text-[#191919]'
            }`}>
              Student Directory
              <Sparkles size={20} className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} />
            </h1>
            <p className={theme === 'dark' ? 'text-zinc-500 text-sm mt-1' : 'text-zinc-500 text-sm mt-1'}>
              Manage database records, query departments, and update student profiles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Show admin actions conditionally */}
            {user.role === 'admin' && (
              <>
                <button
                  onClick={handleSeedData}
                  className={`text-xs border px-4 py-2 rounded-full transition-all cursor-pointer font-semibold ${
                    theme === 'dark'
                      ? 'text-zinc-400 hover:text-zinc-200 border-zinc-800'
                      : 'text-[#cc5a37] hover:text-[#e05a47] border-[#e5e2d9] hover:border-[#cc5a37]'
                  }`}
                >
                  Seed Mock Data
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <StatsPanel students={students} theme={theme} />
          </div>
          <div>
            <DepartmentChart students={students} theme={theme} />
          </div>
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
        </div>

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
        {showUserSidebar && user && user.role === 'admin' && (
          <UserManageSidebar
            currentUser={user}
            onClose={() => setShowUserSidebar(false)}
            theme={theme}
            onAddNotification={addNotification}
            addToast={addToast}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showWelcomeSplash && user && (
          <WelcomeSplash
            username={user.username}
            role={user.role}
            onComplete={() => setShowWelcomeSplash(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </FloatingPathsBackground>
  );
}
