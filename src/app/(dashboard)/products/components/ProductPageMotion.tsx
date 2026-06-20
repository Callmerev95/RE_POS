"use client";

import { motion } from "framer-motion"; 

interface ProductPageMotionProps {
  children: React.ReactNode;
}

export function ProductPageMotion({ children }: ProductPageMotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}