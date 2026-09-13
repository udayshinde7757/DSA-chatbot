"use client";

import React from "react";
import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  MotionProps & {
    children?: React.ReactNode;
  };

/**
 * AnimatedButton (VengeanceUI, adapted to AlgoMate)
 * - Ember shine CTA on the charcoal design system
 * - Accepts all native button props (onClick, className, type, etc.)
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children = "Continue",
  className = "",
  ...rest
}) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      {...rest}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      className={cn(
        "group inline-flex items-center justify-center px-6 py-2 rounded-lg relative overflow-hidden",
        "bg-ember-600 hover:bg-ember-500 text-white font-medium",
        "border border-ember-500/40 shadow-glow-ember",
        "transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember-400 disabled:pointer-events-none disabled:opacity-50",
        "[--shine:rgba(255,255,255,.6)]",
        className,
      )}
    >
      {/* Text with moving shine mask */}
      <motion.span
        className="tracking-wide font-light flex items-center justify-center h-full w-full relative z-10"
        style={{
          WebkitMaskImage:
            "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
          maskImage:
            "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
        }}
        initial={{ ["--mask-x" as string]: "100%" }}
        animate={reduceMotion ? undefined : { ["--mask-x" as string]: "-100%" }}
        transition={
          reduceMotion
            ? undefined
            : {
                repeat: Infinity,
                duration: 1,
                ease: "linear",
                repeatDelay: 1,
              }
        }
      >
        {children}
      </motion.span>

      {/* Border shine */}
      <motion.span
        className="block absolute inset-0 rounded-lg p-px"
        style={{
          background: "linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
        }}
        initial={{ backgroundPosition: "100% 0", opacity: reduceMotion ? 0 : undefined }}
        animate={
          reduceMotion ? undefined : { backgroundPosition: ["100% 0", "0% 0"], opacity: [0, 1, 0] }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 1,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1,
              }
        }
      />
    </motion.button>
  );
};

export default AnimatedButton;
