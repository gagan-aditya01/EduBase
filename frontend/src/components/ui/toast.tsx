import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto flex items-start gap-3 bg-zinc-900/90 border border-zinc-800 backdrop-blur-md p-4 rounded-xl shadow-2xl"
          >
            {/* Icon */}
            <div className="shrink-0 pt-0.5">
              {toast.type === 'success' && <CheckCircle className="text-emerald-400" size={18} />}
              {toast.type === 'error' && <AlertTriangle className="text-red-400" size={18} />}
              {toast.type === 'info' && <Info className="text-blue-400" size={18} />}
            </div>

            {/* Message */}
            <div className="flex-1 text-sm text-zinc-200 leading-relaxed font-medium">
              {toast.message}
            </div>

            {/* Close Button */}
            <button
              onClick={() => onClose(toast.id)}
              className="shrink-0 text-zinc-500 hover:text-zinc-300 p-0.5 hover:bg-zinc-800/50 rounded transition-all"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
