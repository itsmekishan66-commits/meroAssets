import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Reusable destructive/confirmation dialog used for logout, deletes, etc.
export default function ConfirmDialog({
  isOpen,
  icon: Icon,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-card rounded-2xl p-8 w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-vault-muted hover:text-vault-text transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                {Icon && <Icon size={28} className="text-red-500" />}
              </div>

              <div className="text-center">
                <h3 className="font-display text-xl font-bold text-vault-text">{title}</h3>
                <p className="text-vault-muted text-sm mt-1">{message}</p>
              </div>

              <div className="w-full flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 rounded-xl border border-vault-border text-vault-muted hover:text-vault-text hover:border-black/30 transition-all font-medium text-sm"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm relative z-10"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
