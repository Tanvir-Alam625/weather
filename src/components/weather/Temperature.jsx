import React from "react";
import { AnimatePresence, motion } from "motion/react";

export default function Temperature({ value, className = "" }) {
  return (
    <span className={className} aria-label={`${Math.round(value)} degrees Celsius`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={Math.round(value)}
          className="temperature-value"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.24 }}
        >
          {Math.round(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
