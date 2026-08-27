import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

export function ConfirmDialog({
  isOpen,
  title = 'Are you absolutely sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  theme = 'dark',
}: ConfirmDialogProps) {
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[150] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className={`pointer-events-auto w-full max-w-md border p-6 rounded-2xl shadow-2xl flex flex-col gap-4 overflow-hidden ${
                isDark ? 'bg-zinc-950 border-zinc-850 text-zinc-100' : 'bg-[#fbfaf7] border-[#e5e2d9] text-[#191919]'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-red-500 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
                  {title}
                </h3>
              </div>

              {/* Message */}
              <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {message}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onCancel}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                    isDark
                      ? 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      : 'border-[#e5e2d9] text-zinc-600 hover:text-zinc-900 hover:border-zinc-400'
                  }`}
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-full bg-red-650 hover:bg-red-700 text-white font-semibold text-xs border border-red-500/15 shadow-lg transition-colors cursor-pointer"
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
