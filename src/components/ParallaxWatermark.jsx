import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxWatermark() {
  const { scrollYProgress } = useScroll();

  // Subtle smooth parallax translation without vanishing
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">

      {/* Top Left Watermark */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-28 -left-10 text-[9rem] sm:text-[15rem] font-black text-stroke-watermark uppercase whitespace-nowrap opacity-80"
      >
        AWAHAAN 2026
      </motion.div>

      {/* Mid Right Watermark */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[40%] -right-12 text-[8rem] sm:text-[14rem] font-black text-stroke-watermark uppercase whitespace-nowrap opacity-70"
      >
        GCEK SPORTS
      </motion.div>

      {/* Mid Left Watermark */}
      <motion.div
        style={{ y: y3 }}
        className="absolute top-[70%] -left-10 text-[10rem] sm:text-[16rem] font-black text-stroke-watermark uppercase whitespace-nowrap opacity-80"
      >
        VICTORY
      </motion.div>

      {/* Bottom Right Watermark */}
      <motion.div
        style={{ y: y4 }}
        className="absolute top-[92%] -right-10 text-[9rem] sm:text-[15rem] font-black text-stroke-watermark uppercase whitespace-nowrap opacity-70"
      >
        CHAMPIONS
      </motion.div>

    </div>
  );
}
