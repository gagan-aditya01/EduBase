import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert, Search, RefreshCw, Clock, User, Filter } from 'lucide-react';

interface AuditLogItem {
  _id: string;
  action: 'CREATE_STUDENT' | 'UPDATE_STUDENT' | 'DELETE_STUDENT' | 'RESTORE_STUDENT' | 'PURGE_STUDENT' | 'USER_LOGIN' | 'CHANGE_PASSWORD' | string;
  targetId?: string;
  performedBy: string;
  details?: string;
  createdAt: string;
}

interface AuditLogDrawerProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty' };
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export function AuditLogDrawer({ currentUser, onClose, theme = 'dark' }: AuditLogDrawerProps) {
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
        throw new Error(data.error || 'Failed to fetch audit trail logs');
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

  const filteredLogs = logs.filter((log) => {
    const actionMatch = selectedAction === 'ALL' || log.action === selectedAction;
    const query = searchQuery.toLowerCase();
    const textMatch =
      !query ||
      log.performedBy.toLowerCase().includes(query) ||
      (log.details && log.details.toLowerCase().includes(query)) ||
      (log.targetId && log.targetId.toLowerCase().includes(query)) ||
      log.action.toLowerCase().includes(query);
    return actionMatch && textMatch;
  });

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
    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 md:p-6 pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/65 backdrop-blur-md pointer-events-auto cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className={`pointer-events-auto w-full max-w-2xl h-full max-h-[92vh] p-6 md:p-8 rounded-[36px] border shadow-2xl overflow-hidden flex flex-col z-10 relative ${
          isDark
            ? 'bg-zinc-950/85 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] text-zinc-100 backdrop-blur-3xl'
            : 'bg-[#fbfaf7]/90 border-[#e5e2d9]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] text-[#191919] backdrop-blur-3xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-amber-400' : 'bg-[#cc5a37]/10 border-[#cc5a37]/20 text-[#cc5a37]'}`}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight">System Audit Trail</h3>
              <p className="text-xs text-zinc-500">Immutable security event logs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-[#e5e2d9] hover:bg-[#e5e2d9] text-zinc-650'
              }`}
              title="Refresh Logs"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={onClose}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-[#e5e2d9] hover:bg-[#e5e2d9] text-zinc-650'
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search audit details or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none border transition-colors ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-zinc-700'
                  : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-[#cc5a37]/50'
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
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200 focus:border-zinc-700'
                  : 'bg-white border-[#e5e2d9] text-[#191919] focus:border-[#cc5a37]/50'
              }`}
            >
              <option value="ALL">All Event Types</option>
              <option value="CREATE_STUDENT">CREATE_STUDENT</option>
              <option value="UPDATE_STUDENT">UPDATE_STUDENT</option>
              <option value="DELETE_STUDENT">DELETE_STUDENT</option>
              <option value="RESTORE_STUDENT">RESTORE_STUDENT</option>
              <option value="PURGE_STUDENT">PURGE_STUDENT</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs mb-3">
            {error}
          </div>
        )}

        {/* Audit Log Timeline Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
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
                className={`p-4 rounded-2xl border flex flex-col space-y-2 transition-all ${
                  isDark
                    ? 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/60'
                    : 'bg-white border-[#e5e2d9] hover:bg-[#fbfaf7]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono uppercase font-bold border ${getActionBadgeColor(item.action)}`}>
                      {item.action}
                    </span>
                    {item.targetId && (
                      <span className="text-[11px] font-mono text-zinc-500">
                        Target: <span className="text-zinc-300 font-semibold">{item.targetId}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Clock size={12} />
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-300 font-medium">
                  {item.details || 'No additional details logged'}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/20">
                  <User size={12} />
                  <span>Performed by:</span>
                  <span className="font-bold text-zinc-400">{item.performedBy}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
