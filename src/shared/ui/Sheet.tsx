'use client'

import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Mobile-first bottom sheet for customer-facing item details.
 * On larger screens, behaves as a centered modal.
 */
export function Sheet({ open, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full sm:max-w-lg bg-[rgb(var(--color-bg))] border-t sm:border border-[rgb(var(--color-border))] rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
          >
            <div className="absolute inset-x-0 top-2 flex justify-center sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-[rgb(var(--color-border))]" />
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 end-4 z-10 h-9 w-9 rounded-full bg-black/40 text-white grid place-items-center"
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
