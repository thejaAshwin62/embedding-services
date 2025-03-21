"use client";

import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { useEffect } from "react";
import { cn } from "../lib/utils";

export const TypewriterEffect = ({ words, className, cursorClassName }) => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      animate("span", { opacity: 1 }, { duration: 0.25, delay: stagger(0.1) });
    }
  }, [isInView]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {words.map((word, idx) => {
          return (
            <motion.span
              initial={{ opacity: 0 }}
              key={`${word.text}-${idx}`}
              // Updated color logic here
              className={cn("text-green-500", word.className)}
            >
              {word.text}
              {idx < words.length - 1 ? " " : ""}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      {renderWords()}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-primary",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};
