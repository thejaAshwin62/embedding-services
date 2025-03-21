import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const AnimatedTooltip = ({ children, items = [] }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-max px-4 py-2 text-sm text-white bg-black rounded-md shadow-lg -top-20 left-1/2 transform -translate-x-1/2"
          >
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center mb-2">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p>{item.designation}</p>
                </div>
              </div>
            ))}
            <div className="absolute w-3 h-3 bg-black transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
