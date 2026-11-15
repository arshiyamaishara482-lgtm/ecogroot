"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Motions must never leave content at opacity:0 if JS fails to hydrate
 * (common over tunnels / blocked chunks) — that blanks the whole page
 * while the static header still shows.
 */
function useMotionReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}

export function PageMotion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ready = useMotionReady();
  return (
    <motion.div
      className={cn(className)}
      initial={false}
      animate={
        ready && !reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }
      }
      transition={{ duration: ready && !reduce ? 0.45 : 0, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Fade in on mount. Content stays visible if client JS is slow/blocked. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 20,
  onView = false,
  ...props
}: HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  onView?: boolean;
}) {
  const reduce = useReducedMotion();
  const ready = useMotionReady();
  const shown = { opacity: 1, y: 0 };
  // Only animate after mount — first paint is always visible
  const hidden =
    ready && !reduce ? { opacity: 0.01, y: Math.min(y, 12) } : false;

  if (onView) {
    return (
      <motion.div
        className={className}
        initial={false}
        whileInView={shown}
        viewport={{ once: true, amount: 0.12, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.5, delay, ease }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={shown}
      transition={{ duration: ready && !reduce ? 0.45 : 0, delay, ease }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  delay = 0,
  onView = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onView?: boolean;
}) {
  const reduce = useReducedMotion();
  const variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: delay } },
  };

  if (onView) {
    return (
      <motion.div
        className={className}
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={variants}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={false}
      animate="show"
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 1, y: 0 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
      }}
      initial={false}
    >
      {children}
    </motion.div>
  );
}

export function Float({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
