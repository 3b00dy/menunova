'use client'

import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const widthMap = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`relative w-full ${widthMap[size]} bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div className="flex-1">
                {title && (
                  <h2 className="text-lg font-semibold text-[rgb(var(--color-text))]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-[rgb(var(--color-muted))]">
                    {description}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
            {footer && (
              <div className="px-6 py-4 border-t border-[rgb(var(--color-border))] flex justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
