import { motion } from 'framer-motion'

interface MagneticBtnProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
}

export function MagneticBtn({ children, href, onClick, className }: MagneticBtnProps) {
  return (
    <motion.div
      style={{ display: 'inline-block' }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97, y: 2 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {href ? (
        <a href={href} className={className}>
          {children}
        </a>
      ) : (
        <button onClick={onClick} className={className}>
          {children}
        </button>
      )}
    </motion.div>
  )
}
