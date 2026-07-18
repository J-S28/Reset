"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo to-indigo-soft text-white shadow-lg shadow-indigo/25 hover:shadow-indigo/40",
  secondary: "glass text-foreground hover:bg-white/10",
  ghost: "text-foreground-muted hover:text-foreground",
};

const sizeClasses: Record<Size, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const baseClasses =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const MotionLink = motion.create(Link);

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: Variant;
  size?: Size;
  href?: undefined;
};

type LinkButtonProps = Omit<HTMLMotionProps<"a">, "href"> & {
  variant?: Variant;
  size?: Size;
  href: string;
};

/** A single Button that renders a `<button>`, or a Next `<Link>` when given `href`. */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | LinkButtonProps>(
  ({ className, variant = "primary", size = "md", children, href, ...props }, ref) => {
    const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
    const motionProps = {
      whileHover: { scale: 1.03, y: -1 },
      whileTap: { scale: 0.97 },
      transition: { type: "spring" as const, stiffness: 400, damping: 25 },
    };

    if (href) {
      return (
        <MotionLink
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...motionProps}
          {...(props as HTMLMotionProps<"a">)}
        >
          {children}
        </MotionLink>
      );
    }

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...motionProps}
        {...(props as HTMLMotionProps<"button">)}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
