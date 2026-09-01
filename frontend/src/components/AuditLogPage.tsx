import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Search, Filter, Clock, User } from 'lucide-react';

interface AuditLogItem {
  _id: string;
  action: string;
  targetId?: string;
  performedBy: string;
  details?: string;
  createdAt: string;
}

interface AuditLogPageProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty' | 'student' };
  theme?: 'light' | 'dark';
}

export function AuditLogPage({ currentUser, theme = 'dark' }: AuditLogPageProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const isDark = theme === 'dark';

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5050/api/v1/audit-logs?limit=100', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch audit logs');
      }
      setLogs(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((item) => {
    const actionMatch = selectedAction === 'ALL' || item.action === selectedAction;
    const query = searchQuery.toLowerCase();
    const textMatch =
      item.action.toLowerCase().includes(query) ||
      (item.details && item.details.toLowerCase().includes(query)) ||
      (item.performedBy && item.performedBy.toLowerCase().includes(query)) ||
      (item.targetId && item.targetId.toLowerCase().includes(query));
    return actionMatch && textMatch;
  });

  const formatActionName = (action: string) => {
    switch (action) {
      case 'CREATE_STUDENT':
        return 'Student Created';
      case 'UPDATE_STUDENT':
        return 'Student Updated';
      case 'DELETE_STUDENT':
        return 'Student Soft-Deleted';
      case 'RESTORE_STUDENT':
        return 'Student Restored';
      case 'PURGE_STUDENT':
        return 'Student Hard Purged';
      case 'USER_LOGIN':
        return 'User Login';
      case 'CHANGE_PASSWORD':
        return 'Password Change';
      default:
        return action.replace(/_/g, ' ');
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE_STUDENT':
      case 'USER_LOGIN':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'UPDATE_STUDENT':
      case 'CHANGE_PASSWORD':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'DELETE_STUDENT':
      case 'RESTORE_STUDENT':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'PURGE_STUDENT':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-zinc-900' : 'border-[#e5e2d9]'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-amber-400' : 'bg-[#cc5a37]/10 border-[#cc5a37]/20 text-[#cc5a37]'}`}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
              System Audit Trail
            </h1>
            <p className="text-xs text-zinc-500">Immutable security event logs & audit record stream</p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className={`px-4 py-2 rounded-2xl border cursor-pointer font-bold text-xs flex items-center gap-2 transition-colors ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'bg-white border-[#e5e2d9] hover:bg-[#f5f2eb] text-[#191919]'
          }`}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Stream
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className={`p-4 rounded-3xl border grid grid-cols-1 sm:grid-cols-2 gap-4 ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search audit details, target ID, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none border transition-colors ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-zinc-700'
                : 'bg-[#f8f6f0] border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-[#cc5a37]/50'
            }`}
          />
        </div>

        <div className="relative flex items-center">
          <Filter size={14} className="absolute left-3.5 text-zinc-500 pointer-events-none" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className={`w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none border appearance-none transition-colors cursor-pointer ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700'
                : 'bg-[#f8f6f0] border-[#e5e2d9] text-[#191919] focus:border-[#cc5a37]/50'
            }`}
          >
            <option value="ALL">All Event Types</option>
            <option value="CREATE_STUDENT">Student Created</option>
            <option value="UPDATE_STUDENT">Student Updated</option>
            <option value="DELETE_STUDENT">Student Soft-Deleted</option>
            <option value="RESTORE_STUDENT">Student Restored</option>
            <option value="PURGE_STUDENT">Student Hard Purged</option>
            <option value="USER_LOGIN">User Login</option>
            <option value="CHANGE_PASSWORD">Password Change</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Audit Log Timeline Stream */}
      <div className="space-y-3.5">
        {loading && logs.length === 0 ? (
          <div className="text-center p-12 text-zinc-500 text-xs">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500 inline-block mr-2 align-middle" />
            Fetching audit records...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center p-12 text-zinc-500 text-xs font-mono">
            No matching audit trail logs recorded.
          </div>
        ) : (
          filteredLogs.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`p-5 rounded-3xl border flex flex-col space-y-3 transition-all ${
                isDark
                  ? 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70'
                  : 'bg-white border-[#e5e2d9] hover:bg-[#fbfaf7]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${getActionBadgeColor(item.action)}`}>
                    {formatActionName(item.action)}
                  </span>
                  {item.targetId && (
                    <span className="text-[11px] font-mono text-zinc-500">
                      Target: <span className="text-zinc-300 font-semibold">{item.targetId}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Clock size={13} />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="text-xs font-medium leading-relaxed">
                {item.details || 'No additional details logged'}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/20">
                <User size={13} />
                <span>Performed by:</span>
                <span className="font-bold text-zinc-300">{item.performedBy}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
