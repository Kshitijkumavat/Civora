import React from "react";
import { motion } from "framer-motion";

export default function AnimatedText({
  text,
  duration = 0.05,
  delay = 0.1,
  className = "",
  textClassName = "",
}) {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: duration,
        delayChildren: delay,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <motion.div
          style={{ display: "flex", overflow: "hidden" }}
          variants={container}
          initial="hidden"
          animate="visible"
          className={`text-4xl font-bold text-center ${textClassName}`}
        >
          {letters.map((letter, index) => (
            <motion.span key={index} variants={child}>
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            delay: letters.length * duration,
            duration: 0.8,
          }}
          className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-cyan-400 to-teal-500"
        />
      </div>
    </div>
  );
}