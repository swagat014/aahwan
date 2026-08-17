import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MouseSpotlight() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-30 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-amber-500/10 blur-3xl -translate-x-1/2 -translate-y-1/2"
      animate={{
        x: mousePos.x,
        y: mousePos.y,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.5 }}
    />
  );
}
