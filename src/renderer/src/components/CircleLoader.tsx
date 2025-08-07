'use client'

import { motion } from 'framer-motion'

export function CircleLoader() {
  return (
    <motion.div
      className=" z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-24 h-24">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-0 w-full h-full rounded-full border-t-2 border-b-2 border-transparent"
            style={{
              borderTopColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'][i],
              borderBottomColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'][i],
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
            }}
            animate={{
              rotate: 360,
              scale: 1 - i * 0.15
            }}
            transition={{
              duration: 1.5 + i * 0.2,
              ease: 'linear',
              repeat: Number.POSITIVE_INFINITY
            }}
          />
        ))}

        <motion.div
          className="absolute inset-0 flex items-center justify-center text-blue-500 dark:text-blue-400"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a9 9 0 1 0 9 9" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  )
}
